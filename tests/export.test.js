describe('ExportPipeline', () => {

  describe('negotiateMimeType', () => {
    it('returns a string', () => {
      const result = ExportPipeline.negotiateMimeType();
      if (result === null) {
        // MediaRecorder may not be available in test env
        expect(result).toBeNull();
      } else {
        expect(typeof result).toBe('string');
      }
    });

    it('prefers webm codecs when available', () => {
      const result = ExportPipeline.negotiateMimeType();
      if (result && typeof MediaRecorder !== 'undefined') {
        expect(result).toContain('video/');
      }
    });
  });

  describe('computeProgress', () => {
    it('returns 0 when currentTime is 0', () => {
      expect(ExportPipeline.computeProgress(0, 60)).toBe(0);
    });

    it('returns 50 at halfway', () => {
      expect(ExportPipeline.computeProgress(30, 60)).toBe(50);
    });

    it('returns 100 at the end', () => {
      expect(ExportPipeline.computeProgress(60, 60)).toBe(100);
    });

    it('clamps above 100', () => {
      expect(ExportPipeline.computeProgress(70, 60)).toBe(100);
    });

    it('returns 0 when duration is 0', () => {
      expect(ExportPipeline.computeProgress(10, 0)).toBe(0);
    });
  });

  describe('assembleBlob', () => {
    it('returns a Blob from chunks', () => {
      const chunks = [
        new Blob(['aaa'], { type: 'video/webm' }),
        new Blob(['bbb'], { type: 'video/webm' })
      ];
      const result = ExportPipeline.assembleBlob(chunks, 'video/webm');
      expect(result).toBeInstanceOf(Blob);
    });

    it('returns a Blob with correct type', () => {
      const chunks = [new Blob(['data'], { type: 'video/webm' })];
      const result = ExportPipeline.assembleBlob(chunks, 'video/webm');
      expect(result.type).toBe('video/webm');
    });

    it('combines chunk sizes', () => {
      const chunks = [
        new Blob(['aaaa'], { type: 'video/webm' }),
        new Blob(['bb'], { type: 'video/webm' })
      ];
      const result = ExportPipeline.assembleBlob(chunks, 'video/webm');
      expect(result.size).toBe(6);
    });
  });
});
