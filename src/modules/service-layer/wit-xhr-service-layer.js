var WitServiceLayer = function() {
  var url = 'https://api.wit.ai/message';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';

  function postMesssage(audioBuffer, callback) {
    var request = new XXMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.setRequestHeader('Authorization', 'Bearer' + token);
    request.send();

    request.addEventListener('load', callback, false);
    request.addEventListener('error', errorCallback, false);
  }
}

module.exports = WitServiceLayer;