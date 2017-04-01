(function($) {
    'use strict';

    var topNavHeight = 50;
    var scrollDurationMs = 750;

    enableLinkScrolling();
    enableTabHighlighting();
    enableResponsiveMenuClosing();
    affixMainNavigation();
    animateLogo();

    function enableLinkScrolling() {
        $('.page-scroll a').bind('click', function (event) {
            var $target = $($(this).attr('href'));
            var anchorTop = $target.offset().top;

            $('html, body').stop().animate({
                scrollTop: (anchorTop - topNavHeight)
            }, scrollDurationMs, 'easeInOutExpo');

            event.preventDefault();
        });
    }

    function enableTabHighlighting() {
        $('body').scrollspy({
            target: '.navbar-fixed-top',
            offset: topNavHeight + 1
        });
    }

    function enableResponsiveMenuClosing() {
        $('.navbar-collapse ul li a').click(function () {
            $('.navbar-toggle:visible').click();
        });
    }

    function affixMainNavigation() {
        $('#main-nav').affix();
    }

    function animateLogo() {
        var waves = [
            $('#animated-logo #wave1'),
            $('#animated-logo #wave2'),
            $('#animated-logo #wave3')
        ];

        var currentWave = 0;
        setInterval(function () {
            for (var i = 0; i < waves.length; ++i) {
                (i === currentWave) ? waves[i].removeClass('hidden') : waves[i].addClass('hidden');
            }

            currentWave = (currentWave + 1) % waves.length;
        }, 500);
    }
})(jQuery);
