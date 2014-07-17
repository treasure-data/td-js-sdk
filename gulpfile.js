'use strict';

var gulp = require('gulp'),
  // runSequence = require('run-sequence'),
  // gutil = require('gulp-util'),
  // morgan = require('morgan'),
  server,
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  streamify = require('gulp-streamify'),
  rename = require('gulp-rename'),
  express = require('express'),
  path = require('path'),
  uglify = require('gulp-uglify'),
  rimraf = require('gulp-rimraf'),
  ignore = require('gulp-ignore'),
  karma = require('karma').server,
  _ = require('lodash'),
  async = require('async'),
  glob = require('glob'),
  wd = require('wd'),
  config = require('./config');

gulp.task('clean', function () {
  return gulp
    .src(path.join(config.folders.dist, '/*'), {read: false})
    .pipe(ignore('.*'))
    .pipe(rimraf());
});

gulp.task('browserify', function () {
  return browserify(config.browserify.index).bundle()
    .pipe(source('td.js'))
    .pipe(gulp.dest('dist'))
    .pipe(streamify(uglify()))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('loader', function () {
  return gulp
    .src(config.loader.src)
    .pipe(gulp.dest(config.folders.dist))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest(config.folders.dist));
});

gulp.task('build', ['loader', 'browserify']);
gulp.task('default', ['build']);

gulp.task('server', function (done) {
  var app = express();
  // app.use(morgan());
  app.use(express.static(path.resolve(__dirname, config.folders.test)));
  app.use(function(req, res, next) {
    if (req.url.indexOf('callback')) {
      if (req.url.indexOf('error') > -1) {
        res.jsonp(400, config.server.error);
      } else {
        res.jsonp(200, config.server.success);
      }
    } else {
      next();
    }
  });
  server = app.listen(config.server.port, function () {
    done();
  });
});

gulp.task('tdd', ['build', 'server'], function (done) {
  gulp.watch(config.tdd.watch, ['build']);
  karma.start(require('./karma.conf.js')(), function (exitCode) {
    if (server) {
      server.close();
    }
    done(exitCode);
    process.exit(exitCode);
  });
});

gulp.task('test', ['build', 'server'], function (done) {
  karma.start(_.assign({}, require('./karma.conf.js')(), {singleRun: true}), function (exitCode) {
    if (server) {
      server.close();
    }
    done(exitCode);
    process.exit(exitCode);
  });
});

// Requires webdriver to be installed, up-to-date and running
gulp.task('e2e', function (done) {
  var files = glob.sync('./test/e2e/*.spec.js');
  var count = files.length;
  var finish = function () {
    count--;
    if (count === 0) {
      done();
    }
  };

  files.forEach(function (file) {
    require(file)(wd.remote('http://localhost:4444/wd/hub'), {browserName: 'chrome'}, finish);
  });
});

gulp.task('ci', ['build', 'server'], function (done) {
  var sauceConnectLauncher = require('sauce-connect-launcher'),
    karmaConfig = _.assign({}, require('./karma.conf.js')(), config.sauce.karma),
    count = Math.ceil(config.sauce.browsers.length / config.sauce.concurrency);

  sauceConnectLauncher(config.sauce.connect, function (err, sauceConnectProcess) {
    if (err) {
      console.error('Error with sauceConnectLauncher', err);
      done(err);
      process.exit(1);
      return;
    }

    console.log('Started Sauce Connect Process');
    console.log('Tests will be run in', config.sauce.browsers.length, 'browsers');
    async.timesSeries(count, function(n, next) {
      var browser,
        idx,
        sauceConfig = _.assign({}, karmaConfig);
      sauceConfig.browsers = [];
      sauceConfig.customLaunchers = {};
      for (var i = 0; i < config.sauce.concurrency; i++) {
        idx = (n * config.sauce.concurrency) + i;
        browser = config.sauce.browsers[idx];
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
