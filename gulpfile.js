
var gulp = require('gulp');
var md = require('gulp-marked');
var rename = require('gulp-rename');
var header = require('gulp-header');
var fs = require('fs');
var exec = require('gulp-exec');
gulp.task('default', function() {

  gulp.src('index.md')
    .pipe(md())
    .pipe(rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest('./'));

  gulp.src('2014/03/drawing-waveforms/*.md')
    .pipe(header( fs.readFileSync(__dirname + '/header.md') ) )
    .pipe(md({
      highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
      }
    }))
    .pipe(rename({
      dirname: '2014/03/drawing-waveforms',
      extname: '.html'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('deploy', function() {
  gulp.src('index.html')
    .pipe(exec('gulp'))
    .pipe(exec('git add -A'))
    .pipe(exec('git commit -m "' + (new Date()) + ' deploy"') )
    .pipe(exec('git push') );
});
