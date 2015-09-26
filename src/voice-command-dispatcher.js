var MessageRegistry = require('./modules/register');
var VoiceReader = require('./modules/voice-reader');
var WAVEncoder = require('./modules/encoders/wav-encoder');
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
      new VoiceReader(new WAVEncoder()).initializeAudioCapture(speechRecService, registry.notify);
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
