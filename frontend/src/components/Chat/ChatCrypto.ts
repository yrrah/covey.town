import { nanoid } from 'nanoid';
import CryptoJS from 'crypto-js';
import { ChatData, SecretKeyIdentifier, SecretKeySet } from '../../CoveyTypes';

export function encrypt(data: ChatData): ChatData {
  if (data.chatType === 'public' || data.receivingPlayerID === undefined) {
    return data;
  }
  const encryptedData = data;
  const secretKey = nanoid(12);
  
  const secretKeySet: SecretKeySet[] = [];
  encryptedData.message = CryptoJS.AES.encrypt(data.message, secretKey).toString();
  data.receivingPlayerID.forEach(player => {
    secretKeySet.push({ secretKey: CryptoJS.AES.encrypt(SecretKeyIdentifier.concat(secretKey), player.playerID).toString() });
  });
  encryptedData.encryptedSecretKeys = secretKeySet;
  return encryptedData;
}

export function decrypt(data: ChatData, playerID: string): ChatData {
  if (data.chatType === 'public' || data.receivingPlayerID === undefined) {
    return data;
  }
  const decryptedData = data;
  const secretKey = data.encryptedSecretKeys?.find(secretKeySet => CryptoJS.AES.decrypt(secretKeySet.secretKey, playerID).toString(CryptoJS.enc.Utf8).includes(SecretKeyIdentifier));
  if (secretKey) {
    const decryptedSecretKey = CryptoJS.AES.decrypt(secretKey.secretKey, playerID).toString(CryptoJS.enc.Utf8).split('=')[1];
    decryptedData.message = CryptoJS.AES.decrypt(data.message, decryptedSecretKey).toString(CryptoJS.enc.Utf8);
    return decryptedData;
  }
  throw new Error(`Error decrypting message`);
}