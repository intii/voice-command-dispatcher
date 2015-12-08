var WAVEncoder = require('../modules/encoders/wav-encoder');
var BingServiceLayer = function() {
  var speechRecognitionUrl = 'https://speech.platform.bing.com/recognize';
  var authUrl = 'https://oxford-speech.cloudapp.net/token/issueToken';
  var encoding = 'audio/wav;samplerate=16000';
  var CLIENT_ID = '2cda9758546f42cc8a587d7b7dba363d';
  var CLIENT_SECRET = '650017920dc548dfb95799c52c721762';
  var token;

  function getToken() {
    var request = new XMLHttpRequest();

    audioBuffer = WAVEncoder.encode(audioBuffer);
    request.open('POST', authUrl, true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send('grant_type=client_credentials&' +
      'scope=https://speech.platform.bing.com&' +
      'client_id=' + CLIENT_ID + '&' +
      'client_secret=' + CLIENT_SECRET
    );
    request.addEventListener('load', function(event) {
      token = JSON.parse(event.target.response).access_token;
      console.log(token);
    }, false);
  }

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();
    audio
    function processResponse(xhr) {
      var outcome = JSON.parse(xhr.target.response.outcomes);

    }
    request.open("POST", speechRecognitionUrl + '?' +
      'scenarios=ulm'+ '&' +
      'appid=D4D52672-91D7-4C74-8AD8-42B1D98141A5'+ '&' + // This magic value is required
      'locale=en-US'+ '&' +
      'device.os=web browsers'+ '&' +
      'version=3.0' + '&' +
      'format=json' + '&' +
      'requestid=1d4b6030-9099-11e0-91e4-0800200c9a66' + '&' + // can be anything
      'instanceid=1d4b6030-9099-11e0-91e4-0800200c9a66' // can be anything
    , true);
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

module.exports = BingServiceLayer;