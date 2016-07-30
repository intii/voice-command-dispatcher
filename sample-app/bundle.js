(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var VoiceCommandDispatcher = require('../src/voice-command-dispatcher');
var witService = require('../src/modules/service-layer/apiai-service-layer');
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

},{"../src/modules/service-layer/apiai-service-layer":3,"../src/voice-command-dispatcher":5}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
var WitServiceLayer = function() {
  var url = 'https://7p6oly17u1.execute-api.us-east-1.amazonaws.com/devinti/apiai';

  function postMessage(message, callback) {
    var request = new XMLHttpRequest();
    function processResponse(xhr) {
      var outcome = JSON.parse(xhr.target.response).message;
      var intent;

      if (outcome.status.code === 200) {
        intent = outcome.result.metadata.intentName;
        console.log('intent:', intent);
        callback(intent, outcome);
      }
    }

    request.open("GET", url + '?query=' + message, true);
    request.addEventListener('load', processResponse, false);
    request.addEventListener('error', handleError, false);

    request.send(message);
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
  var serviceLayer;
  var responseHandler;

  function processResponse(event) {
    var finalText = '';
    var resultsLength = event.results.length;
    var index;

    for (index = event.resultIndex; index < resultsLength; ++index) {
        finalText += event.results[index][0].transcript;
    }

    console.log(finalText);
    serviceLayer.postMessage(finalText, responseHandler);
  }

  function processError(event) {
    console.log('Error procesing the audio');
  }

  /**
   * Initializes the capture of sound provenient from the microphone, using the
   * text to speech API, if supported.
   * @param  {Object} serviceLayer The speech recognition service interface
   * @param  {Function} callback The handler to call each time the service sends a response
   */
  function initializeAudioCapture(service, callback) {
    var recognition;
    serviceLayer = service;
    responseHandler = callback;

    if (!('webkitSpeechRecognition' in window)) {
      console.warn('This browser does not support speech to text API');
    } else {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';

      recognition.onstart = function() {
        console.log('starting');
      }
      recognition.onresult = processResponse;
      recognition.onerror = processError;

      recognition.start();
    }
  }

  return {
    initializeAudioCapture: initializeAudioCapture
  }
}

module.exports = VoiceReader;

},{}],5:[function(require,module,exports){
var MessageRegistry = require('./modules/register');
var VoiceReader = require('./modules/voice-reader-speech-api');
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

},{"./modules/register":2,"./modules/voice-reader-speech-api":4}]},{},[1]);
