import eslint from 'gulp-eslint';
import gulp from 'gulp';
import mocha from 'gulp-spawn-mocha';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import nodemon from 'gulp-nodemon';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import dotenv from 'dotenv';


dotenv.config();

gulp.task('lint', () => {
  const gulpStream = gulp.src([
    '**/*.js',
    '!node_modules/**',
    '!dist/**',
    '!./coverage/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  return gulpStream;
});

gulp.task('build', () => {
  gulp.src([
    'server/**/*.js',
    '!node_modules/**',
    '!gulpfile.js',
    '!dist/**'])
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('build-dev', () => {
  const filesStream = gulp.src('server/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
  return filesStream;
});

gulp.task('serve-dev', ['lint', 'build-dev'], () => {
  nodemon({
    script: 'dist/server.js',
    ext: 'js',
    env: {
      SECRET: process.env.SECRET
    },
    ignore: [
      'gulpfile.js',
      'dist/**'
    ],
    tasks: ['lint', 'build-dev']
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

gulp.task('test', ['lint'], () => {
  gulp.src(['tests/**/*.js'])
    .pipe(mocha({
      compilers: 'babel-core/register',
      reporter: 'dot',
      timeout: 20000,
      env: { NODE_ENV: 'test' },
      istanbul: {
        dir: 'coverage/',
        includeAllSources: {
          root: './server',
        },
        x: [
          '**/dist/**',
          '**/node_modules**/',
          '**/migrations/**',
          '**/seeders/**',
          '**gulpfile.babel.js**'],
        print: 'both'
      }
    }));
});
