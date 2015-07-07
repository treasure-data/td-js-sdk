'use strict';

var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  runSequence = require('run-sequence'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  express = require('express'),
  path = require('path'),
  del = require('del'),
  karma = require('karma').server,
  _ = require('lodash'),
  async = require('async'),
  glob = require('glob'),
  wd = require('wd'),
  server;

gulp.task('clean', function (cb) {
  del([path.join('dist', '/*'), '!.*'], cb);
});

var tdTask = function tdTask (entry, name) {
  return function () {
    return browserify(entry).bundle()
      .pipe(source(name))
      .pipe(buffer())
      .pipe(gulp.dest('dist'))
      .pipe($.uglify())
      .pipe($.rename({extname: '.min.js'}))
      .pipe(gulp.dest('dist'));
  };
};

// Build td and td.legacy
gulp.task('td', tdTask('./lib/index.js', 'td.js'));
gulp.task('td.legacy', tdTask('./lib/index.legacy.js', 'td.legacy.js'));

// Copy and compile async loader for td.js
gulp.task('loader', function () {
  return gulp
    .src('src/loader.js')
    .pipe($.replace('@URL', process.env.URL || '//td.js'))
    .pipe($.replace('@SDK_GLOBAL', process.env.SDK_GLOBAL || 'Treasure'))
    .pipe(gulp.dest('dist'))
    .pipe($.uglify())
    .pipe($.rename({extname: '.min.js'}))
    .pipe(gulp.dest('dist'));
});

// Gzip dist files
gulp.task('compress', function () {
  return gulp.src('./dist/*.js')
    .pipe($.gzip())
    .pipe(gulp.dest('dist'));
});

// Compile and compress files
gulp.task('build', function () {
  return runSequence(['loader', 'td', 'td.legacy'], 'compress');
});
gulp.task('default', ['build']);

// Respond 400 {error: true} when url contains callback and error
// Respond 200 {created: true} when url contains callback without error
var callbackMiddleware = function callbackMiddleware (req, res, next) {
  if (!_.contains(req.url, 'callback'))
    next();
  else if (_.contains(req.url, 'error'))
    res.status(400).jsonp({error: true});
  else
    res.status(200).jsonp({created: true});
};

// Development server
gulp.task('dev', function (done) {
  var app = express();
  app.use(express.static(path.resolve(__dirname, 'test')));
  app.use(callbackMiddleware);
  server = app.listen(9999, done);
});

var karmaCallback = function karmaCallback (done) {
  return function (exitCode) {
    if (server) server.close();
    done(exitCode);
    process.exit(exitCode);
  };
};

// Continually run unit tests
gulp.task('tdd', ['build', 'dev'], function (done) {
  var karmaConfig = require('./karma.conf.js');
  karma.start(karmaConfig(), karmaCallback(done));
  gulp.watch('lib/**/*.js', ['build']);
});

// Run unit tests once
gulp.task('test', ['build', 'dev'], function (done) {
  var karmaConfig = require('./karma.conf.js');
  karmaConfig = _.defaults({singleRun: true}, karmaConfig());
  karma.start(karmaConfig, karmaCallback(done));
});

// Requires webdriver to be installed, up-to-date and running
gulp.task('e2e', function (done) {
  var files = glob.sync('./test/e2e/*.spec.js'),
  count = files.length;

  function finish () {
    if (!--count) {
      done();
    }
  }

  files.forEach(function (file) {
    require(file)(wd.remote('http://localhost:4444/wd/hub'), {browserName: 'chrome'}, finish);
  });
});

gulp.task('ci', ['build', 'dev'], function (done) {
  var sauce = require('./sauce.conf.js'),
    sauceConnectLauncher = require('sauce-connect-launcher'),
    karmaConfig = _.assign({}, require('./karma.conf.js')(), sauce.karma),
    count = Math.ceil(sauce.browsers.length / sauce.concurrency);

  sauceConnectLauncher(sauce.connect, function (err, sauceConnectProcess) {
    if (err) {
      console.error('Error with sauceConnectLauncher', err);
      done(err);
      process.exit(1);
      return;
    }

    console.log('Started Sauce Connect Process');
    console.log('Tests will be run in', sauce.browsers.length, 'browsers');
    async.timesSeries(count, function(n, next) {
      var browser,
        idx,
        sauceConfig = _.assign({}, karmaConfig);
      sauceConfig.browsers = [];
      sauceConfig.customLaunchers = {};
      for (var i = 0; i < sauce.concurrency; i++) {
        idx = (n * sauce.concurrency) + i;
        browser = sauce.browsers[idx];
        if (browser) {
          browser.base = 'SauceLabs';
          sauceConfig.customLaunchers[idx] = browser;
          sauceConfig.browsers.push(idx.toString());
        }
      }

      console.log('Browsers:', sauceConfig.customLaunchers);
      karma.start(sauceConfig, function(exitCode) {
        console.log('Karma finished running with code', exitCode);
        next(null, exitCode);
      });

    }, function (err, result) {

      try {
        server.close();
      } catch (e) {
        console.warn('Error closing server', e);
      }

      console.log('Result', result);
      sauceConnectProcess.close(function () {
        console.log('Closed Sauce Connect Process');
        done(_.max(result));
        process.exit(_.max(result));
      });

    });

  });

});
