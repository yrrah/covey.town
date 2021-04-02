import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Box, Flex, Input, Select, Spacer, useToast} from '@chakra-ui/react';
import {Button} from "@material-ui/core";
import useCoveyAppState from "../../hooks/useCoveyAppState";
import {ChatState, ChatType, ChatUpdate, ReceivingPlayerID} from "../../CoveyTypes";
import ChatList from "./ChatList";

function ChatPanel(props: { chatState: ChatState, updateChatState: React.Dispatch<ChatUpdate> }): JSX.Element {
  const [chatInput, setChatInput] = useState('');
  const {userName, myPlayerID, players, nearbyPlayers, apiClient, sessionToken, currentTownID} = useCoveyAppState();
  const {chatState, updateChatState} = props;
  const [receivingPlayerList, addReceivingPlayers] = useState<ReceivingPlayerID[]>();
  const [chatMode, setChatMode] = useState<ChatType>('public');
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const playersList = players.filter((player) => player.id !== myPlayerID);
  const myRef = useRef(null);
  const toast = useToast()

  const executeScroll = () => {
    const node = (myRef.current) as unknown as Element;
    node.scrollIntoView({
      block: 'nearest', behavior: 'smooth',
      inline: "end"
    });
  };

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

  useEffect(() => {
    executeScroll();
  }, [chatState]);

  function sendMessage(message: string, fileName?: string) {
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
    if (item === 'Proximity Chat') {
      setChatMode('proximity');
      updateNearbyPlayers();
    } else if (item === 'Everyone') {
      setChatMode('public');
      addReceivingPlayers(undefined);
    } else {
      setChatMode('private');
      const privatePlayerList: ReceivingPlayerID[] = [];
      const privatePlayer = players.find(player => player.userName === item);
      if (privatePlayer) {
        privatePlayerList.push({playerID: privatePlayer.id});
      }
      privatePlayerList.push({playerID: myPlayerID});
      addReceivingPlayers(privatePlayerList);
    }
  }

  async function doUpload():Promise<void> {
    if (fileRef.current && fileRef.current.files && fileRef.current.files[0]) {
      setUploading(true);
      const file = fileRef.current.files[0]
      fileRef.current.value = ''
      const response = await apiClient.uploadFile({
        file,
        name: 'chatFile',
        token: sessionToken,
        coveyTownID: currentTownID
      });
      if ('fileName' in response) {
        sendMessage(response.name, response.fileName)
      }
      if ('userError' in response) {
        toast({
          title: 'Unable to upload file',
          description: response.message,
          status: 'error'
        });
      }
    }
  }

  function fileTypes():string{
    return "text/plain, application/pdf, image/*, " +
      "application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, " +
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document, " +
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, " +
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow"
  }

  return <Flex bg='lightgrey' direction='column' height='600px' marginTop="50px">
    <Flex direction='row'>
      <label htmlFor="chatFile">
        <input type='file' name='chatFile' ref={fileRef} title="&nbsp;"
               accept={fileTypes()} id='chatFile' style={{'display': 'none'}}
               onChange={() => doUpload().then(() => setUploading(false))}/>
         <Button variant="outlined" component="span" disabled={uploading}>Upload File</Button>
      </label>
      <Spacer/>
      <Button variant="text">
        X
      </Button>
    </Flex>
    <Box bg='black' flex={1} m={2} overflow="scroll" overflowY="auto">
      <ChatList chatState={chatState}/>
      <div ref={myRef}/>
    </Box>
    <Select data-testid="playerList" variant="filled" placeHolder='Everyone'
            onChange={item => handleChangeList(item.target.value)}>
      <option> Everyone</option>
      <option> Proximity Chat</option>
      {playersList.map(player => (
        <option key={player.id}> {player.userName} </option>
      ))}
    </Select>
    <Flex direction='row'>
      <Input data-testid="chatInput" placeholder="Chat input"
             value={chatInput}
             onChange={event => setChatInput(event.target.value)}/>
      <Spacer flex={1}/>
      <Button data-testid="sendChat" onClick={() => sendMessage(chatInput)} variant="outlined"
              >Send</Button>
    </Flex>
  </Flex>
}

export default ChatPanel;
