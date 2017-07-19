(function() {
    'use strict';

    enableLinkScrolling();
    enableTabHighlighting();
    enableResponsiveMenu();

    function enableLinkScrolling() {
        smoothScroll.init({selectorHeader: '#main-nav'});
    }

    function enableTabHighlighting() {
        gumshoe.init();
    }

    function enableResponsiveMenu() {
        document.getElementById('navbar-toggle').addEventListener('click', function () {
          var show = document.getElementById('nav-menu').style.display !== 'block';
          showResponsiveMenu(show);
        });

        var links = document.querySelectorAll('.navbar-collapse ul li a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function () {
                showResponsiveMenu(false);
            });
        }
    }

    function showResponsiveMenu(show) {
      document.getElementById('nav-menu').style.display = show ? 'block' : '';  
    }
})();
