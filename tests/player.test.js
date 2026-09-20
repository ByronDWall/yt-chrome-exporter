describe('Player', () => {

  describe('formatTime', () => {
    it('formats 0 seconds as 0:00', () => {
      expect(Player.formatTime(0)).toBe('0:00');
    });

    it('formats 5 seconds as 0:05', () => {
      expect(Player.formatTime(5)).toBe('0:05');
    });

    it('formats 65 seconds as 1:05', () => {
      expect(Player.formatTime(65)).toBe('1:05');
    });

    it('formats 600 seconds as 10:00', () => {
      expect(Player.formatTime(600)).toBe('10:00');
    });

    it('formats 3661 seconds as 1:01:01', () => {
      expect(Player.formatTime(3661)).toBe('1:01:01');
    });

    it('formats 7200 seconds as 2:00:00', () => {
      expect(Player.formatTime(7200)).toBe('2:00:00');
    });

    it('handles NaN by returning 0:00', () => {
      expect(Player.formatTime(NaN)).toBe('0:00');
    });

    it('handles negative by returning 0:00', () => {
      expect(Player.formatTime(-10)).toBe('0:00');
    });

    it('floors fractional seconds', () => {
      expect(Player.formatTime(5.9)).toBe('0:05');
    });
  });

  describe('computeSeekPosition', () => {
    it('returns 0 when clickX is 0', () => {
      expect(Player.computeSeekPosition(0, 1000, 120)).toBe(0);
    });

    it('returns duration when clickX equals barWidth', () => {
      expect(Player.computeSeekPosition(1000, 1000, 120)).toBe(120);
    });

    it('returns half duration when clickX is half barWidth', () => {
      expect(Player.computeSeekPosition(500, 1000, 120)).toBe(60);
    });

    it('clamps negative clickX to 0', () => {
      expect(Player.computeSeekPosition(-50, 1000, 120)).toBe(0);
    });

    it('clamps clickX beyond barWidth to duration', () => {
      expect(Player.computeSeekPosition(1200, 1000, 120)).toBe(120);
    });
  });

  describe('computeVolumeFromPosition', () => {
    it('returns 0 when clickX is 0', () => {
      expect(Player.computeVolumeFromPosition(0, 100)).toBe(0);
    });

    it('returns 1 when clickX equals barWidth', () => {
      expect(Player.computeVolumeFromPosition(100, 100)).toBe(1);
    });

    it('returns 0.5 at midpoint', () => {
      expect(Player.computeVolumeFromPosition(50, 100)).toBe(0.5);
    });

    it('clamps below 0', () => {
      expect(Player.computeVolumeFromPosition(-10, 100)).toBe(0);
    });

    it('clamps above 1', () => {
      expect(Player.computeVolumeFromPosition(150, 100)).toBe(1);
    });
  });
});
