var config = require('../config');
var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');

gulp.task('html', function () {
    var templateData = {};
    var options = {
        batch: [config.partials.src]
    };

    return gulp
        .src(config.html.src)
        .pipe(handlebars(templateData, options))
        .pipe(gulp.dest(config.html.dest));
});
