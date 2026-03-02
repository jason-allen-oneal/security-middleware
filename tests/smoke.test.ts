import { analyzeHeaders } from '../src/checks/headers';

describe('security-middleware smoke', () => {
  test('analyzeHeaders returns issues array', () => {
    const issues = analyzeHeaders({
      'content-security-policy': "default-src 'self'",
      'x-frame-options': 'DENY'
    });
    expect(Array.isArray(issues)).toBe(true);
  });
});
