var WitServiceLayer = function() {
  var url = 'https://api.wit.ai/speech';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';
  var encoding = 'audio/raw;encoding=floating-point;bits=32;rate=44100;endian=little';

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();
    function processResponse(xhr) {
      var response = JSON.parse(xhr.target.response);
      var outcome = response.outcomes;
      var intent = outcome[0].intent;
      callback(intent, outcome);
    }
    request.open("POST", url, true);
    request.setRequestHeader('Content-type', encoding);
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.addEventListener('load', processResponse, false);
    request.addEventListener('error', handleError, false);

    request.send(audioBuffer);
  }

  function handleError(error) {
    console.log(error);
  }

  return {
    postMessage: postMessage
  }
}

module.exports = WitServiceLayer;