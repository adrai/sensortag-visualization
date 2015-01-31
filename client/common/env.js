'use strict';
var env = require('targetenv'),
    _ = require('lodash'),
    EE = require('eventemitter2');
if (EE.EventEmitter2) EE = EE.EventEmitter2;


env.debug = process.env.NODE_ENV === 'development';

function getExtendedEnv() {

  function getVersion(regex, src) {
    function parse(optA, optB, optC, optD) {

      // We want to allow implicit conversion of any type to number while avoiding
      // compiler warnings about the type.
      return /** @type {number} */ (optA) << 21 |
          /** @type {number} */ (optB) << 14 |
          /** @type {number} */ (optC) << 7 |
          /** @type {number} */ (optD);
    }

    var groups = regex.exec(src) || [];
    groups.shift();

    return parse(groups);
  }

  function viewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window )) {
      a = 'client';
      e = document.documentElement || document.body;
    }
    return { width: e[ a + 'Width' ], height: e[ a + 'Height' ] };
  }

  function getVendorPrefix() {
    /**
     * Helper function to detect browser vendor prefix.
     * Thanks to Lea Verou: http://lea.verou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/
     * I just modified it slightly as I expect it to be used in mobile/WebKit scenarios mostly.
     */
    var vendorPrefix,
        regex = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
        someScript = document.getElementsByTagName('script')[0];

    // Exception for WebKit based browsers
    if ('WebkitOpacity' in someScript.style) {
        vendorPrefix = 'Webkit';
    } else if ('KhtmlOpacity' in someScript.style) {
        vendorPrefix = 'Khtml';
    } else {
        for (var prop in someScript.style) {
            if (regex.test(prop)) {
                // test is faster than match, so it's better to perform
                // that on the lot and match only when necessary
                vendorPrefix = prop.match(regex)[0];
                break;
            }
        }
    }

    return vendorPrefix.toLowerCase() || '';
  }

  function getBrowser() {
    /*!
    * Bowser - a browser detector
    * https://github.com/ded/bowser
    * MIT License | (c) Dustin Diaz 2014
    */

  // !function (name, definition) {
  //   if (typeof module != 'undefined' && module.exports) module.exports['browser'] = definition()
  //   else if (typeof define == 'function' && define.amd) define(definition)
  //   else this[name] = definition()
  // }('bowser', function () {
    /**
      * See useragents.js for examples of navigator.userAgent
      */

    var t = true;

    function detect(ua) {

      function getFirstMatch(regex) {
        var match = ua.match(regex);
        return (match && match.length > 1 && match[1]) || '';
      }

      var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
        , likeAndroid = /like android/i.test(ua)
        , android = !likeAndroid && /android/i.test(ua)
        , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
        , tablet = /tablet/i.test(ua)
        , mobile = !tablet && /[^-]mobi/i.test(ua)
        , result;

      if (/opera|opr/i.test(ua)) {
        result = {
          name: 'Opera'
        , opera: t
        , version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
        };
      }
      else if (/windows phone/i.test(ua)) {
        result = {
          name: 'Windows Phone'
        , windowsphone: t
        , msie: t
        , version: getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
        };
      }
      else if (/msie|trident/i.test(ua)) {
        result = {
          name: 'Internet Explorer'
        , msie: t
        , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
        };
      }
      else if (/chrome|crios|crmo/i.test(ua)) {
        result = {
          name: 'Chrome'
        , chrome: t
        , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
        };
      }
      else if (iosdevice) {
        result = {
          name: iosdevice === 'iphone' ? 'iPhone' : iosdevice === 'ipad' ? 'iPad' : 'iPod'
        };
        // WTF: version is not part of user agent in web apps
        if (versionIdentifier) {
          result.version = versionIdentifier;
        }
      }
      else if (/sailfish/i.test(ua)) {
        result = {
          name: 'Sailfish'
        , sailfish: t
        , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
        };
      }
      else if (/seamonkey\//i.test(ua)) {
        result = {
          name: 'SeaMonkey'
        , seamonkey: t
        , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
        };
      }
      else if (/firefox|iceweasel/i.test(ua)) {
        result = {
          name: 'Firefox'
        , firefox: t
        , version: getFirstMatch(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
        };
        if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
          result.firefoxos = t;
        }
      }
      else if (/silk/i.test(ua)) {
        result = {
          name: 'Amazon Silk'
        , silk: t
        , version: getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
        };
      }
      else if (android) {
        result = {
          name: 'Android'
        , version: versionIdentifier
        };
      }
      else if (/phantom/i.test(ua)) {
        result = {
          name: 'PhantomJS'
        , phantom: t
        , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
        };
      }
      else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
        result = {
          name: 'BlackBerry'
        , blackberry: t
        , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
        };
      }
      else if (/(web|hpw)os/i.test(ua)) {
        result = {
          name: 'WebOS'
        , webos: t
        , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
        };
        if (/touchpad\//i.test(ua)) result.touchpad = t;
      }
      else if (/bada/i.test(ua)) {
        result = {
          name: 'Bada'
        , bada: t
        , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
        };
      }
      else if (/tizen/i.test(ua)) {
        result = {
          name: 'Tizen'
        , tizen: t
        , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
        };
      }
      else if (/safari/i.test(ua)) {
        result = {
          name: 'Safari'
        , safari: t
        , version: versionIdentifier
        };
      }
      else result = {};

      // set webkit or gecko flag for browsers based on these engines
      if (/(apple)?webkit/i.test(ua)) {
        result.name = result.name || 'Webkit';
        result.webkit = t;
        if (!result.version && versionIdentifier) {
          result.version = versionIdentifier;
        }
      } else if (!result.opera && /gecko\//i.test(ua)) {
        result.name = result.name || 'Gecko';
        result.gecko = t;
        result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i);
      }

      // set OS flags for platforms that have multiple browsers
      if (android || result.silk) {
        result.android = t;
      } else if (iosdevice) {
        result[iosdevice] = t;
        result.ios = t;
      }

      // OS version extraction
      var osVersion = '';
      if (iosdevice) {
        osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
        osVersion = osVersion.replace(/[_\s]/g, '.');
      } else if (android) {
        osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
      } else if (result.windowsphone) {
        osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
      } else if (result.webos) {
        osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
      } else if (result.blackberry) {
        osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
      } else if (result.bada) {
        osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
      } else if (result.tizen) {
        osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
      }
      if (osVersion) {
        result.osversion = osVersion;
      }

      // device type extraction
      var osMajorVersion = osVersion.split('.')[0];
      if (tablet || iosdevice === 'ipad' || (android && (osMajorVersion === 3 || (osMajorVersion === 4 && !mobile))) || result.silk) {
        result.tablet = t;
      } else if (mobile || iosdevice === 'iphone' || iosdevice === 'ipod' || android || result.blackberry || result.webos || result.bada) {
        result.mobile = t;
      }

      // Graded Browser Support
      // http://developer.yahoo.com/yui/articles/gbs
      if ((result.msie && result.version >= 10) ||
          (result.chrome && result.version >= 20) ||
          (result.firefox && result.version >= 20.0) ||
          (result.safari && result.version >= 6) ||
          (result.opera && result.version >= 10.0) ||
          (result.ios && result.osversion && result.osversion.split('.')[0] >= 6) ||
          (result.blackberry && result.version >= 10.1)
          ) {
        result.a = t;
      }
      else if ((result.msie && result.version < 10) ||
          (result.chrome && result.version < 20) ||
          (result.firefox && result.version < 20.0) ||
          (result.safari && result.version < 6) ||
          (result.opera && result.version < 10.0) ||
          (result.ios && result.osversion && result.osversion.split('.')[0] < 6)
          ) {
        result.c = t;
      } else result.x = t;

      return result;
    }

    var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent : '');


    /*
     * Set our detect method to the main bowser object so we can
     * reuse it to test other user agents.
     * This is needed to implement future tests.
     */
    bowser._detect = detect;

    return bowser;

  }

  var environment = {
    eventList: {},
    init: function() {
      var userAgent = navigator.userAgent;

      this.OS = {
        windows: /Windows/.test(userAgent),
        linux: /Linux/.test(userAgent),
        mac: /Mac/.test(userAgent)
      };

      this.device = {
        isBlackberry: /BlackBerry/.test(userAgent),
        isPlayBook: /PlayBook/.test(userAgent),
        isAndroid: /Android/.test(userAgent),
        androidVersion: getVersion(/Android (\d)\.(\d)(?:\.(\d))?/, userAgent),

        isIOS: /iPad|iPhone/.test(userAgent),
        iOSVersion: getVersion(/OS (\d)_(\d)(?:_(\d))?/, userAgent),
        isIPhone: /iPhone/.test(userAgent),
        isIPad: /iPad/.test(userAgent),
        isUIWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent),
        standalone: navigator.standalone || false,


        isMobile: /iPhone|iPod|iPad|Android|BlackBerry|PlayBook/.test(userAgent),
        isTouch: 'ontouchstart' in window || 'onmsgesturechange' in window
      };

      // try to guess if tablet
      this.device.isTablet = this.device.isIPad ||
        (screen.width / screen.pixelRatio >= 1024 &&
        this.device.isMobile);

      // set common values
      if (window.device) {
        this.device.platform = window.device.platform;
        this.device.version = window.device.version;
        this.device.name = window.device.name;
        this.device.uuid = window.device.uuid;
      } else if (this.device.isIOS) {
        this.device.version = this.device.iOSVersion;
        this.device.platform = 'iOS';
      } else if (this.device.isAndroid) {
        this.device.version = this.device.androidVersion;
        this.device.platform = 'Android';
      } else if (this.device.isBlackberry) {
        this.device.platform = 'BlackBerry';
      } else {
        this.device.platform = navigator.platform;
      }

      this.browser = getBrowser();

      this.isPhoneGap = ((window.cordova || window.PhoneGap || window.phonegap) &&
        /^file:\/{3}[^\/]/i.test(window.location.href) &&
        this.device.isMobile) || false;

      this.vendorPrefix = getVendorPrefix();
      this.vendorPrefixCSS = this.vendorPrefix ? '-' + this.vendorPrefix + '-' : '';

      this.initScreen();
    },
    initScreen: function() {
      this.screen = screen;
      this.window = {
        width: document.body.clientWidth,
        height: document.body.clientHeight,
        pixelRatio: window.devicePixelRatio || 1,
        viewport: viewport()
      };
      if (window.innerHeight > window.innerWidth) {
        this.window.landscape = true;
        this.window.portrait = false;
        this.window.orientation = 'landscape';
      } else {
        this.window.landscape = false;
        this.window.portrait = true;
        this.window.orientation = 'portrait';
      }
    },
    bindWindowResize: function() {
      var self = this;
      window.addEventListener('resize', _.debounce(function(/*event*/) {
        // Make sure width has actually changed, iOS triggers resize on scroll sometimes (http://jsbin.com/igocaf/latest)
        if (document.body.clientWidth !== environment.window.width
         || document.body.clientHeight !== environment.window.height) {
          self.initScreen();
          self.emit('windowResize', self.window);
        }
      }, 500));
    },
    // composition of eventemitter
    emitter: new EE({ maxListener: 9999999 }),
    emit: function() { this.emitter.emit.apply(this.emitter, arguments); },
    on: function() { this.emitter.on.apply(this.emitter, arguments); },
    off: function() { this.emitter.off.apply(this.emitter, arguments); },
    once: function() { this.emitter.once.apply(this.emitter, arguments); },
    onAny: function() { this.emitter.onAny.apply(this.emitter, arguments); }
  };

  // MicroEvent.mixin(environment);

  environment.init();
  environment.bindWindowResize();

  return environment;
}

var extEnv = env.isBrowser ? getExtendedEnv() : {};
extEnv = _.extend(extEnv, env);

module.exports = extEnv;
