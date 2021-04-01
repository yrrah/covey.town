import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { nanoid } from 'nanoid';
import path from 'path';
import mongo, { ObjectId } from 'mongodb';
import Busboy from 'busboy';
import { logError } from '../Utils';
import db, { GRIDFS_BUCKET_NAME } from '../db';
import CoveyTownsStore from '../lib/CoveyTownsStore';

export default function addFileRoutes(app: Express): void {

  /**
   * Upload a file
   */
  app.post('/files', (req, res)=> {
    try {
      const busboy = new Busboy({
        headers: req.headers,
        limits : {
          files : 1,
          fileSize : 5242880, // 5mb
        },
      });
      let townId = '';
      let authorized = false;
      busboy.on('field', (fieldname, val) => {
        if (fieldname === 'townId'){ townId = val;}
      });
      busboy.on('field', (fieldname, token) => {
        if (fieldname === 'token'){
          const townController = CoveyTownsStore.getInstance().getControllerForTown(townId);
          // Retrieve metadata about sending player from the TownController
          const s = townController?.getSessionByToken(token);
          if (s && townController) {
            // Valid session exists for this token so allow upload to our database
            authorized = true;
          }
        }
      });
      busboy.on('file', (fieldname, file, filename, _encoding, mimetype) => {
        if (!authorized) {
          res.status(StatusCodes.UNAUTHORIZED);

        } else if (!(mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          || mimetype === 'image/png'
          || mimetype === 'image/jpg'
          || mimetype === 'image/jpeg')) {
          res.status(StatusCodes.BAD_REQUEST)
            .json({
              message: 'Invalid file format',
            });

        } else if (fieldname !== 'chatFile') {
          res.status(StatusCodes.BAD_REQUEST);

        } else {
          const newFilename = nanoid() + path.extname(filename);
          const gfs = new mongo.GridFSBucket(db(), { bucketName: GRIDFS_BUCKET_NAME });
          const ws = gfs.openUploadStream(newFilename, {
            // (TODO) tagged with townId so it's possible to clean up files when a town is closed
            metadata: {townId},
            contentType: mimetype,
          });
          file.pipe(ws);
          res.status(StatusCodes.OK)
            .json({
              isOK: true,
              response: {
                fileName: newFilename,
                name: filename,
              },
            });
        }
      });
      req.pipe(busboy);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });


  /**
   * Download a file
   */
  app.get('/files/:fileName', async (req, res) => {
    try {
      const gfs = new mongo.GridFSBucket(db(), { bucketName: GRIDFS_BUCKET_NAME });
      const cursor = gfs.find({ filename: req.params.fileName });
      cursor.toArray((error, docs) => {
        if (error){throw (error);}
        if (docs.length < 1){throw (new Error('File not found.'));}
        const file = docs[0];
        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', `attachment; filename="${  file.filename  }"`);
        gfs.openDownloadStream(file._id).pipe(res);
      });
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
   * Delete a file
   */
  app.delete('/files/:fileId', async (req, res) => {
    try {
      const gfs = new mongo.GridFSBucket(db(), { bucketName: GRIDFS_BUCKET_NAME });
      gfs.delete(new ObjectId(req.params.fileId), (err) => {
        if (err){ throw (err); }
        return res.status(StatusCodes.OK);
      });
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });
}


