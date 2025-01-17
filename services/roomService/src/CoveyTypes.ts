export type Direction = 'front' | 'back' | 'left' | 'right';
export type ChatType = 'public' | 'proximity' | 'private';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type ReceivingPlayerID = {
  playerID: string
};

export type SecretKeySet = {
  secretKey: string
};

export type CoveyTownList = { friendlyName: string; coveyTownID: string; currentOccupancy: number; maximumOccupancy: number }[];

export type ChatData = {
  fileName?: string;
  message: string;
  timestamp: Date,
  sendingPlayer: { id: string, userName: string },
  receivingPlayerID?: ReceivingPlayerID [],
  chatType: ChatType,
  encryptedSecretKeys?: SecretKeySet[]
};
