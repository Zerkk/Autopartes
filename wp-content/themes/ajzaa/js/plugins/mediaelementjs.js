/*!
 * MediaElement.js
 * HTML5 <video> and <audio> shim and player
 * http://mediaelementjs.com/
 *
 * Creates a JavaScript object that mimics HTML5 MediaElement API
 * for browsers that don't understand HTML5 or can't play the provided codec
 * Can play MP4 (H.264), Ogg, WebM, FLV, WMV, WMA, ACC, and MP3
 *
 * Copyright 2010-2013, John Dyer (http://j.hn)
 * License: MIT
 *
 */
var mejs = mejs || {};
mejs.version = "2.13.0";
mejs.meIndex = 0;
mejs.plugins = {
  silverlight: [{
    version: [3, 0],
    types: ["video/mp4", "video/m4v", "video/mov", "video/wmv", "audio/wma", "audio/m4a", "audio/mp3", "audio/wav", "audio/mpeg"]
  }],
  flash: [{
    version: [9, 0, 124],
    types: ["video/mp4", "video/m4v", "video/mov", "video/flv", "video/rtmp", "video/x-flv", "audio/flv", "audio/x-flv", "audio/mp3", "audio/m4a", "audio/mpeg", "video/youtube", "video/x-youtube"]
  }],
  youtube: [{version: null, types: ["video/youtube", "video/x-youtube", "audio/youtube", "audio/x-youtube"]}],
  vimeo: [{
    version: null, types: ["video/vimeo",
      "video/x-vimeo"]
  }]
};
mejs.Utility = {
  encodeUrl: function (a) {
    return encodeURIComponent(a)
  }, escapeHTML: function (a) {
    return a.toString().split("&").join("&amp;").split("<").join("&lt;").split('"').join("&quot;")
  }, absolutizeUrl: function (a) {
    var b = document.createElement("div");
    b.innerHTML = '<a href="' + this.escapeHTML(a) + '">x</a>';
    return b.firstChild.href
  }, getScriptPath: function (a) {
    for (var b = 0, c, d = "", e = "", f, g, h = document.getElementsByTagName("script"), l = h.length, j = a.length; b < l; b++) {
      f = h[b].src;
      c = f.lastIndexOf("/");
      if (c > -1) {
        g = f.substring(c +
          1);
        f = f.substring(0, c + 1)
      } else {
        g = f;
        f = ""
      }
      for (c = 0; c < j; c++) {
        e = a[c];
        e = g.indexOf(e);
        if (e > -1) {
          d = f;
          break
        }
      }
      if (d !== "")break
    }
    return d
  }, secondsToTimeCode: function (a, b, c, d) {
    if (typeof c == "undefined")c = false; else if (typeof d == "undefined")d = 25;
    var e = Math.floor(a / 3600) % 24, f = Math.floor(a / 60) % 60, g = Math.floor(a % 60);
    a = Math.floor((a % 1 * d).toFixed(3));
    return (b || e > 0 ? (e < 10 ? "0" + e : e) + ":" : "") + (f < 10 ? "0" + f : f) + ":" + (g < 10 ? "0" + g : g) + (c ? ":" + (a < 10 ? "0" + a : a) : "")
  }, timeCodeToSeconds: function (a, b, c, d) {
    if (typeof c == "undefined")c = false; else if (typeof d ==
      "undefined")d = 25;
    a = a.split(":");
    b = parseInt(a[0], 10);
    var e = parseInt(a[1], 10), f = parseInt(a[2], 10), g = 0, h = 0;
    if (c)g = parseInt(a[3]) / d;
    return h = b * 3600 + e * 60 + f + g
  }, convertSMPTEtoSeconds: function (a) {
    if (typeof a != "string")return false;
    a = a.replace(",", ".");
    var b = 0, c = a.indexOf(".") != -1 ? a.split(".")[1].length : 0, d = 1;
    a = a.split(":").reverse();
    for (var e = 0; e < a.length; e++) {
      d = 1;
      if (e > 0)d = Math.pow(60, e);
      b += Number(a[e]) * d
    }
    return Number(b.toFixed(c))
  }, removeSwf: function (a) {
    var b = document.getElementById(a);
    if (b && /object|embed/i.test(b.nodeName))if (mejs.MediaFeatures.isIE) {
      b.style.display =
        "none";
      (function () {
        b.readyState == 4 ? mejs.Utility.removeObjectInIE(a) : setTimeout(arguments.callee, 10)
      })()
    } else b.parentNode.removeChild(b)
  }, removeObjectInIE: function (a) {
    if (a = document.getElementById(a)) {
      for (var b in a)if (typeof a[b] == "function")a[b] = null;
      a.parentNode.removeChild(a)
    }
  }
};
mejs.PluginDetector = {
  hasPluginVersion: function (a, b) {
    var c = this.plugins[a];
    b[1] = b[1] || 0;
    b[2] = b[2] || 0;
    return c[0] > b[0] || c[0] == b[0] && c[1] > b[1] || c[0] == b[0] && c[1] == b[1] && c[2] >= b[2] ? true : false
  },
  nav: window.navigator,
  ua: window.navigator.userAgent.toLowerCase(),
  plugins: [],
  addPlugin: function (a, b, c, d, e) {
    this.plugins[a] = this.detectPlugin(b, c, d, e)
  },
  detectPlugin: function (a, b, c, d) {
    var e = [0, 0, 0], f;
    if (typeof this.nav.plugins != "undefined" && typeof this.nav.plugins[a] == "object") {
      if ((c = this.nav.plugins[a].description) && !(typeof this.nav.mimeTypes != "undefined" && this.nav.mimeTypes[b] && !this.nav.mimeTypes[b].enabledPlugin)) {
        e = c.replace(a, "").replace(/^\s+/, "").replace(/\sr/gi, ".").split(".");
        for (a = 0; a < e.length; a++)e[a] = parseInt(e[a].match(/\d+/), 10)
      }
    } else if (typeof window.ActiveXObject != "undefined")try {
      if (f = new ActiveXObject(c))e = d(f)
    } catch (g) {
    }
    return e
  }
};
mejs.PluginDetector.addPlugin("flash", "Shockwave Flash", "application/x-shockwave-flash", "ShockwaveFlash.ShockwaveFlash", function (a) {
  var b = [];
  if (a = a.GetVariable("$version")) {
    a = a.split(" ")[1].split(",");
    b = [parseInt(a[0], 10), parseInt(a[1], 10), parseInt(a[2], 10)]
  }
  return b
});
mejs.PluginDetector.addPlugin("silverlight", "Silverlight Plug-In", "application/x-silverlight-2", "AgControl.AgControl", function (a) {
  var b = [0, 0, 0, 0], c = function (d, e, f, g) {
    for (; d.isVersionSupported(e[0] + "." + e[1] + "." + e[2] + "." + e[3]);)e[f] += g;
    e[f] -= g
  };
  c(a, b, 0, 1);
  c(a, b, 1, 1);
  c(a, b, 2, 1E4);
  c(a, b, 2, 1E3);
  c(a, b, 2, 100);
  c(a, b, 2, 10);
  c(a, b, 2, 1);
  c(a, b, 3, 1);
  return b
});
mejs.MediaFeatures = {
  init: function () {
    var a = this, b = document, c = mejs.PluginDetector.nav, d = mejs.PluginDetector.ua.toLowerCase(), e, f = ["source", "track", "audio", "video"];
    a.isiPad = d.match(/ipad/i) !== null;
    a.isiPhone = d.match(/iphone/i) !== null;
    a.isiOS = a.isiPhone || a.isiPad;
    a.isAndroid = d.match(/android/i) !== null;
    a.isBustedAndroid = d.match(/android 2\.[12]/) !== null;
    a.isBustedNativeHTTPS = location.protocol === "https:" && (d.match(/android [12]\./) !== null || d.match(/macintosh.* version.* safari/) !== null);
    a.isIE = c.appName.toLowerCase().indexOf("microsoft") != -1;
    a.isChrome = d.match(/chrome/gi) !== null;
    a.isFirefox = d.match(/firefox/gi) !== null;
    a.isWebkit = d.match(/webkit/gi) !== null;
    a.isGecko = d.match(/gecko/gi) !== null && !a.isWebkit;
    a.isOpera = d.match(/opera/gi) !== null;
    a.hasTouch = "ontouchstart" in window && window.ontouchstart != null;
    a.svg = !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
    for (c = 0; c < f.length; c++)e = document.createElement(f[c]);
    a.supportsMediaTag = typeof e.canPlayType !== "undefined" || a.isBustedAndroid;
    try {
      e.canPlayType("video/mp4")
    } catch (g) {
      a.supportsMediaTag = false
    }
    a.hasSemiNativeFullScreen = typeof e.webkitEnterFullscreen !== "undefined";
    a.hasWebkitNativeFullScreen = typeof e.webkitRequestFullScreen !== "undefined";
    a.hasMozNativeFullScreen = typeof e.mozRequestFullScreen !== "undefined";
    a.hasTrueNativeFullScreen = a.hasWebkitNativeFullScreen || a.hasMozNativeFullScreen;
    a.nativeFullScreenEnabled = a.hasTrueNativeFullScreen;
    if (a.hasMozNativeFullScreen)a.nativeFullScreenEnabled = e.mozFullScreenEnabled;
    if (this.isChrome)a.hasSemiNativeFullScreen =
      false;
    if (a.hasTrueNativeFullScreen) {
      a.fullScreenEventName = a.hasWebkitNativeFullScreen ? "webkitfullscreenchange" : "mozfullscreenchange";
      a.isFullScreen = function () {
        if (e.mozRequestFullScreen)return b.mozFullScreen; else if (e.webkitRequestFullScreen)return b.webkitIsFullScreen
      };
      a.requestFullScreen = function (h) {
        if (a.hasWebkitNativeFullScreen)h.webkitRequestFullScreen(); else a.hasMozNativeFullScreen && h.mozRequestFullScreen()
      };
      a.cancelFullScreen = function () {
        if (a.hasWebkitNativeFullScreen)document.webkitCancelFullScreen();
        else a.hasMozNativeFullScreen && document.mozCancelFullScreen()
      }
    }
    if (a.hasSemiNativeFullScreen && d.match(/mac os x 10_5/i)) {
      a.hasNativeFullScreen = false;
      a.hasSemiNativeFullScreen = false
    }
  }
};
mejs.MediaFeatures.init();
mejs.HtmlMediaElement = {
  pluginType: "native", isFullScreen: false, setCurrentTime: function (a) {
    this.currentTime = a
  }, setMuted: function (a) {
    this.muted = a
  }, setVolume: function (a) {
    this.volume = a
  }, stop: function () {
    this.pause()
  }, setSrc: function (a) {
    for (var b = this.getElementsByTagName("source"); b.length > 0;)this.removeChild(b[0]);
    if (typeof a == "string")this.src = a; else {
      var c;
      for (b = 0; b < a.length; b++) {
        c = a[b];
        if (this.canPlayType(c.type)) {
          this.src = c.src;
          break
        }
      }
    }
  }, setVideoSize: function (a, b) {
    this.width = a;
    this.height = b
  }
};
mejs.PluginMediaElement = function (a, b, c) {
  this.id = a;
  this.pluginType = b;
  this.src = c;
  this.events = {};
  this.attributes = {}
};
mejs.PluginMediaElement.prototype = {
  pluginElement: null,
  pluginType: "",
  isFullScreen: false,
  playbackRate: -1,
  defaultPlaybackRate: -1,
  seekable: [],
  played: [],
  paused: true,
  ended: false,
  seeking: false,
  duration: 0,
  error: null,
  tagName: "",
  muted: false,
  volume: 1,
  currentTime: 0,
  play: function () {
    if (this.pluginApi != null) {
      this.pluginType == "youtube" ? this.pluginApi.playVideo() : this.pluginApi.playMedia();
      this.paused = false
    }
  },
  load: function () {
    if (this.pluginApi != null) {
      this.pluginType != "youtube" && this.pluginApi.loadMedia();
      this.paused =
        false
    }
  },
  pause: function () {
    if (this.pluginApi != null) {
      this.pluginType == "youtube" ? this.pluginApi.pauseVideo() : this.pluginApi.pauseMedia();
      this.paused = true
    }
  },
  stop: function () {
    if (this.pluginApi != null) {
      this.pluginType == "youtube" ? this.pluginApi.stopVideo() : this.pluginApi.stopMedia();
      this.paused = true
    }
  },
  canPlayType: function (a) {
    var b, c, d, e = mejs.plugins[this.pluginType];
    for (b = 0; b < e.length; b++) {
      d = e[b];
      if (mejs.PluginDetector.hasPluginVersion(this.pluginType, d.version))for (c = 0; c < d.types.length; c++)if (a == d.types[c])return "probably"
    }
    return ""
  },
  positionFullscreenButton: function (a, b, c) {
    this.pluginApi != null && this.pluginApi.positionFullscreenButton && this.pluginApi.positionFullscreenButton(Math.floor(a), Math.floor(b), c)
  },
  hideFullscreenButton: function () {
    this.pluginApi != null && this.pluginApi.hideFullscreenButton && this.pluginApi.hideFullscreenButton()
  },
  setSrc: function (a) {
    if (typeof a == "string") {
      this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(a));
      this.src = mejs.Utility.absolutizeUrl(a)
    } else {
      var b, c;
      for (b = 0; b < a.length; b++) {
        c = a[b];
        if (this.canPlayType(c.type)) {
          this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(c.src));
          this.src = mejs.Utility.absolutizeUrl(a);
          break
        }
      }
    }
  },
  setCurrentTime: function (a) {
    if (this.pluginApi != null) {
      this.pluginType == "youtube" ? this.pluginApi.seekTo(a) : this.pluginApi.setCurrentTime(a);
      this.currentTime = a
    }
  },
  setVolume: function (a) {
    if (this.pluginApi != null) {
      this.pluginType == "youtube" ? this.pluginApi.setVolume(a * 100) : this.pluginApi.setVolume(a);
      this.volume = a
    }
  },
  setMuted: function (a) {
    if (this.pluginApi != null) {
      if (this.pluginType == "youtube") {
        a ? this.pluginApi.mute() : this.pluginApi.unMute();
        this.muted = a;
        this.dispatchEvent("volumechange")
      } else this.pluginApi.setMuted(a);
      this.muted = a
    }
  },
  setVideoSize: function (a, b) {
    if (this.pluginElement.style) {
      this.pluginElement.style.width = a + "px";
      this.pluginElement.style.height = b + "px"
    }
    this.pluginApi != null && this.pluginApi.setVideoSize && this.pluginApi.setVideoSize(a, b)
  },
  setFullscreen: function (a) {
    this.pluginApi != null && this.pluginApi.setFullscreen && this.pluginApi.setFullscreen(a)
  },
  enterFullScreen: function () {
    this.pluginApi != null && this.pluginApi.setFullscreen && this.setFullscreen(true)
  },
  exitFullScreen: function () {
    this.pluginApi != null && this.pluginApi.setFullscreen &&
    this.setFullscreen(false)
  },
  addEventListener: function (a, b) {
    this.events[a] = this.events[a] || [];
    this.events[a].push(b)
  },
  removeEventListener: function (a, b) {
    if (!a) {
      this.events = {};
      return true
    }
    var c = this.events[a];
    if (!c)return true;
    if (!b) {
      this.events[a] = [];
      return true
    }
    for (i = 0; i < c.length; i++)if (c[i] === b) {
      this.events[a].splice(i, 1);
      return true
    }
    return false
  },
  dispatchEvent: function (a) {
    var b, c, d = this.events[a];
    if (d) {
      c = Array.prototype.slice.call(arguments, 1);
      for (b = 0; b < d.length; b++)d[b].apply(null, c)
    }
  },
  hasAttribute: function (a) {
    return a in
      this.attributes
  },
  removeAttribute: function (a) {
    delete this.attributes[a]
  },
  getAttribute: function (a) {
    if (this.hasAttribute(a))return this.attributes[a];
    return ""
  },
  setAttribute: function (a, b) {
    this.attributes[a] = b
  },
  remove: function () {
    mejs.Utility.removeSwf(this.pluginElement.id);
    mejs.MediaPluginBridge.unregisterPluginElement(this.pluginElement.id)
  }
};
mejs.MediaPluginBridge = {
  pluginMediaElements: {}, htmlMediaElements: {}, registerPluginElement: function (a, b, c) {
    this.pluginMediaElements[a] = b;
    this.htmlMediaElements[a] = c
  }, unregisterPluginElement: function (a) {
    delete this.pluginMediaElements[a];
    delete this.htmlMediaElements[a]
  }, initPlugin: function (a) {
    var b = this.pluginMediaElements[a], c = this.htmlMediaElements[a];
    if (b) {
      switch (b.pluginType) {
        case "flash":
          b.pluginElement = b.pluginApi = document.getElementById(a);
          break;
        case "silverlight":
          b.pluginElement = document.getElementById(b.id);
          b.pluginApi = b.pluginElement.Content.MediaElementJS
      }
      b.pluginApi != null && b.success && b.success(b, c)
    }
  }, fireEvent: function (a, b, c) {
    var d, e;
    if (a = this.pluginMediaElements[a]) {
      b = {type: b, target: a};
      for (d in c) {
        a[d] = c[d];
        b[d] = c[d]
      }
      e = c.bufferedTime || 0;
      b.target.buffered = b.buffered = {
        start: function () {
          return 0
        }, end: function () {
          return e
        }, length: 1
      };
      a.dispatchEvent(b.type, b)
    }
  }
};
mejs.MediaElementDefaults = {
  mode: "auto",
  plugins: ["flash", "silverlight", "youtube", "vimeo"],
  enablePluginDebug: false,
  httpsBasicAuthSite: false,
  type: "",
  pluginPath: mejs.Utility.getScriptPath(["mediaelement.js", "mediaelement.min.js", "mediaelement-and-player.js", "mediaelement-and-player.min.js"]),
  flashName: "flashmediaelement.swf",
  flashStreamer: "",
  enablePluginSmoothing: false,
  enablePseudoStreaming: false,
  pseudoStreamingStartQueryParam: "start",
  silverlightName: "silverlightmediaelement.xap",
  defaultVideoWidth: 480,
  defaultVideoHeight: 270,
  pluginWidth: -1,
  pluginHeight: -1,
  pluginVars: [],
  timerRate: 250,
  startVolume: 0.8,
  success: function () {
  },
  error: function () {
  }
};
mejs.MediaElement = function (a, b) {
  return mejs.HtmlMediaElementShim.create(a, b)
};
mejs.HtmlMediaElementShim = {
  create: function (a, b) {
    var c = mejs.MediaElementDefaults, d = typeof a == "string" ? document.getElementById(a) : a, e = d.tagName.toLowerCase(), f = e === "audio" || e === "video", g = f ? d.getAttribute("src") : d.getAttribute("href");
    e = d.getAttribute("poster");
    var h = d.getAttribute("autoplay"), l = d.getAttribute("preload"), j = d.getAttribute("controls"), k;
    for (k in b)c[k] = b[k];
    g = typeof g == "undefined" || g === null || g == "" ? null : g;
    e = typeof e == "undefined" || e === null ? "" : e;
    l = typeof l == "undefined" || l === null || l === "false" ?
      "none" : l;
    h = !(typeof h == "undefined" || h === null || h === "false");
    j = !(typeof j == "undefined" || j === null || j === "false");
    k = this.determinePlayback(d, c, mejs.MediaFeatures.supportsMediaTag, f, g);
    k.url = k.url !== null ? mejs.Utility.absolutizeUrl(k.url) : "";
    if (k.method == "native") {
      if (mejs.MediaFeatures.isBustedAndroid) {
        d.src = k.url;
        d.addEventListener("click", function () {
          d.play()
        }, false)
      }
      return this.updateNative(k, c, h, l)
    } else if (k.method !== "")return this.createPlugin(k, c, e, h, l, j); else {
      this.createErrorMessage(k, c, e);
      return this
    }
  },
  determinePlayback: function (a, b, c, d, e) {
    var f = [], g, h, l, j = {method: "", url: "", htmlMediaElement: a, isVideo: a.tagName.toLowerCase() != "audio"}, k;
    if (typeof b.type != "undefined" && b.type !== "")if (typeof b.type == "string")f.push({
      type: b.type,
      url: e
    }); else for (g = 0; g < b.type.length; g++)f.push({type: b.type[g], url: e}); else if (e !== null) {
      l = this.formatType(e, a.getAttribute("type"));
      f.push({type: l, url: e})
    } else for (g = 0; g < a.childNodes.length; g++) {
      h = a.childNodes[g];
      if (h.nodeType == 1 && h.tagName.toLowerCase() == "source") {
        e = h.getAttribute("src");
        l = this.formatType(e, h.getAttribute("type"));
        h = h.getAttribute("media");
        if (!h || !window.matchMedia || window.matchMedia && window.matchMedia(h).matches)f.push({type: l, url: e})
      }
    }
    if (!d && f.length > 0 && f[0].url !== null && this.getTypeFromFile(f[0].url).indexOf("audio") > -1)j.isVideo = false;
    if (mejs.MediaFeatures.isBustedAndroid)a.canPlayType = function (m) {
      return m.match(/video\/(mp4|m4v)/gi) !== null ? "maybe" : ""
    };
    if (c && (b.mode === "auto" || b.mode === "auto_plugin" || b.mode === "native") && !(mejs.MediaFeatures.isBustedNativeHTTPS &&
      b.httpsBasicAuthSite === true)) {
      if (!d) {
        g = document.createElement(j.isVideo ? "video" : "audio");
        a.parentNode.insertBefore(g, a);
        a.style.display = "none";
        j.htmlMediaElement = a = g
      }
      for (g = 0; g < f.length; g++)if (a.canPlayType(f[g].type).replace(/no/, "") !== "" || a.canPlayType(f[g].type.replace(/mp3/, "mpeg")).replace(/no/, "") !== "") {
        j.method = "native";
        j.url = f[g].url;
        break
      }
      if (j.method === "native") {
        if (j.url !== null)a.src = j.url;
        if (b.mode !== "auto_plugin")return j
      }
    }
    if (b.mode === "auto" || b.mode === "auto_plugin" || b.mode === "shim")for (g =
                                                                                  0; g < f.length; g++) {
      l = f[g].type;
      for (a = 0; a < b.plugins.length; a++) {
        e = b.plugins[a];
        h = mejs.plugins[e];
        for (c = 0; c < h.length; c++) {
          k = h[c];
          if (k.version == null || mejs.PluginDetector.hasPluginVersion(e, k.version))for (d = 0; d < k.types.length; d++)if (l == k.types[d]) {
            j.method = e;
            j.url = f[g].url;
            return j
          }
        }
      }
    }
    if (b.mode === "auto_plugin" && j.method === "native")return j;
    if (j.method === "" && f.length > 0)j.url = f[0].url;
    return j
  }, formatType: function (a, b) {
    return a && !b ? this.getTypeFromFile(a) : b && ~b.indexOf(";") ? b.substr(0, b.indexOf(";")) : b
  },
  getTypeFromFile: function (a) {
    a = a.split("?")[0];
    a = a.substring(a.lastIndexOf(".") + 1).toLowerCase();
    return (/(mp4|m4v|ogg|ogv|webm|webmv|flv|wmv|mpeg|mov)/gi.test(a) ? "video" : "audio") + "/" + this.getTypeFromExtension(a)
  }, getTypeFromExtension: function (a) {
    switch (a) {
      case "mp4":
      case "m4v":
        return "mp4";
      case "webm":
      case "webma":
      case "webmv":
        return "webm";
      case "ogg":
      case "oga":
      case "ogv":
        return "ogg";
      default:
        return a
    }
  }, createErrorMessage: function (a, b, c) {
    var d = a.htmlMediaElement, e = document.createElement("div");
    e.className =
      "me-cannotplay";
    try {
      e.style.width = d.width + "px";
      e.style.height = d.height + "px"
    } catch (f) {
    }
    e.innerHTML = b.customError ? b.customError : c !== "" ? '<a href="' + a.url + '"><img src="' + c + '" width="100%" height="100%" /></a>' : '<a href="' + a.url + '"><span>' + mejs.i18n.t("Download File") + "</span></a>";
    d.parentNode.insertBefore(e, d);
    d.style.display = "none";
    b.error(d)
  }, createPlugin: function (a, b, c, d, e, f) {
    c = a.htmlMediaElement;
    var g = 1, h = 1, l = "me_" + a.method + "_" + mejs.meIndex++, j = new mejs.PluginMediaElement(l, a.method, a.url), k = document.createElement("div"),
      m;
    j.tagName = c.tagName;
    for (m = 0; m < c.attributes.length; m++) {
      var n = c.attributes[m];
      n.specified == true && j.setAttribute(n.name, n.value)
    }
    for (m = c.parentNode; m !== null && m.tagName.toLowerCase() != "body";) {
      if (m.parentNode.tagName.toLowerCase() == "p") {
        m.parentNode.parentNode.insertBefore(m, m.parentNode);
        break
      }
      m = m.parentNode
    }
    if (a.isVideo) {
      g = b.pluginWidth > 0 ? b.pluginWidth : b.videoWidth > 0 ? b.videoWidth : c.getAttribute("width") !== null ? c.getAttribute("width") : b.defaultVideoWidth;
      h = b.pluginHeight > 0 ? b.pluginHeight : b.videoHeight >
      0 ? b.videoHeight : c.getAttribute("height") !== null ? c.getAttribute("height") : b.defaultVideoHeight;
      g = mejs.Utility.encodeUrl(g);
      h = mejs.Utility.encodeUrl(h)
    } else if (b.enablePluginDebug) {
      g = 320;
      h = 240
    }
    j.success = b.success;
    mejs.MediaPluginBridge.registerPluginElement(l, j, c);
    k.className = "me-plugin";
    k.id = l + "_container";
    a.isVideo ? c.parentNode.insertBefore(k, c) : document.body.insertBefore(k, document.body.childNodes[0]);
    d = ["id=" + l, "isvideo=" + (a.isVideo ? "true" : "false"), "autoplay=" + (d ? "true" : "false"), "preload=" + e, "width=" +
    g, "startvolume=" + b.startVolume, "timerrate=" + b.timerRate, "flashstreamer=" + b.flashStreamer, "height=" + h, "pseudostreamstart=" + b.pseudoStreamingStartQueryParam];
    if (a.url !== null)a.method == "flash" ? d.push("file=" + mejs.Utility.encodeUrl(a.url)) : d.push("file=" + a.url);
    b.enablePluginDebug && d.push("debug=true");
    b.enablePluginSmoothing && d.push("smoothing=true");
    b.enablePseudoStreaming && d.push("pseudostreaming=true");
    f && d.push("controls=true");
    if (b.pluginVars)d = d.concat(b.pluginVars);
    switch (a.method) {
      case "silverlight":
        k.innerHTML =
          '<object data="data:application/x-silverlight-2," type="application/x-silverlight-2" id="' + l + '" name="' + l + '" width="' + g + '" height="' + h + '" class="mejs-shim"><param name="initParams" value="' + d.join(",") + '" /><param name="windowless" value="true" /><param name="background" value="black" /><param name="minRuntimeVersion" value="3.0.0.0" /><param name="autoUpgrade" value="true" /><param name="source" value="' + b.pluginPath + b.silverlightName + '" /></object>';
        break;
      case "flash":
        if (mejs.MediaFeatures.isIE) {
          a =
            document.createElement("div");
          k.appendChild(a);
          a.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="' + l + '" width="' + g + '" height="' + h + '" class="mejs-shim"><param name="movie" value="' + b.pluginPath + b.flashName + "?x=" + new Date + '" /><param name="flashvars" value="' + d.join("&amp;") + '" /><param name="quality" value="high" /><param name="bgcolor" value="#000000" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /></object>'
        } else k.innerHTML =
          '<embed id="' + l + '" name="' + l + '" play="true" loop="false" quality="high" bgcolor="#000000" wmode="transparent" allowScriptAccess="always" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="//www.macromedia.com/go/getflashplayer" src="' + b.pluginPath + b.flashName + '" flashvars="' + d.join("&") + '" width="' + g + '" height="' + h + '" class="mejs-shim"></embed>';
        break;
      case "youtube":
        b = a.url.substr(a.url.lastIndexOf("=") + 1);
        youtubeSettings = {
          container: k, containerId: k.id, pluginMediaElement: j, pluginId: l,
          videoId: b, height: h, width: g
        };
        mejs.PluginDetector.hasPluginVersion("flash", [10, 0, 0]) ? mejs.YouTubeApi.createFlash(youtubeSettings) : mejs.YouTubeApi.enqueueIframe(youtubeSettings);
        break;
      case "vimeo":
        j.vimeoid = a.url.substr(a.url.lastIndexOf("/") + 1);
        k.innerHTML = '<iframe src="http://player.vimeo.com/video/' + j.vimeoid + '?portrait=0&byline=0&title=0" width="' + g + '" height="' + h + '" frameborder="0" class="mejs-shim"></iframe>'
    }
    c.style.display = "none";
    c.removeAttribute("autoplay");
    return j
  }, updateNative: function (a,
                             b) {
    var c = a.htmlMediaElement, d;
    for (d in mejs.HtmlMediaElement)c[d] = mejs.HtmlMediaElement[d];
    b.success(c, c);
    return c
  }
};
mejs.YouTubeApi = {
  isIframeStarted: false, isIframeLoaded: false, loadIframeApi: function () {
    if (!this.isIframeStarted) {
      var a = document.createElement("script");
      a.src = "//www.youtube.com/player_api";
      var b = document.getElementsByTagName("script")[0];
      b.parentNode.insertBefore(a, b);
      this.isIframeStarted = true
    }
  }, iframeQueue: [], enqueueIframe: function (a) {
    if (this.isLoaded)this.createIframe(a); else {
      this.loadIframeApi();
      this.iframeQueue.push(a)
    }
  }, createIframe: function (a) {
    var b = a.pluginMediaElement, c = new YT.Player(a.containerId,
      {
        height: a.height, width: a.width, videoId: a.videoId, playerVars: {controls: 0}, events: {
        onReady: function () {
          a.pluginMediaElement.pluginApi = c;
          mejs.MediaPluginBridge.initPlugin(a.pluginId);
          setInterval(function () {
            mejs.YouTubeApi.createEvent(c, b, "timeupdate")
          }, 250)
        }, onStateChange: function (d) {
          mejs.YouTubeApi.handleStateChange(d.data, c, b)
        }
      }
      })
  }, createEvent: function (a, b, c) {
    c = {type: c, target: b};
    if (a && a.getDuration) {
      b.currentTime = c.currentTime = a.getCurrentTime();
      b.duration = c.duration = a.getDuration();
      c.paused = b.paused;
      c.ended = b.ended;
      c.muted = a.isMuted();
      c.volume = a.getVolume() / 100;
      c.bytesTotal = a.getVideoBytesTotal();
      c.bufferedBytes = a.getVideoBytesLoaded();
      var d = c.bufferedBytes / c.bytesTotal * c.duration;
      c.target.buffered = c.buffered = {
        start: function () {
          return 0
        }, end: function () {
          return d
        }, length: 1
      }
    }
    b.dispatchEvent(c.type, c)
  }, iFrameReady: function () {
    for (this.isIframeLoaded = this.isLoaded = true; this.iframeQueue.length > 0;)this.createIframe(this.iframeQueue.pop())
  }, flashPlayers: {}, createFlash: function (a) {
    this.flashPlayers[a.pluginId] =
      a;
    var b, c = "//www.youtube.com/apiplayer?enablejsapi=1&amp;playerapiid=" + a.pluginId + "&amp;version=3&amp;autoplay=0&amp;controls=0&amp;modestbranding=1&loop=0";
    if (mejs.MediaFeatures.isIE) {
      b = document.createElement("div");
      a.container.appendChild(b);
      b.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="' + a.pluginId + '" width="' + a.width + '" height="' + a.height + '" class="mejs-shim"><param name="movie" value="' +
        c + '" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /></object>'
    } else a.container.innerHTML = '<object type="application/x-shockwave-flash" id="' + a.pluginId + '" data="' + c + '" width="' + a.width + '" height="' + a.height + '" style="visibility: visible; " class="mejs-shim"><param name="allowScriptAccess" value="always"><param name="wmode" value="transparent"></object>'
  }, flashReady: function (a) {
    var b = this.flashPlayers[a], c =
      document.getElementById(a), d = b.pluginMediaElement;
    d.pluginApi = d.pluginElement = c;
    mejs.MediaPluginBridge.initPlugin(a);
    c.cueVideoById(b.videoId);
    a = b.containerId + "_callback";
    window[a] = function (e) {
      mejs.YouTubeApi.handleStateChange(e, c, d)
    };
    c.addEventListener("onStateChange", a);
    setInterval(function () {
      mejs.YouTubeApi.createEvent(c, d, "timeupdate")
    }, 250)
  }, handleStateChange: function (a, b, c) {
    switch (a) {
      case -1:
        c.paused = true;
        c.ended = true;
        mejs.YouTubeApi.createEvent(b, c, "loadedmetadata");
        break;
      case 0:
        c.paused = false;
        c.ended = true;
        mejs.YouTubeApi.createEvent(b, c, "ended");
        break;
      case 1:
        c.paused = false;
        c.ended = false;
        mejs.YouTubeApi.createEvent(b, c, "play");
        mejs.YouTubeApi.createEvent(b, c, "playing");
        break;
      case 2:
        c.paused = true;
        c.ended = false;
        mejs.YouTubeApi.createEvent(b, c, "pause");
        break;
      case 3:
        mejs.YouTubeApi.createEvent(b, c, "progress")
    }
  }
};
function onYouTubePlayerAPIReady() {
  mejs.YouTubeApi.iFrameReady()
}
function onYouTubePlayerReady(a) {
  mejs.YouTubeApi.flashReady(a)
}
window.mejs = mejs;
window.MediaElement = mejs.MediaElement;
(function (a, b) {
  var c = {locale: {language: "", strings: {}}, methods: {}};
  c.locale.getLanguage = function () {
    return c.locale.language || navigator.language
  };
  if (typeof mejsL10n != "undefined")c.locale.language = mejsL10n.language;
  c.locale.INIT_LANGUAGE = c.locale.getLanguage();
  c.methods.checkPlain = function (d) {
    var e, f, g = {"&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;"};
    d = String(d);
    for (e in g)if (g.hasOwnProperty(e)) {
      f = RegExp(e, "g");
      d = d.replace(f, g[e])
    }
    return d
  };
  c.methods.formatString = function (d, e) {
    for (var f in e) {
      switch (f.charAt(0)) {
        case "@":
          e[f] =
            c.methods.checkPlain(e[f]);
          break;
        case "!":
          break;
        default:
          e[f] = '<em class="placeholder">' + c.methods.checkPlain(e[f]) + "</em>"
      }
      d = d.replace(f, e[f])
    }
    return d
  };
  c.methods.t = function (d, e, f) {
    if (c.locale.strings && c.locale.strings[f.context] && c.locale.strings[f.context][d])d = c.locale.strings[f.context][d];
    if (e)d = c.methods.formatString(d, e);
    return d
  };
  c.t = function (d, e, f) {
    if (typeof d === "string" && d.length > 0) {
      var g = c.locale.getLanguage();
      f = f || {context: g};
      return c.methods.t(d, e, f)
    } else throw{
      name: "InvalidArgumentException",
      message: "First argument is either not a string or empty."
    };
  };
  b.i18n = c
})(document, mejs);
(function (a) {
  if (typeof mejsL10n != "undefined")a[mejsL10n.language] = mejsL10n.strings
})(mejs.i18n.locale.strings);
(function (a) {
  a.de = {
    Fullscreen: "Vollbild",
    "Go Fullscreen": "Vollbild an",
    "Turn off Fullscreen": "Vollbild aus",
    Close: "Schlie\u00dfen"
  }
})(mejs.i18n.locale.strings);
(function (a) {
  a.zh = {
    Fullscreen: "\u5168\u87a2\u5e55",
    "Go Fullscreen": "\u5168\u5c4f\u6a21\u5f0f",
    "Turn off Fullscreen": "\u9000\u51fa\u5168\u5c4f\u6a21\u5f0f",
    Close: "\u95dc\u9589"
  }
})(mejs.i18n.locale.strings);
