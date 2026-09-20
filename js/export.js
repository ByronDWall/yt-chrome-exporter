const ExportPipeline = (() => {
  let mediaRecorder = null;
  let canvas = null;
  let ctx = null;
  let audioContext = null;
  let chunks = [];
  let frameHandle = null;
  let cancelled = false;
  let currentVideo = null;
  let endedHandler = null;
  let selectedMimeType = null;

  function negotiateMimeType() {
    if (typeof MediaRecorder === 'undefined') return null;
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return null;
  }

  function computeProgress(currentTime, duration) {
    if (!duration) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }

  function assembleBlob(chunks, mimeType) {
    return new Blob(chunks, { type: mimeType });
  }

  function scheduleNextFrame(renderFrame) {
    if (typeof currentVideo.requestVideoFrameCallback === 'function') {
      frameHandle = currentVideo.requestVideoFrameCallback(renderFrame);
    } else {
      frameHandle = requestAnimationFrame(renderFrame);
    }
  }

  function cancelScheduledFrame() {
    if (frameHandle === null) return;
    if (currentVideo && typeof currentVideo.cancelVideoFrameCallback === 'function') {
      currentVideo.cancelVideoFrameCallback(frameHandle);
    } else {
      cancelAnimationFrame(frameHandle);
    }
    frameHandle = null;
  }

  function stopRecording() {
    cancelScheduledFrame();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }

  function start(options) {
    const { video, title, onProgress, onComplete, onError } = options;

    try {
      cancelled = false;
      currentVideo = video;

      canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx = canvas.getContext('2d');

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      const canvasStream = canvas.captureStream(30);
      const videoTrack = canvasStream.getVideoTracks()[0];
      const audioTrack = destination.stream.getAudioTracks()[0];

      const combinedStream = new MediaStream();
      if (videoTrack) combinedStream.addTrack(videoTrack);
      if (audioTrack) combinedStream.addTrack(audioTrack);

      selectedMimeType = negotiateMimeType();
      const recorderOptions = { videoBitsPerSecond: 8000000 };
      if (selectedMimeType) recorderOptions.mimeType = selectedMimeType;

      mediaRecorder = new MediaRecorder(combinedStream, recorderOptions);
      chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = assembleBlob(chunks, selectedMimeType || 'video/webm');
        const filename = `${title || 'export'}.webm`;
        if (onComplete) onComplete(blob, filename);
      };

      endedHandler = () => {
        stopRecording();
      };
      video.addEventListener('ended', endedHandler);

      function renderFrame() {
        if (cancelled) return;
        if (video.paused || video.ended) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ChromeRenderer.drawChrome(ctx, canvas.width, canvas.height, {
          playing: !video.paused,
          currentTime: video.currentTime,
          duration: video.duration,
          volume: video.volume,
          muted: video.muted,
          title: title,
          hovered: false
        });

        if (onProgress) onProgress(computeProgress(video.currentTime, video.duration));

        scheduleNextFrame(renderFrame);
      }

      video.currentTime = 0;
      mediaRecorder.start();

      video.play().then(() => {
        scheduleNextFrame(renderFrame);
      }).catch(err => {
        if (onError) onError(err);
      });
    } catch (err) {
      if (onError) onError(err);
    }
  }

  function cancel() {
    cancelled = true;
    cancelScheduledFrame();

    if (currentVideo) {
      currentVideo.pause();
      if (endedHandler) currentVideo.removeEventListener('ended', endedHandler);
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    chunks = [];
  }

  return { start, cancel, negotiateMimeType, computeProgress, assembleBlob };
})();
