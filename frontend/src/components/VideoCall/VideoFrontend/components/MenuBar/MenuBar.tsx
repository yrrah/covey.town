import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Box, Flex, Button, Grid} from "@chakra-ui/react";
import { Typography, Hidden } from '@material-ui/core';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import FlipCameraButton from './FlipCameraButton/FlipCameraButton';
import Menu from './Menu/Menu';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import ToggleScreenShareButton from '../Buttons/ToogleScreenShareButton/ToggleScreenShareButton';
import TownSettings from '../../../../Login/TownSettings';

const useStyles = makeStyles((theme: Theme) => createStyles({
  screenShareBanner: {
    position: 'fixed',
    zIndex: 10,
    bottom: 0,
    left: 0,
    right: 0,
    height: '104px',
    background: 'rgba(0, 0, 0, 0.5)',
    '& h6': {
      color: 'white',
    },
    '& button': {
      background: 'white',
      color: theme.brand,
      border: `2px solid ${theme.brand}`,
      margin: '0 2em',
      '&:hover': {
        color: '#600101',
        border: '2px solid #600101',
        background: '#FFE9E7',
      },
    },
  },
  hideMobile: {
    display: 'initial',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

export default function MenuBar(props: { chatVisible: boolean, chatButton: JSX.Element; setMediaError?(error: Error): void }) {
  const classes = useStyles();
  const { isSharingScreen, toggleScreenShare } = useVideoContext();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const [hamburger, setHamburger] = React.useState(false);
  const toggleHamburger = () => setHamburger(!hamburger);
  const {chatVisible} = props

// derived from https://github.com/chakra-ui/chakra-ui/issues/298
  function MenuItem(props: { children: React.ReactNode; chatButton?: boolean }):JSX.Element {
    const {children, chatButton} = props;
    return (
      <Box display={{ sm: hamburger ? "block" : "none", md:(!chatVisible || hamburger || chatButton) ? "block" : "none"}}>
        {children}
      </Box>
    );
  }

  return (
    <>
      {isSharingScreen && (
        <Grid container justify="center" alignItems="center" className={classes.screenShareBanner}>
          <Typography variant="h6">You are sharing your screen</Typography>
          <Button onClick={() => toggleScreenShare()}>Stop Sharing</Button>
        </Grid>
      )}
        <Flex as="nav" align="center" style={{padding: '0 1.43em'}}>
          <Box flex={1}  display={{ md: chatVisible ? "block" : "none" }} width="100%" padding="10px" onClick={toggleHamburger}>
            <svg
              style={{position:'relative', top: '5px', left:'10px'}}
              fill="black"
              width="30px"
              height="30px"
              viewBox="0 3 20 14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </Box>
          <Grid  style={{background:'white'}} alignItems="center"
                templateColumns={{ sm: "repeat(3, 1fr)", md: chatVisible ? "repeat(4, 1fr)" : "repeat(8, 1fr)" }}
          >
            <ToggleAudioButton disabled={isReconnecting} setMediaError={props.setMediaError} />
            <ToggleVideoButton disabled={isReconnecting} setMediaError={props.setMediaError} />
            <Hidden mdUp>
              <EndCallButton />
            </Hidden>
            <MenuItem chatButton={true}>{props.chatButton}</MenuItem>
             {!isSharingScreen && <MenuItem><ToggleScreenShareButton disabled={isReconnecting} /></MenuItem>}
            <MenuItem><TownSettings /></MenuItem>
            <MenuItem><Menu /></MenuItem>
            <MenuItem><FlipCameraButton /></MenuItem>
            {isSharingScreen && <MenuItem>&nbsp;</MenuItem>}
            <Hidden smDown>
              <EndCallButton />
            </Hidden>
          </Grid>
        </Flex>
    </>
  );
}
