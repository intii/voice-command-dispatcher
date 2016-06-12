
var WitServiceLayer = function() {
  var url = 'https://api.wit.ai/message';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';

  function postMessage(message, callback) {
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
    // request.setRequestHeader('Content-type', encoding);
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.addEventListener('load', processResponse, false);
    request.addEventListener('error', handleError, false);

    request.send(message);
  }

  function handleError(error) {
    console.log(error);
  }

  return {
    postMessage: postMessage
  }
}

module.exports = WitServiceLayer;
