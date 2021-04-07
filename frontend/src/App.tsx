import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider} from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import assert from "assert";
import { io } from "socket.io-client";
import VideoContext from './contexts/VideoContext';
import CoveyAppContext from './contexts/CoveyAppContext';
import NearbyPlayersContext from './contexts/NearbyPlayersContext';
import AppStateProvider, { useAppState } from './components/VideoCall/VideoFrontend/state';
import useConnectionOptions from './components/VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import UnsupportedBrowserWarning
  from './components/VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from './components/VideoCall/VideoFrontend/components/VideoProvider';
import ErrorDialog from './components/VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import theme from './components/VideoCall/VideoFrontend/theme';
import { Callback } from './components/VideoCall/VideoFrontend/types';
import Video from './classes/Video/Video';
import { appStateReducer, defaultAppState } from "./components/Town/TownLogic";
import TownPage from "./components/Town/TownPage";
import { TownJoinResponse } from "./classes/TownsServiceClient";
import Login from "./components/Login/Login";
import { chatStateReducer, defaultChatState } from "./components/Chat/ChatLogic";
import {ChatData, ChatUpdate, CoveyAppUpdate} from "./CoveyTypes";

import Player, {ServerPlayer, UserLocation} from "./classes/Player";

async function GameController(initData: TownJoinResponse,
                                     dispatchAppUpdate: (update: CoveyAppUpdate) => void,
                                     updateChat: (message: ChatUpdate) => void):Promise<boolean>{
  // Now, set up the game sockets
  const gamePlayerID = initData.coveyUserID;
  const sessionToken = initData.coveySessionToken;
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);
  const video = Video.instance();
  assert(video);
  const roomName = video.townFriendlyName;
  assert(roomName);

  const socket = io(url, { auth: { token: sessionToken, coveyTownID: video.coveyTownID } });
  socket.on('newPlayer', (player: ServerPlayer) => {
    dispatchAppUpdate({
      action: 'addPlayer',
      player: Player.fromServerPlayer(player),
    });
  });
  socket.on('playerMoved', (player: ServerPlayer) => {
    if (player._id !== gamePlayerID) {
      dispatchAppUpdate({ action: 'playerMoved', player: Player.fromServerPlayer(player) });
    }
  });
  socket.on('playerDisconnect', (player: ServerPlayer) => {
    dispatchAppUpdate({ action: 'playerDisconnect', player: Player.fromServerPlayer(player) });
  });
  socket.on('disconnect', () => {
    dispatchAppUpdate({action: 'disconnect'});
    updateChat({action: 'disconnect'});
  });
  const emitMovement = (location: UserLocation) => {
    socket.emit('playerMovement', location);
    dispatchAppUpdate({ action: 'weMoved', location });
  };
  const emitChat = (data: ChatData) => {
    socket.emit('newChatMessage', data);
  };
  socket.on('newChatMessage', (data: ChatData) => {
    updateChat({
      action: 'receiveMessage',
      data,
    });
  });

  updateChat({
    action: 'initChat',
    myPlayerID: gamePlayerID,
    chats: [{
      message: `Connected to town, ${roomName}`,
      timestamp: new Date(),
      sendingPlayer: {id: '0', userName:'Server Message'},
      receivingPlayerID: [{ playerID: gamePlayerID }],
      chatType: 'private'
    }],
    emitChat,
  });

  dispatchAppUpdate({
    action: 'doConnect',
    data: {
      sessionToken,
      userName: video.userName,
      townFriendlyName: roomName,
      townID: video.coveyTownID,
      myPlayerID: gamePlayerID,
      townIsPubliclyListed: video.isPubliclyListed,
      emitMovement,
      socket,
      players: initData.currentPlayers.map((sp) => Player.fromServerPlayer(sp)),
    },
  });
  return true;
}

function App(props: { setOnDisconnect: Dispatch<SetStateAction<Callback | undefined>> }) {
  const [appState, dispatchAppUpdate] = useReducer(appStateReducer, defaultAppState());
  const [chatState, updateChatState] = useReducer(chatStateReducer, defaultChatState());
  const { setOnDisconnect } = props;

  useEffect(() => {
    setOnDisconnect(() => async () => { // Here's a great gotcha: https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
      dispatchAppUpdate({ action: 'disconnect' });
      return Video.teardown();
    });
  }, [dispatchAppUpdate, setOnDisconnect]);

  const setupGameController = useCallback(async (initData: TownJoinResponse) => {
    await GameController(initData, dispatchAppUpdate, updateChatState);
    return true;
  }, [dispatchAppUpdate]);
  const videoInstance = Video.instance();

  const page = useMemo(() => {
    if (!appState.sessionToken) {
      return <Login doLogin={setupGameController}/>;
    }
    if (!videoInstance) {
      return <div>Loading...</div>;
    }
    return  <TownPage chatState={chatState} updateChatState={updateChatState} />
  }, [ chatState, setupGameController, appState.sessionToken, videoInstance ]);

  return (
    <CoveyAppContext.Provider value={appState}>
      <VideoContext.Provider value={Video.instance()}>
        <NearbyPlayersContext.Provider value={appState.nearbyPlayers}>
          {page}
        </NearbyPlayersContext.Provider>
      </VideoContext.Provider>
    </CoveyAppContext.Provider>
  );
}

function EmbeddedTwilioAppWrapper() {
  const { error, setError } = useAppState();
  const [onDisconnect, setOnDisconnect] = useState<Callback | undefined>();
  const connectionOptions = useConnectionOptions();
  return (
    <UnsupportedBrowserWarning>
      <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
        <ErrorDialog dismissError={() => setError(null)} error={error} />
        <App setOnDisconnect={setOnDisconnect} />
      </VideoProvider>
    </UnsupportedBrowserWarning>
  );
}

export default function AppStateWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <MuiThemeProvider theme={theme('rgb(185, 37, 0)')}>
          <AppStateProvider preferredMode="fullwidth" highlightedProfiles={[]}>
            <EmbeddedTwilioAppWrapper />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}
