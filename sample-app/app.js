var VoiceCommandDispatcher = require('../src/voice-command-dispatcher');
var witService = require('../src/modules/service-layer/wit-ws-service-layer');
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