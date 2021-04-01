import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import { AddressInfo } from 'net';
import stoppable from 'stoppable';
import addTownRoutes from './router/towns';
import CoveyTownsStore from './lib/CoveyTownsStore';
import addFileRoutes from './router/files';
import { logError } from './Utils';
import { connect, dbConnected, emptyGridFS, closeDb } from './db';

const app = Express();
app.use(CORS());
const server = stoppable(http.createServer(app), 0);

connect((err)=>{
  if (err){
    logError(err);
  } else {
    addFileRoutes(app);
  }
});

addTownRoutes(server, app);

// Tried to clean up thoroughly to avoid ADDRESS IN USE errors, but they still happen some times
let called = false;
function cleanUp(event: string){
  // eslint-disable-next-line no-console
  console.log(`got ${event} event`);
  if (!called) {
    called = true;
    server.stop(async (err, gracefully) => {
      if (err){logError(err);}
      // eslint-disable-next-line no-console
      console.log(`http closed ${gracefully ? 'gracefully' : '(forced)'}`);
      if (dbConnected()){
        emptyGridFS((gridErr) => {
          if (gridErr){logError(gridErr);}
          closeDb((dbErr) => {
            if (dbErr){logError(dbErr);}
            // eslint-disable-next-line no-console
            console.log('db closed');
            process.exit(0);
          });
        });
      } else {
        process.exit(0);
      }
    });
  }
}
['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGHUP', 'SIGQUIT'].forEach((eventType) => {
  process.on(eventType, cleanUp.bind(null, eventType));
});

server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    CoveyTownsStore.getInstance()
      .createTown(process.env.DEMO_TOWN_ID, false);
  }
});
