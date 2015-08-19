var VoiceCommandDispatcher = require('../src/voice-command-dispatcher');
var voiceChannel = new VoiceCommandDispatcher();

window.document.querySelector('.js-trigger-mic').addEventListener('click', function() {
    voiceChannel.start();
});