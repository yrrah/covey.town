import React, {useCallback, useEffect, useState} from 'react';
import {Box, Button, Flex, Input, Select, Spacer,} from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import {ChatState, ChatType, ChatUpdate, ReceivingPlayerID} from "../../CoveyTypes";
import ChatList from "./ChatList";

function ChatPanel(props: { chatState: ChatState, updateChatState: React.Dispatch<ChatUpdate> }): JSX.Element {
  const [chatInput, setChatInput] = useState('');
  const {userName, myPlayerID, players, nearbyPlayers, apiClient, sessionToken, currentTownID} = useCoveyAppState();
  const {chatState, updateChatState} = props;
  const [receivingPlayerList, addReceivingPlayers] = useState<ReceivingPlayerID[]>();
  const [chatMode, setChatMode] = useState<ChatType>('public');
  const playersList = players.filter((player) => player.id !== myPlayerID);
  const [files, setFiles] = useState<FileList|null>(null);

  const updateNearbyPlayers = useCallback(() => {
    const proximityPlayerList: ReceivingPlayerID[] = [];
    nearbyPlayers.nearbyPlayers.forEach(player => {
      proximityPlayerList.push({playerID: player.id});
    });
    proximityPlayerList.push({playerID: myPlayerID});
    addReceivingPlayers(proximityPlayerList);
  }, [myPlayerID, nearbyPlayers.nearbyPlayers]);

  useEffect(() => {
    updateNearbyPlayers();
  }, [updateNearbyPlayers]);

  function sendMessage(message:string, fileName?:string) {
    updateChatState({
      action: 'sendMessage',
      data: {
        fileName,
        message,
        timestamp: new Date(),
        sendingPlayer: {id: myPlayerID, userName},
        receivingPlayerID: receivingPlayerList,
        chatType: chatMode,
        }
    })
  }

  function handleChangeList(item: string) {
    if(item === 'Proximity Chat') {
      setChatMode('proximity');
      updateNearbyPlayers();
    }
    else if(item === 'Everyone') {
      setChatMode('public');
      addReceivingPlayers(undefined);
    }
    else {
      setChatMode('private');
      const privatePlayerList: ReceivingPlayerID[] = [];
      const privatePlayer = players.find(player => player.userName === item);
      if(privatePlayer) {
        privatePlayerList.push({ playerID: privatePlayer.id });
      }
      privatePlayerList.push({ playerID: myPlayerID });
      addReceivingPlayers(privatePlayerList);
    }
  }

  async function doUpload() {
    if (files && files[0]) {
      const response = await apiClient.uploadFile({
          file: files[0],
          name: 'chatFile',
          token:sessionToken,
          coveyTownID:currentTownID
        })
      if (response.fileName) {
        sendMessage(response.name, response.fileName)
      }
    }
  }

  return <Flex bg='lightgrey' direction='column' height='600px' marginTop="50px">
    <Flex justify='flex-end'>
      <Input type='file' name='chatFile' onChange={(event) => {setFiles(event.target.files)}}/>
      <Button data-testid="uploadFile" onClick={ () => doUpload() } color="blue">Upload</Button>
      <Button colorScheme="teal" variant="ghost">
        X
      </Button>
    </Flex>
    <Box bg='black' flex={1} m={2} overflow="scroll" overflowY="auto">
      <ChatList chatState={chatState}/>
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
      <Button data-testid="sendChat" onClick={ () => sendMessage(chatInput) } color="blue">Send</Button>
    </Flex>
  </Flex>
}

export default ChatPanel;
