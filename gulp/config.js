module.exports = {
    buildDir: 'build',

    scripts: {
        src: [
            'website/js/jquery-3.2.1.min.js',
            'website/js/jquery.easing.min.js',
            'website/js/bootstrap.min.js',
            'website/js/site.js'
        ],
        dest: 'build/js'
    },

    images: {
        src: 'website/img/**/*',
        dest: 'build/img'
    },

    favicon: {
        src: 'website/favicon.ico',
        dest: 'build'
    },

    html: {
        src: 'website/*.html',
        dest: 'build'
    },

    partials: {
        src: 'website/partials'
    },

    fonts: {
        src: 'website/font/**/*',
        dest: 'build/font/'
    },

    sass: {
        src: 'website/scss/**/*.scss',
        dest: 'build/css'
    },

    uncss: {
        htmlSrc: 'build/*.html',
        cssSrc: 'build/css/*.css',
        cssDest: 'build/css'
    }
};
