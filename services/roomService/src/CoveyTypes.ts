export type Direction = 'front' | 'back' | 'left' | 'right';
export type ChatType = 'public' | 'proximity' | 'private';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type CoveyTownList = { friendlyName: string; coveyTownID: string; currentOccupancy: number; maximumOccupancy: number }[];
export type ChatData = {
  message: string;
  timestamp: Date,
  sendingPlayer: { id: string, userName: string },
  receivingPlayerID?: { playerID: string } [],
  chatType: ChatType
};
