(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var VoiceCommandDispatcher = require('../src/voice-command-dispatcher');
var witService = require('../src/modules/service-layer/wit-xhr-service-layer');
var voiceChannel = new VoiceCommandDispatcher(witService);

window.document.querySelector('.js-trigger-mic').addEventListener('click', function() {
    function sampleCallback(message, data) {
      console.log('The intent is: ' + message);
      console.log('Data Received:');
      console.log(data);
    }
    voiceChannel.start();
    voiceChannel.register('useless', sampleCallback);

});
},{"../src/modules/service-layer/wit-xhr-service-layer":4,"../src/voice-command-dispatcher":6}],2:[function(require,module,exports){
var WAVEncoder = function() {

  /**
   * Creates a DataView object with the encoded WAV
   * @param  {AudioBuffer} buf The recorded audio
   * @param  {Number} sr       The sample rate
   * @return {DataView}        The encoded WAV
   */
  function encodeWAV(buf, sr) {
    var buffer = new ArrayBuffer(44 + buf.length * 2);
    var view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 32 + buf.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sr, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sr *2 , true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, buf.length * 2, true);

    floatTo16BitPCM(view, 44, buf);

    return view;
  }

  function floatTo16BitPCM(output, offset, input){
    for (var i = 0; i < input.length; i++, offset+=2){
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  function writeString(view, offset, string){
    for (var i = 0; i < string.length; i++){
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }


  function encode(audioBuffer) {
    return encodeWAV(audioBuffer, 44100);
  }

  return {
    encode: encode
  }
}


module.exports = WAVEncoder;
},{}],3:[function(require,module,exports){
var MessageRegistry = function() {

  /**
   * A pairing 'message' : [component1, ..., componentN], matching a message to an
   * array of listening components
   * @type {Object}
   */
  var register = {};

  /**
   * Adds a component to the registry, so it can be notified when the given message is received
   * @param  {Object} component The web component
   * @param  {String} message   A message that will be associated with an action
   */
  function subscribe(component, message) {
    if (register[message]) {
      register[message].push(component);
    } else {
      register[message] = [];
      register[message].push(component);
    }
  }

  /**
   * Removes a component from a given message queue
   * @param  {Object} component The web component
   * @param  {String} message   The message to stop listening to
   */
  function unsubscribe(component, message) {
    var index;
    if (register[message]) {
      index = register[message].indexOf(component);
      if (index !== -1) {
        register[message].splice(index, 1);
      }
    }
  }

  /**
   * Notifies all componentes waiting for the received message
   * @param  {String} message The received message
   * @param  {Object} data additional returned data
   */
  function notify(message, data) {
    var index, length;
    if (register[message]) {
      length = register[message].length;
      for(index = 0; index < length; index ++) {
        register[message][index].call(null, message, data);
      }
    }
  }

  return {
    notify: notify,
    subscribe: subscribe,
    unsubscribe: unsubscribe
  }
}

module.exports = MessageRegistry;
},{}],4:[function(require,module,exports){
var WAVEncoder = require('../encoders/wav-encoder');
var WitServiceLayer = function() {
  var url = 'https://api.wit.ai/speech';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';
  var encoding = 'audio/wav';
  var encoder = new WAVEncoder();

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();

    audioBuffer = encoder.encode(audioBuffer);
    function processResponse(xhr) {
      var outcome = JSON.parse(xhr.target.response).outcomes;
      var intent;

      if (outcome.length > 0) {
        intent = outcome[0].intent;
        callback(intent, outcome);
      }
    }
    request.open("POST", url, true);
    request.setRequestHeader('Content-type', encoding);
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.addEventListener('load', processResponse, false);
    request.addEventListener('error', handleError, false);

    audioBuffer = new Blob([audioBuffer], {type: 'audio/wav'});
    request.send(audioBuffer);
  }

  function handleError(error) {
    console.log(error);
  }

  return {
    postMessage: postMessage
  }
}

module.exports = WitServiceLayer;
},{"../encoders/wav-encoder":2}],5:[function(require,module,exports){
var VoiceReader = function() {

  /**
   * The AudioContext to be used in every step of the voice command dispatcher flow
   */
  var audioContext;

  /**
   * A constant representing the sample rate
   * @type {Number}
   */
  var BUFF_SIZE_RENDERER = 16384;

  /**
   * A constant representing the minimum sound amplitud that could be considered as audible
   * @type {Number}
   */
  var SILENCE_THRESHOLD = 0.015;

  /**
   * An array containing the recorded input until a phrase is recognised and properly handled
   * @type {Array}
   */
  var cachedBuffer = [];

  /**
   * The speech recognition service interface
   */
  var serviceLayer;

  /**
   * Cached callback to call each time the service returns a message
   */
  var responseHandler;

  /**
   * Initializes the AudioContext if supported
   */
  function createAudioContext() {
    audioCtx = window.AudioContext || window.webkitAudioContext;
    if (audioCtx) {
      audioContext = new audioCtx();
    } else {
      console.alert('AudioContext not supported');
    }
  }

  /**
   * Trims silence subarrays from the begin and the end of the buffer
   * @param  {Array} audioBuffer The audio buffer
   */
  function trimSilences(audioBuffer) {
    while (audioBuffer.length > 0 && audioBuffer[0] <= SILENCE_THRESHOLD) {
      audioBuffer.splice(0, 1);
    }
    while (audioBuffer.length > 0 && audioBuffer[audioBuffer.length - 1] <= SILENCE_THRESHOLD) {
      audioBuffer.splice(audioBuffer.length - 1, 1);
    }
  }

  /**
   * Identifies if the audio buffer contains a possible command by trimming silences, analysing
   * the buffer, and checking duration. If so, it send's the buffer to the sevice layer
   * @param  {Array} commandBuffer The audio buffer
   */
  function captureVoiceCommand(commandBuffer) {
    trimSilences(commandBuffer);
    if (commandBuffer.length >= BUFF_SIZE_RENDERER) {
      if (commandBuffer.length >= 22050 && !detectSilence(commandBuffer)) {
        if (serviceLayer) {
          serviceLayer.postMessage(commandBuffer, responseHandler);
        } else {
          throw new Error('No service layer provided');
        }
      }
    }
  }

  /**
   * Analyses the audio buffer comparing each value to a defined threshold, looking for periods of
   * silence.
   * @param  {Array} audioBuffer The audio buffer
   * @param  {Number} [limit]    An index until, starting from the end, the algorithm should search for
   *                             silences
   * @return {Boolean}           True if the analysed buffer is considered silence
   */
  function detectSilence(audioBuffer, limit) {
    var sum = 0;
    var index = audioBuffer.length -1;
    var end = limit ? audioBuffer.length - limit : 0;
    var avg;
    for(index; index >= end; index--) {
      sum += Math.abs(audioBuffer[index]);
    }
    avg = sum/BUFF_SIZE_RENDERER;
    return avg <= SILENCE_THRESHOLD;
  }

  /**
   * Takes the input directly from the microphone stream, caching(recording) until a silence,
   * considered as a phrase separation, is found. Delegates the phrase handling, and continues
   * recording a possible new phrase.
   * @param  {AudioProcessingEvent} event The event fired by AudioScriptProcessor
   */
  function processInput(event) {
    var inputBuffer = event.inputBuffer.getChannelData(0);

    cachedBuffer = Array.prototype.concat(cachedBuffer, Array.prototype.slice.call(inputBuffer));

    //Since the sample rate is 44.1khz, that means 44100 samples are taken in 1 second
    //So, 22050 samples are taken in half a second. We will only process a stream if it last
    //at least half a second, an we will consider a silence, a half a second break in the audio
    if (cachedBuffer.length >= 22050 && detectSilence(cachedBuffer, 22050)) {
      console.log('Silence ---> ');
      captureVoiceCommand(cachedBuffer);
      cachedBuffer = [];
    }
  }

  /**
   * Based on HTML5 Audio API, creates the necessary graph to listen to the microphone input,
   * and handling the received stream
   * @param  {MediaStream} audioStream The audio stream coming from the microphone
   */
  function createSoundGraph(audioStream) {
    var micStream = audioContext.createMediaStreamSource(audioStream);
    var inputAnalyzer = audioContext.createScriptProcessor(BUFF_SIZE_RENDERER, 1, 1);
    window.globalInstance = inputAnalyzer;
    inputAnalyzer.onaudioprocess = processInput;
    micStream.connect(inputAnalyzer);
    inputAnalyzer.connect(audioContext.destination);
  }

  /**
   * Initializes the capture of sound provenient from the microphone, if supported.
   * @param  {Object} serviceLayer The speech recognition service interface
   * @param  {Function} callback The handler to call each time the service sends a response
   */
  function initializeAudioCapture(service, callback) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia || navigator.msGetUserMedia;

    serviceLayer = service;
    responseHandler = callback;
    createAudioContext();

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio:true}, createSoundGraph, function(e) {
        console.warn('Error capturing audio.');
      });
    } else {
      console.warn('getUserMedia not supported in this browser.');
    }
  }

  return {
    initializeAudioCapture: initializeAudioCapture
  }
}

module.exports = VoiceReader;
},{}],6:[function(require,module,exports){
var MessageRegistry = require('./modules/register');
var VoiceReader = require('./modules/voice-reader');
var VoiceCommandDispatcher = function(serviceLayer) {

  /**
   * The speech recognition service interface
   * @type {Object}
   */
  var speechRecService = new serviceLayer();

  /**
   * The registry containing all the dispatch information
   */
  var registry;

  /**
   * Crates the instance for the message registry
   */
  function createRegistry() {
    registry = new MessageRegistry();
  }

  return {
    start: function() {
      createRegistry();
      new VoiceReader().initializeAudioCapture(speechRecService, registry.notify);
    },

    register: function(message, callback) {
      registry.subscribe(callback, message);
    },

    unregister: function(message, callback) {
      registry.unsubscribe(callback, message);
    }
  }
}

module.exports = VoiceCommandDispatcher;

},{"./modules/register":3,"./modules/voice-reader":5}]},{},[1]);
