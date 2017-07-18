var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build', function (cb) {
    cb = cb || function () {};
    runSequence(['favicon', 'html', 'images', 'scripts', 'fonts', 'sass', 'uncss'], cb);
});
