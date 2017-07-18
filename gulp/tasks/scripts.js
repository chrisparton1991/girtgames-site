var config = require('../config');
var gulp = require('gulp');
var concat = require('gulp-concat');  
var rename = require('gulp-rename');  
var uglify = require('gulp-uglify'); 

gulp.task('scripts', function() {  
    return gulp.src(config.scripts.src)
        .pipe(concat('site.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.scripts.dest));
});
