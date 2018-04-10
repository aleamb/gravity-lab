const gulp = require('gulp');
const browserSync = require('browser-sync');
const browserify = require('gulp-browserify');


// Basic usage 
gulp.task('browserify', function() {
  // Single entry point to browserify 
  gulp.src('index.js')
      .pipe(browserify({
        insertGlobals : true,
        debug : !gulp.env.production
      }))
      .pipe(gulp.dest('./dist'))
});

// Static server
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './',
      index: 'index.html',
    },
  });
});

gulp.task('watch', ['browserify', 'browser-sync'], () => {});




