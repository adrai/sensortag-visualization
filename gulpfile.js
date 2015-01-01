var gulp = require('gulp');

var shell = require('gulp-shell');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
  return gulp.src('test/**/*.js', {read: false})
           .pipe(mocha({reporter: 'spec'}));
});

gulp.task('server', shell.task([
  'npm start'
]));

gulp.task('default', ['test']);
