var WitServiceLayer = function() {
  var url = 'https://api.att.com/speech/v3/speechToText';
  var accesUrl = 'https://api.att.com/oauth/v4/token';
  var APP_KEY = 'n8iozf1qwqpgb23no0miroyfqjrf0mrh';
  var APP_SECRET = 'wqkcutgqkbog0whi2chpcdb1gd4jixf6';
  var encoding = 'audio/raw;encoding=floating-point;bits=32;rate=44100;endian=little';

  function getToken() {
    var request = new XMLHttpRequest();
    var API_SCOPES = 'SPEECH';

    request.open("POST", accesUrl, true);
    request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send('client_id:' + APP_KEY + '&' +
      'client_secret:' + APP_SECRET + '&' +
      'grant_type:client_credentials&' +
      'scope:' + API_SCOPES);
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