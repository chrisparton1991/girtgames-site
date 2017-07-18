(function($) {
    'use strict';

    var topNavHeight = 50;
    var scrollDurationMs = 750;

    enableLinkScrolling();
    enableTabHighlighting();
    enableResponsiveMenuClosing();

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
})(jQuery);
