import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import { AddressInfo } from 'net';
import addTownRoutes from './router/towns';
import CoveyTownsStore from './lib/CoveyTownsStore';
import addFileRoutes from './router/files';
import { logError } from './Utils';
import { connectDb, dbConnected, dropBucket, closeDb, PROD_BUCKET_NAME } from './db';

const app = Express();
app.use(CORS());
const server = http.createServer(app);

connectDb((err)=>{
  if (err){ logError(err); } else { addFileRoutes(PROD_BUCKET_NAME, app); }
});

const socket = addTownRoutes(server, app);

server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    CoveyTownsStore.getInstance()
      .createTown(process.env.DEMO_TOWN_ID, false);
  }
});

let calledOnce = false;
function cleanUp(eventType: string){
  // eslint-disable-next-line no-console
  console.log(`got signal ${eventType}`);
  if (!calledOnce){
    calledOnce = true;
    socket.close();
    server.close();
    if (dbConnected()) {
      dropBucket(PROD_BUCKET_NAME, (gridErr) => {
        if (gridErr) {
          logError(gridErr);
        }
        closeDb((dbErr) => {
          if (dbErr) {
            logError(dbErr);
          }
        });
      });
    }
  }
}

// https://stackoverflow.com/a/49392671/2585800
['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGHUP', 'SIGQUIT'].forEach((eventType: string) => {
  process.on(eventType, () => cleanUp(eventType));
});
