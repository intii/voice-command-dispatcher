var voiceCommandDispatcher = function() {
  var audioContext;
  var BUFF_SIZE_RENDERER = 512;
  var SILENCE_THRESHOLD = 0.015;
  var cachedBuffer = [];

  function createAudioContext() {
    audioCtx = window.AudioContext || window.webkitAudioContext;
    if (audioCtx) {
      audioContext = new audioCtx();
    } else {
      console.alert('AudioContext not supported');
    }
  }

  function trimSilences(audioBuffer) {
    while (audioBuffer.length > 0 && audioBuffer[0] <= SILENCE_THRESHOLD) {
      audioBuffer.splice(0, 1);
    }
    while (audioBuffer.length > 0 && audioBuffer[audioBuffer.length - 1] <= SILENCE_THRESHOLD) {
      audioBuffer.splice(audioBuffer.length - 1, 1);
    }
  }

  function captureVoiceCommand(commandBuffer) {
    var audioBuffer;
    trimSilences(commandBuffer);
    if (commandBuffer.length >= BUFF_SIZE_RENDERER) {
      audioBuffer = audioContext.createBuffer(1, commandBuffer.length, audioContext.sampleRate);
      audioBuffer.copyToChannel(new Float32Array(commandBuffer), 0);

      if(audioBuffer.duration > 0.5 && !detectSilence(audioBuffer)) {
        var source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        // source.start();
        console.log('pause');
      }
    }
  }

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

  function createSoundGraph(audioStream) {
    var micStream = audioContext.createMediaStreamSource(audioStream);
    var inputAnalyzer = audioContext.createScriptProcessor(BUFF_SIZE_RENDERER, 1, 1);

    inputAnalyzer.onaudioprocess = processInput;
    micStream.connect(inputAnalyzer);
    inputAnalyzer.connect(audioContext.destination);
  }

  function initialize() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia || navigator.msGetUserMedia;

    createAudioContext();

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio:true}, createSoundGraph, function(e) {
        console.alert('Error capturing audio.');
      });
    } else {
      console.alert('getUserMedia not supported in this browser.');
    }
  }

  return {
    start: function() {
      initialize();
    }
  }
}


var voiceChannel = new voiceCommandDispatcher();

window.document.querySelector('.js-trigger-mic').addEventListener('click', function() {
    voiceChannel.start();
});
