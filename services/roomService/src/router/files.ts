import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { nanoid } from 'nanoid';
import path from 'path';
import mongo from 'mongodb';
import Busboy from 'busboy';
import { logError } from '../Utils';
import db from '../db';
import CoveyTownsStore from '../lib/CoveyTownsStore';

export default function addFileRoutes(bucketName: string, app: Express): void {

  /**
   * Upload a file
   */
  app.post('/files', (req, res)=> {
    try {
      const busboy = new Busboy({
        headers: req.headers,
        limits : {
          files : 1,
          fileSize : 5000000, // 5mb
        },
      });
      let townId = '';
      let authorized = false;
      let uploading = false;
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
        const allowedMimes = [
          'text/plain',
          'text/css',
          'application/pdf',
          'application/msword',
          'application/vnd.ms-excel',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
          'image/png',
          'image/jpeg',
          'image/bmp',
          'image/gif',
          'image/tiff',
          'image/svg+xml',
        ];
        if (!authorized) {
          res.sendStatus(StatusCodes.UNAUTHORIZED);
        } else if (!allowedMimes.includes(mimetype)) {
          res.sendStatus(StatusCodes.UNSUPPORTED_MEDIA_TYPE);
        } else if (fieldname !== 'chatFile') {
          res.sendStatus(StatusCodes.BAD_REQUEST);
        } else {
          uploading = true;
          const newFilename = nanoid() + path.extname(filename);
          const gfs = new mongo.GridFSBucket(db(), { bucketName });
          const ws = gfs.openUploadStream(newFilename, {
            // (TODO) tagged with townId so it's possible to clean up files when a town is closed
            metadata: {townId},
            contentType: mimetype,
          });
          file.on('limit', () => {
            ws.abort();
            req.unpipe(busboy);
            res.set('Connection', 'close');
            res.sendStatus(StatusCodes.REQUEST_TOO_LONG);
          });
          file.pipe(ws).on('finish', () => {
            res.status(StatusCodes.OK)
              .json({
                isOK: true,
                response: {
                  fileName: newFilename,
                  name: filename,
                },
              });
          });
        }
      });
      busboy.on('error', (err: Error) => {
        if (!res.headersSent) {
          logError(err);
          res.sendStatus(StatusCodes.BAD_REQUEST);
        }
      });
      busboy.on('finish', () => {
        if (!uploading) {
          res.sendStatus(StatusCodes.BAD_REQUEST);
        }
      });
      req.pipe(busboy);
    } catch (err) {
      if (!res.headersSent) {
        if (err.message === 'Missing Content-Type') {
          res.sendStatus(StatusCodes.BAD_REQUEST);
        } else if (err.message.includes('Unsupported content type')) {
          res.sendStatus(StatusCodes.UNSUPPORTED_MEDIA_TYPE);
        } else {
          logError(err);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
              message: 'Internal server error, please see log in server for more details',
            });
        }
      }
    }
  });


  /**
   * Download a file
   */
  app.get('/files/:fileName', async (req, res) => {
    try {
      const gfs = new mongo.GridFSBucket(db(), { bucketName });
      const cursor = gfs.find({ filename: req.params.fileName.toString().replace('$', '') });
      cursor.toArray((error, docs) => {
        if (error){throw (error);}
        if (docs.length < 1){
          res.sendStatus(StatusCodes.NOT_FOUND);
          return;
        }
        const file = docs[0];
        res.set('Content-Type', file.contentType);
        res.set('X-Content-Type-Options', 'nosniff');
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
}


