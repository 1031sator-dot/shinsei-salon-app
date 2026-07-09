import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// 本番環境では環境変数を使用します。ローカル開発用には仮の32バイトキーを使用します。
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'shinseisalonsecurekartekey123456';

export function encryptData(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // 保存フォーマット: IV:AuthTag:暗号化データ
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptData(encryptedData: string): string {
  if (!encryptedData) return '';
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return '';
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('Decryption error:', e);
    return ''; // 復号化失敗時は空文字を返す
  }
}
