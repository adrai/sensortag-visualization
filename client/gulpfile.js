var gulp = require('gulp');

var shell = require('gulp-shell');

gulp.task('build', shell.task([
  'webpack --progress --profile --colors'
]));

gulp.task('serve', shell.task([
  'npm run hot-dev-server'
]));

gulp.task('serveCold', shell.task([
  'npm run dev-server'
]));

gulp.task('default', ['build']);
