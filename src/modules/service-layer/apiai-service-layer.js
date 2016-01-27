var WitServiceLayer = function() {
  var url = 'https://api.api.ai/v1/query?v=20150910';
  var token = '4430fa3e3b2d4547a22ef99e3fe01eb6';
  var subscriptionKey = 'f4893584-dd2a-4b70-865c-6e6f4f967eb4';
  // var encoding = 'audio/raw;encoding=floating-point;bits=32;rate=44100;endian=little';
  var encoding = 'multipart';

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();
    function processResponse(xhr) {
      var outcome = JSON.parse(xhr.target.response).outcomes;
      var intent;

      if (outcome.length > 0) {
        intent = outcome[0].intent;
        callback(intent, outcome);
      }
    }
    request.open("POST", url, true);
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.setRequestHeader('ocp-apim-subscription-key', subscriptionKey);
    request.addEventListener('load', processResponse, false);
    request.addEventListener('error', handleError, false);

    audioBuffer = new Blob([audioBuffer], {type: 'audio/wav'});
    var fd = new FormData();

    debugger;
    fd.append("voiceData", audioBuffer);
    fd.append("request", '{ timezone : "America/New_York", lang : "en", sessionId : "1234567890" };type=application/json');
    request.send(fd);
  }

  function handleError(error) {
    console.log(error);
  }

  return {
    postMessage: postMessage
  }
}

module.exports = WitServiceLayer;

