var WAVEncoder = require('../encoders/wav-encoder');
var WitServiceLayer = function() {
  var url = 'https://api.wit.ai/speech';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';
  var encoding = 'audio/wav';
  var encoder = new WAVEncoder();

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();

    audioBuffer = encoder.encode(audioBuffer);
    function processResponse(xhr) {
      var outcome = JSON.parse(xhr.target.response).outcomes;
      var intent;

      if (outcome.length > 0) {
        intent = outcome[0].intent;
        callback(intent, outcome);
      }
    }
    request.open("POST", url, true);
    request.setRequestHeader('Content-type', encoding);
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.addEventListener('load', processResponse, false);
    request.addEventListener('error', handleError, false);

    audioBuffer = new Blob([audioBuffer], {type: 'audio/wav'});
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