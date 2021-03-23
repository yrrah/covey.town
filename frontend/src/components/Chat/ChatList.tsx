import React from 'react';
import { VStack, Text, Wrap, Tooltip} from "@chakra-ui/react";
import { ChatState } from "../../CoveyTypes";


export default function ChatList(props: { chatState: ChatState  }):JSX.Element {

  const { chatState } = props;

  function showChats():string | JSX.Element[]{
      if (!chatState.chats) return 'no data';
      if (!Array.isArray(chatState.chats)) return 'results are not array'
      return chatState.chats.map(chat => (
        <Wrap key={chat.timestamp.getMilliseconds()} align='left'>
          <Tooltip label={`Sent at ${chat.timestamp.toLocaleTimeString()}`} aria-label="Message Timestamp">
            <Text as='b'>{ chat.sendingPlayer.userName }:&nbsp;</Text>
          </Tooltip>
          <Text> { chat.message }</Text>
        </Wrap>
      ))
  }
  return (
    <VStack>
      { showChats() }
    </VStack>
  );
}
