import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, decodeUTF8 } from 'tweetnacl-util'

export async function encryptCredentials(credentials, rsaPublicKeyPem) {
    const message = decodeUTF8(JSON.stringify(credentials))
    const aesKey = nacl.randomBytes(32)
    const iv = nacl.randomBytes(24)
    const ciphertext = nacl.secretbox(message, iv, aesKey)

    // Encrypt the AES key with server's RSA public key
    const crypto = window.crypto.subtle
    const importedKey = await crypto.importKey(
        'spki',
        pemToArrayBuffer(rsaPublicKeyPem),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    )
    const encryptedKey = await crypto.encrypt({ name: 'RSA-OAEP' }, importedKey, aesKey)

    return {
        ciphertext: encodeBase64(ciphertext),
        encryptedKey: encodeBase64(new Uint8Array(encryptedKey)),
        iv: encodeBase64(iv)
    }
}

function pemToArrayBuffer(pem: string) {
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
    const binary = atob(b64)
    const buffer = new ArrayBuffer(binary.length)
    new Uint8Array(buffer).forEach((_, i, arr) => arr[i] = binary.charCodeAt(i))
    return buffer
}

export function decryptCredentials(ciphertext: string, iv: string, aesKeyB64: string): object {
    const box = decodeBase64(ciphertext)
    const nonce = decodeBase64(iv)
    const key = decodeBase64(aesKeyB64)

    const decrypted = nacl.secretbox.open(box, nonce, key)
    if (!decrypted) throw new Error('Decryption failed')

    return JSON.parse(new TextDecoder().decode(decrypted))
}
