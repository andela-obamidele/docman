const eslint = require('gulp-eslint');
const gulp = require('gulp');
gulp.task('lint', () => {
  const gulpLintStream = gulp.src(['**/*.js', 'node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  return gulpLintStream;
});
