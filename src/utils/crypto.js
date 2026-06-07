export const DEFAULT_PASSWORD_HASH = '7fe996e4f2f7661bb98266a9760d27b3fab54f509401081dceaa4288e5ea3602'; // Hash for 'Nagadurga@2026'

export async function hashPassword(password) {
  const salt = "nagadurga_interiors_2026";
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateSessionToken(username) {
  const timestamp = Date.now();
  // Session expires in 2 hours
  const payload = JSON.stringify({ username, timestamp, expires: timestamp + 2 * 60 * 60 * 1000 });
  const encoder = new TextEncoder();
  const data = encoder.encode(payload + "session_salt_2026_nagadurga");
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return base64 encoded payload and signature
  const b64Payload = btoa(payload);
  return `${b64Payload}.${signature}`;
}

export async function verifySessionToken(token) {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [b64Payload, signature] = parts;
    const payloadStr = atob(b64Payload);
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    if (Date.now() > payload.expires) return false;
    
    // Verify signature
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadStr + "session_salt_2026_nagadurga");
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return signature === expectedSignature;
  } catch (e) {
    return false;
  }
}
