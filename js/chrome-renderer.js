const ChromeRenderer = (() => {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function computeProgressWidth(canvasWidth, progress) {
    const availableWidth = canvasWidth - 48;
    return availableWidth * clamp(progress, 0, 1);
  }

  function computeGradientHeight(canvasHeight) {
    return canvasHeight * 0.25;
  }

  function computeControlBarY(canvasHeight) {
    return canvasHeight - canvasHeight * 0.07;
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function drawChrome(ctx, width, height, state) {
    const gradientHeight = computeGradientHeight(height);
    const topGradient = ctx.createLinearGradient(0, 0, 0, gradientHeight);
    topGradient.addColorStop(0, 'rgba(0,0,0,0.7)');
    topGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, gradientHeight);

    const titleFontSize = Math.max(10, height * 0.09);
    ctx.fillStyle = '#ffffff';
    ctx.font = `${titleFontSize}px Roboto, Arial, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(state.title || '', 24, height * 0.04);

    const bottomGradientHeight = height * 0.4;
    const bottomGradientY = height - bottomGradientHeight;
    const bottomGradient = ctx.createLinearGradient(0, bottomGradientY, 0, height);
    bottomGradient.addColorStop(0, 'rgba(0,0,0,0)');
    bottomGradient.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, bottomGradientY, width, bottomGradientHeight);

    const controlBarY = computeControlBarY(height);
    const progressBarY = controlBarY - Math.max(6, height * 0.05);
    const trackWidth = width - 48;
    const trackHeight = Math.max(2, height * 0.01);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(24, progressBarY, trackWidth, trackHeight);

    const progress = state.duration > 0 ? state.currentTime / state.duration : 0;
    const playedWidth = computeProgressWidth(width, progress);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(24, progressBarY, playedWidth, trackHeight);

    const controlFontSize = Math.max(9, height * 0.08);
    const timeText = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${controlFontSize}px Roboto, Arial, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(timeText, 24, controlBarY);

    if (!state.playing) {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.15;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fill();

      const path = typeof Icons !== 'undefined' ? Icons.svgToPath2D(Icons.play) : null;
      if (path) {
        const iconSize = radius * 1.2;
        const scale = iconSize / 24;
        ctx.save();
        ctx.translate(centerX - iconSize / 2, centerY - iconSize / 2);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.fill(path);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.moveTo(centerX - radius * 0.3, centerY - radius * 0.5);
        ctx.lineTo(centerX - radius * 0.3, centerY + radius * 0.5);
        ctx.lineTo(centerX + radius * 0.5, centerY);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
  }

  return { drawChrome, computeProgressWidth, computeGradientHeight, computeControlBarY };
})();
