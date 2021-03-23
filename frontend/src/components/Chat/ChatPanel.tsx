import React, {useState} from 'react';
import {
  Button,
  Select,
  Flex,
  Spacer,
  Box,
  Input
} from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import {ChatState, ChatUpdate} from "../../CoveyTypes";
import ChatList from "./ChatList";


function ChatPanel(props: { chatState: ChatState, updateChatState: React.Dispatch<ChatUpdate> }):JSX.Element {
  const [chatInput, setChatInput] = useState('');
  const {userName, myPlayerID} = useCoveyAppState();
  const { chatState, updateChatState } = props;

  function sendMessage() {
    updateChatState({
      action: 'sendMessage',
      data: {
        message: chatInput,
        timestamp: new Date(),
        sendingPlayer: {id: myPlayerID, userName},
        // receivingPlayerID?: { playerID: string } [],
        chatType: 'public'
        }
    })
  }

  return <Flex bg='lightgrey' direction='column' height='100%'>
    <Flex justify='flex-end'>
      <Button colorScheme="teal" variant="ghost">
        X
      </Button>
    </Flex>
    <Box bg='white' flex={1} m={2}>
      <ChatList chatState={chatState} />
    </Box>
    <Select variant="filled" placeholder="Player List">
      {/* {players.map(player => ( */}
      {/*  <option value="option1">Option 1</option> */}
      {/* ))} */}
    </Select>
    <Select variant="filled" placeholder="Chat Mode" />
    <Flex direction='row'>
      <Input placeholder="Chat input"
             value={chatInput}
             onChange={event => setChatInput(event.target.value)}  />
      <Spacer flex={1} />
      <Button onClick={ () => sendMessage } color="blue">Send</Button>
    </Flex>
  </Flex>
}

export default ChatPanel;
