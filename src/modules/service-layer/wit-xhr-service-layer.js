var WitServiceLayer = function() {
  var url = 'https://api.wit.ai/speech';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';
  var encoding = 'audio/raw;encoding=floating-point;bits=32;rate=44100;endian=little';

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader('Content-type', encoding);
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.addEventListener('load', handleResponse, false);
    request.addEventListener('error', handleError, false);

    request.send(audioBuffer);
  }

  function handleResponse(response) {
    console.log(response);
  }

  function handleError(error) {
    console.log(error);
  }

  return {
    postMessage: postMessage
  }
}

module.exports = WitServiceLayer;