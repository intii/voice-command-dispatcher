var WitServiceLayer = function() {
  var url = 'https://api.wit.ai/speech';
  var token;

  function postMesssage(audioBuffer, callback) {
    var request = new XXMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.setRequestHeader('Authorization', 'Token token="'+token+'"');
    request.send();

    request.addEventListener('load', callback, false);
    request.addEventListener('error', errorCallback, false);
  }
}

module.exports = WitServiceLayer;