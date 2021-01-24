/*! echo-js v1.7.3 | (c) 2016 @toddmotto | https://github.com/toddmotto/echo */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory(root);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.echo = factory(root);
  }
})(this, function(root) {

  'use strict';

  var echo = {};

  var callback = function() {};

  var offset, poll, delay, useDebounce, unload;

  var isHidden = function(element) {
    return (element.offsetParent === null);
  };

  var inView = function(element, view) {
    if (isHidden(element)) {
      return false;
    }

    var box = element.getBoundingClientRect();
    return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
  };

  var debounceOrThrottle = function() {
    if (!useDebounce && !!poll) {
      return;
    }
    clearTimeout(poll);
    poll = setTimeout(function() {
      echo.render();
      poll = null;
    }, delay);
  };

  echo.init = function(opts) {
    opts = opts || {};
    var offsetAll = opts.offset || 0;
    var offsetVertical = opts.offsetVertical || offsetAll;
    var offsetHorizontal = opts.offsetHorizontal || offsetAll;
    var optionToInt = function(opt, fallback) {
      return parseInt(opt || fallback, 10);
    };
    offset = {
      t: optionToInt(opts.offsetTop, offsetVertical),
      b: optionToInt(opts.offsetBottom, offsetVertical),
      l: optionToInt(opts.offsetLeft, offsetHorizontal),
      r: optionToInt(opts.offsetRight, offsetHorizontal)
    };
    delay = optionToInt(opts.throttle, 250);
    useDebounce = opts.debounce !== false;
    unload = !!opts.unload;
    callback = opts.callback || callback;
    echo.render();
    if (document.addEventListener) {
      root.addEventListener('scroll', debounceOrThrottle, false);
      root.addEventListener('load', debounceOrThrottle, false);
    } else {
      root.attachEvent('onscroll', debounceOrThrottle);
      root.attachEvent('onload', debounceOrThrottle);
    }
  };

  echo.render = function() {
    var nodes = document.querySelectorAll('img[data-echo], [data-echo-background]');
    var length = nodes.length;
    var src, elem;
    var view = {
      l: 0 - offset.l,
      t: 0 - offset.t,
      b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
      r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
    };
    for (var i = 0; i < length; i++) {
      elem = nodes[i];
      if (inView(elem, view)) {

        if (unload) {
          elem.setAttribute('data-echo-placeholder', elem.src);
        }

        if (elem.getAttribute('data-echo-background') !== null) {
          elem.style.backgroundImage = "url(" + elem.getAttribute('data-echo-background') + ")";
        } else {
          elem.src = elem.getAttribute('data-echo');
        }

        if (!unload) {
          elem.removeAttribute('data-echo');
          elem.removeAttribute('data-echo-background');
        }

        callback(elem, 'load');
      } else if (unload && !!(src = elem.getAttribute('data-echo-placeholder'))) {

        if (elem.getAttribute('data-echo-background') !== null) {
          elem.style.backgroundImage = "url(" + src + ")";
        } else {
          elem.src = src;
        }

        elem.removeAttribute('data-echo-placeholder');
        callback(elem, 'unload');
      }
    }
    if (!length) {
      echo.detach();
    }
  };

  echo.detach = function() {
    if (document.removeEventListener) {
      root.removeEventListener('scroll', debounceOrThrottle);
    } else {
      root.detachEvent('onscroll', debounceOrThrottle);
    }
    clearTimeout(poll);
  };

  return echo;

});
function deepCopy(c, p) {
　var c = c || {};
　for (var i in p) {
　　if (typeof p[i] === 'object') {
　　　c[i] = (p[i].constructor === Array) ? [] : {};
　　　deepCopy(p[i], c[i]);
　　} else {
　　　c[i] = p[i];
　　}
　}
　return c;
}
/**
 * 网站js
 * @author Jelon
 * @type {{init, toggleMenu}}
 */
var JELON = window.JELON || {};
JELON = deepCopy(JELON, {
  name: 'JELON',
  version: '0.0.2',
  init: function() {
    this.toggleMenu();
    this.backToTop();

    echo.init({
      offset: 50,
      throttle: 250,
      unload: false,
      callback: function(element, op) {
        console.log(element, 'has been', op + 'ed')
      }
    });
    this.initSearch();
    this.initImgPreviewer();
  },
  $: function(str) {
    return /^(\[object HTML)[a-zA-Z]*(Element\])$/.test(Object.prototype.toString.call(str)) ? str : document.getElementById(str);
  },
  toggleMenu: function() {
    var _this = this,
      $menu = _this.$(_this.name + '__menu');
    _this.$(_this.name + '__btnDropNav').onclick = function() {
      if ($menu.className.indexOf('hidden') === -1) {
        $menu.className += ' hidden';
      } else {
        $menu.className = $menu.className.replace(/\s*hidden\s*/, '');
      }

    };
  },
  backToTop: function() {
    var _this = this;
    if (typeof _this.$(_this.name + '__backToTop') === 'undefined') return;
    window.onscroll = window.onresize = function() {
      if (document.documentElement.scrollTop + document.body.scrollTop > 0) {
        _this.$(_this.name + '__backToTop').style.display = 'block';
      } else {
        _this.$(_this.name + '__backToTop').style.display = 'none';
      }
    };
    _this.$(_this.name + '__backToTop').onclick = function() {
      var Timer = setInterval(GoTop, 10);

      function GoTop() {
        if (document.documentElement.scrollTop + document.body.scrollTop < 1) {
          clearInterval(Timer);
        } else {
          document.documentElement.scrollTop /= 1.1;
          document.body.scrollTop /= 1.1
        }
      }
    };
  },
  initSearch: function () {
    var _this = this;
    if (document.getElementById('searchKeyword') && document.getElementById('searchButton')) {
      document.getElementById('searchKeyword').onkeyup = function (e) {
        var e = e || window.event;
        var keyCode = e.keyCode || e.which || e.key;
        if (keyCode === 13) {
          _this.startSearch();
        }
      }
      document.getElementById('searchButton').onclick = _this.startSearch;
    }
  },
  startSearch: function () {
    if (document.getElementById('searchKeyword').value) {
      document.getElementById('searchKeywordHidden').value = 'site:jelon.info ' + document.getElementById('searchKeyword').value;
      document.getElementById('searchForm').submit();
    }
  },
  initImgPreviewer: function() {
    var _this = this;
    var $articleWrapper = document.getElementById(_this.name + '__articlePostContent');
    var $imgs = $articleWrapper && $articleWrapper.getElementsByTagName('img');
    if ($articleWrapper && $imgs.length) {
      $articleWrapper.addEventListener('click', function(e) {
        _this.handleImgPreview(e);
      }, false);
    }
  },
  handleImgPreview: function(e) {
    var target = e.target;
    if (target.nodeName.toUpperCase() === 'IMG') {
      this.createImgPreviewer(target.src);
      this.onRemoveImgPreviewer();
    }
  },
  createImgPreviewer: function(src) {
    var $imgPreviewer = document.createElement('div');
    var $img = document.createElement('img');
    $imgPreviewer.id = this.name + '__imgPreviewer';
    $imgPreviewer.style = [
      'position: fixed',
      'display: flex',
      'top: 0',
      'right: 0',
      'bottom: 0',
      'left: 0',
      'width: 100%',
      'height: 100%',
      'align-items: center',
      'background-color: rgba(30, 30, 30, .9)',
      'transition-duration: inherit',
      'transition-property: opacity',
      'transition-timing-function: cubic-bezier(.47,0,.74,.71)',
      'z-index: 10000'
    ].join(';');
    $img.src = src;
    $img.alt = '预览';
    $img.style = [
      'margin: 0 auto',
      'max-width: 80%',
      'max-height: 80%',
      'transform: scale(1, 1)',
      'z-index: 10001'
    ].join(';');
    $imgPreviewer.appendChild($img);
    document.body.appendChild($imgPreviewer);
  },
  onRemoveImgPreviewer: function() {
    var $imgPreviewer = document.getElementById(this.name + '__imgPreviewer');
    if ($imgPreviewer) {
      $imgPreviewer.onclick = function () {
        document.body.removeChild($imgPreviewer);
      }
    }
  }
});

/**
 * 程序入口
 */
JELON.init();
