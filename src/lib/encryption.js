// Simple client-side encryption utilities
// Note: This is basic encryption for demonstration. For production, consider more robust solutions.

const ENCRYPTION_KEY_STORAGE = 'notes_encryption_key'

// Generate or retrieve encryption key
export const getOrCreateEncryptionKey = async () => {
  if (typeof window === 'undefined') return null
  
  let key = localStorage.getItem(ENCRYPTION_KEY_STORAGE)
  
  if (!key) {
    // Generate new key
    const keyArray = new Uint8Array(32)
    crypto.getRandomValues(keyArray)
    key = Array.from(keyArray).map(b => b.toString(16).padStart(2, '0')).join('')
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, key)
  }
  
  return key
}

// Simple XOR encryption (for demonstration - use proper encryption in production)
export const encryptText = async (text, key) => {
  if (!text || !key) return text
  
  const keyBytes = key.match(/.{2}/g).map(hex => parseInt(hex, 16))
  const textBytes = new TextEncoder().encode(text)
  const encrypted = new Uint8Array(textBytes.length)
  
  for (let i = 0; i < textBytes.length; i++) {
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length]
  }
  
  return btoa(String.fromCharCode(...encrypted))
}

// Simple XOR decryption
export const decryptText = async (encryptedText, key) => {
  if (!encryptedText || !key) return encryptedText
  
  try {
    const keyBytes = key.match(/.{2}/g).map(hex => parseInt(hex, 16))
    const encryptedBytes = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)))
    const decrypted = new Uint8Array(encryptedBytes.length)
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length]
    }
    
    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.error('Decryption failed:', error)
    return encryptedText
  }
}

// Clear encryption key (for logout)
export const clearEncryptionKey = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ENCRYPTION_KEY_STORAGE)
  }
}