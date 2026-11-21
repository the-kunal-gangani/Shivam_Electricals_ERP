export function normalizePhone(raw) {
  const digits = String(raw).replace(/\D/g, '');
  let local = null;
  if (digits.length === 10) local = digits;
  else if (digits.length === 12 && digits.startsWith('91')) local = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) local = digits.slice(1);
  return local && /^[6-9]\d{9}$/.test(local) ? local : null;
}

export function parseIdentifier(raw) {
  const text = String(raw).trim();
  if (text.includes('@')) return { kind: 'email', value: text.toLowerCase() };
  const phone = normalizePhone(text);
  return phone ? { kind: 'phone', value: phone } : null;
}
