var config = require('../config');
var gulp = require('gulp');
var uncss = require('gulp-uncss');

gulp.task('uncss', ['html', 'sass'], function () {
    var appIgnores = [/\.finocomp-power-button/];
    var owlCarouselIgnores = [/\.owl/];
    var bootStrapIgnores = [
        /\.affix/, /\.alert/, /\.close/, /\.collaps/, /\.fade/, /\.has/, /\.help/, /\.active/,
        /\.in/, /\.modal/, /\.open/, /\.popover/, /\.tooltip/, /\.top-nav-collapse/];

    var ignores = appIgnores.concat(owlCarouselIgnores).concat(bootStrapIgnores);
    return gulp
        .src(config.uncss.cssSrc)
        .pipe(uncss({
            html: [config.uncss.htmlSrc],
            ignore: ignores
        }))
        .pipe(gulp.dest(config.uncss.cssDest));
});
