import { nanoid } from "nanoid";
import { ChatData, ChatType, ReceivingPlayerID } from "../../CoveyTypes";
import { decrypt, encrypt } from "./ChatCrypto";

function generateTestMessage(chatType: ChatType, receivingPlayerID?: ReceivingPlayerID[]): ChatData {
  return {
    message: nanoid(200),
    timestamp: new Date(),
    sendingPlayer: { id: nanoid(), userName: 'username' }, 
    receivingPlayerID,
    chatType,
  };
}

function generateProximityOrPrivateMessage(chatType: ChatType, playerID: string) {
  const receivingPlayerID: ReceivingPlayerID[] = [];
  receivingPlayerID.push({ playerID });
  if (chatType === 'proximity') {
    receivingPlayerID.push({ playerID: nanoid() }); 
  }
  return generateTestMessage(chatType, receivingPlayerID);
}

describe('ChatCrypto', () => {
  describe('Encryption', () => {
    it('Should not encrypt public message', async () => {
      const testMessage = generateTestMessage('public');
      const encryptedData = encrypt(testMessage);
      expect(encryptedData.message === testMessage.message);
    });

    it('Should encrypt private message', async () => {
      const testMessage = generateProximityOrPrivateMessage('private', nanoid());
      const encryptedData = encrypt(testMessage);
      expect(encryptedData.message !== testMessage.message);
    });
    it('Should encrypt proximity messages', async () => {
      const testMessage = generateProximityOrPrivateMessage('proximity', nanoid());
      const encryptedData = encrypt(testMessage);
      expect(encryptedData.message !== testMessage.message);
    });
    it('Should encrypt message with same private key', async () => {
      const testMessage = generateProximityOrPrivateMessage('proximity', nanoid());
      const encryptedFirstData = encrypt(testMessage);
      const encryptedSecondData = encrypt(testMessage);
      expect(encryptedFirstData.message === encryptedSecondData.message);
    });
  });
  describe('Decryption', () => {
    it('Should not decrypt public message', async () => {
      const playerID = nanoid();
      const testMessage = generateTestMessage('public');
      const encryptedData = encrypt(testMessage);
      expect(encryptedData.message === testMessage.message);
      const decryptedData = decrypt(encryptedData, playerID);
      expect(decryptedData.message === testMessage.message);
    });

    it('Should decrypt encrypted private message', async () => {
      const playerID = nanoid();
      const testMessage = generateProximityOrPrivateMessage('private', playerID);
      const encryptedData = encrypt(testMessage);
      const decryptedData = decrypt(encryptedData, playerID);
      expect(decryptedData.message === testMessage.message);
    });
    it('Should decrypt encrypted proximity messages', async () => {
      const playerID = nanoid();
      const testMessage = generateProximityOrPrivateMessage('proximity', playerID);
      const encryptedData = encrypt(testMessage);
      const decryptedData = decrypt(encryptedData, playerID);
      expect(decryptedData.message === testMessage.message);
    });
  });
});