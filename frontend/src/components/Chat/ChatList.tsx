import React from 'react';
import {Box, Container, Link, Text, Tooltip, VStack} from "@chakra-ui/react";
import {ChatData, ChatState} from "../../CoveyTypes";
import useCoveyAppState from "../../hooks/useCoveyAppState";

export default function ChatList(props: { chatState: ChatState }): JSX.Element {

  const {chatState} = props;
  const {myPlayerID} = useCoveyAppState();

  function showChats(): string | JSX.Element[] {

    if (!chatState.chats) return 'no data';
    if (!Array.isArray(chatState.chats)) return 'results are not array';

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
      let sender = sendingPlayerUserName;
      if (sendingPlayerID === myPlayerID) {
        sender = "Me"
      }
      const playerNameText = (<Text as='b'> {sender}:&nbsp; </Text>);
      // hide player id of server messages
      if (sendingPlayerID === '0') {
        return playerNameText
      }
      return (
        <Tooltip label={`User ID:  ${sendingPlayerID}`} aria-label="User ID">
          {playerNameText}
        </Tooltip>
      );
    }

    function chatMessage(chat: ChatData) {
      if (chat.fileName) {
        return (
          <Link display="flex"
                href={`${process.env.REACT_APP_TOWNS_SERVICE_URL}/files/${chat.fileName}`}
                download={chat.message} target="_blank">
            {chat.message}
          </Link>)
      }
      return (<Text style={{whiteSpace: "pre"}} display="flex"> {chat.message} </Text>)
    }

    return chatState.chats.map(chat => (
      <VStack key={chat.timestamp.getMilliseconds()}
              alignSelf={chat.sendingPlayer.id === myPlayerID ? "end" : "baseline"} mr={3} ml={3}>
        <Box>{
          chat.chatType === 'proximity' &&
          <Text ml={2} color='powderblue' fontSize="sm">(Proximity Chat)</Text>
        }
          {chat.chatType === 'private' &&
          <Text ml={2} color='tomato' fontSize="sm">(Private Chat)</Text>
          }
          <Container display="flex" m={2} mt={0}
                     backgroundColor={chatColor(chat.chatType, chat.sendingPlayer.id)}
                     borderRadius="10px"
                     padding="1">

            {chatUserName(chat.sendingPlayer.id, chat.sendingPlayer.userName)}

            <Tooltip label={`Sent at ${chat.timestamp.toLocaleTimeString()}`}
                     aria-label="Message Timestamp">
              {chatMessage(chat)}
            </Tooltip>

          </Container>
        </Box>
      </VStack>
    ))
  }

  return (
    <VStack>
      {showChats()}
    </VStack>
  );
}
