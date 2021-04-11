import Express from 'express';
import CORS from 'cors';
import http from 'http';
import { nanoid } from 'nanoid';
import assert from 'assert';
import { AddressInfo } from 'net';
import request from 'supertest';

import TownsServiceClient, { TownListResponse } from './TownsServiceClient';
import addTownRoutes from '../router/towns';
import {closeDb, connectDb, dropBucket, TEST_BUCKET_NAME} from "../db";
import addFileRoutes from "../router/files";
import {logError} from "../Utils";
import io from 'socket.io';
import {StatusCodes} from "http-status-codes";
import * as fs from "fs";

type TestTownData = {
  friendlyName: string, coveyTownID: string,
  isPubliclyListed: boolean, townUpdatePassword: string
};

function expectTownListMatches(towns: TownListResponse, town: TestTownData) {
  const matching = towns.towns.find(townInfo => townInfo.coveyTownID === town.coveyTownID);
  if (town.isPubliclyListed) {
    expect(matching)
      .toBeDefined();
    assert(matching);
    expect(matching.friendlyName)
      .toBe(town.friendlyName);
  } else {
    expect(matching)
      .toBeUndefined();
  }
}

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: TownsServiceClient;
  let app: any;
  let address: AddressInfo;
  let socket: io.Server;

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
    app = Express();
    app.use(CORS());
    server = http.createServer(app);
    socket = addTownRoutes(server, app);
    addFileRoutes(TEST_BUCKET_NAME, app);

    await server.listen();
    address = server.address() as AddressInfo;
    if(address){
      apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);
    }
    return new Promise<void>(resolve => {
      connectDb(() => {resolve();});
    });
  });
  afterAll(async () => {
    socket.close();
    await server.close();
    await new Promise<void>(resolve => {
      dropBucket(TEST_BUCKET_NAME, (gridErr) => {
        if (gridErr) {
          logError(gridErr);
        }
        closeDb((dbErr) => {
          if (dbErr) {
            logError(dbErr);
          }
          resolve();
        });
      });
    });
  });
  describe('CoveyTownCreateAPI', () => {
    it('Allows for multiple towns with the same friendlyName', async () => {
      const firstTown = await createTownForTesting();
      const secondTown = await createTownForTesting(firstTown.friendlyName);
      expect(firstTown.coveyTownID)
        .not
        .toBe(secondTown.coveyTownID);
    });
    it('Prohibits a blank friendlyName', async () => {
      try {
        await createTownForTesting('');
        fail('createTown should throw an error if friendly name is empty string');
      } catch (err) {
        // OK
      }
    });
  });

  describe('CoveyTownListAPI', () => {
    it('Lists public towns, but not private towns', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const pubTown2 = await createTownForTesting(undefined, true);
      const privTown2 = await createTownForTesting(undefined, false);

      const towns = await apiClient.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);

    });
    it('Allows for multiple towns with the same friendlyName', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
      const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
      const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);

      const towns = await apiClient.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);
    });
  });

  describe('CoveyTownDeleteAPI', () => {
    it('Throws an error if the password is invalid', async () => {
      const { coveyTownID } = await createTownForTesting(undefined, true);
      try {
        await apiClient.deleteTown({
          coveyTownID,
          coveyTownPassword: nanoid(),
        });
        fail('Expected deleteTown to throw an error');
      } catch (e) {
        // Expected error
      }
    });
    it('Throws an error if the townID is invalid', async () => {
      const { townUpdatePassword } = await createTownForTesting(undefined, true);
      try {
        await apiClient.deleteTown({
          coveyTownID: nanoid(),
          coveyTownPassword: townUpdatePassword,
        });
        fail('Expected deleteTown to throw an error');
      } catch (e) {
        // Expected error
      }
    });
    it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
      const { coveyTownID, townUpdatePassword } = await createTownForTesting(undefined, true);
      await apiClient.deleteTown({
        coveyTownID,
        coveyTownPassword: townUpdatePassword,
      });
      try {
        await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID,
        });
        fail('Expected joinTown to throw an error');
      } catch (e) {
        // Expected
      }
      const listedTowns = await apiClient.listTowns();
      if (listedTowns.towns.find(r => r.coveyTownID === coveyTownID)) {
        fail('Expected the deleted town to no longer be listed');
      }
    });
  });
  describe('CoveyTownUpdateAPI', () => {
    it('Checks the password before updating any values', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      try {
        await apiClient.updateTown({
          coveyTownID: pubTown1.coveyTownID,
          coveyTownPassword: `${pubTown1.townUpdatePassword}*`,
          friendlyName: 'broken',
          isPubliclyListed: false,
        });
        fail('updateTown with an invalid password should throw an error');
      } catch (err) {
        // err expected
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }

      // Make sure name or vis didn't change
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
    it('Updates the friendlyName and visbility as requested', async () => {
      const pubTown1 = await createTownForTesting(undefined, false);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.updateTown({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        friendlyName: 'newName',
        isPubliclyListed: true,
      });
      pubTown1.friendlyName = 'newName';
      pubTown1.isPubliclyListed = true;
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
    it('Does not update the visibility if visibility is undefined', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.updateTown({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        friendlyName: 'newName2',
      });
      pubTown1.friendlyName = 'newName2';
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
  });

  describe('CoveyMemberAPI', () => {
    it('Throws an error if the town does not exist', async () => {
      await createTownForTesting(undefined, true);
      try {
        await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID: nanoid(),
        });
        fail('Expected an error to be thrown by joinTown but none thrown');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('Admits a user to a valid public or private town', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const res = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: pubTown1.coveyTownID,
      });
      expect(res.coveySessionToken)
        .toBeDefined();
      expect(res.coveyUserID)
        .toBeDefined();

      const res2 = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: privTown1.coveyTownID,
      });
      expect(res2.coveySessionToken)
        .toBeDefined();
      expect(res2.coveyUserID)
        .toBeDefined();

    });
  });
  describe('File Related Testing', () => {
    let townID:string;
    let token:string;
    beforeAll(async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const res = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: pubTown1.coveyTownID,
      });
      townID = pubTown1.coveyTownID;
      token = res.coveySessionToken;
    });
    it('Check normal upload and download', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID)
        .field('token', token)
        .attach('chatFile', 'src/client/testFiles/small_test.txt')
        .expect(StatusCodes.OK)
        .then(response => {
          assert(response.body.response.name === 'small_test.txt')
          const newName = response.body.response.fileName
          request(app)
            .get(`/files/${newName}`)
            .expect(StatusCodes.OK)
            .then(response => {
              const file_text = fs.readFileSync('src/client/testFiles/small_test.txt');
              assert(response.text === file_text.toString());
              done();
            })
        })
    });
    it('Check block executable file', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID)
        .field('token', token)
        .attach('chatFile', 'src/client/testFiles/no-op.js')
        .expect(StatusCodes.UNSUPPORTED_MEDIA_TYPE, done)
    });
    it('Check block oversize file', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID)
        .field('token', token)
        .attach('chatFile', 'src/client/testFiles/too_big_file.txt')
        .expect(StatusCodes.REQUEST_TOO_LONG, done)
    });
    it('Check reject invalid token', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID)
        .field('token', token + 'invalid')
        .attach('chatFile', 'src/client/testFiles/small_test.txt')
        .expect(StatusCodes.UNAUTHORIZED, done)
    });
    it('Check reject invalid town', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID + 'invalid')
        .field('token', token)
        .attach('chatFile', 'src/client/testFiles/small_test.txt')
        .expect(StatusCodes.UNAUTHORIZED, done)
    });
    it('Check reject missing token', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID + 'invalid')
        .attach('chatFile', 'src/client/testFiles/small_test.txt')
        .expect(StatusCodes.UNAUTHORIZED, done)
    });
    it('Check reject missing town', async (done) => {
      request(app)
        .post(`/files`)
        .field('token', token)
        .attach('chatFile', 'src/client/testFiles/small_test.txt')
        .expect(StatusCodes.UNAUTHORIZED, done)
    });
    it('Check reject missing file', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID)
        .field('token', token)
        .expect(StatusCodes.BAD_REQUEST, done)
    });
    it('Check reject misnamed file field', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID)
        .field('token', token)
        .attach('wrongName', 'src/client/testFiles/small_test.txt')
        .expect(StatusCodes.BAD_REQUEST, done)
    });
    it('Check ignore second file', async (done) => {
      request(app)
        .post(`/files`)
        .field('townId', townID)
        .field('token', token)
        .attach('chatFile', 'src/client/testFiles/small_test.txt')
        .attach('chatFile', 'src/client/testFiles/too_big_file.txt')
        .expect(StatusCodes.OK)
        .then(response => {
          assert(response.body.response.name === 'small_test.txt')
          done();
        })
    });
    it('Check get wrong file name', async (done) => {
      request(app)
        .get(`/files/invalid`)
        .expect(StatusCodes.NOT_FOUND, done)
    });
  });
});
