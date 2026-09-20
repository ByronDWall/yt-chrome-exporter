self.onmessage = function(e) {
  self.postMessage({ type: 'error', message: 'OffscreenCanvas worker not yet implemented' });
};
