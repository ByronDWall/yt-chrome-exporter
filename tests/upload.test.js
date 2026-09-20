describe('Upload', () => {

  describe('validateFileType', () => {
    it('accepts video/mp4', () => {
      const file = { type: 'video/mp4' };
      expect(Upload.validateFileType(file)).toBe(true);
    });

    it('accepts video/webm', () => {
      const file = { type: 'video/webm' };
      expect(Upload.validateFileType(file)).toBe(true);
    });

    it('accepts video/quicktime', () => {
      const file = { type: 'video/quicktime' };
      expect(Upload.validateFileType(file)).toBe(true);
    });

    it('rejects image/png', () => {
      const file = { type: 'image/png' };
      expect(Upload.validateFileType(file)).toBe(false);
    });

    it('rejects application/pdf', () => {
      const file = { type: 'application/pdf' };
      expect(Upload.validateFileType(file)).toBe(false);
    });

    it('rejects empty type', () => {
      const file = { type: '' };
      expect(Upload.validateFileType(file)).toBe(false);
    });
  });

  describe('checkFileSize', () => {
    it('returns null for files under 2 GB', () => {
      const file = { size: 500 * 1024 * 1024 };
      expect(Upload.checkFileSize(file)).toBeNull();
    });

    it('returns warning message for files over 2 GB', () => {
      const file = { size: 3 * 1024 * 1024 * 1024 };
      const result = Upload.checkFileSize(file);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
    });

    it('returns warning for exactly 2 GB', () => {
      const file = { size: 2 * 1024 * 1024 * 1024 };
      const result = Upload.checkFileSize(file);
      expect(result).not.toBeNull();
    });
  });

  describe('createObjectUrl', () => {
    it('returns a string URL', () => {
      const fakeFile = new Blob(['test'], { type: 'video/mp4' });
      const url = Upload.createObjectUrl(fakeFile);
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });
  });
});
