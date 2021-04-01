import { Db, GridFSBucket, MongoClient, MongoError } from 'mongodb';
import dotenv from 'dotenv';
import assert from 'assert';
import { logError } from './Utils';

let database: Db | null = null;
let client: MongoClient | null = null;
const DB_NAME = 'coveydb';
export const GRIDFS_BUCKET_NAME = 'Uploads';

export function connect(callback: (err?: MongoError | undefined) => void): void {
  if (database == null) {
    dotenv.config();
    assert(process.env.MONGO_CONNECT,
      'Environmental variable MONGO_CONNECT must be set');
    client = new MongoClient(process.env.MONGO_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    client.connect((err) => {
      if (err) {
        database = null;
        callback(err);
      } else {
        callback();
      }
    });
  } else {
    callback();
  }
}

export default function db():Db {
  if (database){
    return database;
  }
  if (client){
    database = client.db(DB_NAME);
    return database;
  }
  throw (new MongoError('no database connection'));
}

export async function emptyGridFS():Promise<void>{
  const bucket = new GridFSBucket(db(), { bucketName: GRIDFS_BUCKET_NAME });
  bucket.drop((error)=> {if (error){logError(error);}});
}

export function dbConnected():boolean {
  if (client){
    return client.isConnected();
  }
  return false;
}

// close open connection
export async function closeDb(): Promise<void> {
  if (client) {
    await client.close(true, (error)=> {if (error){logError(error);}});
    client = null;
  }
}
