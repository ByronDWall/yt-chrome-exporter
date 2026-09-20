describe('ChromeRenderer', () => {

  describe('computeProgressWidth', () => {
    it('returns 0 when progress is 0', () => {
      expect(ChromeRenderer.computeProgressWidth(1920, 0)).toBe(0);
    });

    it('returns full width minus padding when progress is 1', () => {
      const result = ChromeRenderer.computeProgressWidth(1920, 1);
      expect(result).toBe(1920 - 48);
    });

    it('returns half of available width at 0.5 progress', () => {
      const result = ChromeRenderer.computeProgressWidth(1920, 0.5);
      expect(result).toBe((1920 - 48) * 0.5);
    });

    it('clamps progress above 1', () => {
      const full = ChromeRenderer.computeProgressWidth(1920, 1);
      const over = ChromeRenderer.computeProgressWidth(1920, 1.5);
      expect(over).toBe(full);
    });

    it('clamps progress below 0', () => {
      expect(ChromeRenderer.computeProgressWidth(1920, -0.5)).toBe(0);
    });
  });

  describe('computeGradientHeight', () => {
    it('returns approximately 25% of canvas height for top gradient', () => {
      const h = ChromeRenderer.computeGradientHeight(1080);
      expect(h).toBeGreaterThan(0);
      expect(h).toBeLessThan(1080 * 0.35);
    });

    it('scales with canvas height', () => {
      const h1 = ChromeRenderer.computeGradientHeight(1080);
      const h2 = ChromeRenderer.computeGradientHeight(720);
      expect(h1).toBeGreaterThan(h2);
    });
  });

  describe('computeControlBarY', () => {
    it('positions the control bar near the bottom', () => {
      const y = ChromeRenderer.computeControlBarY(1080);
      expect(y).toBeGreaterThan(1080 * 0.85);
      expect(y).toBeLessThan(1080);
    });

    it('scales with canvas height', () => {
      const y1 = ChromeRenderer.computeControlBarY(1080);
      const y2 = ChromeRenderer.computeControlBarY(720);
      expect(y1).toBeGreaterThan(y2);
    });
  });

  describe('drawChrome', () => {
    it('draws without throwing on a small canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');

      const state = {
        playing: true,
        currentTime: 30,
        duration: 60,
        volume: 0.5,
        muted: false,
        title: 'Test Video',
        hovered: true
      };

      let threw = false;
      try {
        ChromeRenderer.drawChrome(ctx, 160, 90, state);
      } catch (e) {
        threw = true;
      }
      expect(threw).toBe(false);
    });

    it('produces non-blank output', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');

      const state = {
        playing: false,
        currentTime: 0,
        duration: 60,
        volume: 1,
        muted: false,
        title: 'Test',
        hovered: true
      };

      ChromeRenderer.drawChrome(ctx, 160, 90, state);

      const imageData = ctx.getImageData(0, 0, 160, 90);
      let nonZero = 0;
      for (let i = 0; i < imageData.data.length; i++) {
        if (imageData.data[i] !== 0) nonZero++;
      }
      expect(nonZero).toBeGreaterThan(0);
    });
  });
});
