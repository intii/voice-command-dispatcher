var MessageRegistry = require('./modules/register');
var VoiceReader = require('./modules/voice-reader');
var VoiceCommandDispatcher = function() {

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
      new VoiceReader().initializeAudioCapture();
    }
  }
}

module.exports = VoiceCommandDispatcher;
