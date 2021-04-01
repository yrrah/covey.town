import React from 'react';
import {Container, Text, Tooltip, VStack, Wrap, Link} from "@chakra-ui/react";
import {ChatData, ChatState} from "../../CoveyTypes";
import useCoveyAppState from "../../hooks/useCoveyAppState";

// ToDo: Auto scroll to bottom
export default function ChatList(props: { chatState: ChatState }): JSX.Element {

  const {chatState} = props;
  const {myPlayerID} = useCoveyAppState();


  function showChats(): string | JSX.Element[] {

    if (!chatState.chats) return 'no data';
    if (!Array.isArray(chatState.chats)) return 'results are not array'

    function chatColor(chatType: string, sendingPlayerID: string) {
      if (sendingPlayerID === myPlayerID) {
        return "yellowgreen";
      }
      if (chatType === "public") {
        return "powderblue"
      }
      if (chatType === "private") {
        return "wheat"
      }
      return "tomato"
    }

    function chatUserName(sendingPlayerID: string, sendingPlayerUserName: string) {
      if (sendingPlayerID === myPlayerID) {
        return "Me"
      }
      return sendingPlayerUserName
    }

    function chatMessage(chat:ChatData){
      if(chat.fileName){
        return (
          <Link display="flex"
            href={`${process.env.REACT_APP_TOWNS_SERVICE_URL}/files/${chat.fileName}`}
            download={chat.message} target="_blank">
            { chat.message }
          </Link>)
      }
      return (<Text display="flex"> {chat.message}</Text>)
    }

    return chatState.chats.map(chat => (
      <Wrap key={chat.timestamp.getMilliseconds()} align='left'>
        <Text ml={2} color='white'>({chat.chatType})</Text>
        <Container display="flex" m={2} mt={0}
                   backgroundColor={chatColor(chat.chatType, chat.sendingPlayer.id)}
                   borderRadius="10px"
                   padding="1">
          <Tooltip label={`User ID:  ${chat.sendingPlayer.id}`}
                   aria-label="User ID">
            <Text
              as='b'>{chatUserName(chat.sendingPlayer.id, chat.sendingPlayer.userName)}:&nbsp; </Text>
          </Tooltip>
          <Tooltip label={`Sent at ${chat.timestamp.toLocaleTimeString()}`}
                   aria-label="Message Timestamp">
            {chatMessage(chat)}
          </Tooltip>

        </Container>
      </Wrap>
    ))
  }

  return (
    <VStack>
      {showChats()}
    </VStack>
  );
}
