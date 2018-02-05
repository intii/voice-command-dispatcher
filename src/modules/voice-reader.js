export default function() {

  /**
   * The AudioContext to be used in every step of the voice command dispatcher flow
   */
  var audioContext;

  /**
   * A constant representing the sample rate
   * @type {Number}
   */
  var BUFF_SIZE_RENDERER = 16384;

  /**
   * A constant representing the minimum sound amplitud that could be considered as audible
   * @type {Number}
   */
  var SILENCE_THRESHOLD = 0.015;

  /**
   * An array containing the recorded input until a phrase is recognised and properly handled
   * @type {Array}
   */
  var cachedBuffer = [];

  /**
   * The speech recognition service interface
   */
  var serviceLayer;

  /**
   * Cached callback to call each time the service returns a message
   */
  var responseHandler;

  /**
   * Initializes the AudioContext if supported
   */
  function createAudioContext() {
    audioCtx = window.AudioContext || window.webkitAudioContext;
    if (audioCtx) {
      audioContext = new audioCtx();
    } else {
      console.alert('AudioContext not supported');
    }
  }

  /**
   * Trims silence subarrays from the begin and the end of the buffer
   * @param  {Array} audioBuffer The audio buffer
   */
  function trimSilences(audioBuffer) {
    while (audioBuffer.length > 0 && audioBuffer[0] <= SILENCE_THRESHOLD) {
      audioBuffer.splice(0, 1);
    }
    while (audioBuffer.length > 0 && audioBuffer[audioBuffer.length - 1] <= SILENCE_THRESHOLD) {
      audioBuffer.splice(audioBuffer.length - 1, 1);
    }
  }

  /**
   * Identifies if the audio buffer contains a possible command by trimming silences, analysing
   * the buffer, and checking duration. If so, it send's the buffer to the sevice layer
   * @param  {Array} commandBuffer The audio buffer
   */
  function captureVoiceCommand(commandBuffer) {
    trimSilences(commandBuffer);
    if (commandBuffer.length >= BUFF_SIZE_RENDERER) {
      if (commandBuffer.length >= 22050 && !detectSilence(commandBuffer)) {
        if (serviceLayer) {
          serviceLayer.postMessage(commandBuffer, responseHandler);
        } else {
          throw new Error('No service layer provided');
        }
      }
    }
  }

  /**
   * Analyses the audio buffer comparing each value to a defined threshold, looking for periods of
   * silence.
   * @param  {Array} audioBuffer The audio buffer
   * @param  {Number} [limit]    An index until, starting from the end, the algorithm should search for
   *                             silences
   * @return {Boolean}           True if the analysed buffer is considered silence
   */
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

  /**
   * Takes the input directly from the microphone stream, caching(recording) until a silence,
   * considered as a phrase separation, is found. Delegates the phrase handling, and continues
   * recording a possible new phrase.
   * @param  {AudioProcessingEvent} event The event fired by AudioScriptProcessor
   */
  function processInput(event) {
    var inputBuffer = event.inputBuffer.getChannelData(0);

    cachedBuffer = Array.prototype.concat(cachedBuffer, Array.prototype.slice.call(inputBuffer));

    //Since the sample rate is 44.1khz, that means 44100 samples are taken in 1 second
    //So, 22050 samples are taken in half a second. We will only process a stream if it last
    //at least half a second, an we will consider a silence, a half a second break in the audio
    if (cachedBuffer.length >= 22050 && detectSilence(cachedBuffer, 22050)) {
      console.log('Silence ---> ');
      captureVoiceCommand(cachedBuffer);
      cachedBuffer = [];
    }
  }

  /**
   * Based on HTML5 Audio API, creates the necessary graph to listen to the microphone input,
   * and handling the received stream
   * @param  {MediaStream} audioStream The audio stream coming from the microphone
   */
  function createSoundGraph(audioStream) {
    var micStream = audioContext.createMediaStreamSource(audioStream);
    var inputAnalyzer = audioContext.createScriptProcessor(BUFF_SIZE_RENDERER, 1, 1);
    window.globalInstance = inputAnalyzer;
    inputAnalyzer.onaudioprocess = processInput;
    micStream.connect(inputAnalyzer);
    inputAnalyzer.connect(audioContext.destination);
  }

  /**
   * Initializes the capture of sound provenient from the microphone, if supported.
   * @param  {Object} serviceLayer The speech recognition service interface
   * @param  {Function} callback The handler to call each time the service sends a response
   */
  function initializeAudioCapture(service, callback) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia || navigator.msGetUserMedia;

    serviceLayer = service;
    responseHandler = callback;
    createAudioContext();

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio:true}, createSoundGraph, function(e) {
        console.warn('Error capturing audio.');
      });
    } else {
      console.warn('getUserMedia not supported in this browser.');
    }
  }

  return {
    initializeAudioCapture: initializeAudioCapture
  }
}