var WAVEncoder = require('../encoders/wav-encoder');
var crypto = require('crypto-browserify');
var uuid = require('node-uuid');

var WitServiceLayer = function() {
  var url = 'https://api.houndify.com/v1/audio';
  var clientId = 'z7dEmuIyHz5c9LPkPVD7DQ==';
  var clientKey = '3fWXNXd5uXMEzV37yF3rx-NaeomXz-TiJJTY8qE44-8l8MaPMVDLchs14bMPaMpkFDhvKzte5TG-MTtZLnBIdQ==';
  var userId;
  var requestId;
  var timestamp;
  var encoder = new WAVEncoder();


  function generateAuthHeaders (clientId, clientKey, userId, requestId) {
    var requestData;
    var encodedData;

    function unescapeBase64Url(key) {
        return key.replace(/-/g, '+').replace(/_/g, '/');
    }

    function escapeBase64Url(key) {
        return key.replace(/\+/g, '-').replace(/\//g, '_');
    }

    function signKey(clientKey, message) {
        var key = new Buffer(unescapeBase64Url(clientKey), 'base64');
        var hash = crypto.createHmac('sha256', key).update(message).digest('base64');
        return escapeBase64Url(hash);

    }

    // Generate a unique UserId and RequestId.
    userId = userId || uuid.v1();
    // keep track of this requestId, you will need it for the RequestInfo Object
    requestId = requestId || uuid.v1();
    requestData = userId + ';' + requestId;
    // keep track of this timestamp, you will need it for the RequestInfo Object
    timestamp = Math.floor(Date.now() / 1000);
    encodedData = signKey(clientKey, requestData + timestamp);

    return {
      'Hound-Request-Authentication': requestData,
      'Hound-Client-Authentication': clientId + ';' + timestamp + ';' + encodedData
    };
  }

  function postMessage(audioBuffer, callback) {
    var request = new XMLHttpRequest();
    var headers = generateAuthHeaders(clientId, clientKey);
    var houndRequest = {
      Latitude:  43.7,
Longitude: -79.4,
Street: '121 Bloor Street East',
City: 'Toronto',
State: 'ON',
Country: 'Canada',
        ClientID: clientId,
        RequestID: requestId,
          DeviceID: '8333687f040f3d88',
        ClientVersionCode: '1.0',
        SessionID: uuid.v1(),
        TimeZone: 'America/New_York',
        TimeStamp: timestamp,
        Language: 'en_US'
    };

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
    request.setRequestHeader('Content-type', 'application/json');
    request.setRequestHeader('Hound-Request-Authentication', headers['Hound-Request-Authentication']);
    request.setRequestHeader('Hound-Client-Authentication', headers['Hound-Client-Authentication']);
    request.setRequestHeader('Hound-Request-Info', JSON.stringify(houndRequest));
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
