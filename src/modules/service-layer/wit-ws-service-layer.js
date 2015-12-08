var IntEncoder = require('../encoders/integer-encoder');
var WitServiceLayer = function() {
  var WEBSOCKET_HOST = 'wss://api.wit.ai/speech_ws';
  var token = 'I2VWI6GAJ4T52J5KBZ6LGOTJAWNBNV3F';
  var socket = new WebSocket(WEBSOCKET_HOST);
  var encoder = new IntEncoder();

  socket.onopen = authenticate;
  socket.onclose = closing;
  socket.onerror = processError;
  socket.onmessage = processResponse;

  function authenticate(event) {
    var auth = {
      token: token,
      bps: 16,
      encoding: 'signed-integer'
    };
    socket.send(JSON.stringify(["auth", auth]));
  }

  function closing() {
    console.log('closing');
  }

  function postMessage(audioBuffer, callback) {
    audioBuffer = encoder.encode(audioBuffer);
    socket.send(JSON.stringify(["start", {}]));
    socket.send(audioBuffer);
    socket.send(JSON.stringify(["stop", {}]));
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