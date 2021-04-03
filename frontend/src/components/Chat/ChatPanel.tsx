import React, {useEffect, useRef, useState, useMemo } from 'react';
import {Box, Flex, Input, Select, Spacer, useToast} from '@chakra-ui/react';
import {Button} from "@material-ui/core";
import useCoveyAppState from "../../hooks/useCoveyAppState";
import {ChatState, ChatType, ChatUpdate, ReceivingPlayerID} from "../../CoveyTypes";
import ChatList from "./ChatList";
import useMaybeVideo from '../../hooks/useMaybeVideo';

function ChatPanel(props: { chatState: ChatState, setChatVisible: React.Dispatch<React.SetStateAction<boolean>>, updateChatState: React.Dispatch<ChatUpdate> }): JSX.Element {
  const [chatInput, setChatInput] = useState('');
  const {userName, myPlayerID, players, nearbyPlayers, apiClient, sessionToken, currentTownID} = useCoveyAppState();
  const {chatState, setChatVisible, updateChatState} = props;
  const [chatMode, setChatMode] = useState<ChatType>('public');
  const [privatePlayer, setPrivatePlayer] = useState<ReceivingPlayerID[]>([])
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const playersList = players.filter((player) => player.id !== myPlayerID);
  const myRef = useRef(null);
  const video = useMaybeVideo();
  const toast = useToast();

  const executeScroll = () => {
    const node = (myRef.current) as unknown as Element;
    node.scrollIntoView({
      block: 'nearest', behavior: 'smooth',
      inline: "end"
    });
  };

  function receivingPlayerList():ReceivingPlayerID[] | undefined {
    if (chatMode === 'proximity') {
      const proximityPlayerList = nearbyPlayers.nearbyPlayers.map(player => ({playerID: player.id}))
      proximityPlayerList.push({playerID: myPlayerID});
      return proximityPlayerList
    }
    if (chatMode === 'private') {
      return [...privatePlayer, {playerID: myPlayerID}];
    }
    return undefined;
  }

  useEffect(() => {
    executeScroll();
  }, [chatState]);

  function wrapMessage(message: string) {
    const listOfWords = message.split(' ');
    let wrappedMessage = '';
    let messageLine = '';
    const characterLimit = 32;
    listOfWords.forEach(word => {
      if((word.length + messageLine.length) > characterLimit && word.length < characterLimit) {
        wrappedMessage = wrappedMessage.concat(messageLine).concat('\n');
        messageLine = '';
      }
      if(word.length > 32) {
        let count = 0;
        while(count < word.length) {
          if(messageLine.length + count + characterLimit > word.length) {
            messageLine = messageLine.concat(word.substring(count, word.length));
          }
          else {
            messageLine = messageLine.concat(word.substring(count, count + (characterLimit - messageLine.length))).concat('-\n');
            wrappedMessage = wrappedMessage.concat(messageLine);
            messageLine = '';
          }
          count += characterLimit;
        }
      }
      else {
        messageLine = messageLine.concat(word).concat(' ');
      }
    });
    if(messageLine !== '') {
      wrappedMessage = wrappedMessage.concat(messageLine);
    }
    return wrappedMessage;
  }

  function sendMessage(message: string, fileName?: string) {
    const wrappedMessage = wrapMessage(message);
    updateChatState({
      action: 'sendMessage',
      data: {
        fileName,
        message: wrappedMessage,
        timestamp: new Date(),
        sendingPlayer: {id: myPlayerID, userName},
        receivingPlayerID: receivingPlayerList(),
        chatType: chatMode,
      }
    })
    setChatInput('');
  }

  function handleKeyDownEvents(event: React.KeyboardEvent<HTMLInputElement>) {
    if(event.key === 'Enter') {
        sendMessage(chatInput);
      }
  }

  function handleChangeList(item: string) {
    if (item === 'Proximity Chat') {
      setChatMode('proximity');
    } else if (item === 'Everyone') {
      setChatMode('public');
    } else {
      setChatMode('private');
      setPrivatePlayer(players
        .filter(player => player.userName === item)
        .map(player => ({playerID: player.id})))
    }
  }

  async function doUpload():Promise<void> {
    if (fileRef.current && fileRef.current.files && fileRef.current.files[0]) {
      const file = fileRef.current.files[0]
      if(file.size > 5242880) { // 5mb
        toast({
          title: 'Unable to upload file',
          description: 'Files must be smaller than 5MB.',
          status: 'error'
        });
        return;
      }
      setUploading(true);
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

  const proximityOption = useMemo(() => {
    if(nearbyPlayers.nearbyPlayers.length === 0
      && chatMode === 'proximity'){
      setChatMode('public');
    }
    if(nearbyPlayers.nearbyPlayers.length > 0){
      return (<option> Proximity Chat</option>);
    }
    return null
  }, [chatMode, nearbyPlayers.nearbyPlayers.length]);

  return <Flex bg='lightgrey' direction='column' height='600px' marginTop="50px">
    <Flex direction='row'>
      <label htmlFor="chatFile">
        <input type='file' name='chatFile' ref={fileRef} title="&nbsp;"
               accept={fileTypes()} id='chatFile' style={{'display': 'none'}}
               onChange={() => doUpload().then(() => setUploading(false))}/>
         <Button variant="outlined" component="span" disabled={uploading}>Upload File</Button>
      </label>
      <Spacer/>
      <Button variant="text" onClick={() => setChatVisible(false)}>
        X
      </Button>
    </Flex>
    <Box bg='black' flex={1} m={2} overflowX='hidden' overflowY="auto">
      <ChatList chatState={chatState}/>
      <div ref={myRef}/>
    </Box>
    <Select data-testid="playerList" variant="filled" placeHolder='Everyone' on
            onChange={item => handleChangeList(item.target.value)}>
      <option> Everyone</option>
      {proximityOption}
      {playersList.map(player => (
        <option key={player.id}> {player.userName} </option>
      ))}
    </Select>
    <Flex direction='row'>
      <Input data-testid="chatInput" placeholder="Chat input"
             value={chatInput}
             onChange={event => setChatInput(event.target.value)}
             onFocus={() => video?.pauseGame()}
             onBlur={ () => video?.unPauseGame()}
             onKeyDown={event => handleKeyDownEvents(event)}/>
      <Spacer flex={1}/>
      <Button data-testid="sendChat" onClick={() => sendMessage(chatInput)} variant="outlined"
              >Send</Button>
    </Flex>
  </Flex>
}

export default ChatPanel;
