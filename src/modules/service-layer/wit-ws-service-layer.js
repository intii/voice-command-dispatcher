var WitServiceLayer = function() {
  var WEBSOCKET_HOST = 'wss://api.wit.ai/speech_ws';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';
  var socket = new WebSocket(WEBSOCKET_HOST);

  socket.onopen = authenticate;
  socket.onerror = processError;
  socket.onmessage = processResponse;

  function authenticate(event) {
    var auth = {
      token: token,
      bps: 32,
      encoding: 'floating-point'
    };

    socket.send(JSON.stringify(["auth", auth]));
  }

  function postMessage(audioBuffer, callback) {
    socket.send(audioBuffer);
  }

  function processResponse(response) {
    console.log('response --> ' + response);
  }

  function processError(response) {
    console.log('response --> ' + response);
  }

  return {
    postMessage: postMessage
  }
}

module.exports = WitServiceLayer;