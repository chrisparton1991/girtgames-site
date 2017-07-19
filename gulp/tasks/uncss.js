var config = require('../config');
var gulp = require('gulp');
var uncss = require('gulp-uncss');

gulp.task('uncss', ['html', 'sass'], function () {
    var bootstrapIgnores = [/\.active/];

    return gulp
        .src(config.uncss.cssSrc)
        .pipe(uncss({
            html: [config.uncss.htmlSrc],
            ignore: bootstrapIgnores
        }))
        .pipe(gulp.dest(config.uncss.cssDest));
});
