/**
 * @file gulpfle
 * 
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 */

const gulp = require('gulp');
const browserSync = require('browser-sync');
const browserify = require('gulp-browserify');


// Basic usage 
gulp.task('browserify', function() {
  // Single entry point to browserify 
  gulp.src('main.js')
      .pipe(browserify({
        insertGlobals : true,
        debug: false
      }))
      .pipe(gulp.dest('./dist/grlab.js'));
});

// Static server
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './',
      index: 'index.html',
    },
  });
  gulp.watch("*.js").on('change', function() { gulp.start('browserify'); browserSync.reload(); });

});

gulp.task('watch', ['browserify', 'browser-sync'], () => {});
gulp.task('dist', ['browserify'], () => {});
