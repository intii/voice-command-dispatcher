(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var VoiceCommandDispatcher = require('../src/voice-command-dispatcher');
var witService = require('../src/modules/service-layer/wit-xhr-service-layer');
var voiceChannel = new VoiceCommandDispatcher(witService);

window.document.querySelector('.js-trigger-mic').addEventListener('click', function() {
    voiceChannel.start();
});
},{"../src/modules/service-layer/wit-xhr-service-layer":3,"../src/voice-command-dispatcher":5}],2:[function(require,module,exports){
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
   */
  function notify(message) {
    var index, length;
    if (register[message]) {
      length = register[message].length;
      for(index = 0; index <= length; index ++) {
        register[message][index].notify(message);
      }
    }
  }
}

module.exports = MessageRegistry;
},{}],3:[function(require,module,exports){
var WitServiceLayer = function() {
  var url = 'https://api.wit.ai/speech';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';
  var encoding = 'audio/raw;encoding=floating-point;bits=32;rate=44100;endian=little';

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader('Content-type', encoding);
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.addEventListener('load', handleResponse, false);
    request.addEventListener('error', handleError, false);

    request.send(audioBuffer);
  }

  function handleResponse(response) {
    console.log(response);
  }

  function handleError(error) {
    console.log(error);
  }

  return {
    postMessage: postMessage
  }
}

module.exports = WitServiceLayer;
},{}],4:[function(require,module,exports){
var VoiceReader = function() {

  /**
   * The AudioContext to be used in every step of the voice command dispatcher flow
   */
  var audioContext;

  /**
   * A constant representing the sample rate
   * @type {Number}
   */
  var BUFF_SIZE_RENDERER = 512;

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

  function encodeBuffer(audioBuffer) {
    var bufferLength = audioBuffer.length,
        transferBuffer = new Int16Array(bufferLength),
        i, x, y;

    /**
     * Extracted from the implementation of Microphone
     * https://github.com/wit-ai/microphone/blob/master/app/coffee/microphone.coffee
     */
    for (i = 0; i < bufferLength; i++) {
      x = audioBuffer[i];
      y = x < 0 ? x * 0x8000 : x * 0x7fff;
      transferBuffer[i] = y;
    }
    return transferBuffer;
  }

  /**
   * Identifies if the audio buffer contains a possible command by trimming silences, analysing
   * the buffer, and checking duration. If so, it send's the buffer to the sevice layer
   * @param  {Array} commandBuffer The audio buffer
   */
  function captureVoiceCommand(commandBuffer) {
    var audioBuffer, transferBuffer;
    trimSilences(commandBuffer);
    if (commandBuffer.length >= BUFF_SIZE_RENDERER) {
      audioBuffer = audioContext.createBuffer(1, commandBuffer.length, audioContext.sampleRate);
      audioBuffer.copyToChannel(new Float32Array(commandBuffer), 0);

      if(audioBuffer.duration > 0.5 && !detectSilence(audioBuffer)) {
        //This whole code block is just for testing purposes. Here we should send the buffer
        //to the service layer.
        // var source = audioContext.createBufferSource();
        // source.buffer = audioBuffer;
        // source.connect(audioContext.destination);
        // source.start();
        if (serviceLayer) {
          // transferBuffer = encodeBuffer(commandBuffer);
          serviceLayer.postMessage(new Float32Array(commandBuffer));
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
    var audioBuffer;

    cachedBuffer = Array.prototype.concat(cachedBuffer, Array.prototype.slice.call(inputBuffer));
    audioBuffer = audioContext.createBuffer(1, cachedBuffer.length, audioContext.sampleRate);
    audioBuffer.copyToChannel(new Float32Array(cachedBuffer), 0);

    if (audioBuffer.duration >= 0.5 && detectSilence(cachedBuffer, 20000)) {
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

    inputAnalyzer.onaudioprocess = processInput;
    micStream.connect(inputAnalyzer);
    inputAnalyzer.connect(audioContext.destination);
  }

  /**
   * Initializes the capture of sound provenient from the microphone, if supported.
   * @param  {Object} serviceLayer The speech recognition service interface
   */
  function initializeAudioCapture(service) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia || navigator.msGetUserMedia;

    serviceLayer = service;
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
},{}],5:[function(require,module,exports){
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
      new VoiceReader().initializeAudioCapture(speechRecService);
    }
  }
}

module.exports = VoiceCommandDispatcher;

},{"./modules/register":2,"./modules/voice-reader":4}]},{},[1]);
