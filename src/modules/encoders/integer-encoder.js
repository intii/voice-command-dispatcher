var WAVEncoder = function() {

  function encode(audioBuffer) {
    var bufferLength = audioBuffer.length;
    var intBuffer = new Int16Array(bufferLength);
    var floatSignal, i = 0;
    for (; i < bufferLength; i++) {
      floatSignal = audioBuffer[i];
      intBuffer[i] = floatSignal < 0 ? floatSignal * 0x8000 : floatSignal * 0x7FFF
    }
    return intBuffer;
  }

  return {
    encode: encode
  }
}


module.exports = WAVEncoder;