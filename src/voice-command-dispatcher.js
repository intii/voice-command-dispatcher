import MessageRegistry from './modules/register';
import VoiceReader from './modules/voice-reader-speech-api';
import apiaiServiceLayer from './modules/service-layer/apiai-service-layer';
import witServiceLayer from './modules/service-layer/wit-xhr-text-service-layer';

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

export default VoiceCommandDispatcher;
