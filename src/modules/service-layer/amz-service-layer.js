var WitServiceLayer = function() {
  var url = 'https://api.amazon.com/auth/O2/token';
  var accesUrl = 'https://api.amazon.com/auth/O2/token';
  var APP_KEY = 'amzn1.application-oa2-client.c8eebcc97c704afcb1c58c9a0b3b0358';
  var APP_SECRET = '8ba24c323e9eb1bd993fc0bff4c2a0f73565e3159d1d378037303142e519d186';
  var encoding = 'audio/raw;encoding=floating-point;bits=32;rate=44100;endian=little';

  function getToken() {
    var request = new XMLHttpRequest();

    request.open("POST", accesUrl, true);
    // request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send('grant_type=client_credentials&' +
      'scope=alexa:all&' +
      'client_id=' + APP_KEY + '&' +
      'client_secret=' + APP_SECRET
    );
    request.addEventListener('load', function(response) {
      console.log('auth');
    }, false);
  }

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();
    function processResponse(xhr) {
      var outcome = JSON.parse(xhr.target.response.outcomes);
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

    request.send(audioBuffer);
  }

  function handleError(error) {
    console.log(error);
  }

  getToken();

  return {
    postMessage: postMessage
  }
}

module.exports = WitServiceLayer;