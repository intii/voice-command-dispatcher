var WitServiceLayer = function() {
  var url = 'https://7p6oly17u1.execute-api.us-east-1.amazonaws.com/devinti/apiai';

  function postMessage(message, callback) {
    var request = new XMLHttpRequest();
    function processResponse(xhr) {
      var outcome = JSON.parse(xhr.target.response).message;
      var intent;

      if (outcome.status.code === 200) {
        intent = outcome.result.metadata.intentName;
        console.log('intent:', intent);
        callback(intent, outcome.result);
      }
    }

    request.open("GET", url + '?query=' + message, true);
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
