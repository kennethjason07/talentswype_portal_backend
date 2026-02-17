import crypto from 'crypto';

function parseSignatureHeader(headerValue) {
  if (!headerValue || Array.isArray(headerValue)) {
    return null;
  }

  const parts = headerValue.split(',');
  const timestamp = parts.find((part) => part.startsWith('t='))?.split('=')[1];
  const signature = parts.find((part) => part.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !signature) {
    return null;
  }

  return { timestamp, signature };
}

export function verifyFlowmingoSignature(rawBody, headerValue, secret, toleranceSeconds = 300) {
  const parsed = parseSignatureHeader(headerValue);
  if (!parsed) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const eventTs = Number(parsed.timestamp);
  if (!Number.isFinite(eventTs) || Math.abs(now - eventTs) > toleranceSeconds) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${parsed.timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex');

  const receivedBuffer = Buffer.from(parsed.signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}
