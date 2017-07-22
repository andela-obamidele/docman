const eslint = require('gulp-eslint');
const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

gulp.task('lint', () => {
  const gulpStream = gulp.src(['**/*.js', '!node_modules/**', '!dist/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  return gulpStream;
});

gulp.task('build', () => {
  gulp.src(['server/**/*.js', '!node_modules/**', '!gulpfile.js', '!dist/**'])
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});


gulp.task('build-dev', () => {
  const filesStream = gulp.src(['server/**/*.js', '!node_modules', '!dist/'])
    .pipe(sourcemaps.init())
    .pipe(babel({
    }))
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
  return filesStream;
});

gulp.task('serve-dev', ['lint', 'build-dev'], () => {
  nodemon({
    script: 'dist/all.js',
    ext: 'js',
    ignore: [
      'gulpfile.js'
    ]
  });
});

gulp.task('serve', ['build'], () => {
  const nodemonStream = nodemon({
    script: 'dist/all.js'
  });

  nodemonStream.on('crash', () => {
    nodemonStream.emit('restart', 20);
  });
});

