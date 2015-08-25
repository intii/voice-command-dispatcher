var VoiceCommandDispatcher = require('../src/voice-command-dispatcher');
var witService = require('../src/modules/service-layer/wit-xhr-service-layer');
var voiceChannel = new VoiceCommandDispatcher(witService);

window.document.querySelector('.js-trigger-mic').addEventListener('click', function() {
    voiceChannel.start();
});