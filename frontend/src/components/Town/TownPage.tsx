import React, { useState } from "react";
import { Typography } from "@material-ui/core";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import MenuItem from "@material-ui/core/MenuItem";

import { ChatState, ChatUpdate } from "../../CoveyTypes";
import MenuBar from "../VideoCall/VideoFrontend/components/MenuBar/MenuBar";
import WorldMap from "./WorldMap";
import ChatPanel from "../Chat/ChatPanel";
import VideoOverlay from "../VideoCall/VideoOverlay/VideoOverlay";

export default function TownPage(props: { chatState: ChatState, updateChatState: React.Dispatch<ChatUpdate> }):JSX.Element{
  const { chatState, updateChatState } = props;
  const [chatVisible, setChatVisible] = useState(false);
  const [mediaError, setMediaError] = useState<Error>();

  const chatButton = (
    <MenuItem onClick={() => setChatVisible(!chatVisible)}>
      <Typography variant="body1">{chatVisible ? <span>Hide Chat</span> :
        <span>Show Chat</span>}</Typography>
    </MenuItem>);

  return (
    <Flex wrap='wrap'>
      <Grid width='100%' templateColumns={chatVisible ? "repeat(10, 1fr)" : "repeat(7, 1fr)"}>
        <GridItem colSpan={7}>
          <Box position='relative'><MenuBar chatVisible={chatVisible} chatButton={chatButton}
                                            setMediaError={setMediaError}/></Box>
          <Box flex={1}> <WorldMap/></Box>
        </GridItem>
        {chatVisible &&
        <GridItem colSpan={3}>
          <ChatPanel chatState={chatState} setChatVisible={setChatVisible} updateChatState={updateChatState}/>
        </GridItem>
        }
      </Grid>
      <Box position='relative' bottom={0} height='100%' width='100%'><VideoOverlay
        mediaError={mediaError} setMediaError={setMediaError} preferredMode="fullwidth"/></Box>
    </Flex>
  );
}
