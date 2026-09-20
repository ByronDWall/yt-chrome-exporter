const Player = (() => {
  let container, video, title;
  let idleTimer = null;
  let isDragging = false;

  const els = {};

  function q(id) {
    return document.getElementById(id);
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const ss = String(s).padStart(2, '0');
    if (h > 0) {
      const mm = String(m).padStart(2, '0');
      return `${h}:${mm}:${ss}`;
    }
    return `${m}:${ss}`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function computeSeekPosition(clickX, barWidth, duration) {
    const clamped = clamp(clickX, 0, barWidth);
    return (clamped / barWidth) * duration;
  }

  function computeVolumeFromPosition(clickX, barWidth) {
    const clamped = clamp(clickX, 0, barWidth);
    return clamped / barWidth;
  }

  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function seekToClientX(clientX) {
    const rect = els.progressContainer.getBoundingClientRect();
    const duration = video.duration || 0;
    const pos = computeSeekPosition(clientX - rect.left, rect.width, duration);
    video.currentTime = pos;
    updateProgressUI();
  }

  function onProgressClick(e) {
    seekToClientX(e.clientX);
  }

  function onProgressMouseDown(e) {
    isDragging = true;
    seekToClientX(e.clientX);
  }

  function onProgressHover(e) {
    if (!els.progressTooltip) return;
    const rect = els.progressContainer.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const time = ratio * (video.duration || 0);
    els.progressTooltip.textContent = formatTime(time);
    els.progressTooltip.style.left = `${ratio * 100}%`;
  }

  function onDocumentMouseMove(e) {
    if (isDragging) {
      seekToClientX(e.clientX);
    }
  }

  function onDocumentMouseUp() {
    isDragging = false;
  }

  function setVolumeFromClientX(clientX) {
    const rect = els.volumeSliderTrack.getBoundingClientRect();
    const vol = computeVolumeFromPosition(clientX - rect.left, rect.width);
    video.volume = vol;
    video.muted = vol === 0;
    updateVolumeUI();
  }

  function onVolumeSliderMouseDown(e) {
    isDraggingVolume = true;
    setVolumeFromClientX(e.clientX);
  }

  let isDraggingVolume = false;

  function onDocumentMouseMoveVolume(e) {
    if (isDraggingVolume) {
      setVolumeFromClientX(e.clientX);
    }
  }

  function onDocumentMouseUpVolume() {
    isDraggingVolume = false;
  }

  function toggleMute() {
    video.muted = !video.muted;
    updateVolumeUI();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      els.btnFullscreen.innerHTML = Icons.fullscreen;
    } else {
      container.requestFullscreen();
      els.btnFullscreen.innerHTML = Icons.exitFullscreen;
    }
  }

  function updateVolumeUI() {
    const muted = video.muted || video.volume === 0;
    const icon = muted ? Icons.volumeMuted : (video.volume < 0.5 ? Icons.volumeLow : Icons.volumeHigh);
    els.btnVolume.innerHTML = icon;
    const pct = muted ? 0 : video.volume * 100;
    if (els.volumeSliderFill) els.volumeSliderFill.style.width = `${pct}%`;
    if (els.volumeSliderHandle) els.volumeSliderHandle.style.right = `${100 - pct}%`;
  }

  function updatePlayIcon() {
    els.btnPlay.innerHTML = video.paused ? Icons.play : Icons.pause;
  }

  function updateCenterPlay() {
    if (!els.centerPlay) return;
    if (video.paused) {
      els.centerPlay.classList.remove('hidden');
    } else {
      els.centerPlay.classList.add('hidden');
    }
  }

  function updateProgressUI() {
    const duration = video.duration || 0;
    const current = video.currentTime || 0;
    const pct = duration > 0 ? (current / duration) * 100 : 0;
    if (els.progressPlayed) els.progressPlayed.style.width = `${pct}%`;
    if (els.progressScrubber) els.progressScrubber.style.left = `${pct}%`;
    if (els.timestamp) els.timestamp.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    updateBufferedUI();
  }

  function updateBufferedUI() {
    if (!els.progressBuffered) return;
    const duration = video.duration || 0;
    if (duration <= 0 || video.buffered.length === 0) {
      els.progressBuffered.style.width = '0%';
      return;
    }
    const end = video.buffered.end(video.buffered.length - 1);
    const pct = (end / duration) * 100;
    els.progressBuffered.style.width = `${pct}%`;
  }

  function showSpinner() {
    if (els.spinner) els.spinner.hidden = false;
  }

  function hideSpinner() {
    if (els.spinner) els.spinner.hidden = true;
  }

  function showControls() {
    container.classList.remove('controls-hidden');
    resetIdleTimer();
  }

  function resetIdleTimer() {
    clearIdleTimer();
    idleTimer = setTimeout(() => {
      if (!video.paused) {
        container.classList.add('controls-hidden');
      }
    }, 3000);
  }

  function clearIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  function onMouseMove() {
    showControls();
  }

  function onKeyDown(e) {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'ArrowRight':
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        video.volume = clamp(video.volume + 0.1, 0, 1);
        video.muted = false;
        updateVolumeUI();
        break;
      case 'ArrowDown':
        e.preventDefault();
        video.volume = clamp(video.volume - 0.1, 0, 1);
        updateVolumeUI();
        break;
      case 'm':
      case 'M':
        toggleMute();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
    }
  }

  function onPlay() {
    updatePlayIcon();
    updateCenterPlay();
    resetIdleTimer();
  }

  function onPause() {
    updatePlayIcon();
    updateCenterPlay();
    clearIdleTimer();
    container.classList.remove('controls-hidden');
  }

  function onTimeUpdate() {
    updateProgressUI();
  }

  function onWaiting() {
    showSpinner();
  }

  function onCanPlay() {
    hideSpinner();
  }

  function onLoadedMetadata() {
    updateProgressUI();
    updateVolumeUI();
  }

  function init(options) {
    container = options.container;
    video = options.video;
    title = options.title;

    els.btnPlay = q('btn-play');
    els.btnVolume = q('btn-volume');
    els.btnFullscreen = q('btn-fullscreen');
    els.progressContainer = q('progress-container');
    els.progressPlayed = q('progress-played');
    els.progressScrubber = q('progress-scrubber');
    els.progressBuffered = q('progress-buffered');
    els.timestamp = q('timestamp');
    els.centerPlay = q('center-play');
    els.spinner = q('player-spinner');
    els.volumeSliderContainer = q('volume-slider-container');
    els.volumeSliderTrack = container.querySelector('.volume-slider-track');
    els.volumeSliderFill = q('volume-slider-fill');
    els.volumeSliderHandle = q('volume-slider-handle');

    els.btnPlay.addEventListener('click', togglePlay);
    els.btnVolume.addEventListener('click', toggleMute);
    els.btnFullscreen.addEventListener('click', toggleFullscreen);

    els.progressTooltip = q('progress-tooltip');
    els.progressContainer.addEventListener('click', onProgressClick);
    els.progressContainer.addEventListener('mousedown', onProgressMouseDown);
    els.progressContainer.addEventListener('mousemove', onProgressHover);
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);

    if (els.volumeSliderTrack) {
      els.volumeSliderTrack.addEventListener('mousedown', onVolumeSliderMouseDown);
    }
    document.addEventListener('mousemove', onDocumentMouseMoveVolume);
    document.addEventListener('mouseup', onDocumentMouseUpVolume);

    if (els.centerPlay) {
      els.centerPlay.addEventListener('click', togglePlay);
    }

    container.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);

    q('btn-next').innerHTML = Icons.next;
    q('btn-cc').innerHTML = Icons.cc;
    q('btn-settings').innerHTML = Icons.settings;
    q('btn-miniplayer').innerHTML = Icons.miniplayer;
    q('btn-theater').innerHTML = Icons.theater;
    els.btnFullscreen.innerHTML = Icons.fullscreen;

    updatePlayIcon();
    updateVolumeUI();
    resetIdleTimer();
  }

  function load() {
    if (!video) return;
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    updatePlayIcon();
    updateCenterPlay();
    updateVolumeUI();
  }

  function destroy() {
    if (video) {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    }

    if (els.btnPlay) els.btnPlay.removeEventListener('click', togglePlay);
    if (els.btnVolume) els.btnVolume.removeEventListener('click', toggleMute);
    if (els.btnFullscreen) els.btnFullscreen.removeEventListener('click', toggleFullscreen);
    if (els.progressContainer) {
      els.progressContainer.removeEventListener('click', onProgressClick);
      els.progressContainer.removeEventListener('mousedown', onProgressMouseDown);
      els.progressContainer.removeEventListener('mousemove', onProgressHover);
    }
    if (els.volumeSliderTrack) {
      els.volumeSliderTrack.removeEventListener('mousedown', onVolumeSliderMouseDown);
    }
    if (els.centerPlay) els.centerPlay.removeEventListener('click', togglePlay);
    if (container) container.removeEventListener('mousemove', onMouseMove);

    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
    document.removeEventListener('mousemove', onDocumentMouseMoveVolume);
    document.removeEventListener('mouseup', onDocumentMouseUpVolume);
    document.removeEventListener('keydown', onKeyDown);

    clearIdleTimer();

    isDragging = false;
    isDraggingVolume = false;
    container = null;
    video = null;
    title = null;
  }

  return { init, load, destroy, formatTime, computeSeekPosition, computeVolumeFromPosition };
})();
