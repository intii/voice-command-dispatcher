var MessageRegistry = require('./modules/register');
var VoiceReader = require('./modules/voice-reader-speech-api');
var apiaiServiceLayer = require('./modules/service-layer/apiai-service-layer');
var witServiceLayer = require('./modules/service-layer/wit-xhr-text-service-layer');

var servicesMap = {
  apiai: apiaiServiceLayer,
  wit: witServiceLayer
};

var VoiceCommandDispatcher = function(serviceName, config) {

  if (!servicesMap[serviceName]) {
    throw(new Error('No service registered with the ' + serviceName + ' name.'));
  }
  /**
   * The speech recognition service interface
   * @type {Object}
   */
  var speechRecService = new servicesMap[serviceName](config);

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
