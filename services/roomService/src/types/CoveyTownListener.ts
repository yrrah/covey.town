import { ChatData } from '../CoveyTypes';
import Player from './Player';

/**
 * A listener for player-related events in each town
 */
export default interface CoveyTownListener {
  /**
   * Called when a player joins a town
   * @param newPlayer the new player
   */
  onPlayerJoined(newPlayer: Player): void;

  /**
   * Called when a player's location changes
   * @param movedPlayer the player that moved
   */
  onPlayerMoved(movedPlayer: Player): void;

  /**
   * Called when a player disconnects from the town
   * @param removedPlayer the player that disconnected
   */
  onPlayerDisconnected(removedPlayer: Player): void;

  /**
   * Called when a town is destroyed, causing all players to disconnect
   */
  onTownDestroyed(): void;
  
  /**
   * Called when a message is sent by a player
   */
  onMessageSent(chatData: ChatData): void;
}
