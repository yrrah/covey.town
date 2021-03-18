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
  container: {
    backgroundColor: theme.palette.background.default,
    bottom: 20,
    left: 0,
    right: 0,
    // height: `${theme.footerHeight}px`,
    // position: 'absolute',
    // display: 'flex',
    padding: '0 1.43em',
    zIndex: 10,
    [theme.breakpoints.down('sm')]: {
      height: `${theme.mobileFooterHeight}px`,
      padding: 0,
    },
  },
  screenShareBanner: {
    position: 'absolute',
    zIndex: 10,
    bottom: `${theme.footerHeight}px`,
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

export default function MenuBar(props: { chatButton: JSX.Element; setMediaError?(error: Error): void }) {
  const classes = useStyles();
  const { isSharingScreen, toggleScreenShare } = useVideoContext();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const [hamburger, setHamburger] = React.useState(false);
  const toggleHamburger = () => setHamburger(!hamburger);

// derived from https://github.com/chakra-ui/chakra-ui/issues/298
  function MenuItem(props: { children: React.ReactNode; }):JSX.Element {
    const {children} = props;
    return (
      <Box display={{ sm: hamburger ? "block" : "none", md:"block"}}>
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
      <footer className={classes.container}>
        <Flex as="nav" align="center">
          <Box flex={1} display={{ md: "none" }} width="100%" padding="10px" onClick={toggleHamburger}>
            <svg
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
                templateColumns={{ sm: "repeat(3, 1fr)", md: "repeat(8, 1fr)" }}
          >
            <ToggleAudioButton disabled={isReconnecting} setMediaError={props.setMediaError} />
            <ToggleVideoButton disabled={isReconnecting} setMediaError={props.setMediaError} />
            <Hidden mdUp>
              <EndCallButton />
            </Hidden>
            <Hidden smDown>
              {!isSharingScreen && <ToggleScreenShareButton disabled={isReconnecting} />}
            </Hidden>
            <MenuItem>{props.chatButton}</MenuItem>
            <MenuItem><TownSettings /></MenuItem>
            <MenuItem><Menu /></MenuItem>
            <MenuItem><FlipCameraButton /></MenuItem>
            <Hidden smDown>
              <EndCallButton />
            </Hidden>
          </Grid>
        </Flex>
      </footer>
    </>
  );
}
