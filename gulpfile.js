const gulp = require('gulp');
const browserSync = require('browser-sync');


gulp.task('watch', ['browser-sync'], () => {});


// Static server
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './',
      index: 'index.html',
    },
  });
});

