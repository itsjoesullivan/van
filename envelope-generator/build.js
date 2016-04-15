(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Envelope = require('../env-gen/envelope-generator').default;
var drawBuffer = require('draw-wave');
var NoiseBuffer = require('noise-buffer');
var c = new AudioContext();
var width = document.getElementsByTagName('p')[0].offsetWidth;

window.extraLength = 0.3;

var muted = true;

function render() {
  var settings = {
    attackTime: 0.1,
    decayTime: 0.3,
    sustainLevel: 0.8,
    releaseTime: 0.3,
    delayTime: 0,
    startLevel: 0.001,
    curve: 'exponential'
  };

  settings.attackTime = parseFloat(document.getElementById('attack-time').value);
  settings.decayTime = parseFloat(document.getElementById('decay-time').value);
  settings.sustainLevel = parseFloat(document.getElementById('sustain-level').value);
  settings.releaseTime = parseFloat(document.getElementById('release-time').value);
  settings.curve = document.getElementById('curve').value;

  var duration = settings.attackTime + settings.decayTime + settings.releaseTime + extraLength;

  var context = new OfflineAudioContext(1, duration * 44100, 44100);

  var env = new Envelope(context, settings);
  var noise = NoiseBuffer(1, 'white');
  var gainNode = context.createGain();
  var quieter = context.createGain();
  var source = context.createBufferSource();
  source.buffer = noise;
  source.connect(gainNode);
  source.loop = true;
  env.connect(gainNode.gain);
  gainNode.gain.value = 0;
  source.start(0);
  env.start(0);
  env.release(settings.attackTime + settings.decayTime + extraLength);
  source.stop(env.getReleaseCompleteTime());
  gainNode.connect(quieter);
  quieter.connect(context.destination);
  quieter.gain.value = 1;
  context.startRendering().then(function(buffer) {
    var waveSVG = drawBuffer.svg(buffer, width, width / 4, '#111');
    $("#svg-container").empty();
    $("#svg-container").append(waveSVG);
    
    if (!muted) {
      var source = c.createBufferSource();
      source.buffer = buffer;
      source.start();
      var gain = c.createGain();
      gain.gain.value = 0.01;
      source.connect(gain);
      gain.connect(c.destination);
    }
  });
}

$('input, select').on('input', function() {
  render();
});

render();
render = _.debounce(render, 500);

$("#muter").on('click', function() {
  var request = $("#muter").html();
  if (request === "unmute") {
    $("#muter").html("mute");
    muted = false;
  } else {
    $("#muter").html("unmute");
    muted = true;
  }
})
$("#play").on('click', render);

},{"../env-gen/envelope-generator":7,"draw-wave":2,"noise-buffer":5}],2:[function(require,module,exports){
module.exports = {
  canvas: drawBuffer,
  svg: require('./svg.js')
};

function drawBuffer (canvas, buffer, color) {
  var ctx = canvas.getContext('2d');
  var width = canvas.width;
  var height = canvas.height;
  if (color) {
    ctx.fillStyle = color;
  }

    var data = buffer.getChannelData( 0 );
    var step = Math.ceil( data.length / width );
    var amp = height / 2;
    for(var i=0; i < width; i++){
        var min = 1.0;
        var max = -1.0;
        for (var j=0; j<step; j++) {
            var datum = data[(i*step)+j];
            if (datum < min)
                min = datum;
            if (datum > max)
                max = datum;
        }
      ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
    }
}
},{"./svg.js":3}],3:[function(require,module,exports){
var createEl = require('svg-create-element');

module.exports = drawBufferSVG;

function getRect(x, y, width, height, color) {
  return createEl('rect', {
    x: x,
    y: y,
    width: width,
    height: height,
    fill: color
  });
}

function drawBufferSVG(buffer, width, height, color) {
  if (!color) color = '#000';

  var svgEl = createEl('svg', {
    width: width,
    height: height
  });

  svgEl.style.display = "block";

  var g = createEl('g');

  svgEl.appendChild(g);

  var data = buffer.getChannelData( 0 );
  var step = Math.ceil( data.length / width );
  var amp = height / 2;
  for (var i=0; i < width; i++) {
    var min = 1.0;
    var max = -1.0;
    for (var j=0; j<step; j++) {
      var datum = data[(i*step)+j];
      if (datum < min)
        min = datum;
      if (datum > max)
        max = datum;
    }
    g.appendChild(getRect(i, (1+min)*amp, 1, Math.max(1,(max-min)*amp), color));
  }

  return svgEl;
}
},{"svg-create-element":6}],4:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;


module.exports = function has(obj, property) {
  return hasOwn.call(obj, property);
};

},{}],5:[function(require,module,exports){
// courtesy of http://noisehack.com/generate-noise-web-audio-api/
module.exports = function(length, type) {
  type = type || 'white';

  var sampleRate = 44100;
  var samples = length * sampleRate;
  var context = new OfflineAudioContext(1, samples, sampleRate);
  var noiseBuffer = context.createBuffer(1, samples, sampleRate);
  var output = noiseBuffer.getChannelData(0);

  switch(type) {
    case 'white':
      // http://noisehack.com/generate-noise-web-audio-api/
      for (var i = 0; i < samples; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      break;
    case 'pink':
      // just completely http://noisehack.com/generate-noise-web-audio-api/
      var b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (var i = 0; i < samples; i++) {
        var white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }
      break;
    case 'brown':
      // just completely http://noisehack.com/generate-noise-web-audio-api/
      var lastOut = 0.0;
      for (var i = 0; i < samples; i++) {
        var white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // (roughly) compensate for gain
      }
      break;
  }

  return noiseBuffer;
};

},{}],6:[function(require,module,exports){
var has = require('has');

module.exports = function (name, attr) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', name);
    if (!attr) return elem;
    for (var key in attr) {
        if (!has(attr, key)) continue;
        var nkey = key.replace(/([a-z])([A-Z])/g, function (_, a, b) {
            return a + '-' + b.toLowerCase();
        });
        elem.setAttribute(nkey, attr[key]);
    }
    return elem;
}

},{"has":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Create an envelope generator that
 * can be attached to an AudioParam
 */

var Envelope = function () {
  function Envelope(context, settings) {
    _classCallCheck(this, Envelope);

    // Hold on to these
    this.context = context;
    this.settings = settings;

    this._setDefaults();

    // Create nodes
    this.source = this._getOnesBufferSource();
    this.attackDecayNode = context.createGain();
    this.releaseNode = context.createGain();

    // Set up graph
    this.source.connect(this.attackDecayNode);
    this.attackDecayNode.connect(this.releaseNode);
  }

  _createClass(Envelope, [{
    key: '_setDefaults',
    value: function _setDefaults() {

      // curve
      if (typeof this.settings.curve !== 'string') {
        this.settings.curve = 'linear';
      }

      // delayTime
      if (typeof this.settings.delayTime !== 'number') {
        this.settings.delayTime = 0;
      }

      // startLevel
      if (typeof this.settings.startLevel !== 'number') {
        this.settings.startLevel = 0;
      }
      if (this.settings.startLevel === 0) {
        this.settings.startLevel = 0.001;
      }

      // attackTime
      if (typeof this.settings.attackTime !== 'number') {
        this.settings.attackTime = 0;
      }

      // holdTime
      if (typeof this.settings.holdTime !== 'number') {
        this.settings.holdTime = 0;
      }

      // decayTime
      if (typeof this.settings.decayTime !== 'number') {
        this.settings.decayTime = 0;
      }
      if (this.settings.decayTime === 0) {
        this.settings.decayTime = 0.001;
      }

      // sustainLevel
      if (typeof this.settings.sustainLevel !== 'number') {
        this.settings.sustainLevel = 1;
      }
      if (this.settings.sustainLevel === 0) {
        this.settings.sustainLevel = 0.001;
      }

      // releaseTime
      if (typeof this.settings.releaseTime !== 'number') {
        this.settings.releaseTime = 0;
      }
    }

    /**
     * Get an audio source that will be pegged at 1,
     * providing a signal through our path that can
     * drive the AudioParam this is attached to.
     * TODO: Can we always cache this?
     */

  }, {
    key: '_getOnesBufferSource',
    value: function _getOnesBufferSource() {
      var context = this.context;

      // Generate buffer, setting its one sample to 1
      var onesBuffer = context.createBuffer(1, 1, context.sampleRate);
      onesBuffer.getChannelData(0)[0] = 1;

      // Create a source for the buffer, looping it
      var source = context.createBufferSource();
      source.buffer = onesBuffer;
      source.loop = true;

      return source;
    }

    /**
     * Connect the end of the path to the
     * targetParam.
     *
     * TODO: Throw error when not an AudioParam target?
     */

  }, {
    key: 'connect',
    value: function connect(targetParam) {
      this.releaseNode.connect(targetParam);
    }

    /**
     * Begin the envelope, scheduling everything we know
     * (attack time, decay time, sustain level).
     */

  }, {
    key: 'start',
    value: function start(when) {

      var attackRampMethodName = this._getRampMethodName('attack');
      var decayRampMethodName = this._getRampMethodName('decay');

      var attackStartsAt = when + this.settings.delayTime;
      var attackEndsAt = attackStartsAt + this.settings.attackTime;
      var decayStartsAt = attackEndsAt + this.settings.holdTime;
      var decayEndsAt = decayStartsAt + this.settings.decayTime;

      this.attackDecayNode.gain.setValueAtTime(this.settings.startLevel, when);
      this.attackDecayNode.gain.setValueAtTime(this.settings.startLevel, attackStartsAt);
      this.attackDecayNode.gain[attackRampMethodName](1, attackEndsAt);
      this.attackDecayNode.gain.setValueAtTime(1, decayStartsAt);
      this.attackDecayNode.gain[decayRampMethodName](this.settings.sustainLevel, decayEndsAt);

      this.source.start(when);
    }

    /**
     * Return  either linear or exponential
     * ramp method names based on a general
     * 'curve' setting, which is overridden
     * on a per-stage basis by 'attackCurve',
     * 'decayCurve', and 'releaseCurve',
     * all of which can be set to values of
     * either 'linear' or 'exponential'.
     */

  }, {
    key: '_getRampMethodName',
    value: function _getRampMethodName(stage) {
      var exponential = 'exponentialRampToValueAtTime';
      var linear = 'linearRampToValueAtTime';

      // Handle general case
      var generalRampMethodName = linear;
      if (this.settings.curve === 'exponential') {
        generalRampMethodName = exponential;
      }

      switch (stage) {
        case 'attack':
          if (this.settings.attackCurve) {
            if (this.settings.attackCurve === 'exponential') {
              return exponential;
            } else if (this.settings.attackCurve === 'linear') {
              return linear;
            }
          }
          break;
        case 'decay':
          if (this.settings.decayCurve) {
            if (this.settings.decayCurve === 'exponential') {
              return exponential;
            } else if (this.settings.decayCurve === 'linear') {
              return linear;
            }
          }
          break;
        case 'release':
          if (this.settings.releaseCurve) {
            if (this.settings.releaseCurve === 'exponential') {
              return exponential;
            } else if (this.settings.releaseCurve === 'linear') {
              return linear;
            }
          }
          break;
        default:
          break;
      }
      return generalRampMethodName;
    }

    /**
     * End the envelope, scheduling what we didn't know before
     * (release time)
     */

  }, {
    key: 'release',
    value: function release(when) {
      this.releasedAt = when;
      var releaseEndsAt = this.releasedAt + this.settings.releaseTime;

      var rampMethodName = this._getRampMethodName('release');

      this.releaseNode.gain.setValueAtTime(1, when);
      this.releaseNode.gain[rampMethodName](this.settings.startLevel, releaseEndsAt);

      this.source.stop(releaseEndsAt);
    }

    /**
     * Provide a helper for consumers to
     * know when the release is finished,
     * so that a source can be stopped.
     */

  }, {
    key: 'getReleaseCompleteTime',
    value: function getReleaseCompleteTime() {
      if (typeof this.releasedAt !== 'number') {
        throw new Error("Release has not been called.");
      }
      return this.releasedAt + this.settings.releaseTime;
    }
  }]);

  return Envelope;
}();

exports.default = Envelope;


},{}]},{},[1]);
