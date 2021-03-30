import {ChatData, ChatState, ChatUpdate} from "../../CoveyTypes";
import { decrypt, encrypt } from "./ChatCrypto";

export function defaultChatState(): ChatState {
  return {
    chats: [],
    myPlayerID: '',
    emitChat: () => {}
  }
}

export function chatStateReducer(state: ChatState, update:ChatUpdate): ChatState {

  const nextState = {
    chats: state.chats,
    myPlayerID: state.myPlayerID,
    emitChat: state.emitChat,
  };
  function filterPermissions(data: ChatData) {
    if (data.chatType === 'public') {
      return true;
    }
    if(data.receivingPlayerID?.some(player => player.playerID === state.myPlayerID)) {
      return true;
    }
    return false;
  }

  switch (update.action) {
    case 'initChat':
      nextState.myPlayerID = update.myPlayerID
      nextState.emitChat = update.emitChat
      nextState.chats = update.chats
      break;
    case 'sendMessage':
      state.emitChat(encrypt(update.data))
      break;
    case 'receiveMessage':
      if(filterPermissions(update.data)) {
        const newChat = decrypt(update.data, state.myPlayerID);
        newChat.timestamp = new Date(update.data.timestamp);
        nextState.chats = [...nextState.chats, newChat];
      }
      break;
    case 'disconnect':
      return defaultChatState();
    default:
      throw new Error('Unexpected state request');
  }

  return nextState;
}
