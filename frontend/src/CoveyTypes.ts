import { Socket } from 'socket.io-client';
import Player, { UserLocation } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';

export const SecretKeyIdentifier = 'generated_secret_key=';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';
export type ChatType = 'public' | 'proximity' | 'private';

export type VideoRoom = {
  twilioID: string,
  id: string
};
export type UserProfile = {
  displayName: string,
  id: string
};
export type NearbyPlayers = {
  nearbyPlayers: Player[]
};
export type CoveyAppState = {
  sessionToken: string,
  userName: string,
  currentTownFriendlyName: string,
  currentTownID: string,
  currentTownIsPubliclyListed: boolean,
  myPlayerID: string,
  players: Player[],
  currentLocation: UserLocation,
  nearbyPlayers: NearbyPlayers,
  emitMovement: (location: UserLocation) => void,
  socket: Socket | null,
  apiClient: TownsServiceClient,
};
export type CoveyAppUpdate =
  | { action: 'doConnect'; data: { userName: string, townFriendlyName: string, townID: string,townIsPubliclyListed:boolean, sessionToken: string, myPlayerID: string, socket: Socket, players: Player[], emitMovement: (location: UserLocation) => void } }
  | { action: 'addPlayer'; player: Player }
  | { action: 'playerMoved'; player: Player }
  | { action: 'playerDisconnect'; player: Player }
  | { action: 'weMoved'; location: UserLocation }
  | { action: 'disconnect' }
  ;
export type ChatState = {
  chats: ChatData[],
  myPlayerID: string;
  emitChat: (chat: ChatData) => void,
};

export type ReceivingPlayerID = {
  playerID: string
};

export type SecretKeySet = {
  secretKey: string
};

export type ChatUpdate =
  | { action: 'receiveMessage'; data: ChatData }
  | { action: 'sendMessage'; data: ChatData }
  | { action: 'initChat'; emitChat: (chat: ChatData) => void; myPlayerID: string; chats: ChatData[]}
  | { action: 'disconnect' }
;
export type ChatData = {
  message: string;
  timestamp: Date,
  sendingPlayer: { id: string, userName: string },
  receivingPlayerID?: ReceivingPlayerID [],
  chatType: ChatType,
  encryptedSecretKeys?: SecretKeySet[]
};