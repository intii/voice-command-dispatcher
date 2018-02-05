export default function(conf) {
  var url = 'https://api.api.ai/v1/';

  if (!conf.accessToken) {
    throw(new Error('You must provide an acccess token'));
  }
  function postMessage(message, callback) {
    var request = new XMLHttpRequest();
    var payload = {
      query: message,
      lang: conf.lang || 'en',
      sessionId: 'sessionId'
    };
    function processResponse(xhr) {
      var response = JSON.parse(xhr.target.response);
      var intent;

      if (response.status.code === 200) {
        intent = response.result.metadata.intentName;
        callback(intent, response.result);
      }
    }
    request.open("POST", url + 'query?v=20150910');
    request.setRequestHeader("Authorization", "Bearer " + conf.accessToken);
    request.setRequestHeader('Content-type', 'application/json');
    request.addEventListener('load', processResponse, false);
    request.addEventListener('error', handleError, false);

    request.send(JSON.stringify(payload));
  }

  function handleError(error) {
    console.log(error);
  }

  return {
    postMessage: postMessage
  }
}
