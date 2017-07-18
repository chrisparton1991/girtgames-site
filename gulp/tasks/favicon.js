var config = require('../config');
var gulp = require('gulp');

gulp.task('favicon', function () {
    return gulp.src(config.favicon.src)
        .pipe(gulp.dest(config.favicon.dest));
});
