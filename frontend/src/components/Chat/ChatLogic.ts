import {ChatData, ChatState, ChatUpdate} from "../../CoveyTypes";

export function defaultChatState(): ChatState {
  return {
    chats: [],
    myPlayerID: '',
    emitChat: () => {}
  }
}

export function chatStateReducer(state: ChatState, update:ChatUpdate): ChatState {

  const nextState = {
    chats: {...state.chats},
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
      state.emitChat(update.data)
      break;
    case 'receiveMessage':
      if(filterPermissions(update.data)) {
        nextState.chats.push(update.data)
      }
      break;
    case 'disconnect':
      return defaultChatState();
    default:
      throw new Error('Unexpected state request');
  }

  return nextState;
}
