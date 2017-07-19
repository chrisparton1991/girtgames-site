/*! responsive-nav.js 1.0.39
 * https://github.com/viljamis/responsive-nav.js
 * http://responsive-nav.com
 *
 * Copyright (c) 2015 @viljamis
 * Available under the MIT license
 */

/* global Event */
(function (document, window, index) {
  // Index is used to keep multiple navs on the same page namespaced

  "use strict";

  var responsiveNav = function (el, options) {

    var computed = !!window.getComputedStyle;
    
    /**
     * getComputedStyle polyfill for old browsers
     */
    if (!computed) {
      window.getComputedStyle = function(el) {
        this.el = el;
        this.getPropertyValue = function(prop) {
          var re = /(\-([a-z]){1})/g;
          if (prop === "float") {
            prop = "styleFloat";
          }
          if (re.test(prop)) {
            prop = prop.replace(re, function () {
              return arguments[2].toUpperCase();
            });
          }
          return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        };
        return this;
      };
    }
    /* exported addEvent, removeEvent, getChildren, setAttributes, addClass, removeClass, forEach */
    
    /**
     * Add Event
     * fn arg can be an object or a function, thanks to handleEvent
     * read more at: http://www.thecssninja.com/javascript/handleevent
     *
     * @param  {element}  element
     * @param  {event}    event
     * @param  {Function} fn
     * @param  {boolean}  bubbling
     */
    var addEvent = function (el, evt, fn, bubble) {
        if ("addEventListener" in el) {
          // BBOS6 doesn't support handleEvent, catch and polyfill
          try {
            el.addEventListener(evt, fn, bubble);
          } catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
              el.addEventListener(evt, function (e) {
                // Bind fn as this and set first arg as event object
                fn.handleEvent.call(fn, e);
              }, bubble);
            } else {
              throw e;
            }
          }
        } else if ("attachEvent" in el) {
          // check if the callback is an object and contains handleEvent
          if (typeof fn === "object" && fn.handleEvent) {
            el.attachEvent("on" + evt, function () {
              // Bind fn as this
              fn.handleEvent.call(fn);
            });
          } else {
            el.attachEvent("on" + evt, fn);
          }
        }
      },
    
      /**
       * Remove Event
       *
       * @param  {element}  element
       * @param  {event}    event
       * @param  {Function} fn
       * @param  {boolean}  bubbling
       */
      removeEvent = function (el, evt, fn, bubble) {
        if ("removeEventListener" in el) {
          try {
            el.removeEventListener(evt, fn, bubble);
          } catch (e) {
            if (typeof fn === "object" && fn.handleEvent) {
              el.removeEventListener(evt, function (e) {
                fn.handleEvent.call(fn, e);
              }, bubble);
            } else {
              throw e;
            }
          }
        } else if ("detachEvent" in el) {
          if (typeof fn === "object" && fn.handleEvent) {
            el.detachEvent("on" + evt, function () {
              fn.handleEvent.call(fn);
            });
          } else {
            el.detachEvent("on" + evt, fn);
          }
        }
      },
    
      /**
       * Get the children of any element
       *
       * @param  {element}
       * @return {array} Returns matching elements in an array
       */
      getChildren = function (e) {
        if (e.children.length < 1) {
          throw new Error("The Nav container has no containing elements");
        }
        // Store all children in array
        var children = [];
        // Loop through children and store in array if child != TextNode
        for (var i = 0; i < e.children.length; i++) {
          if (e.children[i].nodeType === 1) {
            children.push(e.children[i]);
          }
        }
        return children;
      },
    
      /**
       * Sets multiple attributes at once
       *
       * @param {element} element
       * @param {attrs}   attrs
       */
      setAttributes = function (el, attrs) {
        for (var key in attrs) {
          el.setAttribute(key, attrs[key]);
        }
      },
    
      /**
       * Adds a class to any element
       *
       * @param {element} element
       * @param {string}  class
       */
      addClass = function (el, cls) {
        if (el.className.indexOf(cls) !== 0) {
          el.className += " " + cls;
          el.className = el.className.replace(/(^\s*)|(\s*$)/g,"");
        }
      },
    
      /**
       * Remove a class from any element
       *
       * @param  {element} element
       * @param  {string}  class
       */
      removeClass = function (el, cls) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        el.className = el.className.replace(reg, " ").replace(/(^\s*)|(\s*$)/g,"");
      },
    
      /**
       * forEach method that passes back the stuff we need
       *
       * @param  {array}    array
       * @param  {Function} callback
       * @param  {scope}    scope
       */
      forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
          callback.call(scope, i, array[i]);
        }
      };

    var nav,
      opts,
      navToggle,
      styleElement = document.createElement("style"),
      htmlEl = document.documentElement,
      hasAnimFinished,
      isMobile,
      navOpen;

    var ResponsiveNav = function (el, options) {
        var i;

        /**
         * Default options
         * @type {Object}
         */
        this.options = {
          animate: true,                    // Boolean: Use CSS3 transitions, true or false
          transition: 284,                  // Integer: Speed of the transition, in milliseconds
          label: "Menu",                    // String: Label for the navigation toggle
          insert: "before",                 // String: Insert the toggle before or after the navigation
          customToggle: "",                 // Selector: Specify the ID of a custom toggle
          closeOnNavClick: false,           // Boolean: Close the navigation when one of the links are clicked
          openPos: "relative",              // String: Position of the opened nav, relative or static
          navClass: "nav-collapse",         // String: Default CSS class. If changed, you need to edit the CSS too!
          navActiveClass: "js-nav-active",  // String: Class that is added to <html> element when nav is active
          jsClass: "js",                    // String: 'JS enabled' class which is added to <html> element
          init: function(){},               // Function: Init callback
          open: function(){},               // Function: Open callback
          close: function(){}               // Function: Close callback
        };

        // User defined options
        for (i in options) {
          this.options[i] = options[i];
        }

        // Adds "js" class for <html>
        addClass(htmlEl, this.options.jsClass);

        // Wrapper
        this.wrapperEl = el.replace("#", "");

        // Try selecting ID first
        if (document.getElementById(this.wrapperEl)) {
          this.wrapper = document.getElementById(this.wrapperEl);

        // If element with an ID doesn't exist, use querySelector
        } else if (document.querySelector(this.wrapperEl)) {
          this.wrapper = document.querySelector(this.wrapperEl);

        // If element doesn't exists, stop here.
        } else {
          throw new Error("The nav element you are trying to select doesn't exist");
        }

        // Inner wrapper
        this.wrapper.inner = getChildren(this.wrapper);

        // For minification
        opts = this.options;
        nav = this.wrapper;

        // Init
        this._init(this);
      };

    ResponsiveNav.prototype = {

      /**
       * Unattaches events and removes any classes that were added
       */
      destroy: function () {
        this._removeStyles();
        removeClass(nav, "closed");
        removeClass(nav, "opened");
        removeClass(nav, opts.navClass);
        removeClass(nav, opts.navClass + "-" + this.index);
        removeClass(htmlEl, opts.navActiveClass);
        nav.removeAttribute("style");
        nav.removeAttribute("aria-hidden");

        removeEvent(window, "resize", this, false);
        removeEvent(window, "focus", this, false);
        removeEvent(document.body, "touchmove", this, false);
        removeEvent(navToggle, "touchstart", this, false);
        removeEvent(navToggle, "touchend", this, false);
        removeEvent(navToggle, "mouseup", this, false);
        removeEvent(navToggle, "keyup", this, false);
        removeEvent(navToggle, "click", this, false);

        if (!opts.customToggle) {
          navToggle.parentNode.removeChild(navToggle);
        } else {
          navToggle.removeAttribute("aria-hidden");
        }
      },

      /**
       * Toggles the navigation open/close
       */
      toggle: function () {
        if (hasAnimFinished === true) {
          if (!navOpen) {
            this.open();
          } else {
            this.close();
          }
        }
      },

      /**
       * Opens the navigation
       */
      open: function () {
        if (!navOpen) {
          removeClass(nav, "closed");
          addClass(nav, "opened");
          addClass(htmlEl, opts.navActiveClass);
          addClass(navToggle, "active");
          nav.style.position = opts.openPos;
          setAttributes(nav, {"aria-hidden": "false"});
          navOpen = true;
          opts.open();
        }
      },

      /**
       * Closes the navigation
       */
      close: function () {
        if (navOpen) {
          addClass(nav, "closed");
          removeClass(nav, "opened");
          removeClass(htmlEl, opts.navActiveClass);
          removeClass(navToggle, "active");
          setAttributes(nav, {"aria-hidden": "true"});

          // If animations are enabled, wait until they finish
          if (opts.animate) {
            hasAnimFinished = false;
            setTimeout(function () {
              nav.style.position = "absolute";
              hasAnimFinished = true;
            }, opts.transition + 10);

          // Animations aren't enabled, we can do these immediately
          } else {
            nav.style.position = "absolute";
          }

          navOpen = false;
          opts.close();
        }
      },

      /**
       * Resize is called on window resize and orientation change.
       * It initializes the CSS styles and height calculations.
       */
      resize: function () {

        // Resize watches navigation toggle's display state
        if (window.getComputedStyle(navToggle, null).getPropertyValue("display") !== "none") {

          isMobile = true;
          setAttributes(navToggle, {"aria-hidden": "false"});

          // If the navigation is hidden
          if (nav.className.match(/(^|\s)closed(\s|$)/)) {
            setAttributes(nav, {"aria-hidden": "true"});
            nav.style.position = "absolute";
          }

          this._createStyles();
          this._calcHeight();
        } else {

          isMobile = false;
          setAttributes(navToggle, {"aria-hidden": "true"});
          setAttributes(nav, {"aria-hidden": "false"});
          nav.style.position = opts.openPos;
          this._removeStyles();
        }
      },

      /**
       * Takes care of all even handling
       *
       * @param  {event} event
       * @return {type} returns the type of event that should be used
       */
      handleEvent: function (e) {
        var evt = e || window.event;

        switch (evt.type) {
        case "touchstart":
          this._onTouchStart(evt);
          break;
        case "touchmove":
          this._onTouchMove(evt);
          break;
        case "touchend":
        case "mouseup":
          this._onTouchEnd(evt);
          break;
        case "click":
          this._preventDefault(evt);
          break;
        case "keyup":
          this._onKeyUp(evt);
          break;
        case "focus":
        case "resize":
          this.resize(evt);
          break;
        }
      },

      /**
       * Initializes the widget
       */
      _init: function () {
        this.index = index++;

        addClass(nav, opts.navClass);
        addClass(nav, opts.navClass + "-" + this.index);
        addClass(nav, "closed");
        hasAnimFinished = true;
        navOpen = false;

        this._closeOnNavClick();
        this._createToggle();
        this._transitions();
        this.resize();

        /**
         * On IE8 the resize event triggers too early for some reason
         * so it's called here again on init to make sure all the
         * calculated styles are correct.
         */
        var self = this;
        setTimeout(function () {
          self.resize();
        }, 20);

        addEvent(window, "resize", this, false);
        addEvent(window, "focus", this, false);
        addEvent(document.body, "touchmove", this, false);
        addEvent(navToggle, "touchstart", this, false);
        addEvent(navToggle, "touchend", this, false);
        addEvent(navToggle, "mouseup", this, false);
        addEvent(navToggle, "keyup", this, false);
        addEvent(navToggle, "click", this, false);

        /**
         * Init callback here
         */
        opts.init();
      },

      /**
       * Creates Styles to the <head>
       */
      _createStyles: function () {
        if (!styleElement.parentNode) {
          styleElement.type = "text/css";
          document.getElementsByTagName("head")[0].appendChild(styleElement);
        }
      },

      /**
       * Removes styles from the <head>
       */
      _removeStyles: function () {
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      },

      /**
       * Creates Navigation Toggle
       */
      _createToggle: function () {

        // If there's no toggle, let's create one
        if (!opts.customToggle) {
          var toggle = document.createElement("a");
          toggle.innerHTML = opts.label;
          setAttributes(toggle, {
            "href": "#",
            "class": "nav-toggle"
          });

          // Determine where to insert the toggle
          if (opts.insert === "after") {
            nav.parentNode.insertBefore(toggle, nav.nextSibling);
          } else {
            nav.parentNode.insertBefore(toggle, nav);
          }

          navToggle = toggle;

        // There is a toggle already, let's use that one
        } else {
          var toggleEl = opts.customToggle.replace("#", "");

          if (document.getElementById(toggleEl)) {
            navToggle = document.getElementById(toggleEl);
          } else if (document.querySelector(toggleEl)) {
            navToggle = document.querySelector(toggleEl);
          } else {
            throw new Error("The custom nav toggle you are trying to select doesn't exist");
          }
        }
      },

      /**
       * Closes the navigation when a link inside is clicked.
       */
      _closeOnNavClick: function () {
        if (opts.closeOnNavClick) {
          var links = nav.getElementsByTagName("a"),
            self = this;
          forEach(links, function (i, el) {
            addEvent(links[i], "click", function () {
              if (isMobile) {
                self.toggle();
              }
            }, false);
          });
        }
      },

      /**
       * Prevents the default functionality.
       *
       * @param  {event} event
       */
      _preventDefault: function(e) {
        if (e.preventDefault) {
          if (e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
          }
          e.preventDefault();
          e.stopPropagation();
          return false;

        // This is strictly for old IE
        } else {
          e.returnValue = false;
        }
      },

      /**
       * On touch start we get the location of the touch.
       *
       * @param  {event} event
       */
      _onTouchStart: function (e) {
        if (!Event.prototype.stopImmediatePropagation) {
          this._preventDefault(e);
        }
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.touchHasMoved = false;

        /**
         * Remove mouseup event completely here to avoid
         * double triggering the event.
         */
        removeEvent(navToggle, "mouseup", this, false);
      },

      /**
       * Check if the user is scrolling instead of tapping.
       *
       * @param  {event} event
       */
      _onTouchMove: function (e) {
        if (Math.abs(e.touches[0].clientX - this.startX) > 10 ||
        Math.abs(e.touches[0].clientY - this.startY) > 10) {
          this.touchHasMoved = true;
        }
      },

      /**
       * On touch end toggle the navigation.
       *
       * @param  {event} event
       */
      _onTouchEnd: function (e) {
        this._preventDefault(e);
        if (!isMobile) {
          return;
        }

        // If the user isn't scrolling
        if (!this.touchHasMoved) {

          // If the event type is touch
          if (e.type === "touchend") {
            this.toggle();
            return;

          // Event type was click, not touch
          } else {
            var evt = e || window.event;

            // If it isn't a right click, do toggling
            if (!(evt.which === 3 || evt.button === 2)) {
              this.toggle();
            }
          }
        }
      },

      /**
       * For keyboard accessibility, toggle the navigation on Enter
       * keypress too.
       *
       * @param  {event} event
       */
      _onKeyUp: function (e) {
        var evt = e || window.event;
        if (evt.keyCode === 13) {
          this.toggle();
        }
      },

      /**
       * Adds the needed CSS transitions if animations are enabled
       */
      _transitions: function () {
        if (opts.animate) {
          var objStyle = nav.style,
            transition = "max-height " + opts.transition + "ms";

          objStyle.WebkitTransition =
          objStyle.MozTransition =
          objStyle.OTransition =
          objStyle.transition = transition;
        }
      },

      /**
       * Calculates the height of the navigation and then creates
       * styles which are later added to the page <head>
       */
      _calcHeight: function () {
        var savedHeight = 0;
        for (var i = 0; i < nav.inner.length; i++) {
          savedHeight += nav.inner[i].offsetHeight;
        }

        var innerStyles = "." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened{max-height:" + savedHeight + "px !important} ." + opts.jsClass + " ." + opts.navClass + "-" + this.index + ".opened.dropdown-active {max-height:9999px !important}";

        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = innerStyles;
        } else {
          styleElement.innerHTML = innerStyles;
        }

        innerStyles = "";
      }

    };

    /**
     * Return new Responsive Nav
     */
    return new ResponsiveNav(el, options);

  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = responsiveNav;
  } else {
    window.responsiveNav = responsiveNav;
  }

}(document, window, 0));
(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define([], factory(root));
    } else if ( typeof exports === 'object' ) {
        module.exports = factory(root);
    } else {
        root.smoothScroll = factory(root);
    }
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

    'use strict';

    //
    // Variables
    //

    var smoothScroll = {}; // Object for public APIs
    var supports = 'querySelector' in document && 'addEventListener' in root; // Feature test
    var settings, anchor, toggle, fixedHeader, headerHeight, eventTimeout, animationInterval;

    // Default settings
    var defaults = {
        // Selectors
        selector: '[data-scroll]',
        ignore: '[data-scroll-ignore]',
        selectorHeader: null,

        // Speed & Easing
        speed: 500,
        offset: 0,
        easing: 'easeInOutCubic',
        easingPatterns: {},

        // Callback API
        before: function () {},
        after: function () {}
    };


    //
    // Methods
    //

    /**
     * Merge two or more objects. Returns a new object.
     * @private
     * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
     * @param {Object}   objects  The objects to merge together
     * @returns {Object}          Merged values of defaults and options
     */
    var extend = function () {

        // Variables
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    // If deep merge and property is an object, merge properties
                    if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    };

    /**
     * Get the height of an element.
     * @private
     * @param  {Node} elem The element to get the height of
     * @return {Number}    The element's height in pixels
     */
    var getHeight = function ( elem ) {
        return Math.max( elem.scrollHeight, elem.offsetHeight, elem.clientHeight );
    };

    /**
     * Get the closest matching element up the DOM tree.
     * @private
     * @param  {Element} elem     Starting element
     * @param  {String}  selector Selector to match against
     * @return {Boolean|Element}  Returns null if not match found
     */
    var getClosest = function ( elem, selector ) {

        // Element.matches() polyfill
        if (!Element.prototype.matches) {
            Element.prototype.matches =
                Element.prototype.matchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.oMatchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                function(s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {}
                    return i > -1;
                };
        }

        // Get closest match
        for ( ; elem && elem !== document; elem = elem.parentNode ) {
            if ( elem.matches( selector ) ) return elem;
        }

        return null;

    };

    /**
     * Escape special characters for use with querySelector
     * @private
     * @param {String} id The anchor ID to escape
     * @author Mathias Bynens
     * @link https://github.com/mathiasbynens/CSS.escape
     */
    var escapeCharacters = function ( id ) {

        // Remove leading hash
        if ( id.charAt(0) === '#' ) {
            id = id.substr(1);
        }

        var string = String(id);
        var length = string.length;
        var index = -1;
        var codeUnit;
        var result = '';
        var firstCodeUnit = string.charCodeAt(0);
        while (++index < length) {
            codeUnit = string.charCodeAt(index);
            // Note: there’s no need to special-case astral symbols, surrogate
            // pairs, or lone surrogates.

            // If the character is NULL (U+0000), then throw an
            // `InvalidCharacterError` exception and terminate these steps.
            if (codeUnit === 0x0000) {
                throw new InvalidCharacterError(
                    'Invalid character: the input contains U+0000.'
                );
            }

            if (
                // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
                // U+007F, […]
                (codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
                // If the character is the first character and is in the range [0-9]
                // (U+0030 to U+0039), […]
                (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
                // If the character is the second character and is in the range [0-9]
                // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
                (
                    index === 1 &&
                    codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
                    firstCodeUnit === 0x002D
                )
            ) {
                // http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
                result += '\\' + codeUnit.toString(16) + ' ';
                continue;
            }

            // If the character is not handled by one of the above rules and is
            // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
            // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
            // U+005A), or [a-z] (U+0061 to U+007A), […]
            if (
                codeUnit >= 0x0080 ||
                codeUnit === 0x002D ||
                codeUnit === 0x005F ||
                codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
                codeUnit >= 0x0041 && codeUnit <= 0x005A ||
                codeUnit >= 0x0061 && codeUnit <= 0x007A
            ) {
                // the character itself
                result += string.charAt(index);
                continue;
            }

            // Otherwise, the escaped character.
            // http://dev.w3.org/csswg/cssom/#escape-a-character
            result += '\\' + string.charAt(index);

        }

        return '#' + result;

    };

    /**
     * Calculate the easing pattern
     * @private
     * @link https://gist.github.com/gre/1650294
     * @param {String} type Easing pattern
     * @param {Number} time Time animation should take to complete
     * @returns {Number}
     */
    var easingPattern = function ( settings, time ) {
        var pattern;

        // Default Easing Patterns
        if ( settings.easing === 'easeInQuad' ) pattern = time * time; // accelerating from zero velocity
        if ( settings.easing === 'easeOutQuad' ) pattern = time * (2 - time); // decelerating to zero velocity
        if ( settings.easing === 'easeInOutQuad' ) pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
        if ( settings.easing === 'easeInCubic' ) pattern = time * time * time; // accelerating from zero velocity
        if ( settings.easing === 'easeOutCubic' ) pattern = (--time) * time * time + 1; // decelerating to zero velocity
        if ( settings.easing === 'easeInOutCubic' ) pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
        if ( settings.easing === 'easeInQuart' ) pattern = time * time * time * time; // accelerating from zero velocity
        if ( settings.easing === 'easeOutQuart' ) pattern = 1 - (--time) * time * time * time; // decelerating to zero velocity
        if ( settings.easing === 'easeInOutQuart' ) pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; // acceleration until halfway, then deceleration
        if ( settings.easing === 'easeInQuint' ) pattern = time * time * time * time * time; // accelerating from zero velocity
        if ( settings.easing === 'easeOutQuint' ) pattern = 1 + (--time) * time * time * time * time; // decelerating to zero velocity
        if ( settings.easing === 'easeInOutQuint' ) pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; // acceleration until halfway, then deceleration

        // Custom Easing Patterns
        if ( settings.easingPatterns[settings.easing] ) {
            pattern = settings.easingPatterns[settings.easing]( time );
        }

        return pattern || time; // no easing, no acceleration
    };

    /**
     * Calculate how far to scroll
     * @private
     * @param {Element} anchor The anchor element to scroll to
     * @param {Number} headerHeight Height of a fixed header, if any
     * @param {Number} offset Number of pixels by which to offset scroll
     * @returns {Number}
     */
    var getEndLocation = function ( anchor, headerHeight, offset ) {
        var location = 0;
        if (anchor.offsetParent) {
            do {
                location += anchor.offsetTop;
                anchor = anchor.offsetParent;
            } while (anchor);
        }
        location = Math.max(location - headerHeight - offset, 0);
        return Math.min(location, getDocumentHeight() - getViewportHeight());
    };

    /**
     * Determine the viewport's height
     * @private
     * @returns {Number}
     */
    var getViewportHeight = function() {
        return Math.max( document.documentElement.clientHeight, root.innerHeight || 0 );
    };

    /**
     * Determine the document's height
     * @private
     * @returns {Number}
     */
    var getDocumentHeight = function () {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
    };

    /**
     * Convert data-options attribute into an object of key/value pairs
     * @private
     * @param {String} options Link-specific options as a data attribute string
     * @returns {Object}
     */
    var getDataOptions = function ( options ) {
        return !options || !(typeof JSON === 'object' && typeof JSON.parse === 'function') ? {} : JSON.parse( options );
    };

    /**
     * Get the height of the fixed header
     * @private
     * @param  {Node}   header The header
     * @return {Number}        The height of the header
     */
    var getHeaderHeight = function ( header ) {
        return !header ? 0 : ( getHeight( header ) + header.offsetTop );
    };

    /**
     * Bring the anchored element into focus
     * @private
     */
    var adjustFocus = function ( anchor, endLocation, isNum ) {

        // Don't run if scrolling to a number on the page
        if ( isNum ) return;

        // Otherwise, bring anchor element into focus
        anchor.focus();
        if ( document.activeElement.id !== anchor.id ) {
            anchor.setAttribute( 'tabindex', '-1' );
            anchor.focus();
            anchor.style.outline = 'none';
        }
        root.scrollTo( 0 , endLocation );

    };

    /**
     * Start/stop the scrolling animation
     * @public
     * @param {Node|Number} anchor  The element or position to scroll to
     * @param {Element}     toggle  The element that toggled the scroll event
     * @param {Object}      options
     */
    smoothScroll.animateScroll = function ( anchor, toggle, options ) {

        // Options and overrides
        var overrides = getDataOptions( toggle ? toggle.getAttribute('data-options') : null );
        var animateSettings = extend( settings || defaults, options || {}, overrides ); // Merge user options with defaults

        // Selectors and variables
        var isNum = Object.prototype.toString.call( anchor ) === '[object Number]' ? true : false;
        var anchorElem = isNum || !anchor.tagName ? null : anchor;
        if ( !isNum && !anchorElem ) return;
        var startLocation = root.pageYOffset; // Current location on the page
        if ( animateSettings.selectorHeader && !fixedHeader ) {
            // Get the fixed header if not already set
            fixedHeader = document.querySelector( animateSettings.selectorHeader );
        }
        if ( !headerHeight ) {
            // Get the height of a fixed header if one exists and not already set
            headerHeight = getHeaderHeight( fixedHeader );
        }
        var endLocation = isNum ? anchor : getEndLocation( anchorElem, headerHeight, parseInt((typeof animateSettings.offset === 'function' ? animateSettings.offset() : animateSettings.offset), 10) ); // Location to scroll to
        var distance = endLocation - startLocation; // distance to travel
        var documentHeight = getDocumentHeight();
        var timeLapsed = 0;
        var percentage, position;

        /**
         * Stop the scroll animation when it reaches its target (or the bottom/top of page)
         * @private
         * @param {Number} position Current position on the page
         * @param {Number} endLocation Scroll to location
         * @param {Number} animationInterval How much to scroll on this loop
         */
        var stopAnimateScroll = function ( position, endLocation, animationInterval ) {
            var currentLocation = root.pageYOffset;
            if ( position == endLocation || currentLocation == endLocation || ( (root.innerHeight + currentLocation) >= documentHeight ) ) {

                // Clear the animation timer
                clearInterval(animationInterval);

                // Bring the anchored element into focus
                adjustFocus( anchor, endLocation, isNum );

                // Run callback after animation complete
                animateSettings.after( anchor, toggle );

            }
        };

        /**
         * Loop scrolling animation
         * @private
         */
        var loopAnimateScroll = function () {
            timeLapsed += 16;
            percentage = ( timeLapsed / parseInt(animateSettings.speed, 10) );
            percentage = ( percentage > 1 ) ? 1 : percentage;
            position = startLocation + ( distance * easingPattern(animateSettings, percentage) );
            root.scrollTo( 0, Math.floor(position) );
            stopAnimateScroll(position, endLocation, animationInterval);
        };

        /**
         * Set interval timer
         * @private
         */
        var startAnimateScroll = function () {
            clearInterval(animationInterval);
            animationInterval = setInterval(loopAnimateScroll, 16);
        };

        /**
         * Reset position to fix weird iOS bug
         * @link https://github.com/cferdinandi/smooth-scroll/issues/45
         */
        if ( root.pageYOffset === 0 ) {
            root.scrollTo( 0, 0 );
        }

        // Run callback before animation starts
        animateSettings.before( anchor, toggle );

        // Start scrolling animation
        startAnimateScroll();

    };

    /**
     * Handle has change event
     * @private
     */
    var hashChangeHandler = function (event) {

        // Get hash from URL
        var hash;
        try {
            hash = escapeCharacters( decodeURIComponent( root.location.hash ) );
        } catch(e) {
            hash = escapeCharacters( root.location.hash );
        }

        // Only run if there's an anchor element to scroll to
        if ( !anchor ) return;

        // Reset the anchor element's ID
        anchor.id = anchor.getAttribute( 'data-scroll-id' );

        // Scroll to the anchored content
        smoothScroll.animateScroll( anchor, toggle );

        // Reset anchor and toggle
        anchor = null;
        toggle = null;

    };

    /**
     * If smooth scroll element clicked, animate scroll
     * @private
     */
    var clickHandler = function (event) {

        // Don't run if right-click or command/control + click
        if ( event.button !== 0 || event.metaKey || event.ctrlKey ) return;

        // Check if a smooth scroll link was clicked
        toggle = getClosest( event.target, settings.selector );
        if ( !toggle || toggle.tagName.toLowerCase() !== 'a' || getClosest( event.target, settings.ignore ) ) return;

        // Only run if link is an anchor and points to the current page
        if ( toggle.hostname !== root.location.hostname || toggle.pathname !== root.location.pathname || !/#/.test(toggle.href) ) return;

        // Get the sanitized hash
        var hash;
        try {
            hash = escapeCharacters( decodeURIComponent( toggle.hash ) );
        } catch(e) {
            hash = escapeCharacters( toggle.hash );
        }

        // If the hash is empty, scroll to the top of the page
        if ( hash === '#' ) {

            // Prevent default link behavior
            event.preventDefault();

            // Set the anchored element
            anchor = document.body;

            // Save or create the ID as a data attribute and remove it (prevents scroll jump)
            var id = anchor.id ? anchor.id : 'smooth-scroll-top';
            anchor.setAttribute( 'data-scroll-id', id );
            anchor.id = '';

            // If no hash change event will happen, fire manually
            // Otherwise, update the hash
            if ( root.location.hash.substring(1) === id ) {
                hashChangeHandler();
            } else {
                root.location.hash = id;
            }

            return;

        }

        // Get the anchored element
        anchor = document.querySelector( hash );

        // If anchored element exists, save the ID as a data attribute and remove it (prevents scroll jump)
        if ( !anchor ) return;
        anchor.setAttribute( 'data-scroll-id', anchor.id );
        anchor.id = '';

        // If no hash change event will happen, fire manually
        if ( toggle.hash === root.location.hash ) {
            event.preventDefault();
            hashChangeHandler();
        }

    };

    /**
     * On window scroll and resize, only run events at a rate of 15fps for better performance
     * @private
     * @param  {Function} eventTimeout Timeout function
     * @param  {Object} settings
     */
    var resizeThrottler = function (event) {
        if ( !eventTimeout ) {
            eventTimeout = setTimeout(function() {
                eventTimeout = null; // Reset timeout
                headerHeight = getHeaderHeight( fixedHeader ); // Get the height of a fixed header if one exists
            }, 66);
        }
    };

    /**
     * Destroy the current initialization.
     * @public
     */
    smoothScroll.destroy = function () {

        // If plugin isn't already initialized, stop
        if ( !settings ) return;

        // Remove event listeners
        document.removeEventListener( 'click', clickHandler, false );
        root.removeEventListener( 'resize', resizeThrottler, false );

        // Reset varaibles
        settings = null;
        anchor = null;
        toggle = null;
        fixedHeader = null;
        headerHeight = null;
        eventTimeout = null;
        animationInterval = null;
    };

    /**
     * Initialize Smooth Scroll
     * @public
     * @param {Object} options User settings
     */
    smoothScroll.init = function ( options ) {

        // feature test
        if ( !supports ) return;

        // Destroy any existing initializations
        smoothScroll.destroy();

        // Selectors and variables
        settings = extend( defaults, options || {} ); // Merge user options with defaults
        fixedHeader = settings.selectorHeader ? document.querySelector( settings.selectorHeader ) : null; // Get the fixed header
        headerHeight = getHeaderHeight( fixedHeader );

        // When a toggle is clicked, run the click handler
        document.addEventListener( 'click', clickHandler, false );

        // Listen for hash changes
        root.addEventListener('hashchange', hashChangeHandler, false);

        // If window is resized and there's a fixed header, recalculate its size
        if ( fixedHeader ) {
            root.addEventListener( 'resize', resizeThrottler, false );
        }

    };


    //
    // Public APIs
    //

    return smoothScroll;

});
(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define([], factory(root));
    } else if ( typeof exports === 'object' ) {
        module.exports = factory(root);
    } else {
        root.gumshoe = factory(root);
    }
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

    'use strict';

    //
    // Variables
    //

    var gumshoe = {}; // Object for public APIs
    var supports = 'querySelector' in document && 'addEventListener' in root && 'classList' in document.createElement('_'); // Feature test
    var navs = []; // Array for nav elements
    var settings, eventTimeout, docHeight, header, headerHeight, currentNav, scrollEventDelay;

    // Default settings
    var defaults = {
        selector: '[data-gumshoe] a',
        selectorHeader: '[data-gumshoe-header]',
        container: root,
        offset: 0,
        activeClass: 'active',
        scrollDelay: false,
        callback: function () {}
    };


    //
    // Methods
    //

    /**
     * A simple forEach() implementation for Arrays, Objects and NodeLists.
     * @private
     * @author Todd Motto
     * @link   https://github.com/toddmotto/foreach
     * @param {Array|Object|NodeList} collection Collection of items to iterate
     * @param {Function}              callback   Callback function for each iteration
     * @param {Array|Object|NodeList} scope      Object/NodeList/Array that forEach is iterating over (aka `this`)
     */
    var forEach = function ( collection, callback, scope ) {
        if ( Object.prototype.toString.call( collection ) === '[object Object]' ) {
            for ( var prop in collection ) {
                if ( Object.prototype.hasOwnProperty.call( collection, prop ) ) {
                    callback.call( scope, collection[prop], prop, collection );
                }
            }
        } else {
            for ( var i = 0, len = collection.length; i < len; i++ ) {
                callback.call( scope, collection[i], i, collection );
            }
        }
    };

    /**
     * Merge two or more objects. Returns a new object.
     * @private
     * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
     * @param {Object}   objects  The objects to merge together
     * @returns {Object}          Merged values of defaults and options
     */
    var extend = function () {

        // Variables
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    // If deep merge and property is an object, merge properties
                    if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    };

    /**
     * Get the height of an element.
     * @private
     * @param  {Node} elem The element to get the height of
     * @return {Number}    The element's height in pixels
     */
    var getHeight = function ( elem ) {
        return Math.max( elem.scrollHeight, elem.offsetHeight, elem.clientHeight );
    };

    /**
     * Get the document element's height
     * @private
     * @returns {Number}
     */
    var getDocumentHeight = function () {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
    };

    /**
     * Get an element's distance from the top of the Document.
     * @private
     * @param  {Node} elem The element
     * @return {Number}    Distance from the top in pixels
     */
    var getOffsetTop = function ( elem ) {
        var location = 0;
        if (elem.offsetParent) {
            do {
                location += elem.offsetTop;
                elem = elem.offsetParent;
            } while (elem);
        } else {
            location = elem.offsetTop;
        }
        location = location - headerHeight - settings.offset;
        return location >= 0 ? location : 0;
    };

    /**
     * Determine if an element is in the viewport
     * @param  {Node}    elem The element
     * @return {Boolean}      Returns true if element is in the viewport
     */
    var isInViewport = function ( elem ) {
        var distance = elem.getBoundingClientRect();
        return (
            distance.top >= 0 &&
            distance.left >= 0 &&
            distance.bottom <= (root.innerHeight || document.documentElement.clientHeight) &&
            distance.right <= (root.innerWidth || document.documentElement.clientWidth)
        );
    };

    /**
     * Arrange nagivation elements from furthest from the top to closest
     * @private
     */
    var sortNavs = function () {
        navs.sort( function (a, b) {
            if (a.distance > b.distance) {
                return -1;
            }
            if (a.distance < b.distance) {
                return 1;
            }
            return 0;
        });
    };

    /**
     * Calculate the distance of elements from the top of the document
     * @public
     */
    gumshoe.setDistances = function () {

        // Calculate distances
        docHeight = getDocumentHeight(); // The document
        headerHeight = header ? ( getHeight(header) + getOffsetTop(header) ) : 0; // The fixed header
        forEach(navs, function (nav) {
            nav.distance = getOffsetTop(nav.target); // Each navigation target
        });

        // When done, organization navigation elements
        sortNavs();

    };

    /**
     * Get all navigation elements and store them in an array
     * @private
     */
    var getNavs = function () {

        // Get all navigation links
        var navLinks = document.querySelectorAll( settings.selector );

        // For each link, create an object of attributes and push to an array
        forEach( navLinks, function (nav) {
            if ( !nav.hash ) return;
            var target = document.querySelector( nav.hash );
            if ( !target ) return;
            navs.push({
                nav: nav,
                target: target,
                parent: nav.parentNode.tagName.toLowerCase() === 'li' ? nav.parentNode : null,
                distance: 0
            });
        });

    };


    /**
     * Remove the activation class from the currently active navigation element
     * @private
     */
    var deactivateCurrentNav = function () {
        if ( currentNav ) {
            currentNav.nav.classList.remove( settings.activeClass );
            if ( currentNav.parent ) {
                currentNav.parent.classList.remove( settings.activeClass );
            }
        }
    };

    /**
     * Add the activation class to the currently active navigation element
     * @private
     * @param  {Node} nav The currently active nav
     */
    var activateNav = function ( nav ) {

        // If a current Nav is set, deactivate it
        deactivateCurrentNav();

        // Activate the current target's navigation element
        nav.nav.classList.add( settings.activeClass );
        if ( nav.parent ) {
            nav.parent.classList.add( settings.activeClass );
        }

        settings.callback( nav ); // Callback after methods are run

        // Set new currentNav
        currentNav = {
            nav: nav.nav,
            parent: nav.parent
        };

    };

    /**
     * Determine which navigation element is currently active and run activation method
     * @public
     * @returns {Object} The current nav data.
     */
    gumshoe.getCurrentNav = function () {

        // Get current position from top of the document
        var position = root.pageYOffset;

        // If at the bottom of the page and last section is in the viewport, activate the last nav
        if ( (root.innerHeight + position) >= docHeight && isInViewport( navs[0].target ) ) {
            activateNav( navs[0] );
            return navs[0];
        }

        // Otherwise, loop through each nav until you find the active one
        for (var i = 0, len = navs.length; i < len; i++) {
            var nav = navs[i];
            if ( nav.distance <= position ) {
                activateNav( nav );
                return nav;
            }
        }

        // If no active nav is found, deactivate the current nav
        deactivateCurrentNav();
        settings.callback();

    };

    /**
     * If nav element has active class on load, set it as currently active navigation
     * @private
     */
    var setInitCurrentNav = function () {
        forEach(navs, function (nav) {
            if ( nav.nav.classList.contains( settings.activeClass ) ) {
                currentNav = {
                    nav: nav.nav,
                    parent: nav.parent
                };
            }
        });
    };

    /**
     * Destroy the current initialization.
     * @public
     */
    gumshoe.destroy = function () {

        // If plugin isn't already initialized, stop
        if ( !settings ) return;

        // Remove event listeners
        settings.container.removeEventListener('resize', eventThrottler, false);
        settings.container.removeEventListener('scroll', eventThrottler, false);

        // Reset variables
        navs = [];
        settings = null;
        eventTimeout = null;
        docHeight = null;
        header = null;
        headerHeight = null;
        currentNav = null;
        scrollEventDelay = null;

    };

    /**
     * Run functions after scrolling stops
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    var scrollStop = function (event) {

        // Clear our timeout throughout the scroll
        window.clearTimeout( eventTimeout );

        // recalculate distances and then get currently active nav
        eventTimeout = setTimeout(function() {
            gumshoe.setDistances();
            gumshoe.getCurrentNav();
        }, 66);

    };

    /**
     * On window scroll and resize, only run events at a rate of 15fps for better performance
     * @private
     * @param  {Function} eventTimeout Timeout function
     * @param  {Object} settings
     */
    var eventThrottler = function (event) {
        if ( !eventTimeout ) {
            eventTimeout = setTimeout(function() {

                eventTimeout = null; // Reset timeout

                // If scroll event, get currently active nav
                if ( event.type === 'scroll' ) {
                    gumshoe.getCurrentNav();
                }

                // If resize event, recalculate distances and then get currently active nav
                if ( event.type === 'resize' ) {
                    gumshoe.setDistances();
                    gumshoe.getCurrentNav();
                }

            }, 66);
        }
    };

    /**
     * Initialize Plugin
     * @public
     * @param {Object} options User settings
     */
    gumshoe.init = function ( options ) {

        // feature test
        if ( !supports ) return;

        // Destroy any existing initializations
        gumshoe.destroy();

        // Set variables
        settings = extend( defaults, options || {} ); // Merge user options with defaults
        header = document.querySelector( settings.selectorHeader ); // Get fixed header
        getNavs(); // Get navigation elements

        // If no navigation elements exist, stop running gumshoe
        if ( navs.length === 0 ) return;

        // Run init methods
        setInitCurrentNav();
        gumshoe.setDistances();
        gumshoe.getCurrentNav();

        // Listen for events
        settings.container.addEventListener('resize', eventThrottler, false);
        if ( settings.scrollDelay ) {
            settings.container.addEventListener('scroll', scrollStop, false);
        } else {
            settings.container.addEventListener('scroll', eventThrottler, false);
        }

    };


    //
    // Public APIs
    //

    return gumshoe;

});
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
