var WitServiceLayer = function() {
  var WEBSOCKET_HOST = 'wss://api.wit.ai/speech_ws';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';
  var socket = new WebSocket(WEBSOCKET_HOST);

  socket.onopen = authenticate;
  socket.onmessage = processResponse;

  function authenticate(event) {
    var auth = {
      token: token,
      bps: 16,
      encoding: 'signed-integer'
    };

    socket.send(JSON.stringify(["auth", auth]));
  }

  function postMesssage(audioBuffer, callback) {
    socket.send('45');
    // request.addEventListener('load', callback, false);
    // request.addEventListener('error', errorCallback, false);
  }

  function processResponse(response) {
    console.log('response --> ' + response);
  }

  return {
    postMessage: postMesssage
  }
}

module.exports = WitServiceLayer;