/*
    Copyright (c) <2011, 2012> Rootof Creations HB, rootof.com, kickassapp.com
*/
(function (window) {
  var JSONP = (function () {
    var counter = 0,
      head,
      query,
      key,
      window = this;

    function load(url) {
      var script = document.createElement("script"),
        done = false;
      script.src = url;
      script.async = true;
      script.onload = script.onreadystatechange = function () {
        if (
          !done &&
          (!this.readyState ||
            this.readyState === "loaded" ||
            this.readyState === "complete")
        ) {
          done = true;
          script.onload = script.onreadystatechange = null;
          if (script && script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }
      };
      if (!head) {
        head = document.getElementsByTagName("head")[0];
        if (!head) head = document.body;
      }
      head.appendChild(script);
    }

    function jsonp(url, params, callback) {
      query = "?";
      params = params || {};
      for (key in params) {
        if (params.hasOwnProperty(key)) {
          query +=
            encodeURIComponent(key) +
            "=" +
            encodeURIComponent(params[key]) +
            "&";
        }
      }
      var jsonp = "json" + ++counter;
      window[jsonp] = function (data) {
        callback(data);
        try {
          delete window[jsonp];
        } catch (e) {}
        window[jsonp] = null;
      };
      load(url + query + "callback=" + jsonp);
      return jsonp;
    }

    return { get: jsonp };
  })();
  var CORS = {
    request: function (url, params, callback) {
      if (this.calledByExtension()) {
        this._callbacks[this._callbackId++] = callback;
        window.postMessage(
          JSON.stringify({
            from: "kickassapp-page",
            url: url,
            type: "callApi",
            params: params,
          }),
          "*"
        );
        return;
      }
      params = params || {};
      var query = "?";
      for (key in params) {
        if (params.hasOwnProperty(key)) {
          query +=
            encodeURIComponent(key) +
            "=" +
            encodeURIComponent(params[key]) +
            "&";
        }
      }
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          callback(JSON.parse(xhr.responseText));
        }
      };
      xhr.open("GET", url + query);
      xhr.withCredentials = true;
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send();
    },
    calledByExtension: function () {
      return !!document.getElementById(
        "kickass-has-been-initialized-yes-yes-yes"
      );
    },
    _callbacks: {},
    _callbackId: 0,
  };
  if (CORS.calledByExtension()) {
    window.addEventListener(
      "message",
      function (e) {
        var messageData;
        try {
          messageData = JSON.parse(e.data);
        } catch (e) {
          return;
        }
        if (
          messageData.from === "kickassapp-extension" &&
          messageData.sanityCheck === "kickassapp-extension-version1"
        ) {
          var message = messageData.payload;
          if (message.type === "response") {
            CORS._callbacks[message.requestId](message.body);
            delete CORS._callbacks[message.requestId];
          } else if (message.type === "destroy") {
            window.KICKASSGAME.destroy();
          }
        }
      },
      false
    );
  }

  function getGlobalNamespace() {
    return window && window.INSTALL_SCOPE ? window.INSTALL_SCOPE : window;
  }

  var Class = function (methods) {
    var ret = function () {
      if (ret.$prototyping) return this;
      if (typeof this.initialize == "function")
        return this.initialize.apply(this, arguments);
    };
    if (methods.Extends) {
      ret.parent = methods.Extends;
      methods.Extends.$prototyping = true;
      ret.prototype = new methods.Extends();
      methods.Extends.$prototyping = false;
    }
    for (var key in methods)
      if (methods.hasOwnProperty(key)) ret.prototype[key] = methods[key];
    return ret;
  };
  if (typeof exports != "undefined") exports.Class = Class;
  var Vector = new Class({
    initialize: function (x, y) {
      if (typeof x == "object") {
        this.x = x.x;
        this.y = x.y;
      } else {
        this.x = x;
        this.y = y;
      }
    },
    cp: function () {
      return new Vector(this.x, this.y);
    },
    mul: function (factor) {
      this.x *= factor;
      this.y *= factor;
      return this;
    },
    mulNew: function (factor) {
      return new Vector(this.x * factor, this.y * factor);
    },
    div: function (factor) {
      this.x /= factor;
      this.y /= factor;
      return this;
    },
    divNew: function (factor) {
      return new Vector(this.x / factor, this.y / factor);
    },
    add: function (vec) {
      this.x += vec.x;
      this.y += vec.y;
      return this;
    },
    addNew: function (vec) {
      return new Vector(this.x + vec.x, this.y + vec.y);
    },
    sub: function (vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      return this;
    },
    subNew: function (vec) {
      return new Vector(this.x - vec.x, this.y - vec.y);
    },
    rotate: function (angle) {
      var x = this.x,
        y = this.y;
      this.x = x * Math.cos(angle) - Math.sin(angle) * y;
      this.y = x * Math.sin(angle) + Math.cos(angle) * y;
      return this;
    },
    rotateNew: function (angle) {
      return this.cp().rotate(angle);
    },
    setAngle: function (angle) {
      var l = this.len();
      this.x = Math.cos(angle) * l;
      this.y = Math.sin(angle) * l;
      return this;
    },
    setAngleNew: function (angle) {
      return this.cp().setAngle(angle);
    },
    setLength: function (length) {
      var l = this.len();
      if (l) this.mul(length / l);
      else this.x = this.y = length;
      return this;
    },
    setLengthNew: function (length) {
      return this.cp().setLength(length);
    },
    normalize: function () {
      var l = this.len();
      if (l == 0) return this;
      this.x /= l;
      this.y /= l;
      return this;
    },
    normalizeNew: function () {
      return this.cp().normalize();
    },
    angle: function () {
      return Math.atan2(this.y, this.x);
    },
    collidesWith: function (rect) {
      return (
        this.x > rect.x &&
        this.y > rect.y &&
        this.x < rect.x + rect.width &&
        this.y < rect.y + rect.height
      );
    },
    len: function () {
      var l = Math.sqrt(this.x * this.x + this.y * this.y);
      if (l < 0.005 && l > -0.005) return 0;
      return l;
    },
    is: function (test) {
      return typeof test == "object" && this.x == test.x && this.y == test.y;
    },
    dot: function (v2) {
      return this.x * v2.x + this.y * v2.y;
    },
    inTriangle: function (a, b, c) {
      var v0 = c.subNew(a);
      var v1 = b.subNew(a);
      var v2 = p.subNew(a);
      var dot00 = v0.dot(v0);
      var dot01 = v0.dot(v1);
      var dot02 = v0.dot(v2);
      var dot11 = v1.dot(v1);
      var dot12 = v1.dot(v2);
      var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
      var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
      return u > 0 && v > 0 && u + v < 1;
    },
    distanceFrom: function (vec) {
      return Math.sqrt(
        Math.pow(this.x - vec.x, 2),
        Math.pow(this.y - vec.y, 2)
      );
    },
    toString: function () {
      return (
        "[Vector(" +
        this.x +
        ", " +
        this.y +
        ") angle: " +
        this.angle() +
        ", length: " +
        this.len() +
        "]"
      );
    },
  });
  if (typeof exports != "undefined") exports.Vector = Vector;
  var Rect = new Class({
    initialize: function (x, y, w, h) {
      this.pos = new Vector(x, y);
      this.size = { width: w, height: h };
    },
    hasPoint: function (point) {
      return (
        point.x > this.getLeft() &&
        point.x < this.getRight() &&
        point.y > this.getTop() &&
        point.y < this.getBottom()
      );
    },
    setLeft: function (left) {
      this.pos.x = left + this.size.width / 2;
    },
    setTop: function (top) {
      this.pos.y = top + this.size.height / 2;
    },
    getLeft: function () {
      return this.pos.x - this.size.width / 2;
    },
    getTop: function () {
      return this.pos.y - this.size.height / 2;
    },
    getRight: function () {
      return this.pos.x + this.size.width / 2;
    },
    getBottom: function () {
      return this.pos.y + this.size.height / 2;
    },
    cp: function () {
      return new Rect(
        this.pos.x,
        this.pos.y,
        this.size.width,
        this.size.height
      );
    },
  });
  if (typeof exports != "undefined") exports.Rect = Rect;
  var Fx = new Class({
    initialize: function () {
      this.listeners = [];
      this.tweens = {};
      this.running = {};
    },
    addListener: function (listener) {
      this.listeners.push(listener);
    },
    add: function (key, props) {
      props = props || {};
      props.duration = props.duration || 500;
      props.transition = props.transition || Tween.Linear;
      props.repeats =
        typeof props.repeats == "undefined" ? false : props.repeats;
      if (!props.tweens) {
        var start = props.start || 0;
        var end = typeof props.end == "undefined" ? 1 : props.end;
        props.tweens = [[start, end]];
      }
      this.tweens[key] = props;
    },
    update: function (time) {
      time = typeof time === "number" ? time : now();
      for (var key in this.tweens)
        if (this.tweens.hasOwnProperty(key)) {
          if (!this.running[key]) {
            this.tweenStart(key, time);
            continue;
          }
          var tween = this.tweens[key];
          var tdelta = time - this.running[key].startTime;
          if (tdelta > tween.duration) {
            this.tweenFinished(tween, key);
            continue;
          }
          var delta = tween.transition(tdelta / tween.duration);
          var changes = [];
          for (var i = 0, t; (t = tween.tweens[i]); i++) {
            var x = delta * (t[1] - t[0]) + t[0];
            changes.push(x);
          }
          this.fire(key, changes, delta);
        }
    },
    tweenStart: function (key, time) {
      this.running[key] = { startTime: time };
      var values = [];
      for (var i = 0, tween; (tween = this.tweens[key].tweens[i]); i++)
        values.push(tween[0]);
      this.fire(key, values, 0);
    },
    tweenFinished: function (tween, key) {
      var values = [];
      for (var i = 0, t; (t = tween.tweens[i]); i++) values.push(t[1]);
      this.fire(key, values, 1);
      if (!tween.repeats) {
        delete this.running[key];
        delete this.tweens[key];
        return;
      }
      this.tweenStart(key, now());
    },
    fire: function (key, values, delta) {
      for (var i = 0, listener; (listener = this.listeners[i]); i++)
        listener.set.call(listener, key, values, delta);
    },
  });
  var Tween = {
    Linear: function (x) {
      return x;
    },
    Quadratic: function (x) {
      return x * x;
    },
    Quintic: function (x) {
      return x * x * x;
    },
    Shake: function (x) {
      return Math.sin(x);
    },
  };
  var GameGlobals = {
    FPS: 60,
    useAnimationFrame: true,
    boids: { flockRadius: 400, size: 100 },
    path: function () {
      return (
        "https://kickassapp.com/" +
        Array.prototype.slice.call(arguments).join("")
      );
    },
    hasCanvas:
      typeof document.createElement("canvas").getContext !== "undefined",
    bulletColor: "black",
  };
  window.GameGlobals = GameGlobals;
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement) {
      if (this === void 0 || this === null) throw new TypeError();
      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) return -1;
      var n = 0;
      if (arguments.length > 0) {
        n = Number(arguments[1]);
        if (n !== n) n = 0;
        else if (n !== 0 && n !== 1 / 0 && n !== -(1 / 0))
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
      if (n >= len) return -1;
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) return k;
      }
      return -1;
    };
  }

  function now() {
    return new Date().getTime();
  }

  function bind(bound, func) {
    return function () {
      return func.apply(bound, arguments);
    };
  }

  function each(arr, func, bindObject) {
    if (typeof arr.forEach == "function") {
      arr.forEach(func, bindObject);
      return arr;
    }
    for (var key in arr)
      if (arr.hasOwnProperty(key))
        func.call(bindObject || window, arr[key], key);
    return arr;
  }

  function addEvent(obj, type, fn) {
    if (obj.addEventListener) obj.addEventListener(type, fn, false);
    else if (obj.attachEvent) {
      obj["e" + type + fn] = fn;
      obj[type + fn] = function () {
        return obj["e" + type + fn](window.event);
      };
      obj.attachEvent("on" + type, obj[type + fn]);
    }
  }

  function removeEvent(obj, type, fn) {
    if (obj.removeEventListener) obj.removeEventListener(type, fn, false);
    else if (obj.detachEvent) {
      obj.detachEvent("on" + type, obj[type + fn]);
      obj[type + fn] = null;
      obj["e" + type + fn] = null;
    }
  }

  function stopEvent(e) {
    if (e.stopPropogation) e.stopPropogation();
    if (e.preventDefault) e.preventDefault();
    e.returnValue = false;
  }

  function elementIsContainedIn(element1, element2) {
    if (element.contains) return element1.contains(element2);
    return !!(element1.compareDocumentPosition(element2) & 16);
  }

  function code(name) {
    var table = {
      38: "up",
      40: "down",
      37: "left",
      39: "right",
      27: "esc",
      17: "ctrl",
      76: "L",
      80: "P",  // 添加P键支持
      82: "R",  // 添加R键支持
      // 添加数字键的映射
      48: "0",
      49: "1",
      50: "2",
      51: "3",
      52: "4",
      53: "5",
      54: "6",
      55: "7",
      56: "8",
      57: "9",
    };
    if (table[name]) return table[name];
    return String.fromCharCode(name);
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function getRect(element) {
    if (typeof element.getBoundingClientRect === "function") {
      var rect = element.getBoundingClientRect();
      var sx = window.pageXOffset;
      var sy = window.pageYOffset;
      return {
        width: rect.width,
        height: rect.height,
        left: rect.left + sx,
        top: rect.top + sy,
      };
    }
    var rect = {
      width: element.offsetWidth,
      height: element.offsetHeight,
      left: 0,
      top: 0,
    };
    var el = element;
    while (el) {
      rect.left += el.offsetLeft;
      rect.top += el.offsetTop;
      el = el.offsetParent;
    }
    return rect;
  }

  function getCompatElement() {
    var doc = document;
    return !doc.compatMode || doc.compatMode == "CSS1Compat"
      ? doc.documentElement
      : doc.body;
  }

  function getScrollSize() {
    var doc = getCompatElement();
    var min = { x: doc.clientWidth, y: doc.clientHeight };
    var body = document.body;
    return {
      x: Math.max(doc.scrollWidth, body.scrollWidth, min.x),
      y: Math.max(doc.scrollHeight, body.scrollHeight, min.y),
    };
  }

  function getStyle(element, prop) {
    if (element.style[prop]) return element.style[prop];
    if (element.currentStyle) return element.currentStyle[prop];
    return document.defaultView
      .getComputedStyle(element, null)
      .getPropertyValue(prop);
  }

  function setStyles(element, props) {
    for (var key in props)
      if (props.hasOwnProperty(key)) {
        var val = props[key];
        if (typeof val === "number" && key !== "opacity" && key !== "zIndex")
          val = val + "px";
        element.style[key] = val;
      }
  }

  function hasClass(ele, cls) {
    return ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
  }

  function addClass(ele, cls) {
    if (!hasClass(ele, cls)) ele.className += " " + cls;
  }

  function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
      var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
      ele.className = ele.className.replace(reg, " ");
    }
  }

  function cloneElement(element) {
    return element.cloneNode(true);
  }

  function newElement(tag, props) {
    var el = document.createElement(tag);
    for (var key in props)
      if (props.hasOwnProperty(key)) {
        if (key === "styles") {
          setStyles(el, props[key]);
        } else {
          el[key] = props[key];
        }
      }
    return el;
  }

  var requestAnimFrame = (function () {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback, element) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();

  function delay(d, func, bound) {
    return setTimeout(bind(bound, func), d);
  }

  var KickAss = new Class({
    initialize: function (options) {
      if (options && options.mySite) {
        this.mySite = options.mySite;
      }
      this.players = [];
      this.elements = [];
      this.weaponClass = Weapons[1].cannonClass;
      this.scrollPos = new Vector(0, 0);
      this.scrollSize = new Vector(0, 0);
      this.windowSize = { width: 0, height: 0 };
      this.updateWindowInfo();
      this.bulletManager = new BulletManager(this);
      this.bulletManager.updateEnemyIndex();
      this.explosionManager = new ExplosionManager(this);
      this.ui = new UIManager(this);
      this.bombManager = new BombManager(this);
      this.menuManager = new MenuManager(this);
      this.menuManager.create();
      if (typeof StatisticsManager !== "undefined") {
        this.statisticsManager = new StatisticsManager(this);
      }
      this.sessionManager = new SessionManager(this);
      this.lastUpdate = now();
      this.keyMap = {};
      this.keydownEvent = bind(this, this.keydown);
      this.keyupEvent = bind(this, this.keyup);
      this.multiplier = 10;
      this.currentShipType = "Standard"; // 默认飞机类型
      this.bigBullets = false; // 追踪子弹大小状态
      this.gameStarted = false; // 游戏是否已启动
      
      // 显示游戏提示
      // setTimeout(function() {
      //   this.ui.showMessage("按 Ctrl+L 开始游戏！<br>游戏开始前键盘输入不受影响。", 5000);
      // }.bind(this), 1000);

      // 创建音频管理器
      this.audioManager = {
        explosion: new AudioManager(
          GameGlobals.path("static/sounds/game/explosion"),
          ["mp3", "ogg"]
        ),
        shot: new AudioManager(GameGlobals.path("static/sounds/game/shot"), [
          "mp3",
          "ogg",
        ]),
      };

      // 特殊处理胜利音效，使用完整路径
      try {
        this.victorySound = document.createElement("audio");
        this.victorySound.src = "https://www.byteoj.com/vector.mp3";
        this.victorySound.preload = "auto";
      } catch (e) {
        console.error("无法加载胜利音效", e);
      }

      // 创建飞机切换器
      this.createShipSwitcher();

      // 添加一个开始游戏按钮
      // this.createStartButton();
      if (window.KickAssStyle && window.KickAssStyle === "white") {
        GameGlobals.bulletColor = "white";
      }

      // 添加事件监听
      addEvent(document, "keydown", this.keydownEvent);
      addEvent(document, "keyup", this.keyupEvent);
      addEvent(document, "keypress", this.keydownEvent);

      // 用户首次交互时解锁音频
      var unlockAudio = bind(this, function () {
        if (this.victorySound) {
          // 创建静音的上下文来解锁音频
          this.victorySound.volume = 0;
          this.victorySound
            .play()
            .then(
              function () {
                this.victorySound.pause();
                this.victorySound.volume = 1;
              }.bind(this)
            )
            .catch(function () {});
        }

        // 移除事件监听器
        removeEvent(document, "click", unlockAudio);
        removeEvent(document, "keydown", unlockAudio);
        removeEvent(document, "touchstart", unlockAudio);
      });

      // 添加解锁音频的事件监听器
      addEvent(document, "click", unlockAudio);
      addEvent(document, "keydown", unlockAudio);
      addEvent(document, "touchstart", unlockAudio);
    },
    begin: function () {
      // 确保只有一台飞机
      this.clearAllPlayers(); // 先清除所有现有飞机
      this.addPlayer(); // 添加一台新飞机

      this.sessionManager.isPlaying = true;
      this.gameStarted = true; // 标记游戏已启动

      // 游戏开始时显示飞机选择按钮
      if (this.shipButtonsContainer) {
        this.shipButtonsContainer.style.display = "flex";
      }

      // 创建游戏状态指示器
      this.createGameStatusIndicator();

      if (!GameGlobals.useAnimationFrame) {
        this.loopTimer = window.setInterval(
          bind(this, this.loop),
          1000 / GameGlobals.FPS
        );
      }
      if (GameGlobals.useAnimationFrame) {
        requestAnimFrame(bind(this, this.loop));
      }

      this.ui.showMessage(
          "欢迎来到2509工作室扩展升级kickassapp项目的小游戏",
          3000
      );

      // 显示控制提示
      this.ui.showMessage(
        "游戏已开始！<br>方向键移动，空格射击<br>按ESC结束游戏<br>按P暂停/继续",
        5000
      );

    },
    
    // 创建游戏状态指示器
    createGameStatusIndicator: function() {
      // 先移除旧的状态指示器
      if (this.gameStatusIndicator) {
        if (this.gameStatusIndicator.parentNode) {
          this.gameStatusIndicator.parentNode.removeChild(this.gameStatusIndicator);
        }
        this.unregisterElement(this.gameStatusIndicator);
      }
      
      // 创建新的状态指示器
      var indicator = document.createElement("div");
      indicator.className = "KICKASSELEMENT game-status-indicator";
      indicator.style.position = "fixed";
      indicator.style.bottom = "10px";
      indicator.style.right = "10px";
      indicator.style.backgroundColor = "rgba(0,0,0,0.6)";
      indicator.style.color = "#fff";
      indicator.style.padding = "5px 10px";
      indicator.style.borderRadius = "5px";
      indicator.style.fontSize = "14px";
      indicator.style.zIndex = "10000001";
      indicator.style.cursor = "pointer";
      indicator.innerHTML = "游戏进行中 [P键暂停]";
      
      // 添加点击暂停/继续功能
      indicator.onclick = bind(this, function() {
        this.togglePause();
      });
      
      getAppContainerElement().appendChild(indicator);
      this.registerElement(indicator);
      this.gameStatusIndicator = indicator;
    },
    
    // 添加暂停/继续功能
    togglePause: function() {
      if (!this.gameStarted) return;
      
      this.isPaused = !this.isPaused;
      
      if (this.isPaused) {
        if (this.gameStatusIndicator) {
          this.gameStatusIndicator.innerHTML = "游戏已暂停 [P键继续]";
          this.gameStatusIndicator.style.backgroundColor = "rgba(255,0,0,0.6)";
        }
        this.ui.showMessage("游戏已暂停<br>按P键或点击右下角继续", 3000);
      } else {
        if (this.gameStatusIndicator) {
          this.gameStatusIndicator.innerHTML = "游戏进行中 [P键暂停]";
          this.gameStatusIndicator.style.backgroundColor = "rgba(0,0,0,0.6)";
        }
        this.ui.showMessage("游戏已继续", 1000);
      }
    },

    // 添加清除所有飞机的方法
    clearAllPlayers: function () {
      // 销毁所有现有飞机
      for (var i = 0; i < this.players.length; i++) {
        if (this.players[i]) {
          this.players[i].destroy();
        }
      }
      // 清空玩家数组
      this.players = [];
    },

    keydown: function (e) {
      var c = code(e.keyCode);
      this.keyMap[c] = true;

      // 添加检测Ctrl+L的逻辑
      if (c === "L" && this.keyMap["ctrl"]) {
        if (!this.gameStarted) {
          this.begin();
        } else {
          this.ui.showMessage("游戏已经开始！");
        }
        stopEvent(e);
        return;
      }

      // 仅在游戏已启动时处理游戏控制
      if (this.gameStarted) {
        // 添加检测Ctrl+数字键的逻辑，用于切换飞机类型
        if (this.keyMap["ctrl"] && !isNaN(parseInt(c))) {
          var shipIndex = c === "0" ? 10 : parseInt(c);
          this.switchShipByIndex(shipIndex);
          stopEvent(e);
          return;
        }

        switch (c) {
          case "left":
          case "right":
          case "up":
          case "down":
          case "esc":
          case " ":
          case "R":
          case "r": // 添加小写r键支持
          case "P": // 添加P键支持
          case "p": // 添加小写p键支持
            stopEvent(e);
            break;
        }
      }
      
      // 即使游戏未启动也处理的按键
      if (c === "ctrl") {
        // 不阻止Ctrl键的默认行为，除非与其他键配合使用
        // 只标记为已按下
      }
      
      switch (c) {
        case "esc":
          this.destroy();
          break;
        case "R": // 处理R键切换子弹大小
        case "r": // 添加小写r键支持
          if (this.gameStarted) {
            this.toggleBulletSize();
          }
          break;
        case "P": // 添加P键暂停/继续游戏
        case "p": // 添加小写p键支持
          if (this.gameStarted) {
            this.togglePause();
            stopEvent(e);
          }
          break;
      }
    },
    keyup: function (e) {
      var c = code(e.keyCode);
      this.keyMap[c] = false;
      
      // 仅在游戏已启动时阻止默认行为
      if (this.gameStarted) {
        switch (c) {
          case "left":
          case "right":
          case "up":
          case "down":
          case "esc":
          case " ":
            if (e.stopPropogation) {
              e.stopPropogation();
            }
            if (e.preventDefault) {
              e.preventDefault();
            }
            e.returnValue = false;
            break;
        }
      }
      
      // ctrl键特殊处理，仅在游戏中用于组合键时阻止
      if (c === "ctrl" && !this.gameStarted) {
        // 不阻止Ctrl键的默认行为
      }
    },
    loop: function () {
      var currentTime = now();
      var tdelta = (currentTime - this.lastUpdate) / 1000;
      this.updateWindowInfo();
      
      // 检查游戏是否暂停
      if (!this.isPaused) {
        for (var i = 0, player; (player = this.players[i]); i++) {
          player.update(tdelta);
        }
        this.bulletManager.update(tdelta);
        this.bombManager.update(tdelta);
        this.explosionManager.update(tdelta);
      }
      
      // UI总是更新
      this.ui.update(tdelta);
      
      if (this.statisticsManager && !this.isPaused) {
        this.statisticsManager.update(tdelta);
      }
      if (!this.isPaused) {
        this.sessionManager.update(tdelta);
      }
      
      this.lastUpdate = currentTime;
      if (GameGlobals.useAnimationFrame) {
        requestAnimFrame(bind(this, this.loop));
      }
    },
    addPlayer: function () {
      var data = false;
      var ship = Ships[this.currentShipType] || Ships.Standard;

      if (window.KICKASSSHIP && window.KICKASSSHIP.points) {
        ship = KICKASSSHIP;
      }
      if (this.mySite && this.mySite.getShipConfig()) {
        ship = this.mySite.getShipConfig();
      }

      // 创建新玩家
      var player = new Player(this);
      player.setShip(ship);

      // 清除旧玩家并添加新玩家
      this.clearAllPlayers();
      this.players.push(player);

      this.explosionManager.addExplosion(player.pos);
    },
    registerElement: function (el) {
      if (!el) {
        throw new Error("Can't register unexisting element.");
      }
      this.elements.push(el);
    },
    unregisterElement: function (el) {
      this.elements.splice(this.elements.indexOf(el), 1);
    },
    isKickAssElement: function (el) {
      for (var i = 0, element; (element = this.elements[i]); i++) {
        if (el === element || elementIsContainedIn(element, el)) {
          return true;
        }
      }
      return false;
    },
    isKeyPressed: function (key) {
      return !!this.keyMap[key];
    },
    updateWindowInfo: function () {
      var isIEQuirks =
        !!window.ActiveXObject && document.compatMode == "BackCompat";
      this.windowSize = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      };
      if (isIEQuirks) {
        this.windowSize.width = document.body.clientWidth;
        this.windowSize.height = document.body.clientHeight;
      }
      if (this.menuManager && this.menuManager.isVisible()) {
        this.windowSize.height -= this.menuManager.getHeight();
      }
      this.scrollPos.x =
        window.pageXOffset || document.documentElement.scrollLeft;
      this.scrollPos.y =
        window.pageYOffset || document.documentElement.scrollTop;
      this.scrollSize = getScrollSize();
    },
    hideAll: function () {
      for (var i = 0, el; (el = this.elements[i]); i++) {
        el.style.visibility = "hidden";
      }
    },
    showAll: function () {
      for (var i = 0, el; (el = this.elements[i]); i++) {
        el.style.visibility = "visible";
      }
    },
    updateShips: function (ship, isInitial) {
      if (!isInitial) {
        this.ui.showMessage(
          "You're now flying<br /><em>" + ship.name + "<em>!!"
        );
      }
      for (var i = 0, player; (player = this.players[i]); i++) {
        player.setShip(ship);
      }
    },
    changeWeapon: function (weapon, isInitial) {
      this.weaponClass = weapon.cannonClass;
      if (!isInitial) {
        this.ui.showMessage("Changed to " + weapon.name.toUpperCase() + "!!!!");
      }
      for (var i = 0, player; (player = this.players[i]); i++) {
        player.setCannons(weapon.cannonClass);
      }
    },
    changeWeaponById: function (id, isInitial) {
      if (Weapons[id]) {
        this.changeWeapon(Weapons[id], isInitial);
      }
    },
    flyOutPlayers: function (x, y) {
      for (var i = 0, player; (player = this.players[i]); i++) {
        player.flyTo(x, -player.size.height);
        player.isBound = false;
      }
    },
    flyInPlayers: function () {
      for (var i = 0, player; (player = this.players[i]); i++) {
        player.flyTo(player.pos.x, 100, function () {
          this.isBound = true;
        });
      }
    },
    newRank: function (rank) {
      this.ui.showMessage(
        "OMG. You leveled up to: <strong>" +
          rank +
          "</strong>!<br /><small>Be sure to check what cool new stuff you get in the menu.</small>"
      );
    },
    fireBomb: function () {
      this.bombManager.blow();
    },
    destroy: function () {
      removeEvent(document, "keydown", this.keydownEvent);
      removeEvent(document, "keypress", this.keydownEvent);
      removeEvent(document, "keyup", this.keyupEvent);
      for (var i = 0, player; (player = this.players[i]); i++) {
        player.destroy();
      }
      this.bulletManager.destroy();
      this.explosionManager.destroy();
      this.menuManager.destroy();
      if (!GameGlobals.useAnimationFrame) {
        clearInterval(this.loopTimer);
      }
      getGlobalNamespace().KICKASSGAME = false;
      if (this.isCampaign()) {
        document.location.reload();
      }
    },
    isCampaign: function () {
      return getGlobalNamespace().IS_CLOUDFLARE_GAME;
    },
    isMySite: function () {
      return !!getGlobalNamespace().KICKASS_SITE_KEY;
    },
    shouldShowAd: function () {
      return !this.mySite && !this.isCampaign();
    },
    shouldShowMenu: function () {
      return !this.mySite && !this.isCampaign();
    },
    shouldShowHowToImage: function () {
      return this.mySite || this.isCampaign();
    },
    createShipSwitcher: function () {
      // 创建飞机切换器容器
      var container = document.createElement("div");
      container.id = "ship-switcher-container";
      container.className = "KICKASSELEMENT";
      getAppContainerElement().appendChild(container);
      this.registerElement(container);

      // 创建飞机选择按钮的容器，初始时隐藏
      var shipButtonsContainer = document.createElement("div");
      shipButtonsContainer.id = "ship-buttons-container";
      shipButtonsContainer.className = "KICKASSELEMENT";
      shipButtonsContainer.style.display = "none"; // 游戏未开始时隐藏
      container.appendChild(shipButtonsContainer);
      this.registerElement(shipButtonsContainer);

      // 创建每种飞机的按钮
      // var shipTypes = Object.keys(Ships);
      // for (var i = 0; i < shipTypes.length; i++) {
      //   var shipType = shipTypes[i];
      //   var ship = Ships[shipType];
      //
      //   var button = document.createElement("div");
      //   button.className =
      //     "ship-button KICKASSELEMENT" +
      //     (shipType === this.currentShipType ? " active" : "");
      //   button.setAttribute("data-ship-type", shipType);
      //   button.innerHTML =
      //     '<div class="ship-icon">' +
      //     (i + 1) +
      //     "</div>" +
      //     '<div class="ship-tooltip">' +
      //     ship.name +
      //     "</div>";
      //
      //   shipButtonsContainer.appendChild(button); // 添加到飞机按钮容器
      //   this.registerElement(button);
      //
      //   // 保存对当前按钮的引用和飞机类型
      //   (function (currentButton, currentShipType) {
      //     currentButton.onclick = function (e) {
      //       e = e || window.event;
      //       if (e.preventDefault) e.preventDefault();
      //       if (e.stopPropagation) e.stopPropagation();
      //
      //       // 调试信息
      //       console.log("切换飞机类型为:", currentShipType);
      //
      //       // 切换飞机类型
      //       GameGlobals.kickass.switchShipType(currentShipType);
      //
      //       // 更新所有按钮状态
      //       var allButtons = document.querySelectorAll(".ship-button");
      //       for (var j = 0; j < allButtons.length; j++) {
      //         if (allButtons[j] === currentButton) {
      //           addClass(allButtons[j], "active");
      //         } else {
      //           removeClass(allButtons[j], "active");
      //         }
      //       }
      //
      //       return false;
      //     };
      //   })(button, shipType);
      // }

      // 保存对容器的引用，以便在游戏开始时显示飞机按钮
      this.shipButtonsContainer = shipButtonsContainer;

      // 创建键盘快捷键提示
      // var shortcutInfo = document.createElement("div");
      // shortcutInfo.className = "shortcut-info KICKASSELEMENT";
      // shortcutInfo.innerHTML = "按下 Ctrl+1 至 Ctrl+" + shipTypes.length + " 切换飞机类型";
      // container.appendChild(shortcutInfo);
      // this.registerElement(shortcutInfo);
    },

    // createStartButton: function () {
    //   // 创建开始游戏按钮容器
    //   var startButtonContainer = document.createElement("div");
    //   startButtonContainer.className = "start-button KICKASSELEMENT";
    //   getAppContainerElement().appendChild(startButtonContainer);
    //   this.registerElement(startButtonContainer);
    //
    //   // 添加按钮内容
    //   startButtonContainer.innerHTML =
    //     '<div class="start-icon">▶</div>' +
    //     '<div class="ship-tooltip">点击开始游戏 (或按 Ctrl+L)</div>';
    //
    //   // 添加点击事件
    //   startButtonContainer.onclick = function (e) {
    //     e = e || window.event;
    //     if (e.preventDefault) e.preventDefault();
    //     if (e.stopPropagation) e.stopPropagation();
    //
    //     // 如果游戏未开始，则开始游戏
    //     if (!GameGlobals.kickass.gameStarted) {
    //       GameGlobals.kickass.begin();
    //       GameGlobals.kickass.ui.showMessage(
    //         "游戏开始！<br>使用方向键移动，空格键射击<br>Ctrl+1~" +
    //           Object.keys(Ships).length +
    //           " 切换飞机"
    //       );
    //     } else {
    //       GameGlobals.kickass.ui.showMessage("游戏已经开始！");
    //     }
    //
    //     return false;
    //   };
    // },
    switchShipType: function (shipType) {
      if (Ships[shipType]) {
        // 清除所有现有飞机
        this.clearAllPlayers();

        // 设置新的飞机类型
        this.currentShipType = shipType;

        // 添加一台新飞机
        this.addPlayer();

        this.ui.showMessage(
          "切换为 <strong>" + Ships[shipType].name + "</strong> 飞船！"
        );
      }
    },

    switchShipByIndex: function (index) {
      // 获取所有飞机类型
      var shipTypes = Object.keys(Ships);

      // 确保索引在有效范围内
      if (index >= 1 && index <= shipTypes.length) {
        var shipType = shipTypes[index - 1]; // 索引从1开始，但数组从0开始

        // 修改切换消息以显示快捷键信息
        var oldShipType = this.currentShipType;
        this.currentShipType = shipType;
        this.clearAllPlayers();
        this.addPlayer();

        this.ui.showMessage(
          "通过 Ctrl+" +
            index +
            " 切换为 <strong>" +
            Ships[shipType].name +
            "</strong> 飞船！"
        );

        // 同时更新按钮的视觉状态
        var allButtons = document.querySelectorAll(".ship-button");
        for (var j = 0; j < allButtons.length; j++) {
          var buttonShipType = allButtons[j].getAttribute("data-ship-type");
          if (buttonShipType === shipType) {
            addClass(allButtons[j], "active");
          } else {
            removeClass(allButtons[j], "active");
          }
        }
      } else {
        this.ui.showMessage("无效的飞机类型索引: " + index);
      }
    },
    toggleBulletSize: function () {
      this.bigBullets = !this.bigBullets;
      var message = this.bigBullets ? "超级子弹模式！" : "恢复普通子弹";
      this.ui.showMessage(message);
    },
  });
  window.KickAss = KickAss;
  var StatisticsManager = new Class({
    initialize: function (game) {
      this.game = game;
      this.data = {};
      this.data.startedPlaying = now();
      this.data.elementsDestroyed = 0;
      this.data.shotsFired = 0;
      this.data.distanceFlownInPixels = 0;
      this.data.totalPointsThisSession = 0;
      this.data.usedThrusters = 0;
      this.lastUpdate = 0;
    },
    usedThrusters: function () {
      this.data.usedThrusters = 1;
    },
    increaseDistanceWithPixels: function (px) {
      this.data.distanceFlownInPixels += px;
    },
    increasePointsGainedWithPoints: function (points) {
      this.data.totalPointsThisSession += points;
    },
    addShotFired: function () {
      this.data.shotsFired++;
      if (this.game.audioManager.shot) {
        this.game.audioManager.shot.play();
      }
    },
    addElementsDestroyed: function () {
      this.data.elementsDestroyed++;
    },
    update: function (tdelta) {
      this.lastUpdate += tdelta;
      if (this.lastUpdate > 0.25) {
        this.syncWithServer();
        this.lastUpdate = 0;
      }
    },
    syncWithServer: function () {
      var fragment = [];
      for (var key in this.data)
        if (this.data.hasOwnProperty(key)) {
          fragment.push(key + ":" + this.data[key]);
        }
      this.game.menuManager.sendMessageToMenu("stats:!" + fragment.join("|"));
    },
  });
  var MySite = new Class({
    initialize: function (key) {
      this.key = key;
    },
    load: function (callback) {
      CORS.request(
        GameGlobals.path("mysite/api.json"),
        {
          site_key: this.key,
          url: document.location.toString(),
        },
        bind(this, function (data) {
          if (data && data.embed) {
            this.mySiteData = data.embed;
            callback(true);
          } else {
            callback(false);
          }
        })
      );
    },
    install: function () {},
    getShipId: function () {
      return this.mySiteData && this.mySiteData.settings.ship;
    },
    getShipConfig: function () {
      return this.mySiteData && this.mySiteData.settings.ship_config;
    },
    getShareURL: function () {
      return this.mySiteData && this.mySiteData.settings.share_url;
    },
  });
  var Menu = new Class({
    initialize: function (game) {
      this.game = game;
      this.size = { height: 300 };
    },
    generate: function (parent) {
      this.container = document.createElement("div");
      this.container.className = "KICKASSELEMENT";
      this.container.id = "kickass-profile-menu";
      parent.appendChild(this.container);
      var shipId = getGlobalNamespace().KICKASSSHIPID || "";
      this.url = GameGlobals.path(
        "intermediate_postmessage.html?url=" +
          encodeURIComponent(
            getGlobalNamespace().KICKASSURL || document.location.href
          ) +
          "&origin=" +
          encodeURIComponent(document.location.href) +
          "&preship=" +
          shipId +
          "&is_campaign=" +
          (this.game.isCampaign() ? "true" : "") +
          "&is_mysite=" +
          (this.game.isMySite() ? "true" : "")
      );
      this.isSocketReady = false;
      this.socketIframe = document.createElement("iframe");
      this.socketIframe.frameborder = "0";
      this.socketIframe.className = "KICKASSELEMENT";
      this.socketIframe.width = "100%";
      this.socketIframe.height = this.size.height + "px";
      this.container.appendChild(this.socketIframe);
      this.menuOrigin = "https://kickassapp.com/".replace(/\/$/, "");
      this.socketIframe.src = this.url;
      this.onMessage = bind(this, function (event) {
        if (
          event.origin !== this.menuOrigin &&
          event.origin !== this.menuOrigin.replace("http://", "https://")
        ) {
          console.log("ignoring event from", event.origin);
          return;
        }
        var message = event.data;
        if (message === "ready") {
          this.onGameReady();
          return;
        }
        var t = message.split(":!");
        if (t.length !== 2) {
          return;
        }
        var type = t.shift().replace(/^./g, function (match) {
          return match.charAt(0).toUpperCase();
        });
        if (typeof this["messageType" + type] === "function") {
          this["messageType" + type](t.join(":!"));
        }
      });
      window.addEventListener("message", this.onMessage, false);
      this.game.registerElement(this.container);
    },
    socketPostMessage: function (message) {
      this.socketIframe.contentWindow.postMessage(message, this.menuOrigin);
    },
    onGameReady: function () {
      this.isSocketReady = true;
      this.game.registerElement(
        this.container.getElementsByTagName("iframe")[0]
      );
      this.socketPostMessage(
        "url:!" + (getGlobalNamespace().KICKASSURL || document.location.href)
      );
      if (this.game.statisticsManager) {
        this.game.statisticsManager.syncWithServer();
      }
      this.game.menuManager.onGameReady();
    },
    sendMessage: function (message) {
      if (!this.isSocketReady) {
        return;
      }
      if (message != this.lastMessage) {
        try {
          this.socketPostMessage(message);
        } catch (e) {}
        this.lastMessage = message;
      }
    },
    messageTypeChangeShip: function (pieces) {
      pieces = pieces.split(",");
      var shipId = pieces[0];
      var weaponId = pieces[1];
      var isInitial = pieces[2] === "initial";
      if (this.shipId === shipId) {
        return;
      }
      if (isInitial && getGlobalNamespace().KICKASSSHIP) {
        return;
      }
      this.shipId = shipId;
      CORS.request(
        GameGlobals.path("designer/ship/" + shipId + "/construction.json"),
        {
          ship_id: shipId,
          is_initial: isInitial ? "1" : "0",
        },
        bind(this, function (data) {
          this.game.updateShips(data.data, isInitial);
          try {
            window.focus();
          } catch (e) {}
        })
      );
      if (!isInitial) {
        this.parent.hideMenu();
      }
    },
    messageTypeChangeWeapon: function (weaponId, isInitial) {
      this.game.changeWeaponById(weaponId, isInitial);
    },
    messageTypeSetMultiplier: function (mod) {
      mod = parseInt(mod, 10);
      if (isNaN(mod) || !mod) {
        return;
      }
      this.game.multiplier = mod;
    },
    messageTypeNewRank: function (rank) {
      this.game.newRank(rank);
    },
    messageTypePlayerMessage: function (message) {
      this.game.ui.showMessage(message);
    },
    destroy: function () {
      this.game.unregisterElement(this.container);
      this.game.unregisterElement(this.iframe);
      window.removeEventListener("message", this.onMessage, false);
      this.container.parentNode.removeChild(this.container);
    },
  });
  var MenuManager = new Class({
    initialize: function (game) {
      this.game = game;
      this.numPoints = 0;
      if (!getGlobalNamespace().KICKASS_INLINE_CSS) {
        this.includeCSS(GameGlobals.path("css/menustyles.css"));
      }
    },
    generateDefaults: function () {
      for (var id in Weapons)
        if (Weapons.hasOwnProperty(id)) {
          this.addWeapon(Weapons[id], id);
        }
      this.hideBombMenu();
    },
    create: function () {
      this.container = document.createElement("div");
      this.container.className =
        "KICKASSELEMENT KICKASShidden " +
        (this.game.shouldShowMenu() ? "" : "KICKASSNOMENU");
      this.container.id = "kickass-menu";
      if (this.game.shouldShowMenu()) {
        this.container.style.bottom = "-250px";
        this.container.style.display = "none";
      } else {
        removeClass(this.container, "KICKASShidden");
      }
      getAppContainerElement().appendChild(this.container);
      var adHTML = "";
      this.container.innerHTML = '<div id="kickass-howto-image" class="KICKASSELEMENT kickass-howto-invisible"></div>' +
          '<div id="kickass-pointstab" style="width: 200px;" class="KICKASSELEMENT">' +
          adHTML +
          '<div id="kickass-bomb-menu" class="KICKASSELEMENT KICKASShidden">' +
          '<ul id="kickass-bomb-list" class="KICKASSELEMENT">' +
          "</ul>" +
          "</div>" +
          '<div id="kickass-weapons-menu" class="KICKASSELEMENT KICKASShidden" style="display:none">' +
          '<ul id="kickass-weapons-list" class="KICKASSELEMENT">' +
          "</ul>" +
          "</div>" +
          '<div id="kickass-pointstab-wrapper" class="KICKASSELEMENT">' +
          '<div id="kickass-points" class="KICKASSELEMENT">' +
          this.numPoints +
          "</div>" +
          '<div id="kickass-esctoquit" class="KICKASSELEMENT">Press esc to quit</div>' +
          this.getShareHTML() +
          "</div>" +
          "</div>";

      this.pointsTab = document.getElementById("kickass-pointstab");
      this.pointsTabWrapper = document.getElementById(
        "kickass-pointstab-wrapper"
      );
      this.points = document.getElementById("kickass-points");
      this.escToQuit = document.getElementById("kickass-esctoquit");
      this.howToImage = document.getElementById("kickass-howto-image");
      this.weaponsMenu = document.getElementById("kickass-weapons-menu");
      this.weaponsList = document.getElementById("kickass-weapons-list");
      this.bombLink = document.getElementById("kickass-bomb-menu");
      var all = this.container.getElementsByTagName("*");
      for (var i = 0; i < all.length; i++) {
        this.game.registerElement(all[i]);
      }
      this.game.registerElement(this.container);
      if (this.game.shouldShowMenu()) {
        this.menu = new Menu(this.game);
        this.menu.parent = this;
        this.menu.generate(this.container);
      } else {
        setTimeout(
          function () {
            this.onGameReady();
          }.bind(this),
          100
        );
      }
      addEvent(
        this.bombLink,
        "click",
        bind(this, function (e) {
          stopEvent(e);
          this.game.fireBomb();
        })
      );
      addEvent(this.pointsTabWrapper, "click", bind(this, this.toggleMenu));
      addEvent(this.weaponsMenu, "click", bind(this, this.toggleWeaponsMenu));
      this.generateDefaults();
    },
    getShareHTML: function () {
      return "";
    },
    onGameReady: function () {
      this.container.style.display = "block";
      if (this.game.shouldShowHowToImage()) {
        setTimeout(
          bind(this, function () {
            removeClass(this.howToImage, "kickass-howto-invisible");
          }),
          10
        );
        setTimeout(
          bind(this, function () {
            addClass(this.howToImage, "kickass-howto-invisible");
          }),
          4000
        );
      }
    },
    navigateTo: function (page, dontShowMenu) {
      if (!dontShowMenu) {
        this.showMenu();
      }
      if (this.menu) {
        this.menu.socketPostMessage("navigate:!" + page);
      }
    },
    toggleMenu: function () {
      if (this.game.shouldShowMenu()) {
        if (hasClass(this.container, "KICKASShidden")) {
          this.showMenu();
        } else {
          this.hideMenu();
        }
      } else {
        this.showMenu();
      }
    },
    toggleWeaponsMenu: function () {
      if (hasClass(this.weaponsMenu, "KICKASShidden")) {
        this.showWeaponsMenu();
      } else {
        this.hideWeaponsMenu();
      }
    },
    hideWeaponsMenu: function () {
      this.weaponsMenu.style.width = "";
      addClass(this.weaponsMenu, "KICKASShidden");
    },
    showWeaponsMenu: function () {
      var last = this.weaponsMenu.getElementsByTagName("li");
      last = last[last.length - 1];
      this.weaponsMenu.style.width =
        last.offsetLeft + last.offsetWidth - 47 + "px";
      removeClass(this.weaponsMenu, "KICKASShidden");
    },
    showMenu: function () {
      if (this.game.shouldShowMenu()) {
        this.container.style.bottom = "";
        removeClass(this.container, "KICKASShidden");
      }
    },
    hideMenu: function () {
      this.container.style.bottom = "";
      addClass(this.container, "KICKASShidden");
    },
    showBombMenu: function () {
      this.bombLink.style.width = "";
    },
    hideBombMenu: function () {
      this.bombLink.style.width = "0px";
    },
    getHeight: function () {
      return this.container.clientHeight;
    },
    isVisible: function () {
      return !hasClass(this.container, "KICKASShidden");
    },
    addPoints: function (killed, pos) {
      var points = killed * this.game.multiplier;
      this.numPoints += points;
      this.points.innerHTML = this.numPoints;
      if (this.game.statisticsManager) {
        this.game.statisticsManager.increasePointsGainedWithPoints(points);
      }
      this.game.ui.addPointsBubbleAt(pos, points);
    },
    includeCSS: function (file) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = file;
      (document.head || document.body).appendChild(link);
    },
    sendMessageToMenu: function (fragment) {
      if (this.menu) {
        this.menu.sendMessage(fragment);
      }
    },
    addWeapon: function (weapon, id) {
      var li = document.createElement("li");
      li.className = "KICKASSELEMENT kickass-weapon-item";
      li.weapon = weapon;
      li.style.backgroundImage =
        "url(" +
        GameGlobals.path("css/gfx/kickass/weap-" + weapon.id + ".png") +
        ")";
      li.innerHTML = '<span class="KICKASSELEMENT">' + weapon.name + "</span>";
      this.weaponsList.appendChild(li);
      addEvent(
        li,
        "click",
        bind(this, function (e) {
          stopEvent(e);
          this.changeWeapon(weapon);
          this.sendMessageToMenu("changeWeapon:!" + id);
        })
      );
    },
    changeWeapon: function (weapon) {
      this.game.changeWeapon(weapon);
    },
    destroy: function () {
      var all = this.container.getElementsByTagName("*");
      for (var i = 0; i < all.length; i++) {
        this.game.unregisterElement(all[i]);
      }
      this.game.unregisterElement(this.container);
      if (this.menu) {
        this.menu.destroy();
      }
      this.container.parentNode.removeChild(this.container);
    },
  });
  var UIManager = new Class({
    initialize: function (game) {
      this.UNIQID = 0;
      this.game = game;
      this.pointBubbles = {};
      this.messages = {};
      this.fx = new Fx();
      this.fx.addListener(this);
    },
    update: function (tdelta) {
      this.fx.update();
    },
    set: function (key, value, delta) {
      var type = key.split("-")[0];
      var id = key.split("-")[1];
      if (this.pointBubbles[id]) {
        var bubble = this.pointBubbles[id];
        bubble.style.top = value[0] + "px";
        bubble.style.opacity = value[1];
        if (delta == 1 && bubble.parentNode) {
          bubble.parentNode.removeChild(bubble);
          delete this.pointBubbles[id];
        }
      } else if (this.messages[id] && type == "messagedown") {
        var message = this.messages[id];
        message.style.top = value[0] + "px";
        if (delta == 1) {
          setTimeout(
            bind(this, function () {
              this.fx.add("messageup-" + id, {
                tweens: [[value[0], -100]],
                transition: Tween.Quadratic,
                duration: 300,
              });
            }),
            message.staytime || 4000
          );
        }
      } else if (this.messages[id] && type == "messageup") {
        var message = this.messages[id];
        message.style.top = value[0] + "px";
        if (delta == 1) {
          message.parentNode.removeChild(message);
          delete this.messages[id];
        }
      }
    },
    addPointsBubbleAt: function (pos, points) {
      var id = "bubble" + this.UNIQID++;
      var y = this.game.scrollPos.y + pos.y;
      var bubble = newElement("span", {
        innerHTML: points,
        className: "KICKASSELEMENT",
        styles: {
          position: "absolute",
          font: "20px Arial",
          fontWeight: "bold",
          opacity: "1",
          color: "black",
          textShadow: "#fff 1px 1px 3px",
          top: y,
          zIndex: "10000000",
        },
      });
      bubble.style.left = pos.x - bubble.offsetWidth / 2 + "px";
      getAppContainerElement().appendChild(bubble);
      this.pointBubbles[id] = bubble;
      this.fx.add("bubble-" + id, {
        tweens: [
          [y, y - 15],
          [1, 0],
        ],
      });
    },
    showMessage: function (html, staytime) {
      staytime = staytime || false;
      var width = 300;
      var id = this.UNIQID++;
      var message = newElement("div", {
        innerHTML: html,
        className: "KICKASSELEMENT",
        id: "kickass-message-" + id,
        styles: {
          position: "fixed",
          top: -100,
          left: "50%",
          marginLeft: -width / 2,
          width: width,
          background: "#222",
          opacity: 0.8,
          padding: "10px",
          color: "#fff",
          textAlign: "center",
          borderRadius: 15,
          font: "20px Arial",
          fontWeight: "bold",
          zIndex: "10000000",
        },
      });
      message.staytime = staytime;
      getAppContainerElement().appendChild(message);
      var to = this.getLowestBubbleY();
      message.kickassto = to;
      this.fx.add("messagedown-" + id, {
        duration: 300,
        tweens: [[-100, to]],
        transition: Tween.Quadratic,
      });
      this.messages[id] = message;
      return message;
    },
    getLowestBubbleY: function () {
      var top = 100;
      for (var id in this.messages)
        if (this.messages.hasOwnProperty(id))
          top = Math.max(
            this.messages[id].kickassto + this.messages[id].offsetHeight + 10,
            top
          );
      return top;
    },
  });
  var AudioManager = new Class({
    initialize: function (src, formats) {
      this.src = src;
      this.formats = formats;
      channels = 8;
      this.supportsAudio =
        typeof document.createElement("audio").play != "undefined";
      if (this.supportsAudio) {
        this.numChannels = channels;
        this.channels = [];
        for (var i = 0; i < this.numChannels; i++) {
          this.channels.push({
            isPlaying: false,
            element: this.prepareElement(this.buildAudioElement()),
          });
        }
      }
    },
    buildAudioElement: function () {
      var TYPES = { ogg: "audio/ogg", mp3: "audio/mpeg" };
      var audio = document.createElement("audio");
      for (var i = 0, format; (format = this.formats[i]); i++) {
        var source = document.createElement("source");
        source.src = this.src + "." + format;
        source.type = TYPES[format];
        audio.appendChild(source);
      }
      return audio;
    },
    prepareElement: function (el) {
      if (typeof el.addEventListener == "undefined") return el;
      var self = this;
      el.addEventListener(
        "ended",
        function (e) {
          self.audioEnded(el);
        },
        false
      );
      return el;
    },
    audioEnded: function (target) {
      for (var i = 0, channel; (channel = this.channels[i]); i++) {
        if (channel.element === target) {
          channel.isPlaying = false;
        }
      }
    },
    play: function () {
      if (!this.supportsAudio) return;
      for (var i = 0, channel; (channel = this.channels[i]); i++) {
        if (!channel.isPlaying) {
          channel.isPlaying = true;
          if (typeof channel.element.play == "function") channel.element.play();
          return;
        }
      }
    },
  });
  var Ships = {
    Standard: {
      name: "战斗机",
      // 定义一个更大、更炫酷的飞机形状
      points: [
        [-20, 15], // 左翼尖端
        [-15, 5], // 左翼内侧
        [-8, 0], // 左侧机身
        [-10, -20], // 左侧机头
        [0, -25], // 机头尖端
        [10, -20], // 右侧机头
        [8, 0], // 右侧机身
        [15, 5], // 右翼内侧
        [20, 15], // 右翼尖端
        [0, 10], // 尾部
      ],
      thrusters: [
        { s: { w: 30, h: 10 }, p: { x: -10, y: 15 }, a: 0 }, // 左侧推进器
        { s: { w: 30, h: 10 }, p: { x: 10, y: 15 }, a: 0 }, // 右侧推进器
      ],
      cannons: [
        { p: { x: -8, y: -20 }, a: 0 }, // 左侧炮口
        { p: { x: 8, y: -20 }, a: 0 }, // 右侧炮口
      ],
      colors: {
        primary: "#3498db", // 蓝色
        secondary: "#9b59b6", // 紫色
        tertiary: "#2ecc71", // 绿色
      },
    },
    Stealth: {
      name: "隐形战机",
      points: [
        [-25, 15], // 左翼尖端
        [-15, 5], // 左翼内侧
        [-10, -5], // 左侧机身
        [-5, -20], // 左侧机头
        [0, -25], // 机头尖端
        [5, -20], // 右侧机头
        [10, -5], // 右侧机身
        [15, 5], // 右翼内侧
        [25, 15], // 右翼尖端
        [0, 10], // 尾部
      ],
      thrusters: [
        { s: { w: 20, h: 8 }, p: { x: -7, y: 10 }, a: 0 },
        { s: { w: 20, h: 8 }, p: { x: 7, y: 10 }, a: 0 },
      ],
      cannons: [
        { p: { x: -5, y: -20 }, a: 0 },
        { p: { x: 5, y: -20 }, a: 0 },
      ],
      colors: {
        primary: "#2c3e50", // 深蓝色
        secondary: "#34495e", // 深灰蓝
        tertiary: "#95a5a6", // 灰色
      },
    },
    Spaceship: {
      name: "太空船",
      points: [
        [-15, 10], // 左后翼
        [-10, -5], // 左侧机身
        [-12, -15], // 左侧机头
        [0, -20], // 机头尖端
        [12, -15], // 右侧机头
        [10, -5], // 右侧机身
        [15, 10], // 右后翼
        [7, 15], // 右侧尾部
        [0, 18], // 中间尾部
        [-7, 15], // 左侧尾部
      ],
      thrusters: [
        { s: { w: 12, h: 6 }, p: { x: -4, y: 18 }, a: 0 },
        { s: { w: 12, h: 6 }, p: { x: 4, y: 18 }, a: 0 },
      ],
      cannons: [
        { p: { x: -6, y: -15 }, a: 0 },
        { p: { x: 6, y: -15 }, a: 0 },
        { p: { x: 0, y: -18 }, a: 0 },
      ],
      colors: {
        primary: "#e74c3c", // 红色
        secondary: "#f39c12", // 橙色
        tertiary: "#f1c40f", // 黄色
      },
    },
    TriangleShip: {
      name: "三角战舰",
      points: [
        [-30, 20], // 左翼尖端
        [-15, 10], // 左翼中段
        [-10, 0], // 左侧机身
        [0, -30], // 机头尖端
        [10, 0], // 右侧机身
        [15, 10], // 右翼中段
        [30, 20], // 右翼尖端
      ],
      thrusters: [{ s: { w: 25, h: 8 }, p: { x: 0, y: 20 }, a: 0 }],
      cannons: [{ p: { x: 0, y: -25 }, a: 0 }],
      colors: {
        primary: "#1abc9c", // 青绿色
        secondary: "#16a085", // 深青绿色
        tertiary: "#2ecc71", // 绿色
      },
    },
    UFO: {
      name: "飞碟",
      points: [
        [-25, 0], // 左侧
        [-20, -5], // 左上侧
        [-10, -10], // 左顶部
        [0, -12], // 顶部中心
        [10, -10], // 右顶部
        [20, -5], // 右上侧
        [25, 0], // 右侧
        [20, 5], // 右下侧
        [10, 8], // 右底部
        [0, 10], // 底部中心
        [-10, 8], // 左底部
        [-20, 5], // 左下侧
      ],
      thrusters: [
        { s: { w: 10, h: 5 }, p: { x: -15, y: 5 }, a: 0 },
        { s: { w: 10, h: 5 }, p: { x: 0, y: 8 }, a: 0 },
        { s: { w: 10, h: 5 }, p: { x: 15, y: 5 }, a: 0 },
      ],
      cannons: [{ p: { x: 0, y: -12 }, a: 0 }],
      colors: {
        primary: "#9b59b6", // 紫色
        secondary: "#8e44ad", // 深紫色
        tertiary: "#ecf0f1", // 白色
      },
    },
    // 添加新的飞机设计
    J60: {
      name: "歼60战机",
      // 更大、更详细的战斗机形状
      points: [
        [-35, 30], // 左翼尖端
        [-32, 25], // 左翼外部
        [-28, 20], // 左翼中部
        [-25, 15], // 左翼内部
        [-22, 10], // 左翼根部
        [-18, 5], // 左侧尾翼连接点
        [-15, 0], // 左侧机身中部
        [-12, -5], // 左侧前机身
        [-15, -15], // 左侧前机翼
        [-10, -25], // 左侧机头
        [-5, -30], // 机头左侧
        [0, -35], // 机头尖端
        [5, -30], // 机头右侧
        [10, -25], // 右侧机头
        [15, -15], // 右侧前机翼
        [12, -5], // 右侧前机身
        [15, 0], // 右侧机身中部
        [18, 5], // 右侧尾翼连接点
        [22, 10], // 右翼根部
        [25, 15], // 右翼内部
        [28, 20], // 右翼中部
        [32, 25], // 右翼外部
        [35, 30], // 右翼尖端
        [10, 28], // 右侧尾部
        [0, 32], // 垂直尾翼
        [-10, 28], // 左侧尾部
      ],
      thrusters: [
        { s: { w: 35, h: 12 }, p: { x: -12, y: 28 }, a: 0 }, // 左侧推进器
        { s: { w: 35, h: 12 }, p: { x: 12, y: 28 }, a: 0 }, // 右侧推进器
      ],
      cannons: [
        { p: { x: -12, y: -25 }, a: 0 }, // 左侧主炮
        { p: { x: 12, y: -25 }, a: 0 }, // 右侧主炮
        { p: { x: -20, y: 5 }, a: 0 }, // 左侧副炮
        { p: { x: 20, y: 5 }, a: 0 }, // 右侧副炮
      ],
      colors: {
        primary: "#34495e", // 深灰蓝
        secondary: "#2980b9", // 蓝色
        tertiary: "#f39c12", // 橙色高光
      },
    },
    AdvancedFighter: {
      name: "先进战斗机",
      // 大型先进战斗机形状
      points: [
        [-30, 25], // 左翼尖端
        [-28, 20], // 左翼外侧
        [-25, 15], // 左翼内侧
        [-20, 10], // 左后翼
        [-18, 5], // 左侧机身
        [-15, 0], // 左侧中段
        [-18, -5], // 左前翼根部
        [-22, -15], // 左前翼尖
        [-15, -20], // 左前机身
        [-10, -30], // 左机头侧
        [-5, -35], // 左机头前
        [0, -40], // 机头尖端
        [5, -35], // 右机头前
        [10, -30], // 右机头侧
        [15, -20], // 右前机身
        [22, -15], // 右前翼尖
        [18, -5], // 右前翼根部
        [15, 0], // 右侧中段
        [18, 5], // 右侧机身
        [20, 10], // 右后翼
        [25, 15], // 右翼内侧
        [28, 20], // 右翼外侧
        [30, 25], // 右翼尖端
        [15, 20], // 右尾部
        [10, 25], // 右垂尾
        [5, 30], // 右垂尾顶
        [0, 35], // 中央垂尾
        [-5, 30], // 左垂尾顶
        [-10, 25], // 左垂尾
        [-15, 20], // 左尾部
      ],
      thrusters: [
        { s: { w: 40, h: 15 }, p: { x: -15, y: 25 }, a: 0 }, // 左侧大推进器
        { s: { w: 40, h: 15 }, p: { x: 15, y: 25 }, a: 0 }, // 右侧大推进器
        { s: { w: 20, h: 8 }, p: { x: 0, y: 30 }, a: 0 }, // 中央小推进器
      ],
      cannons: [
        { p: { x: -15, y: -30 }, a: 0 }, // 左前炮
        { p: { x: 15, y: -30 }, a: 0 }, // 右前炮
        { p: { x: -25, y: -5 }, a: 0 }, // 左翼炮
        { p: { x: 25, y: -5 }, a: 0 }, // 右翼炮
      ],
      colors: {
        primary: "#2c3e50", // 深蓝色
        secondary: "#e74c3c", // 红色
        tertiary: "#f1c40f", // 金色高光
      },
    },
    SuperBomber: {
      name: "超级轰炸机",
      // 大型轰炸机形状
      points: [
        [-45, 20], // 左翼尖端
        [-40, 15], // 左翼外段
        [-35, 10], // 左翼中段
        [-30, 5], // 左翼内段
        [-25, 0], // 左侧机身
        [-20, -5], // 左前机身
        [-15, -10], // 左前机翼
        [-10, -15], // 左侧机头
        [-5, -20], // 左前机头
        [0, -25], // 机头尖端
        [5, -20], // 右前机头
        [10, -15], // 右侧机头
        [15, -10], // 右前机翼
        [20, -5], // 右前机身
        [25, 0], // 右侧机身
        [30, 5], // 右翼内段
        [35, 10], // 右翼中段
        [40, 15], // 右翼外段
        [45, 20], // 右翼尖端
        [25, 25], // 右侧尾部
        [15, 30], // 右尾翼
        [5, 35], // 右垂尾
        [0, 40], // 垂直尾翼顶
        [-5, 35], // 左垂尾
        [-15, 30], // 左尾翼
        [-25, 25], // 左侧尾部
      ],
      thrusters: [
        { s: { w: 35, h: 15 }, p: { x: -25, y: 20 }, a: 0 }, // 左侧外推进器
        { s: { w: 35, h: 15 }, p: { x: 25, y: 20 }, a: 0 }, // 右侧外推进器
        { s: { w: 25, h: 12 }, p: { x: -10, y: 25 }, a: 0 }, // 左侧内推进器
        { s: { w: 25, h: 12 }, p: { x: 10, y: 25 }, a: 0 }, // 右侧内推进器
      ],
      cannons: [
        { p: { x: -15, y: -15 }, a: 0 }, // 左前炮
        { p: { x: 15, y: -15 }, a: 0 }, // 右前炮
        { p: { x: -35, y: 5 }, a: 0 }, // 左翼炮
        { p: { x: 35, y: 5 }, a: 0 }, // 右翼炮
        { p: { x: 0, y: -20 }, a: 0 }, // 中央主炮
      ],
      colors: {
        primary: "#7f8c8d", // 灰色
        secondary: "#e67e22", // 橙色
        tertiary: "#2ecc71", // 绿色高光
      },
    },
    Raptor: {
      name: "猛禽战机",
      // 现代隐形战斗机形状
      points: [
        [-40, 25], // 左翼尖端
        [-35, 20], // 左翼外侧
        [-30, 15], // 左翼中段
        [-25, 10], // 左翼内段
        [-20, 5], // 左后机身
        [-15, 0], // 左中机身
        [-20, -10], // 左前翼尖
        [-15, -15], // 左前机翼
        [-10, -20], // 左前机身
        [-5, -30], // 左机头侧
        [0, -40], // 机头尖端
        [5, -30], // 右机头侧
        [10, -20], // 右前机身
        [15, -15], // 右前机翼
        [20, -10], // 右前翼尖
        [15, 0], // 右中机身
        [20, 5], // 右后机身
        [25, 10], // 右翼内段
        [30, 15], // 右翼中段
        [35, 20], // 右翼外侧
        [40, 25], // 右翼尖端
        [15, 25], // 右垂尾根部
        [10, 35], // 右垂尾尖
        [0, 30], // 中央尾部
        [-10, 35], // 左垂尾尖
        [-15, 25], // 左垂尾根部
      ],
      thrusters: [
        { s: { w: 40, h: 15 }, p: { x: -15, y: 20 }, a: 0 }, // 左侧推进器
        { s: { w: 40, h: 15 }, p: { x: 15, y: 20 }, a: 0 }, // 右侧推进器
      ],
      cannons: [
        { p: { x: -10, y: -30 }, a: 0 }, // 左前炮
        { p: { x: 10, y: -30 }, a: 0 }, // 右前炮
        { p: { x: -25, y: 0 }, a: 0 }, // 左侧翼炮
        { p: { x: 25, y: 0 }, a: 0 }, // 右侧翼炮
      ],
      colors: {
        primary: "#2c3e50", // 深蓝色
        secondary: "#3498db", // 蓝色
        tertiary: "#34495e", // 深灰蓝
      },
    },
    // 添加毁灭机
    Destroyer: {
      name: "毁灭机",
      // 超大型战斗飞船
      points: [
        [-60, 35], // 左翼尖端
        [-55, 30], // 左翼外缘
        [-50, 25], // 左翼外段
        [-45, 20], // 左翼中段
        [-50, 15], // 左翼中段内凹
        [-40, 10], // 左翼内侧
        [-35, 5], // 左侧机身连接点
        [-30, 0], // 左侧机身
        [-35, -10], // 左前甲板外缘
        [-30, -15], // 左前甲板内缘
        [-40, -20], // 左前翼尖
        [-30, -25], // 左侧机头连接
        [-25, -30], // 左侧机头外
        [-20, -35], // 左侧机头内
        [-15, -40], // 左侧前鼻尖
        [-10, -45], // 前鼻左
        [-5, -48], // 前鼻左内
        [0, -50], // 机头尖端
        [5, -48], // 前鼻右内
        [10, -45], // 前鼻右
        [15, -40], // 右侧前鼻尖
        [20, -35], // 右侧机头内
        [25, -30], // 右侧机头外
        [30, -25], // 右侧机头连接
        [40, -20], // 右前翼尖
        [30, -15], // 右前甲板内缘
        [35, -10], // 右前甲板外缘
        [30, 0], // 右侧机身
        [35, 5], // 右侧机身连接点
        [40, 10], // 右翼内侧
        [50, 15], // 右翼中段内凹
        [45, 20], // 右翼中段
        [50, 25], // 右翼外段
        [55, 30], // 右翼外缘
        [60, 35], // 右翼尖端
        [45, 40], // 右尾部外
        [30, 45], // 右尾部内
        [20, 48], // 右垂尾底部
        [15, 55], // 右垂尾中部
        [10, 60], // 右垂尾尖
        [0, 50], // 中央垂尾
        [-10, 60], // 左垂尾尖
        [-15, 55], // 左垂尾中部
        [-20, 48], // 左垂尾底部
        [-30, 45], // 左尾部内
        [-45, 40], // 左尾部外
      ],
      thrusters: [
        // 主推进器
        { s: { w: 50, h: 20 }, p: { x: -25, y: 40 }, a: 0 }, // 左侧主推进器
        { s: { w: 50, h: 20 }, p: { x: 25, y: 40 }, a: 0 }, // 右侧主推进器
        { s: { w: 40, h: 15 }, p: { x: 0, y: 45 }, a: 0 }, // 中央主推进器
        // 辅助推进器
        { s: { w: 25, h: 10 }, p: { x: -45, y: 25 }, a: 0 }, // 左翼推进器
        { s: { w: 25, h: 10 }, p: { x: 45, y: 25 }, a: 0 }, // 右翼推进器
        // 机动推进器
        { s: { w: 15, h: 8 }, p: { x: -40, y: 0 }, a: Math.PI / 2 }, // 左侧机动推进器
        { s: { w: 15, h: 8 }, p: { x: 40, y: 0 }, a: -Math.PI / 2 }, // 右侧机动推进器
      ],
      cannons: [
        // 前部主炮
        { p: { x: -10, y: -45 }, a: 0 }, // 左前主炮
        { p: { x: 10, y: -45 }, a: 0 }, // 右前主炮
        { p: { x: 0, y: -48 }, a: 0 }, // 中央主炮
        // 机翼炮
        { p: { x: -40, y: -15 }, a: 0 }, // 左翼前炮
        { p: { x: 40, y: -15 }, a: 0 }, // 右翼前炮
        { p: { x: -50, y: 20 }, a: 0 }, // 左翼中炮
        { p: { x: 50, y: 20 }, a: 0 }, // 右翼中炮
        // 机身侧炮
        { p: { x: -25, y: -20 }, a: 0 }, // 左侧前炮
        { p: { x: 25, y: -20 }, a: 0 }, // 右侧前炮
        // 尾部防御炮
        { p: { x: -20, y: 40 }, a: Math.PI }, // 左尾炮
        { p: { x: 20, y: 40 }, a: Math.PI }, // 右尾炮
      ],
      colors: {
        primary: "#800000", // 暗红色
        secondary: "#1a1a1a", // 近黑色
        tertiary: "#ff6600", // 亮橙色高光
      },
    },
  };
  var PLAYERIDS = 0;
  var Player = new Class({
    initialize: function (game) {
      this.id = PLAYERIDS++;
      this.game = game;
      this.tween = false;
      this.isBound = true;
      // 在窗口中间创建飞机
      this.pos = new Vector(
        this.game.windowSize.width / 2,
        this.game.windowSize.height / 2
      );
      this.vel = new Vector(0, 0);
      this.acc = new Vector(0, 0);
      this.dir = new Vector(0, 1);
      this.currentRotation = 0;
      this.isBroken = false;
      this.lineOffsets = [];
      this.deadTime = 0;
      this.friction = 0.95;
      this.terminalVelocity = 2000;
      this.lastPos = new Vector(0, 0);
    },
    setShip: function (ship) {
      this.ship = ship;
      this.verts = [];
      for (var i = 0, vert; (vert = this.ship.points[i]); i++)
        this.verts.push(new Vector(vert[0], vert[1]));
      this.verts.push(this.verts[0]);
      this.thrusters = [];
      this.cannons = [];
      this.addThrusters(this.ship.thrusters);
      this.addCannons(this.ship.cannons);
      this.size = this.getSizeFromVertsAndObjects();
      this.bounds = this.calculateBounds();
      if (this.sheet) {
        this.sheet.destroy();
      }
      this.sheet = new Sheet(new Rect(100, 100, this.bounds.x, this.bounds.y));
      this.forceRedraw = true;
    },
    setCannons: function (cannonClass) {
      var newCannons = [];
      for (var i = 0, cannon; (cannon = this.cannons[i]); i++) {
        var newCannon = new cannonClass(
          this,
          this.game,
          cannon.pos.x,
          cannon.pos.y,
          cannon.angle
        );
        newCannons.push(newCannon);
        cannon.destroy();
      }
      this.cannons = newCannons;
    },
    addThrusters: function (thrusters) {
      for (var i = 0, data; (data = thrusters[i]); i++) {
        var thruster = new Thruster(data);
        this.thrusters.push(thruster);
      }
    },
    addCannons: function (cannons) {
      for (var i = 0, data; (data = cannons[i]); i++) {
        var weaponClass = WeaponMap[data.m] || WeaponMap.cannon;
        var cannon = new weaponClass.cannonClass(
          this,
          this.game,
          data.p.x,
          data.p.y,
          data.a
        );
        cannon.player = this;
        cannon.game = this.game;
        this.cannons.push(cannon);
      }
    },
    update: function (tdelta) {
      if (this.isBroken) {
        if (!this.lineOffsets.length) {
          for (var i = 0; i < this.verts.length - 1; i++)
            this.lineOffsets[i] = {
              pos: new Vector(0, 0),
              dir: new Vector(1, 1).setAngle(Math.PI * 2 * Math.random()),
            };
        }
        for (var i = 0; i < this.lineOffsets.length; i++) {
          this.lineOffsets[i].pos.add(
            this.lineOffsets[i].dir.cp().setLength(50).mul(tdelta)
          );
        }
        this.sheet.clear();
        this.sheet.setAngle(this.dir.angle());
        this.sheet.setPosition(this.pos);
        this.sheet.drawBrokenPlayer(this.verts, this.lineOffsets);
        if (now() - this.deadTime > 1000.0) {
          this.isBroken = false;
          this.lineOffsets = [];
          this.randomPos();
        }
        return;
      }
      if (!this.tween) {
        if (this.game.isKeyPressed("left") || this.game.isKeyPressed("right")) {
          if (this.game.isKeyPressed("left")) this.rotateLeft(tdelta);
          if (this.game.isKeyPressed("right")) this.rotateRight(tdelta);
        } else {
          this.stopRotate();
        }
        if (this.game.isKeyPressed("up")) this.activateThrusters();
        else this.stopThrusters();
      }
      if (this.game.isKeyPressed(" ")) {
        this.isShooting = true;
        if (!this.isBroken) this.shootPressed();
      } else if (this.isShooting) {
        this.isShooting = false;
        this.shootReleased();
      }
      if (this.currentRotation)
        this.dir.setAngle(this.dir.angle() + this.currentRotation * tdelta);
      var frictionedAcc = this.acc
        .mulNew(tdelta)
        .sub(this.vel.mulNew(tdelta * this.friction));
      this.vel.add(frictionedAcc);
      if (this.vel.len() > this.terminalVelocity)
        this.vel.setLength(this.terminalVelocity);
      var posDelta = this.vel.mulNew(tdelta);
      this.pos.add(posDelta);
      if (this.game.statisticsManager) {
        this.game.statisticsManager.increaseDistanceWithPixels(posDelta.len());
      }
      var showFlames = !this.acc.is({ x: 0, y: 0 });
      for (var i = 0, thruster; (thruster = this.thrusters[i]); i++) {
        thruster.setIsShown(showFlames);
        thruster.update(tdelta);
      }
      if (this.isBound) this.checkBounds();
      if (
        !this.lastPos.is(this.pos) ||
        this.currentRotation ||
        this.forceRedraw
      ) {
        this.forceRedraw = false;
        this.sheet.clear();
        this.sheet.setAngle(this.dir.angle() + Math.PI / 2);
        this.sheet.setPosition(this.pos);
        if (showFlames) {
          for (var i = 0, thruster; (thruster = this.thrusters[i]); i++)
            thruster.drawTo(this.sheet);
        }
        this.sheet.drawPlayer(this.verts, this.ship.colors);
        this.lastPos = this.pos.cp();
      }
      for (var i = 0, cannon; (cannon = this.cannons[i]); i++) {
        cannon.update(tdelta);
      }
    },
    randomPos: function () {
      var w = this.game.windowSize.width;
      var h = this.game.windowSize.height;
      this.pos = new Vector(random(0, w), random(0, h));
    },
    checkBounds: function () {
      if (this.tween) return;
      var w = this.game.windowSize.width;
      var h = this.game.windowSize.height;
      var rightBound = this.pos.x + this.sheet.rect.size.width / 2;
      var bottomBound = this.pos.y + this.sheet.rect.size.height / 2;
      if (rightBound > w) {
        window.scrollTo(this.game.scrollPos.x + 50, this.game.scrollPos.y);
        this.pos.x = 0;
      } else if (this.pos.x < 0) {
        window.scrollTo(this.game.scrollPos.x - 50, this.game.scrollPos.y);
        this.pos.x = w - this.sheet.rect.size.width / 2;
      }
      if (bottomBound > h) {
        window.scrollTo(
          this.game.scrollPos.x,
          this.game.scrollPos.y + h * 0.75
        );
        this.pos.y = 0;
      } else if (this.pos.y < 0) {
        window.scrollTo(
          this.game.scrollPos.x,
          this.game.scrollPos.y - h * 0.75
        );
        this.pos.y = h - this.sheet.rect.size.height / 2;
      }
    },
    inRect: function (rect) {
      var ret = false;
      for (var i = 0, vert; (vert = this.verts[i]); i++) {
        if (rect.hasPoint(new Vector(vert.x + this.pos.x, vert.y + this.pos.y)))
          ret = true;
      }
      return ret;
    },
    hit: function (by) {
      if (this.isBroken) return;
      this.isBroken = true;
      this.deadTime = now();
    },
    activateThrusters: function () {
      if (this.game.statisticsManager) {
        this.game.statisticsManager.usedThrusters();
      }
      this.acc = new Vector(500, 0).setAngle(this.dir.angle());
    },
    stopThrusters: function () {
      this.acc = new Vector(0, 0);
    },
    rotateLeft: function (tdelta) {
      this.currentRotation = Math.max(
        -Math.PI * 2,
        this.currentRotation - Math.PI * 10 * tdelta
      );
    },
    rotateRight: function (tdelta) {
      this.currentRotation = Math.min(
        Math.PI * 2,
        this.currentRotation + Math.PI * 10 * tdelta
      );
    },
    stopRotate: function () {
      this.currentRotation = 0;
    },
    getSizeFromVertsAndObjects: function () {
      var largestDistance = 0;
      for (var i = 0, vert; (vert = this.verts[i]); i++)
        largestDistance = Math.max(largestDistance, new Vector(vert).len());
      for (var i = 0, obj; (obj = this.thrusters[i]); i++) {
        var p1 = new Vector(
          obj.pos.x - obj.size.width / 2,
          obj.pos.y - obj.size.height / 2
        ).rotate(obj.angle);
        var p2 = new Vector(
          obj.pos.x + obj.size.width / 2,
          obj.pos.y - obj.size.height / 2
        ).rotate(obj.angle);
        var p3 = new Vector(
          obj.pos.x - obj.size.width / 2,
          obj.pos.y + obj.size.height / 2
        ).rotate(obj.angle);
        var p4 = new Vector(
          obj.pos.x + obj.size.width / 2,
          obj.pos.y + obj.size.height / 2
        ).rotate(obj.angle);
        largestDistance = Math.max(
          largestDistance,
          p1.len(),
          p2.len(),
          p3.len(),
          p4.len()
        );
      }
      return { width: largestDistance * 2, height: largestDistance * 2 };
    },
    calculateBounds: function () {
      return {
        x: Math.max(this.size.width, this.size.height) * 1,
        y: Math.max(this.size.height, this.size.width) * 1,
      };
    },
    shootPressed: function () {
      for (var i = 0, cannon; (cannon = this.cannons[i]); i++)
        cannon.shootPressed();
    },
    shootReleased: function () {
      for (var i = 0, cannon; (cannon = this.cannons[i]); i++)
        cannon.shootReleased();
    },
    flyTo: function (x, y, callback) {
      this.tween = {
        start: { pos: this.pos.cp(), dir: this.dir.cp() },
        to: new Vector(x, y),
        callback: callback || function () {},
      };
      this.tween.time = this.getTimeforTween();
    },
    destroy: function () {
      this.sheet.destroy();
    },
  });
  var Thruster = new Class({
    initialize: function (data, ship) {
      this.pos = new Vector(data.p);
      this.size = { width: data.s.w, height: data.s.h };
      this.angle = data.a || 0;
      this.ship = ship;
      this.isShown = false;
      this.flameY = 1;
      this.fx = new Fx();
      this.fx.addListener(this);
      this.flames = { r: [], y: [] };
      this.lastFrameUpdate = 0;
      this.generateFlames();
    },
    update: function (tdelta) {
      this.fx.update();
      if (now() - this.lastFrameUpdate > 1000 / 60) this.generateFlames();
    },
    set: function (key, value) {
      switch (key) {
        case "flames":
          this.flameY = value;
          break;
      }
    },
    setIsShown: function (isShown) {
      if (!this.isShown && isShown) {
        this.flameY = 0.0;
        this.generateFlames();
        this.fx.add("flames", {
          start: this.flameY,
          end: 1,
          duration: 250,
          transition: Tween.Quintic,
        });
      }
      this.isShown = isShown;
    },
    drawTo: function (sheet) {
      // 传递推进器的角度，使火焰与飞机和推进器方向一致
      sheet.drawFlames(this.flames, this.angle);
    },
    generateFlames: function () {
      var redWidth = this.size.width,
        redIncrease = this.size.width * 0.05,
        yellowWidth = this.size.width * 0.8,
        yellowIncrease = yellowWidth * 0.1,
        halfRed = redWidth / 2,
        halfYellow = yellowWidth / 2,
        offsetY = -this.size.height / 2,
        metaY = 0;
      var px = this.pos.x;
      var py = this.pos.y - this.size.height / 2;

      // 检测是否是毁灭机的推进器 (尺寸超过40是毁灭机特征)
      var isDestroyerThruster = this.size.width > 40 || this.size.height > 15;

      // 为毁灭机创建更多点的火焰形状
      if (isDestroyerThruster) {
        redIncrease = this.size.width * 0.03; // 更精细的点
        yellowIncrease = yellowWidth * 0.06; // 更精细的内焰
      }

      function vec(x, y) {
        return new Vector(x, y);
      }

      this.flames.r = [vec(-halfRed + px, py)];
      this.flames.y = [vec(-halfYellow + px, py)];
      this.flames.self = this;

      // 外层火焰轮廓
      for (var x = 0; x < redWidth; x += redIncrease) {
        // 毁灭机的火焰更长更随机
        var flameHeight;
        if (isDestroyerThruster) {
          // 中心火焰更长，边缘较短
          var normalizedX = Math.abs(x / redWidth - 0.5) * 2; // 0在中心，1在边缘
          var centerBoost = Math.pow(1 - normalizedX, 2) * 1.4; // 中心区域增强系数

          // 基于离中心的距离计算火焰高度
          flameHeight =
            this.flameY *
            random(
              this.size.height * (1.0 + centerBoost),
              this.size.height * (1.5 + centerBoost)
            );

          // 添加波浪效果
          flameHeight += Math.sin(x * 0.2) * this.size.height * 0.1;
        } else {
          // 普通推进器
          flameHeight =
            this.flameY * random(this.size.height * 0.7, this.size.height);
        }

        this.flames.r.push(vec(x - halfRed + px, flameHeight + py));
      }
      this.flames.r.push(vec(halfRed + px, py));

      // 内层火焰轮廓
      for (var x = 0; x < yellowWidth; x += yellowIncrease) {
        // 毁灭机的内焰也更长更随机
        var innerFlameHeight;
        if (isDestroyerThruster) {
          // 中心火焰更长，边缘较短，与外焰类似的算法
          var normalizedX = Math.abs(x / yellowWidth - 0.5) * 2;
          var centerBoost = Math.pow(1 - normalizedX, 2) * 1.2;

          innerFlameHeight =
            this.flameY *
            random(
              this.size.height * (0.6 + centerBoost),
              this.size.height * (1.0 + centerBoost)
            );

          // 添加波浪效果，但频率更高
          innerFlameHeight += Math.sin(x * 0.3) * this.size.height * 0.05;
        } else {
          // 普通推进器
          innerFlameHeight =
            this.flameY *
            random(this.size.height * 0.4, this.size.height * 0.7);
        }

        this.flames.y.push(vec(x - halfYellow + px, innerFlameHeight + py));
      }
      this.flames.y.push(vec(halfYellow + px, py));

      this.lastFrameUpdate = now();
      var pos = vec(px, py);
      for (var i = 0, p; (p = this.flames.r[i]); i++)
        p.sub(pos).rotate(this.angle).add(pos);
      for (var i = 0, p; (p = this.flames.y[i]); i++)
        p.sub(pos).rotate(this.angle).add(pos);
    },
  });
  var BombManager = new Class({
    initialize: function (game) {
      this.game = game;
      this.bombShowDelay = 30;
      this.nextBomb = this.bombShowDelay;
    },
    update: function (tdelta) {
      if (this.game.isKeyPressed("F") && this.isReady()) {
        this.blow();
      }
      if (this.nextBomb === -1 || !this.game.sessionManager.isPlaying) {
        return;
      }
      this.nextBomb -= tdelta;
      if (this.nextBomb < 0) {
        this.game.menuManager.showBombMenu();
        this.nextBomb = -1;
        this.game.ui.showMessage(
          "BOMB IS READY<br />(lower right corner or F)"
        );
      }
    },
    blow: function () {
      // 创建一个更震撼的倒计时效果
      var message = this.game.ui.showMessage(
        '<div style="font-size: 40px; color: red; text-shadow: 0 0 10px #ff0000;">3...</div>',
        5000
      );

      // 播放警告音效
      this.playWarningBeep(3);

      // 创建闪烁效果
      var flashScreen = function (times) {
        if (times <= 0) return;

        var container = getAppContainerElement();
        container.style.backgroundColor = "rgba(255,0,0,0.3)";

        setTimeout(function () {
          container.style.backgroundColor = "";

          setTimeout(function () {
            flashScreen(times - 1);
          }, 300);
        }, 300);
      };

      // 开始闪烁
      flashScreen(3);

      delay(
        1000,
        function () {
          message.innerHTML =
            '<div style="font-size: 45px; color: orange; text-shadow: 0 0 15px #ff6600;">2...</div>';
          this.playWarningBeep(2);
        },
        this
      );

      delay(
        2000,
        function () {
          message.innerHTML =
            '<div style="font-size: 50px; color: yellow; text-shadow: 0 0 20px #ffff00;">1...</div>';
          this.playWarningBeep(1);
        },
        this
      );

      delay(
        3000,
        function () {
          message.innerHTML =
            '<div style="font-size: 70px; color: white; text-shadow: 0 0 30px #ffffff;">BOOM!!!</div>';

          // 屏幕闪白
          var container = getAppContainerElement();
          container.style.backgroundColor = "rgba(255,255,255,0.8)";

          setTimeout(function () {
            container.style.backgroundColor = "";
          }, 500);
        },
        this
      );

      delay(3000, this.blowStuffUp, this);
      this.nextBomb = this.bombShowDelay;
    },

    // 添加警告音效
    playWarningBeep: function (count) {
      try {
        var beep = document.createElement("audio");
        beep.volume = 0.5;

        // 根据倒计时设置不同频率
        var freq = 440 + (3 - count) * 220;

        // 使用AudioContext创建蜂鸣声（如果浏览器支持）
        if (window.AudioContext || window.webkitAudioContext) {
          var audioCtx = new (window.AudioContext ||
            window.webkitAudioContext)();
          var oscillator = audioCtx.createOscillator();
          var gainNode = audioCtx.createGain();

          oscillator.type = "sine";
          oscillator.frequency.value = freq;
          gainNode.gain.value = 0.5;

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.start();

          setTimeout(function () {
            oscillator.stop();
            audioCtx.close();
          }, 300);
        }
        // 回退到使用预设音频
        else if (this.game.audioManager.explosion) {
          this.game.audioManager.explosion.play();
        }
      } catch (e) {
        console.error("无法播放警告音效", e);
      }
    },

    blowStuffUp: function () {
      this.game.bulletManager.updateEnemyIndex();
      var index = this.game.bulletManager.enemyIndex;

      // 增加一次爆炸的元素数量
      var maxElements = Math.min(25, index.length);

      // 创建多个爆炸效果，覆盖更多元素
      for (var i = 0, el; (el = index[i]) && i < maxElements; i++) {
        var rect = getRect(el);
        var center = new Vector(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );

        // 对于每个元素，添加一个稍有延迟的爆炸效果
        (function (element, pos, delay) {
          setTimeout(function () {
            GameGlobals.kickass.explosionManager.addExplosion(
              pos,
              element,
              MegaParticleExplosion
            );
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
          }, delay);
        })(el, center, i * 100);
      }

      // 如果摧毁了大量元素，播放震撼音效
      if (maxElements > 10) {
        try {
          var explosionSound = document.createElement("audio");
          explosionSound.src = GameGlobals.path(
            "static/sounds/game/explosion.mp3"
          );
          explosionSound.volume = 1.0;
          explosionSound.play().catch(function () {});

          // 500毫秒后再次播放，音效叠加更震撼
          setTimeout(function () {
            if (GameGlobals.kickass.audioManager.explosion) {
              GameGlobals.kickass.audioManager.explosion.play();
            }
          }, 300);

          // 再次添加一个大爆炸
          setTimeout(function () {
            if (index.length > 0 && index[0]) {
              var rect = getRect(index[0]);
              var center = new Vector(
                rect.left + rect.width / 2 + random(-100, 100),
                rect.top + rect.height / 2 + random(-100, 100)
              );
              GameGlobals.kickass.explosionManager.addExplosion(
                center,
                null,
                MegaParticleExplosion
              );
            }
          }, 600);
        } catch (e) {
          console.error("无法播放爆炸音效", e);
        }
      }

      this.game.menuManager.hideBombMenu();
      this.nextBomb = this.bombShowDelay;
    },

    isReady: function () {
      return this.nextBomb === -1;
    },
  });
  var ELEMENTSTHATARENOTTOBEINCLUDED = [
    "BR",
    "SCRIPT",
    "STYLE",
    "TITLE",
    "META",
    "HEAD",
    "OPTION",
    "OPTGROUP",
    "LINK",
  ];
  var ELEMENTSIZETHRESHOLD = 5;
  var BulletManager = new Class({
    initialize: function (game) {
      this.game = game;
      this.lastBlink = 0;
      this.blinkActive = false;
      this.enemyIndex = [];
      this.updateDelay = 2.5;
      this.nextUpdate = this.updateDelay;
    },
    update: function (tdelta) {
      if (this.game.isKeyPressed("B")) {
        this.blink();
      } else if (this.blinkActive) {
        this.endBlink();
      }
      this.nextUpdate -= tdelta;
      if (this.nextUpdate < 0) {
        this.updateEnemyIndex();
      }
    },
    blink: function () {
      if (now() - this.lastBlink > 250) {
        for (var i = 0, el; (el = this.enemyIndex[i]); i++) {
          if (!this.blinkActive) el.style.outline = "1px solid red";
          else el.style.outline = el.KICKASSOLDBORDER;
        }
        this.blinkActive = !this.blinkActive;
        this.lastBlink = now();
        if (!this.blinkActive) {
          this.updateEnemyIndex();
        }
      }
    },
    endBlink: function () {
      for (var i = 0, el; (el = this.enemyIndex[i]); i++)
        el.style.outline = el.KICKASSOLDBORDER;
      this.lastBlink = 0;
      this.blinkActive = false;
    },
    updateEnemyIndex: function () {
      var all = document.getElementsByTagName("*");
      this.enemyIndex = [];
      for (var i = 0, el; (el = all[i]); i++) {
        if (this.isDestroyable(el)) {
          this.enemyIndex.push(el);
          el.KICKASSOLDBORDER =
            el.style.outline ||
            document.defaultView.getComputedStyle(el, null).outline;
        }
      }
      this.nextUpdate = this.updateDelay;
    },
    isDestroyable: function (element, ignoreSize) {
      if (this.shouldIgnoreElement(element, ignoreSize)) return false;
      for (var i = 0, child; (child = element.childNodes[i]); i++) {
        if (
          child.nodeType === 1 &&
          ELEMENTSTHATARENOTTOBEINCLUDED.indexOf(child.tagName) === -1 &&
          child.offsetWidth >= ELEMENTSIZETHRESHOLD &&
          child.offsetHeight >= ELEMENTSIZETHRESHOLD &&
          document.defaultView.getComputedStyle(child, null).visibility !==
            "hidden"
        ) {
          return false;
        }
      }
      return true;
    },
    isDestroyableFromCollision: function (element) {
      return this.isDestroyable(element, true);
    },
    shouldIgnoreElement: function (element, ignoreSize) {
      if (element.nodeType !== 1) return true;
      if (element == document.documentElement || element == document.body)
        return true;
      if (ELEMENTSTHATARENOTTOBEINCLUDED.indexOf(element.tagName) !== -1)
        return true;
      if (
        element.style.visibility == "hidden" ||
        element.style.display == "none"
      )
        return true;
      if (
        typeof element.className == "string" &&
        element.className.indexOf("KICKASSELEMENT") != -1
      )
        return true;
      if (!ignoreSize) {
        if (
          element.offsetWidth < ELEMENTSIZETHRESHOLD ||
          element.offsetHeight < ELEMENTSIZETHRESHOLD
        )
          return true;
      }
      var rect;
      if (element.offsetLeft < 0 || element.offsetTop < 0) {
        rect = getRect(element);
        if (rect.left + rect.width < 0 || rect.top + rect.height < 0)
          return true;
      }
      if (!rect) rect = getRect(element);
      if (rect.top >= this.game.scrollSize.y) return true;
      return false;
    },
    destroy: function () {
      for (var key in this.bullets)
        if (this.bullets.hasOwnProperty(key))
          for (var i = 0, bullet; (bullet = this.bullets[key][i]); i++)
            bullet.destroy();
      this.bullets = {};
    },
  });
  var SessionManager = new Class({
    initialize: function (game) {
      this.game = game;
      this.isPlaying = false;
    },
    update: function (tdelta) {
      if (this.isPlaying && this.game.bulletManager.enemyIndex.length == 0) {
        this.weHaveWon();
      }
    },
    weHaveWon: function () {
      this.isPlaying = false;
      this.game.ui.showMessage("Victory！！！");

      // 播放胜利音效
      if (this.game.victorySound) {
        this.game.victorySound.currentTime = 0;
        this.game.victorySound.play().catch(function (err) {
          console.error("播放胜利音效失败", err);
        });
      }

      if (this.game.isCampaign()) {
        this.game.menuManager.showMenu();
        this.game.menuManager.navigateTo("highscores");
      } else {
        this.game.menuManager.showMenu();
      }
      this.game.menuManager.sendMessageToMenu("gameFinished:!");
    },
  });
  var ExplosionManager = new Class({
    initialize: function (game) {
      this.game = game;
      this.explosions = [];
    },
    update: function (tdelta) {
      var time = now();
      for (var i = 0, explosion; (explosion = this.explosions[i]); i++) {
        if (time - explosion.bornAt > (explosion.ttl || 500)) {
          explosion.destroy();
          this.explosions.splice(i, 1);
          continue;
        }
        explosion.update(tdelta);
      }
    },
    addExplosion: function (pos, forElement, explosionClass) {
      explosionClass = explosionClass || ParticleExplosion;
      var explosion = new explosionClass(pos, forElement);
      explosion.game = this.game;
      explosion.checkBounds();
      this.explosions.push(explosion);
      if (this.game.audioManager.explosion) {
        this.game.audioManager.explosion.play();
      }
    },
    destroy: function () {
      for (var i = 0, explosion; (explosion = this.explosions[i]); i++)
        explosion.destroy();
      this.explosions = [];
    },
  });
  var Cannon = new Class({
    initialize: function (player, game, x, y, angle) {
      this.player = player;
      this.game = game;
      this.pos = new Vector(x, y);
      this.angle = angle || 0;
    },
    shootPressed: function () {},
    shootReleased: function () {},
    checkCollisions: function () {},
    getExplosionClass: function () {
      return ParticleExplosion;
    },
    update: function (tdelta) {
      this.game.hideAll();
      this.checkCollisions(tdelta);
      this.game.showAll();
    },
    checkCollision: function (bullet) {
      var hit = bullet.checkCollision();
      if (!hit) return false;
      this.game.explosionManager.addExplosion(
        bullet.pos,
        hit,
        this.getExplosionClass()
      );
      this.game.menuManager.addPoints(
        Math.min(hit.getElementsByTagName("*").length + 1, 100),
        bullet.pos
      );
      if (!hit.isShot) {
        hit.parentNode.removeChild(hit);
      }
      if (this.game.statisticsManager) {
        this.game.statisticsManager.addElementsDestroyed();
      }
      return true;
    },
    createBullet: function (bulletClass) {
      var pos = this.getABulletPos();
      var dir = this.getABulletDir();
      var bullet = new bulletClass(pos, dir);
      bullet.game = this.game;
      bullet.manager = this;
      bullet.initCanvas();
      bullet.vel.add(bullet.vel.cp().setLength(this.player.vel.len()));
      return bullet;
    },
    getABulletPos: function () {
      return this.player.pos
        .cp()
        .add(this.pos.cp().rotate(this.player.dir.angle() + Math.PI / 2));
    },
    getABulletDir: function () {
      return this.player.dir.cp().rotate(this.angle);
    },
    destroy: function () {},
  });
  var LaserCannon = new Class({
    Extends: Cannon,
    initialize: function (player, game, x, y, angle) {
      Cannon.prototype.initialize.apply(this, arguments);
      this.lasers = [];
    },
    getExplosionClass: function () {
      return SplitExplosion;
    },
    update: function (tdelta) {
      if (!this.lasers.length) return;
      this.removeOld();
      Cannon.prototype.update.call(this, tdelta);
    },
    checkCollisions: function (tdelta) {
      for (var i = 0, laser; (laser = this.lasers[i]); i++) {
        laser.update(tdelta);
        if (this.checkCollision(laser)) {
        }
      }
    },
    removeOld: function () {
      for (var i = 0, laser; (laser = this.lasers[i]); i++) {
        if (laser.outOfBounds) {
          laser.destroy();
          this.lasers.splice(i, 1);
        }
      }
    },
    shootPressed: function () {
      if (this.lasers.length > 5) {
        return;
      }
      if (now() - this.lastFired < 500) {
        return;
      }
      this.lastFired = now();
      if (this.game.statisticsManager) {
        this.game.statisticsManager.addShotFired();
      }
      this.lasers.push(this.createBullet(LaserBullet));
    },
    destroy: function () {
      if (this.lasers.length) {
        for (var i = 0, laser; (laser = this.lasers[i]); i++) {
          laser.destroy();
        }
        this.lasers = [];
      }
    },
  });
  var BallCannon = new Class({
    Extends: Cannon,
    initialize: function () {
      Cannon.prototype.initialize.apply(this, arguments);
      this.lastFired = 0;
      this.bullets = [];
    },
    getExplosionClass: function () {
      return ParticleExplosion;
    },
    update: function (tdelta) {
      if (!this.bullets.length) {
        return;
      }
      this.removeOld();
      Cannon.prototype.update.call(this, tdelta);
    },
    removeOld: function () {
      var time = now();
      for (var i = 0, bullet; (bullet = this.bullets[i]); i++) {
        if (time - bullet.bornAt > 2000) {
          bullet.destroy();
          this.bullets.splice(i, 1);
        }
      }
    },
    checkCollisions: function (tdelta) {
      for (var i = 0, bullet; (bullet = this.bullets[i]); i++) {
        bullet.update(tdelta);
        if (this.checkCollision(bullet)) {
          bullet.destroy();
          this.bullets.splice(i, 1);
        }
      }
    },
    shootPressed: function () {
      if (now() - this.lastFired < 200) {
        return;
      }
      this.lastFired = now();
      this.addBullet();
      if (this.game.statisticsManager) {
        this.game.statisticsManager.addShotFired();
      }
    },
    addBullet: function () {
      if (this.bullets.length > 7) {
        this.bullets[0].destroy();
        this.bullets.shift();
      }
      var bullet = this.createBullet(Bullet);
      this.bullets.push(bullet);
    },
    destroy: function () {
      for (var i = 0, bullet; (bullet = this.bullets[i]); i++) {
        bullet.destroy();
      }
      this.bullets = [];
    },
  });
  var Bullet = new Class({
    initialize: function (pos, dir) {
      this.pos = pos.cp();
      this.dir = dir;
      this.vel = new Vector(500, 500);
      this.bornAt = now();
      this.lastShake = 0;

      // 检查是否启用大型子弹
      this.isBig = GameGlobals.kickass && GameGlobals.kickass.bigBullets;

      // 根据子弹大小设置速度
      if (this.isBig) {
        this.vel.mul(0.8); // 大型子弹速度稍慢
      }
    },

    initCanvas: function () {
      // 检查是否启用大型子弹
      this.isBig = GameGlobals.kickass && GameGlobals.kickass.bigBullets;

      // 检查是否是毁灭机子弹 - 通过判断玩家的当前飞机类型
      this.isDestroyerBullet =
        GameGlobals.kickass &&
        GameGlobals.kickass.currentShipType === "Destroyer";

      // 毁灭机的子弹更大
      var size;
      if (this.isDestroyerBullet) {
        size = this.isBig ? 20 : 10;
      } else {
        size = this.isBig ? 15 : 5;
      }

      this.sheet = new Sheet(new Rect(this.pos.x, this.pos.y, size, size));
      this.sheet.drawBullet(this.isBig, this.isDestroyerBullet);
    },

    draw: function () {
      this.sheet.setPosition(this.pos);

      // 为大型子弹或毁灭机子弹添加震动效果
      if (
        (this.isBig || this.isDestroyerBullet) &&
        now() - this.lastShake > 50
      ) {
        this.lastShake = now();
        var jitter = this.isDestroyerBullet ? 3 : 2;
        this.pos.x += random(-jitter, jitter);
        this.pos.y += random(-jitter, jitter);
      }
    },

    update: function (tdelta) {
      this.pos.add(this.vel.setAngle(this.dir.angle()).mulNew(tdelta));
      this.checkBounds();
      this.draw();
    },

    checkCollision: function () {
      var element = document.elementFromPoint(this.pos.x, this.pos.y);
      if (element && element.nodeType == 3) element = element.parentNode;
      var didFind =
        element && this.game.bulletManager.isDestroyableFromCollision(element)
          ? element
          : false;
      return didFind;
    },

    checkBounds: function () {
      var w = this.game.windowSize.width;
      var h = this.game.windowSize.height;
      var rightBound = this.pos.x + this.sheet.rect.size.width / 2;
      var bottomBound = this.pos.y + this.sheet.rect.size.height / 2;
      if (rightBound > w) this.pos.x = 0;
      else if (this.pos.x < 0) this.pos.x = w - this.sheet.rect.size.width / 2;
      if (bottomBound > h) this.pos.y = 0;
      else if (this.pos.y < 0) this.pos.y = h - this.sheet.rect.size.height / 2;
    },

    destroy: function () {
      this.sheet.destroy();
    },
  });
  var LaserBullet = new Class({
    Extends: Bullet,
    initialize: function () {
      Bullet.prototype.initialize.apply(this, arguments);
      this.vel = new Vector(750, 750);
      this.lastDrawPos = this.pos.cp();
    },
    initCanvas: function () {
      var s = Math.max(
        GameGlobals.laserImage.width,
        GameGlobals.laserImage.height
      );
      this.sheet = new Sheet(new Rect(0, 0, s, s));
    },
    update: function (tdelta) {
      Bullet.prototype.update.apply(this, arguments);
    },
    draw: function () {
      this.sheet.drawLaser(this.pos, this.dir);
      this.lastDrawPos = this.pos.cp();
    },
    checkBounds: function () {
      var w = this.game.windowSize.width;
      var h = this.game.windowSize.height;
      var rightBound = this.pos.x + this.sheet.rect.size.width / 2;
      var bottomBound = this.pos.y + this.sheet.rect.size.height / 2;
      if (rightBound > w || this.pos.x < 0) this.outOfBounds = true;
      if (bottomBound > h || this.pos.y < 0) this.outOfBounds = true;
    },
    destroy: function () {
      this.sheet.destroy();
    },
  });
  GameGlobals.laserImage = document.createElement("img");
  GameGlobals.laserImage.src = GameGlobals.path("css/gfx/kickass/laser.png");
  var Explosion = new Class({
    initialize: function (pos, element) {
      this.bornAt = now();
      this.pos = pos.cp();
    },
    update: function (tdelta) {},
    checkBounds: function () {},
    destroy: function () {},
  });
  var ParticleExplosion = new Class({
    Extends: Explosion,
    initialize: function (pos, element) {
      Explosion.prototype.initialize.apply(this, arguments);
      this.particleVel = new Vector(150, 0);
      this.particles = [];
      this.generateParticles();
      this.sheet = new Sheet(new Rect(pos.x, pos.y, 250, 250));
    },
    update: function (tdelta) {
      for (var i = 0, particle; (particle = this.particles[i]); i++)
        particle.pos.add(
          particle.vel
            .mulNew(tdelta)
            .mul(random(0.5, 1.0))
            .setAngle(particle.dir.angle())
        );
      this.sheet.clear();
      this.sheet.drawExplosion(this.particles);
    },
    generateParticles: function () {
      for (var i = 0, j = !GameGlobals.hasCanvas ? 10 : 40; i < j; i++) {
        this.particles.push({
          dir: new Vector(random(0, 20) - 10, random(0, 20) - 10).normalize(),
          vel: this.particleVel.cp(),
          pos: new Vector(0, 0),
          color: ["yellow", "red"][random(0, 1)],
        });
      }
    },
    checkBounds: function () {
      var right = this.sheet.rect.getRight();
      var bottom = this.sheet.rect.getBottom();
      var w = this.game.windowSize.width;
      var h = this.game.windowSize.height;
      if (right > w) this.pos.x -= right - w;
      if (bottom > h) this.pos.y -= bottom - h;
      this.sheet.setPosition(this.pos);
    },
    destroy: function () {
      this.sheet.destroy();
    },
  });
  var MegaParticleExplosion = new Class({
    Extends: ParticleExplosion,
    initialize: function (pos, element) {
      Explosion.prototype.initialize.apply(this, arguments);
      this.particleVel = new Vector(300, 0); // 增加粒子速度
      this.particles = [];
      this.generateParticles();
      this.sheet = new Sheet(new Rect(pos.x, pos.y, 800, 800)); // 更大的爆炸区域
      this.ttl = 3000; // 增加爆炸持续时间
      this.generationDelay = 0.4; // 更快的粒子生成
      this.generationTimes = 5; // 更多的粒子生成次数
      this.nextGenerate = this.generationDelay;

      // 添加屏幕震动效果
      this.shakeScreen();
    },

    generateParticles: function () {
      var colors = ["yellow", "red", "orange", "#ff9900", "#ff5500", "white"]; // 更多颜色
      for (var i = 0, j = !GameGlobals.hasCanvas ? 20 : 120; i < j; i++) {
        // 增加粒子数量
        var angle = Math.random() * Math.PI * 2;
        var speed = this.particleVel.cp().mul(random(0.5, 2.0)); // 多样的速度
        var size = random(2, 8); // 多样的大小

        this.particles.push({
          dir: new Vector(random(-20, 20), random(-20, 20)).normalize(),
          vel: speed,
          pos: new Vector(random(-20, 20), random(-20, 20)), // 起始位置有偏移
          color: colors[random(0, colors.length - 1)],
          size: size,
          opacity: 1,
        });
      }
    },

    update: function (tdelta) {
      this.nextGenerate -= tdelta;
      if (this.nextGenerate <= 0 && this.generationTimes > 0) {
        this.nextGenerate = this.generationDelay;
        this.generateParticles();
        this.generationTimes--;

        // 每次生成新粒子时重新震动屏幕
        if (this.generationTimes > 0) {
          this.shakeScreen(this.generationTimes / 5);
        }
      }

      // 更新所有粒子
      for (var i = 0, particle; (particle = this.particles[i]); i++) {
        particle.pos.add(
          particle.vel
            .mulNew(tdelta)
            .mul(random(0.8, 1.2))
            .setAngle(particle.dir.angle())
        );

        // 粒子逐渐变淡
        if (now() - this.bornAt > this.ttl * 0.5) {
          particle.opacity = Math.max(0, particle.opacity - tdelta * 0.5);
        }
      }

      this.sheet.clear();
      this.sheet.drawEnhancedExplosion(this.particles);
    },

    // 添加屏幕震动效果
    shakeScreen: function (intensity) {
      intensity = intensity || 1;
      var strength = 15 * intensity;
      var duration = 400 * intensity;
      var container = getAppContainerElement();
      var originalStyle = container.getAttribute("data-original-style") || "";

      if (!originalStyle) {
        originalStyle = container.style.cssText;
        container.setAttribute("data-original-style", originalStyle);
      }

      // 创建震动效果
      var shake = function () {
        var dx = Math.round(random(-strength, strength));
        var dy = Math.round(random(-strength, strength));
        container.style.transform = "translate(" + dx + "px, " + dy + "px)";
      };

      // 设置震动间隔
      var interval = setInterval(shake, 50);

      // 停止震动
      setTimeout(function () {
        clearInterval(interval);
        container.style.transform = "";
        container.style.cssText = originalStyle;
      }, duration);
    },
  });
  var SplitExplosion = new Class({
    Extends: Explosion,
    initialize: function (pos, element) {
      if (!element) return;
      Explosion.prototype.initialize.apply(this, arguments);
      this.element = element;
      this.fx = new Fx();
      this.fx.addListener(this);
      this.start();
    },
    update: function (tdelta) {
      if (!this.element) return;
      this.fx.update();
    },
    set: function (key, value) {
      if (key == "opacity") {
      }
    },
    start: function () {
      var pieces = this.createClones();
      var left = pieces[0],
        right = pieces[1];
      var lT = "rotate(-" + random(30, 50) + "deg) translate(-100px, 40px)";
      var rT = "rotate(" + random(30, 50) + "deg) translate(100px, 40px)";
      setStyles(left, { transform: lT });
      setStyles(right, { transform: rT });
      this.left = left;
      this.right = right;
      this.fx.add("opacity", { start: 1, end: 0.5, duration: 500 });
    },
    createClones: function () {
      var coords = getRect(this.element);
      var leftContainer = this.createContainer(coords);
      var rightContainer = this.createContainer(coords);
      var left = cloneElement(this.element);
      var right = cloneElement(this.element);
      addClass(left, "KICKASSELEMENT");
      addClass(right, "KICKASSELEMENT");
      var styles = { margin: 0, overflow: "hidden" };
      setStyles(left, styles);
      setStyles(right, styles);
      leftContainer.appendChild(left);
      rightContainer.appendChild(right);
      rightContainer.style.left = coords.left + coords.width / 2 + "px";
      rightContainer.scrollLeft += coords.width / 2;
      this.element.style.opacity = 0;
      this.element.style.visibility = "hidden";
      this.element.style.display = "none";
      return each([leftContainer, rightContainer], function (el) {
        el.style.transition = "transform 500ms ease-in";
      });
    },
    createContainer: function (coords) {
      var ret = document.createElement("div");
      setStyles(ret, {
        position: "absolute",
        left: coords.left,
        top: coords.top,
        width: coords.width * 0.5,
        height: coords.height,
        overflow: "hidden",
      });
      getAppContainerElement().appendChild(ret);
      return ret;
    },
    destroy: function () {
      try {
        this.left.parentNode.removeChild(this.left);
        this.right.parentNode.removeChild(this.right);
        this.element.parentNode.removeChild(this.element);
      } catch (e) {}
    },
  });
  var Weapons = {
    1: { name: "Cannon", id: "cannon", cannonClass: BallCannon },
    2: { name: "Laser", id: "laser", cannonClass: LaserCannon },
  };
  var WeaponMap = { cannon: Weapons[1], laser: Weapons[2] };
  var SheetCanvas = new Class({
    initialize: function (rect) {
      this.canvas = document.createElement("canvas");
      this.canvas.className = "KICKASSELEMENT";
      with (this.canvas.style) {
        position = "absolute";
        zIndex = "1000000";
      }
      GameGlobals.kickass.registerElement(this.canvas);
      if (this.canvas.getContext) this.ctx = this.canvas.getContext("2d");
      this.rect = rect;
      this.angle = 0;
      this.updateCanvas();
      getAppContainerElement().appendChild(this.canvas);
    },
    tracePoly: function (verts) {
      if (!verts[0]) return;
      this.ctx.save();
      this.ctx.translate(this.rect.size.width / 2, this.rect.size.height / 2);
      this.ctx.rotate(this.angle);
      this.ctx.beginPath();
      this.ctx.moveTo(verts[0].x, verts[0].y);
      for (var i = 0; i < verts.length; i++) {
        this.ctx.lineTo(verts[i].x, verts[i].y);
      }
      this.ctx.restore();
    },
    setAngle: function (angle) {
      this.angle = angle;
    },
    updateCanvas: function () {
      if (this.canvas.width != this.rect.size.width)
        this.canvas.width = this.rect.size.width;
      if (this.canvas.height != this.rect.size.height)
        this.canvas.height = this.rect.size.height;
      this.canvas.style.left =
        GameGlobals.kickass.scrollPos.x +
        (this.rect.pos.x - this.rect.size.width / 2) +
        "px";
      this.canvas.style.top =
        GameGlobals.kickass.scrollPos.y +
        (this.rect.pos.y - this.rect.size.height / 2) +
        "px";
    },
    drawLine: function (xFrom, yFrom, xTo, yTo) {
      this.ctx.save();
      this.ctx.translate(this.rect.size.width / 2, this.rect.size.height / 2);
      this.ctx.beginPath();
      this.ctx.moveTo(xFrom, yFrom);
      this.ctx.lineTo(xTo, yTo);
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.restore();
    },
    drawCircle: function (radius, pos) {
      pos = pos || { x: 0, y: 0 };
      this.ctx.save();
      this.ctx.translate(this.rect.size.width / 2, this.rect.size.height / 2);
      if (pos) this.ctx.translate(pos.x, pos.y);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.restore();
    },
    drawRect: function (x, y, w, h) {
      this.ctx.save();
      this.ctx.translate(this.rect.size.width / 2, this.rect.size.height / 2);
      this.ctx.translate(x, y);
      this.ctx.fillRect(x, y, w, h);
      this.ctx.restore();
      this.ctx.fill();
    },
    drawImageFull: function (image) {
      this.ctx.drawImage(
        image,
        0,
        0,
        this.rect.size.width,
        this.rect.size.height
      );
    },
    drawImage: function (image, x, y) {
      this.ctx.save();
      this.ctx.translate(
        this.rect.size.width / 2 + x,
        this.rect.size.height / 2 + y
      );
      this.ctx.rotate(this.angle);
      this.ctx.drawImage(image, 0, -11);
      this.ctx.restore();
    },
    setFillColor: function (color) {
      this.ctx.fillStyle = color;
    },
    setStrokeColor: function (color) {
      this.ctx.strokeStyle = color;
    },
    setLineWidth: function (width) {
      this.ctx.lineWidth = width;
    },
    fillPath: function () {
      this.ctx.fill();
    },
    strokePath: function () {
      this.ctx.stroke();
    },
    clear: function () {
      this.ctx.clearRect(0, 0, this.rect.size.width, this.rect.size.height);
    },
    destroy: function () {
      GameGlobals.kickass.unregisterElement(this.canvas);
      this.canvas.parentNode.removeChild(this.canvas);
    },
  });
  var Sheet = new Class({
    initialize: function (rect) {
      this.rect = rect;
      this.drawer = new SheetCanvas(rect);
    },
    clear: function () {
      this.drawer.clear();
    },
    setPosition: function (pos) {
      this.rect.pos = pos.cp();
      this.drawer.rect = this.rect;
      this.drawer.updateCanvas();
    },
    setAngle: function (angle) {
      this.drawer.setAngle(angle);
    },
    drawPlayer: function (verts, shipColors) {
      // 创建渐变色填充
      var ctx = this.drawer.ctx;
      ctx.save();
      ctx.translate(
        this.drawer.rect.size.width / 2,
        this.drawer.rect.size.height / 2
      );
      ctx.rotate(this.drawer.angle);

      // 获取颜色，如果没有提供则使用默认颜色
      var colors = shipColors || {
        primary: "#3498db",
        secondary: "#9b59b6",
        tertiary: "#2ecc71",
      };

      // 检测是否是毁灭机 (通过识别颜色方案)
      var isDestroyer =
        colors.primary === "#800000" && colors.secondary === "#1a1a1a";

      // 计算飞机尺寸
      var maxX = 0,
        maxY = 0,
        minX = 0,
        minY = 0;
      for (var i = 0; i < verts.length; i++) {
        maxX = Math.max(maxX, Math.abs(verts[i].x));
        maxY = Math.max(maxY, Math.abs(verts[i].y));
        minX = Math.min(minX, verts[i].x);
        minY = Math.min(minY, verts[i].y);
      }

      var size = Math.max(maxX, maxY); // 飞机的大致尺寸

      // 如果是毁灭机，先绘制特殊的光晕效果
      if (isDestroyer) {
        // 恐怖光晕
        var glowRadius = size * 1.2;
        var glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        glow.addColorStop(0, "rgba(128, 0, 0, 0.3)"); // 红色中心
        glow.addColorStop(0.7, "rgba(255, 102, 0, 0.2)"); // 橙色过渡
        glow.addColorStop(1, "rgba(0, 0, 0, 0)"); // 透明边缘

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 恐怖轨迹线
        ctx.beginPath();
        for (var i = 0; i < 12; i++) {
          var angle = (Math.PI * 2 * i) / 12;
          var innerRadius = size * 0.6;
          var outerRadius = size * 1.1;

          ctx.moveTo(
            Math.cos(angle) * innerRadius,
            Math.sin(angle) * innerRadius
          );
          ctx.lineTo(
            Math.cos(angle) * outerRadius,
            Math.sin(angle) * outerRadius
          );
        }
        ctx.strokeStyle = "rgba(255, 102, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 创建渐变填充
      var gradient;
      if (isDestroyer) {
        // 毁灭机使用更复杂的渐变
        gradient = ctx.createLinearGradient(-50, -50, 50, 50);
        gradient.addColorStop(0, colors.primary); // 暗红色起始
        gradient.addColorStop(0.4, colors.secondary); // 黑色中间
        gradient.addColorStop(0.6, colors.secondary); // 黑色中间
        gradient.addColorStop(0.8, colors.primary); // 暗红色
        gradient.addColorStop(1, colors.tertiary); // 橙色高光
      } else {
        // 常规飞机的渐变
        gradient = ctx.createLinearGradient(-30, -40, 30, 40);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(0.5, colors.secondary);
        gradient.addColorStop(1, colors.tertiary);
      }

      // 绘制飞机主体
      ctx.beginPath();
      ctx.moveTo(verts[0].x, verts[0].y);
      for (var i = 1; i < verts.length; i++) {
        ctx.lineTo(verts[i].x, verts[i].y);
      }
      ctx.closePath();

      // 填充渐变色
      ctx.fillStyle = gradient;
      ctx.fill();

      // 描边
      if (isDestroyer) {
        // 毁灭机有特殊的描边
        ctx.strokeStyle = "#ff6600"; // 明亮的橙色边缘
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = "#ecf0f1";
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      // 中心线
      ctx.beginPath();
      ctx.moveTo(0, minY * 0.95); // 稍微缩短一点，不要到达尖端
      ctx.lineTo(0, maxY * 0.8); // 不要到达尾部
      ctx.strokeStyle = "#ecf0f1";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 座舱/驾驶舱
      var cockpitX = 0;
      var cockpitY = minY * 0.5; // 在机头和中心之间
      var cockpitSize = size * 0.15; // 根据飞机大小调整座舱大小

      // 绘制座舱椭圆
      ctx.beginPath();

      if (isDestroyer) {
        // 毁灭机有更复杂的座舱
        ctx.ellipse(
          cockpitX,
          cockpitY,
          cockpitSize * 0.8,
          cockpitSize * 1.2,
          0,
          0,
          Math.PI * 2
        );
        var cockpitGradient = ctx.createRadialGradient(
          cockpitX,
          cockpitY,
          0,
          cockpitX,
          cockpitY,
          cockpitSize * 1.2
        );
        cockpitGradient.addColorStop(0, "#ff3300"); // 亮红色中心
        cockpitGradient.addColorStop(0.5, "#cc0000"); // 深红色
        cockpitGradient.addColorStop(1, "#800000"); // 暗红色边缘
      } else {
        // 普通飞机的座舱
        ctx.ellipse(
          cockpitX,
          cockpitY,
          cockpitSize * 0.6,
          cockpitSize,
          0,
          0,
          Math.PI * 2
        );
        var cockpitGradient = ctx.createRadialGradient(
          cockpitX,
          cockpitY,
          0,
          cockpitX,
          cockpitY,
          cockpitSize
        );
        cockpitGradient.addColorStop(0, "#f39c12"); // 内部橙色
        cockpitGradient.addColorStop(1, "#e67e22"); // 外部深橙色
      }

      ctx.fillStyle = cockpitGradient;
      ctx.fill();

      if (isDestroyer) {
        ctx.strokeStyle = "#ff6600"; // 橙色边缘
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = "#d35400";
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      // 飞机机翼线条细节
      if (size > 20) {
        // 仅在较大的飞机上添加这些细节
        // 左翼细节
        ctx.beginPath();
        ctx.moveTo(minX * 0.8, 0);
        ctx.lineTo(minX * 0.4, minY * 0.3);
        ctx.strokeStyle = "rgba(236, 240, 241, 0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 右翼细节
        ctx.beginPath();
        ctx.moveTo(-minX * 0.8, 0);
        ctx.lineTo(-minX * 0.4, minY * 0.3);
        ctx.stroke();

        // 尾翼细节
        ctx.beginPath();
        ctx.moveTo(0, maxY * 0.7);
        ctx.lineTo(0, maxY * 0.9);
        ctx.lineWidth = 2;
        ctx.stroke();

        // 添加一些装甲板或面板线条
        for (var i = 0; i < 3; i++) {
          var y = minY * 0.7 + (i * (maxY - minY * 0.7)) / 4;
          var width = (1 - i * 0.2) * maxX * 0.7;

          ctx.beginPath();
          ctx.moveTo(-width, y);
          ctx.lineTo(width, y);
          ctx.strokeStyle = "rgba(236, 240, 241, 0.4)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // 毁灭机特殊装甲细节
        if (isDestroyer) {
          // 装甲板细节
          for (var i = 0; i < 5; i++) {
            // 左侧装甲板
            ctx.beginPath();
            ctx.moveTo(-maxX * 0.7, -maxY * 0.2 + i * maxY * 0.1);
            ctx.lineTo(-maxX * 0.4, -maxY * 0.1 + i * maxY * 0.1);
            ctx.strokeStyle = "rgba(255, 102, 0, 0.5)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // 右侧装甲板
            ctx.beginPath();
            ctx.moveTo(maxX * 0.7, -maxY * 0.2 + i * maxY * 0.1);
            ctx.lineTo(maxX * 0.4, -maxY * 0.1 + i * maxY * 0.1);
            ctx.stroke();
          }

          // 武器挂载点指示器
          var weaponPoints = [
            { x: -40, y: -15 },
            { x: 40, y: -15 },
            { x: -50, y: 20 },
            { x: 50, y: 20 },
            { x: -25, y: -20 },
            { x: 25, y: -20 },
            { x: -10, y: -45 },
            { x: 10, y: -45 },
            { x: 0, y: -48 },
          ];

          for (var i = 0; i < weaponPoints.length; i++) {
            var point = weaponPoints[i];
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#ff6600";
            ctx.fill();

            // 武器光晕
            var weaponGlow = ctx.createRadialGradient(
              point.x,
              point.y,
              0,
              point.x,
              point.y,
              8
            );
            weaponGlow.addColorStop(0, "rgba(255, 102, 0, 0.8)");
            weaponGlow.addColorStop(1, "rgba(255, 102, 0, 0)");
            ctx.fillStyle = weaponGlow;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            ctx.fill();
          }

          // 引擎预热效果
          var enginePositions = [
            { x: -25, y: 40 },
            { x: 25, y: 40 },
            { x: 0, y: 45 },
          ];

          for (var i = 0; i < enginePositions.length; i++) {
            var pos = enginePositions[i];
            var engineGlow = ctx.createRadialGradient(
              pos.x,
              pos.y,
              0,
              pos.x,
              pos.y,
              15
            );
            engineGlow.addColorStop(0, "rgba(255, 204, 0, 0.9)");
            engineGlow.addColorStop(0.3, "rgba(255, 102, 0, 0.7)");
            engineGlow.addColorStop(0.6, "rgba(204, 0, 0, 0.5)");
            engineGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = engineGlow;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 发动机舱亮光效果
      var engineGlow;
      if (isDestroyer) {
        // 毁灭机的发动机更强大
        engineGlow = ctx.createRadialGradient(
          0,
          maxY * 0.85,
          0,
          0,
          maxY * 0.85,
          maxX * 0.7
        );
        engineGlow.addColorStop(0, "rgba(255, 204, 0, 0.8)"); // 明亮的黄色中心
        engineGlow.addColorStop(0.3, "rgba(255, 102, 0, 0.6)"); // 橙色过渡
        engineGlow.addColorStop(0.6, "rgba(204, 0, 0, 0.4)"); // 红色外围
        engineGlow.addColorStop(1, "rgba(0, 0, 0, 0)"); // 透明边缘
      } else {
        // 常规发动机
        engineGlow = ctx.createRadialGradient(
          0,
          maxY * 0.85,
          0,
          0,
          maxY * 0.85,
          maxX * 0.5
        );
        engineGlow.addColorStop(0, "rgba(241, 196, 15, 0.7)");
        engineGlow.addColorStop(0.5, "rgba(230, 126, 34, 0.4)");
        engineGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      }

      ctx.beginPath();
      var engineY = maxY * 0.85;
      var engineWidth = isDestroyer ? maxX * 0.7 : maxX * 0.5;
      ctx.fillStyle = engineGlow;
      ctx.arc(0, engineY, engineWidth, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    drawBrokenPlayer: function (verts, lineOffsets) {
      this.drawer.setStrokeColor("black");
      this.drawer.setLineWidth(1.5);
      for (
        var i = 1, vert, lastVert = verts[0];
        (vert = verts[i]);
        i++, lastVert = vert
      ) {
        var o = lineOffsets[i - 1];
        this.drawer.drawLine(
          lastVert.x + o.pos.x,
          lastVert.x + o.pos.y,
          vert.x + o.pos.x,
          vert.y + o.pos.y
        );
      }
    },
    drawFlames: function (flames, angle) {
      var ctx = this.drawer.ctx;
      ctx.save();
      ctx.translate(
        this.drawer.rect.size.width / 2,
        this.drawer.rect.size.height / 2
      );
      // 旋转角度为飞机方向 + 推进器自身角度
      ctx.rotate(this.drawer.angle + angle);

      // 检测是否是毁灭机的推进器 (通过尺寸判断)
      var isDestroyerThruster =
        flames.self &&
        flames.self.size &&
        (flames.self.size.width > 40 || flames.self.size.height > 15);

      // 外层火焰 - 使用渐变
      var outerGradient;
      if (isDestroyerThruster) {
        // 毁灭机的特殊火焰效果 - 更亮、更长的火焰
        outerGradient = ctx.createLinearGradient(0, 0, 0, 60);
        outerGradient.addColorStop(0, "#ffffff"); // 白色核心
        outerGradient.addColorStop(0.2, "#ffcc00"); // 黄色
        outerGradient.addColorStop(0.4, "#ff6600"); // 橙色
        outerGradient.addColorStop(0.7, "#cc0000"); // 红色
        outerGradient.addColorStop(1, "rgba(204, 0, 0, 0)"); // 透明红色
      } else {
        // 普通飞机的火焰效果
        outerGradient = ctx.createLinearGradient(0, 0, 0, 30);
        outerGradient.addColorStop(0, "#e74c3c"); // 红色
        outerGradient.addColorStop(0.6, "#e67e22"); // 橙色
        outerGradient.addColorStop(1, "rgba(231, 76, 60, 0)"); // 透明红色
      }

      ctx.beginPath();
      for (var i = 0; i < flames.r.length; i++) {
        if (i === 0) {
          ctx.moveTo(flames.r[i].x, flames.r[i].y);
        } else {
          // 如果是毁灭机的推进器，添加随机波动效果
          if (isDestroyerThruster && i > 0 && i < flames.r.length - 1) {
            var jitter = Math.random() * 5 - 2.5;
            ctx.lineTo(flames.r[i].x + jitter, flames.r[i].y);
          } else {
            ctx.lineTo(flames.r[i].x, flames.r[i].y);
          }
        }
      }
      ctx.closePath();
      ctx.fillStyle = outerGradient;
      ctx.fill();

      // 内层火焰 - 明亮的黄色到白色渐变
      var innerGradient;
      if (isDestroyerThruster) {
        // 毁灭机的内层火焰 - 更亮、更宽
        innerGradient = ctx.createLinearGradient(0, 0, 0, 40);
        innerGradient.addColorStop(0, "#ffffff"); // 白色核心
        innerGradient.addColorStop(0.3, "#ffff00"); // 亮黄色
        innerGradient.addColorStop(0.7, "#ffcc00"); // 黄色
        innerGradient.addColorStop(1, "rgba(255, 204, 0, 0)"); // 透明黄色
      } else {
        // 普通飞机的内层火焰
        innerGradient = ctx.createLinearGradient(0, 0, 0, 20);
        innerGradient.addColorStop(0, "#f1c40f"); // 黄色
        innerGradient.addColorStop(0.7, "#f39c12"); // 橙黄色
        innerGradient.addColorStop(1, "rgba(241, 196, 15, 0)"); // 透明黄色
      }

      ctx.beginPath();
      for (var i = 0; i < flames.y.length; i++) {
        if (i === 0) {
          ctx.moveTo(flames.y[i].x, flames.y[i].y);
        } else {
          // 如果是毁灭机的推进器，添加随机波动效果
          if (isDestroyerThruster && i > 0 && i < flames.y.length - 1) {
            var jitter = Math.random() * 3 - 1.5;
            ctx.lineTo(flames.y[i].x + jitter, flames.y[i].y);
          } else {
            ctx.lineTo(flames.y[i].x, flames.y[i].y);
          }
        }
      }
      ctx.closePath();
      ctx.fillStyle = innerGradient;
      ctx.fill();

      // 添加火花效果
      var sparkCount = isDestroyerThruster ? 15 : 5; // 毁灭机有更多的火花
      var sparkMaxSize = isDestroyerThruster ? 4 : 2; // 毁灭机的火花更大
      var sparkMaxY = isDestroyerThruster ? 50 : 20; // 毁灭机的火花分布范围更大

      for (var i = 0; i < sparkCount; i++) {
        var sparkX = (Math.random() - 0.5) * (isDestroyerThruster ? 30 : 15);
        var sparkY =
          Math.random() * sparkMaxY + (isDestroyerThruster ? 20 : 15);
        var sparkSize = Math.random() * sparkMaxSize + 1;

        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fillStyle =
          i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#ffcc00" : "#ff6600";
        ctx.fill();
      }

      // 毁灭机特有的震撼波效果
      if (isDestroyerThruster) {
        // 添加冲击波环
        for (var i = 0; i < 2; i++) {
          var radius = 15 + i * 10;
          var opacity = 0.7 - i * 0.3;

          ctx.beginPath();
          ctx.arc(0, 15, radius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 204, 0, " + opacity + ")";
          ctx.lineWidth = 2 - i;
          ctx.stroke();
        }

        // 添加爆燃效果
        if (Math.random() > 0.85) {
          var burstX = (Math.random() - 0.5) * 15;
          var burstY = Math.random() * 30 + 15;
          var burstSize = Math.random() * 8 + 4;

          var burstGradient = ctx.createRadialGradient(
            burstX,
            burstY,
            0,
            burstX,
            burstY,
            burstSize
          );
          burstGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          burstGradient.addColorStop(0.3, "rgba(255, 204, 0, 0.7)");
          burstGradient.addColorStop(0.6, "rgba(255, 102, 0, 0.5)");
          burstGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = burstGradient;
          ctx.beginPath();
          ctx.arc(burstX, burstY, burstSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    },
    drawBullet: function (isBig, isDestroyerBullet) {
      // 根据子弹大小选择显示文本
      var bulletText = Math.random() > 0.5 ? "0" : "1";

      this.drawer.ctx.save();
      this.drawer.ctx.translate(
        this.drawer.rect.size.width / 2,
        this.drawer.rect.size.height / 2
      );

      if (isDestroyerBullet) {
        // 毁灭机子弹 - 更炫酷的效果
        var bulletSize = isBig ? 15 : 8;

        // 外部光晕
        var outerGlow = this.drawer.ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          bulletSize * 1.5
        );
        outerGlow.addColorStop(0, "#ff3300");
        outerGlow.addColorStop(0.3, "#cc0000");
        outerGlow.addColorStop(0.7, "rgba(204, 0, 0, 0.5)");
        outerGlow.addColorStop(1, "rgba(0,0,0,0)");

        this.drawer.ctx.fillStyle = outerGlow;
        this.drawer.ctx.beginPath();
        this.drawer.ctx.arc(0, 0, bulletSize * 1.5, 0, Math.PI * 2, false);
        this.drawer.ctx.fill();

        // 内部核心
        var innerGlow = this.drawer.ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          bulletSize
        );
        innerGlow.addColorStop(0, "#ffffff");
        innerGlow.addColorStop(0.4, "#ffcc00");
        innerGlow.addColorStop(1, "#ff3300");

        this.drawer.ctx.fillStyle = innerGlow;
        this.drawer.ctx.beginPath();
        this.drawer.ctx.arc(0, 0, bulletSize, 0, Math.PI * 2, false);
        this.drawer.ctx.fill();

        // 绘制十字线
        this.drawer.ctx.strokeStyle = "#ffffff";
        this.drawer.ctx.lineWidth = 2;
        this.drawer.ctx.beginPath();
        this.drawer.ctx.moveTo(-bulletSize * 0.7, 0);
        this.drawer.ctx.lineTo(bulletSize * 0.7, 0);
        this.drawer.ctx.moveTo(0, -bulletSize * 0.7);
        this.drawer.ctx.lineTo(0, bulletSize * 0.7);
        this.drawer.ctx.stroke();

        // 如果是大型子弹，添加追踪线
        if (isBig) {
          // 追踪线
          var trailLength = bulletSize * 2;
          var trailGradient = this.drawer.ctx.createLinearGradient(
            0,
            0,
            0,
            trailLength
          );
          trailGradient.addColorStop(0, "rgba(255, 204, 0, 0.8)");
          trailGradient.addColorStop(1, "rgba(255, 0, 0, 0)");

          this.drawer.ctx.fillStyle = trailGradient;
          this.drawer.ctx.beginPath();
          this.drawer.ctx.moveTo(-bulletSize * 0.7, 0);
          this.drawer.ctx.lineTo(0, trailLength);
          this.drawer.ctx.lineTo(bulletSize * 0.7, 0);
          this.drawer.ctx.fill();

          // 绘制脉冲环
          for (var i = 0; i < 2; i++) {
            var pulseSize = bulletSize * (1.2 + i * 0.3);
            var opacity = 0.7 - i * 0.3;

            this.drawer.ctx.strokeStyle = "rgba(255, 102, 0, " + opacity + ")";
            this.drawer.ctx.lineWidth = 2 - i;
            this.drawer.ctx.beginPath();
            this.drawer.ctx.arc(0, 0, pulseSize, 0, Math.PI * 2, false);
            this.drawer.ctx.stroke();
          }
        }
      } else if (isBig) {
        // 大型子弹
        var gradient = this.drawer.ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        gradient.addColorStop(0, "white");
        gradient.addColorStop(0.3, GameGlobals.bulletColor);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        this.drawer.ctx.fillStyle = gradient;
        this.drawer.ctx.beginPath();
        this.drawer.ctx.arc(0, 0, 10, 0, Math.PI * 2, false);
        this.drawer.ctx.fill();

        // 绘制文字
        this.drawer.ctx.fillStyle = "#ffffff";
        this.drawer.ctx.font = "bold 20px Arial";
        this.drawer.ctx.textAlign = "center";
        this.drawer.ctx.textBaseline = "middle";
        this.drawer.ctx.fillText(bulletText, 0, 0);
      } else {
        // 普通子弹
        this.drawer.ctx.fillStyle = GameGlobals.bulletColor;
        this.drawer.ctx.font = "bold 12px Arial";
        this.drawer.ctx.textAlign = "center";
        this.drawer.ctx.textBaseline = "middle";
        this.drawer.ctx.fillText(bulletText, 0, 0);
      }

      this.drawer.ctx.restore();
    },
    drawExplosion: function (particles) {
      for (var i = 0, particle; (particle = particles[i]); i++) {
        this.drawer.setFillColor(particle.color);
        this.drawer.drawRect(particle.pos.x, particle.pos.y, 3, 3);
      }
    },
    drawFace: function (face) {
      this.drawer.drawImageFull(face);
    },
    drawLaser: function (pos, dir) {
      this.clear();
      this.setPosition(pos);
      this.drawer.setAngle(dir.angle());
      this.drawer.drawImage(GameGlobals.laserImage, 0, 0);
    },
    transformToSheetCoordinates: function (vec) {
      var ret = vec
        .cp()
        .sub(new Vector(this.rect.size.width / 2, this.rect.size.height / 2));
      return ret;
    },
    destroy: function () {
      this.drawer.destroy();
    },

    // 修改Sheet类以支持增强型爆炸效果
    drawEnhancedExplosion: function (particles) {
      for (var i = 0, particle; (particle = particles[i]); i++) {
        var size = particle.size || 3;
        var color = particle.color || "yellow";
        var opacity = particle.opacity || 1;

        this.drawer.ctx.save();
        this.drawer.ctx.globalAlpha = opacity;

        // 绘制光晕效果
        var gradient = this.drawer.ctx.createRadialGradient(
          this.drawer.rect.size.width / 2 + particle.pos.x,
          this.drawer.rect.size.height / 2 + particle.pos.y,
          0,
          this.drawer.rect.size.width / 2 + particle.pos.x,
          this.drawer.rect.size.height / 2 + particle.pos.y,
          size * 2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        this.drawer.ctx.fillStyle = gradient;
        this.drawer.ctx.beginPath();
        this.drawer.ctx.arc(
          this.drawer.rect.size.width / 2 + particle.pos.x,
          this.drawer.rect.size.height / 2 + particle.pos.y,
          size * 2,
          0,
          Math.PI * 2,
          false
        );
        this.drawer.ctx.fill();

        // 绘制粒子中心
        this.drawer.ctx.fillStyle = color === "yellow" ? "white" : "yellow";
        this.drawer.ctx.beginPath();
        this.drawer.ctx.arc(
          this.drawer.rect.size.width / 2 + particle.pos.x,
          this.drawer.rect.size.height / 2 + particle.pos.y,
          size / 2,
          0,
          Math.PI * 2,
          false
        );
        this.drawer.ctx.fill();

        this.drawer.ctx.restore();
      }
    },
  });
  var namespace = getGlobalNamespace();

  var initKickAss = function () {
    // If an instance of KickAss is already present, we add a player
    if (!namespace.KICKASSGAME) {
      if (namespace.KICKASS_SITE_KEY) {
        var mySite = new MySite(namespace.KICKASS_SITE_KEY);
        mySite.load(function (ok) {
          namespace.KICKASSGAME = GameGlobals.kickass = new KickAss({
            mySite: ok ? mySite : false,
          });
          // 游戏初始化但不启动，通过Ctrl+L启动
          console.log("游戏已初始化，按Ctrl+L开始游戏");
        });
      } else {
        namespace.KICKASSGAME = GameGlobals.kickass = new KickAss();
        // 游戏初始化但不启动，通过Ctrl+L启动
        console.log("游戏已初始化，按Ctrl+L开始游戏");
      }
    } else {
      namespace.KICKASSGAME.addPlayer();
    }
  };

  if (namespace.LAZYLOAD_KICKASS) {
    window.startBrowserBlaster = initKickAss;
  } else {
    initKickAss();
  }

  function getAppContainerElement() {
    if (namespace.KICKASS_CONTAINER_ELEMENT) {
      return document.getElementById(namespace.KICKASS_CONTAINER_ELEMENT);
    } else {
      return document.body;
    }
  }
})(typeof exports != "undefined" ? exports : window);
