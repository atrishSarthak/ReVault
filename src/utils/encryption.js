import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, encodeUTF8 } from 'tweetnacl-util'

export async function encryptCredentialLocally(credentials, rsaPublicKeyPem) {
    // 1. Serialize the password/credentials JSON to UTF-8
    const message = encodeUTF8(JSON.stringify(credentials))

    // 2. Generate extremely strong AES (Salsa20/Poly1305) symmetric key + IV from NaCl
    const aesKey = nacl.randomBytes(32)
    const iv = nacl.randomBytes(24)

    // 3. Encrypt the raw credentials using NaCl secret box
    const ciphertext = nacl.secretbox(message, iv, aesKey)

    // 4. Encrypt the Symmetric AES key with the Backend Server's RSA public key.
    // This guarantees that *only* the ReVault backend can decrypt the symmetric 
    // key (using its RSA private key), ensuring zero man-in-the-middle attacks.
    const crypto = window.crypto.subtle
    const importedKey = await crypto.importKey(
        'spki',
        pemToArrayBuffer(rsaPublicKeyPem),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    )
    const encryptedKey = await crypto.encrypt({ name: 'RSA-OAEP' }, importedKey, aesKey)

    // 5. Build Base64 strings for payload transmission
    return {
        ciphertext: encodeBase64(ciphertext),
        encryptedKey: encodeBase64(new Uint8Array(encryptedKey)),
        iv: encodeBase64(iv)
    }
}

// Convert PEM format strings into raw ArrayBuffers for SubtleCrypto
function pemToArrayBuffer(pem) {
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
    const binary = atob(b64)
    const buffer = new ArrayBuffer(binary.length)
    new Uint8Array(buffer).forEach((_, i, arr) => arr[i] = binary.charCodeAt(i))
    return buffer
}
