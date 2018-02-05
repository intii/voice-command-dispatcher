
export default function() {
  var url = 'https://7p6oly17u1.execute-api.us-east-1.amazonaws.com/devinti/witGet';

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
