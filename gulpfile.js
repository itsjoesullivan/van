
var gulp = require('gulp');
var md = require('gulp-marked');
var rename = require('gulp-rename');
var header = require('gulp-header');
var fs = require('fs');
gulp.task('default', function() {

  gulp.src('index.md')
    .pipe(md())
    .pipe(rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest('./'));

  gulp.src('2014/03/drawing-waveforms/*.md')
    .pipe(header( fs.readFileSync(__dirname + '/header.md') ) )
    .pipe(md())
    .pipe(rename({
      dirname: '2014/03/drawing-waveforms',
      extname: '.html'
    }))
    .pipe(gulp.dest('./'));
});