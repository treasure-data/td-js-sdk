'use strict';

var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  express = require('express');

gulp.task('default', ['build', 'loader']);

// adapted from td-js-sdk/gulpfile.js td and td.legacy tasks
gulp.task('build', function () {
  return browserify('./lib/index.js').bundle()
    .pipe(source('example.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'))
    .pipe($.uglify())
    .pipe($.rename({extname: '.min.js'}))
    .pipe(gulp.dest('dist'));
});

// adapted from td-js-sdk/gulpfile.js loader task
gulp.task('loader', function () {
  return gulp
    .src('lib/loader.js')
    .pipe($.replace('@URL', process.env.URL || '//example.js'))
    .pipe($.replace('@SDK_GLOBAL', process.env.SDK_GLOBAL || 'Example'))
    .pipe(gulp.dest('dist'))
    .pipe($.uglify())
    .pipe($.rename({extname: '.min.js'}))
    .pipe(gulp.dest('dist'));
});

// adapted from td-js-sdk/gulpfile.js dev task
gulp.task('dev', function (done) {
  var app = express();
  app.use(express.static(__dirname));
  app.listen(3000, done);
});
