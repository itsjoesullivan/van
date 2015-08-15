function getBuffer(url, context) {
  if (!context) {
    context = new OfflineAudioContext(2, 1, 44100);
  }
  return fetch(url).then(function(response) {
    return response.arrayBuffer();
  }).then(function(arrayBuffer) {
    return new Promise(function(resolve, reject) {
      context.decodeAudioData(arrayBuffer, resolve, reject);
    });
  });
}