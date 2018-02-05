export default function() {
  var serviceLayer;
  var responseHandler;

  function processResponse(event) {
    var finalText = '';
    var resultsLength = event.results.length;
    var index;

    for (index = event.resultIndex; index < resultsLength; ++index) {
        finalText += event.results[index][0].transcript;
    }

    console.log(finalText);
    serviceLayer.postMessage(finalText, responseHandler);
  }

  function processError(event) {
    console.log('Error procesing the audio');
  }

  /**
   * Initializes the capture of sound provenient from the microphone, using the
   * text to speech API, if supported.
   * @param  {Object} serviceLayer The speech recognition service interface
   * @param  {Function} callback The handler to call each time the service sends a response
   */
  function initializeAudioCapture(service, callback) {
    var recognition;
    serviceLayer = service;
    responseHandler = callback;

    if (!('webkitSpeechRecognition' in window)) {
      console.warn('This browser does not support speech to text API');
    } else {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';

      recognition.onstart = function() {
        console.log('starting');
      }
      recognition.onresult = processResponse;
      recognition.onerror = processError;

      recognition.start();
    }
  }

  return {
    initializeAudioCapture: initializeAudioCapture
  }
}
