import { Db, GridFSBucket, MongoClient, MongoError } from 'mongodb';
import assert from 'assert';

let database: Db | undefined;
let client: MongoClient | undefined;
const DB_NAME = 'coveydb';
export const GRIDFS_BUCKET_NAME = 'Uploads';

/**
 * Establish a connection to MongoDB server. This connection will be shared/reused for the lifetime of the server.
 * @param callback called after trying to connect
 */
export function connectDb(callback: (err?: Error | undefined) => void): void {
  if (!client) {
    assert(process.env.REACT_APP_MONGO_CONNECT,
      'Environmental variable REACT_APP_MONGO_CONNECT must be set');
    client = new MongoClient(process.env.REACT_APP_MONGO_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    client.connect(callback);
  } else {
    callback(new MongoError('Already connected'));
  }
}

/**
 * Opens a database connection. This connection is saved and returned for subsequent calls to this function.
 */
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

/**
 * Drops the file storage database. This should be called when the server shuts down to clean up the database.
 */
export function emptyGridFS(callback: (err?: Error | undefined) => void):void{
  if (database) {
    const bucket = new GridFSBucket(db(), {bucketName: GRIDFS_BUCKET_NAME});
    bucket.drop(callback);
  } else {
    callback();
  }
}

export function dbConnected():boolean {
  if (client){
    return client.isConnected();
  }
  return false;
}

/**
 * Closes the connection to MongoDB server and associated database connections.
 */
export function closeDb(callback: (err?: Error | undefined) => void): void {
  if (client) {
    client.close(true, callback);
  }
}
