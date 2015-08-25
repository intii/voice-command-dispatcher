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
