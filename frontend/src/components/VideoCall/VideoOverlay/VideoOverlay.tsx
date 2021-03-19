/* eslint-disable */
import React, { useEffect, useRef } from 'react';
import { styled, Theme } from '@material-ui/core/styles';

import { Room as TwilioRoom } from 'twilio-video';

import { Prompt } from 'react-router-dom';
import Room from '../VideoFrontend/components/Room/Room';
import ReconnectingNotification from '../VideoFrontend/components/ReconnectingNotification/ReconnectingNotification';
import useRoomState from '../VideoFrontend/hooks/useRoomState/useRoomState';
import useLocalAudioToggle from '../VideoFrontend/hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../VideoFrontend/hooks/useVideoContext/useVideoContext';
import useLocalVideoToggle from '../VideoFrontend/hooks/useLocalVideoToggle/useLocalVideoToggle';
import './VideoGrid.scss';
import MediaErrorSnackbar from '../VideoFrontend/components/PreJoinScreens/MediaErrorSnackbar/MediaErrorSnackbar';
import usePresenting from '../VideoFrontend/components/VideoProvider/usePresenting/usePresenting';
import useMaybeVideo from '../../../hooks/useMaybeVideo';

const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: '1fr auto',
});

const Main = styled('main')(({ theme: _theme }: { theme: Theme }) => ({
  overflow: 'hidden',
  // position: 'relative',
}));

interface Props {
  highlightedProfiles?: string[];
  hexColour?: string;
  preferredMode: 'sidebar' | 'fullwidth';
  mediaError: Error | undefined;
  setMediaError: Function;
  onPresentingChanged?(presenting: boolean): void;
}

export default function VideoGrid(props: Props) {
  const { room } = useVideoContext();
  const roomState = useRoomState();
  const coveyController = useMaybeVideo();

  const { stopAudio } = useLocalAudioToggle();
  const { stopVideo } = useLocalVideoToggle();
  const unmountRef = useRef<() => void>();
  const unloadRef = useRef<EventListener>();
  const existingRoomRef = useRef<TwilioRoom | undefined>();
  const presenting = usePresenting();

  let coveyRoom = coveyController?.coveyTownID;
  if (!coveyRoom) coveyRoom = 'Disconnected';
  useEffect(() => {
    function stop() {
      try {
        stopAudio();
      } catch {}

      try {
        stopVideo();
      } catch {}

      try {
        if (roomState === 'connected' || roomState === 'reconnecting') {
          room.disconnect();
        }
      } catch {}
    }

    unmountRef.current = () => {
      stop();
    };
    unloadRef.current = (ev) => {
      ev.preventDefault();
      stop();
    };
  }, [room, roomState, stopAudio, stopVideo]);

  useEffect(() => () => {
    if (unmountRef && unmountRef.current) {
      unmountRef.current();
    }
  }, []);

  useEffect(() => {
    if (unloadRef && unloadRef.current) {
      window.addEventListener('beforeunload', unloadRef.current);
    }
    return () => {
      if (unloadRef && unloadRef.current) window.removeEventListener('beforeunload', unloadRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      existingRoomRef.current
            && (room.sid !== existingRoomRef.current.sid || coveyRoom !== existingRoomRef.current.sid)
    ) {
      if (existingRoomRef.current.state === 'connected') {
        existingRoomRef.current.disconnect();
      }
    }
    existingRoomRef.current = room;
  }, [room.sid, room, coveyRoom]);

  useEffect(() => {
    const isPresenting = presenting === 'presenting';
    if (props.onPresentingChanged) {
      props.onPresentingChanged(isPresenting);
    }
  }, [presenting, props]);

  return (
    <>
      <Prompt when={roomState !== 'disconnected'} message="Are you sure you want to leave the video room?" />
      <Container style={{ height: '100%' }} className="video-grid">
        {roomState === 'disconnected' ? (
        // <PreJoinScreens room={{id: coveyRoom, twilioID: coveyRoom}} setMediaError={setMediaError} />
          <div>Error</div>
        ) : (
          <Main>
            <ReconnectingNotification />
            <Room />
          </Main>
        )}
        <MediaErrorSnackbar error={props.mediaError} dismissError={() => props.setMediaError(undefined)} />
      </Container>
    </>
  );
}
