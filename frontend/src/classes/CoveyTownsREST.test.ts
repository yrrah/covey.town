import { nanoid } from 'nanoid';

import TownsServiceClient from './TownsServiceClient';

type TestTownData = {
  friendlyName: string, coveyTownID: string,
  isPubliclyListed: boolean, townUpdatePassword: string
};

describe('TownsServiceAPIREST', () => {
  let apiClient: TownsServiceClient;

  async function createTownForTesting(friendlyNameToUse?: string, isPublic = false): Promise<TestTownData> {
    const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
      `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await apiClient.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      coveyTownID: ret.coveyTownID,
      townUpdatePassword: ret.coveyTownPassword,
    };
  }

  beforeAll(async () => {
    apiClient = new TownsServiceClient(`http://127.0.0.1:8081`);
  });
  describe('File Related Testing', () => {
    it('Check for file upload', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const res = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: pubTown1.coveyTownID,
      });
      const testFileName = 'testFile_'.concat(nanoid()).concat('.txt');
      const file = new File(['file contents'], testFileName);
      const fileUploadRequest = await apiClient.uploadFile({
        file,
        name: testFileName,
        token: res.coveySessionToken,
        coveyTownID: pubTown1.coveyTownID,
        bucketName: 'testBucket',
      });
      expect(fileUploadRequest.fileName === testFileName);
    });
  });
});
