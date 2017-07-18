var config = require('../config');
var gulp = require('gulp');

gulp.task('images', function () {
    return gulp
        .src(config.images.src)
        .pipe(gulp.dest(config.images.dest));
});
