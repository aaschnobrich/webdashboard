const blockedPatterns = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^::1$/,
  /\.local$/i
];

const hasBlockedHost = (host: string): boolean => blockedPatterns.some((p) => p.test(host));

export const normalizeUrl = (input: string): string => {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are allowed.');
  }

  if (hasBlockedHost(parsed.hostname)) {
    throw new Error('URL host is blocked for security reasons.');
  }

  parsed.hash = '';
  return parsed.toString();
};
