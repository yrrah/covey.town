import React, {useState} from 'react';
import {
  Button,
  Select,
  Flex,
  Spacer,
  Box,
  Input,
  useToast
} from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import {ChatState, ChatType, ChatUpdate, ReceivingPlayerID} from "../../CoveyTypes";
import ChatList from "./ChatList";

function ChatPanel(props: { chatState: ChatState, updateChatState: React.Dispatch<ChatUpdate> }):JSX.Element {
  const [chatInput, setChatInput] = useState('');
  const {userName, myPlayerID, players, nearbyPlayers} = useCoveyAppState();
  const { chatState, updateChatState } = props;
  const [receivingPlayerID, addReceivingPlayers] = useState<ReceivingPlayerID[]>();
  const [chatMode, setChatMode] = useState<ChatType>('public');
  const playersList = players.filter((player) => player.id !== myPlayerID);
  const toast = useToast();

  function sendMessage() {
    updateChatState({
      action: 'sendMessage',
      data: {
        message: chatInput,
        timestamp: new Date(),
        sendingPlayer: {id: myPlayerID, userName},
        receivingPlayerID,
        chatType: chatMode,
        }
    })
  }
  
  function handleChangeList(item: string) {
    if(item === 'Proximity Chat') {
      const proximityPlayerList: ReceivingPlayerID[] = [];
      nearbyPlayers.nearbyPlayers.forEach(player => {
        proximityPlayerList.push({ playerID: player.id } as ReceivingPlayerID);
      });
      let test = "";
      proximityPlayerList.forEach(player => {
          const proximityPlayer = players.find((all) => all.id === player.playerID);
          if (proximityPlayer) {
            test = test.concat(proximityPlayer.userName);
            test = test.concat(" ");
          }
      });
      toast({
        title: 'Proximity Chat Selected',
        description: test,
        status: 'success',
      });
      addReceivingPlayers(proximityPlayerList);
      setChatMode('proximity' as ChatType);
    }
    else if(item === 'Everyone') {
      addReceivingPlayers(undefined);
      toast({
        title: 'Public Chat Selected',
        description: item,
        status: 'success',
      });
      setChatMode('public' as ChatType);
    }
    else {
      const privatePlayerList: ReceivingPlayerID[] = [];
      privatePlayerList.push({ playerID: item } as ReceivingPlayerID);
      toast({
        title: 'Private Chat Selected',
        description: item,
        status: 'success',
      });
      addReceivingPlayers(privatePlayerList);
      setChatMode('private' as ChatType);
    }
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
    <Select data-testid="playerList" variant="filled" placeHolder='Everyone' onChange={item => handleChangeList(item.target.value)}>
    <option> Everyone </option>
    <option> Proximity Chat </option>
      { playersList.map(player => (
        <option key={player.id}> {player.userName} </option> 
        )) }
    </Select>
    <Flex direction='row'>
      <Input data-testid="chatInput" placeholder="Chat input"
             value={chatInput}
             onChange={event => setChatInput(event.target.value)}  />
      <Spacer flex={1} />
      <Button data-testid="sendChat" onClick={ () => sendMessage } color="blue">Send</Button>
    </Flex>
  </Flex>
}

export default ChatPanel;
