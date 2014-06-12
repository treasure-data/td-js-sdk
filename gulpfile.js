'use strict';

var gulp = require('gulp'),
  // runSequence = require('run-sequence'),
  // gutil = require('gulp-util'),
  express = require('express'),
  morgan = require('morgan'),
  path = require('path'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rimraf = require('gulp-rimraf'),
  ignore = require('gulp-ignore'),
  config = require('./config');

gulp.task('clean', function () {
  return gulp
    .src(path.join(config.folders.dist, '/*'), {read: false})
    .pipe(ignore('.*'))
    .pipe(rimraf());
});

gulp.task('concat-library', function () {
  return gulp
    .src(config.concat.library.src)
    .pipe(concat(config.concat.library.dest))
    .pipe(gulp.dest(config.folders.dist));
});

gulp.task('concat-loader', function () {
  return gulp
    .src(config.concat.loader.src)
    .pipe(concat(config.concat.loader.dest))
    .pipe(gulp.dest(config.folders.dist));
});

gulp.task('minify-library', function () {
  return gulp
    .src(config.concat.library.src)
    .pipe(concat(config.minify.library.dest))
    .pipe(uglify())
    .pipe(gulp.dest(config.folders.dist));
});

gulp.task('minify-loader', function () {
  return gulp
    .src(config.concat.loader.src)
    .pipe(concat(config.minify.loader.dest))
    .pipe(uglify())
    .pipe(gulp.dest(config.folders.dist));
});

gulp.task('concat', ['concat-loader', 'concat-library']);
gulp.task('minify', ['minify-loader', 'minify-library']);
gulp.task('build', ['concat', 'minify']);

gulp.task('server', function (done) {
  var app = express();
  app.use(morgan());
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
  app.listen(config.server.port, function () {
    done();
  });
});
