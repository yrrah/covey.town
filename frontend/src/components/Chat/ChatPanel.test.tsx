/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ChakraProvider } from '@chakra-ui/react';
import React, { useReducer } from 'react';
import '@testing-library/jest-dom'
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import { nanoid } from 'nanoid';
import { TargetElement } from '@testing-library/user-event';
import ChatPanel from './ChatPanel';
import TownsServiceClient from '../../classes/TownsServiceClient';
import { ChatState, ChatUpdate } from '../../CoveyTypes';
import { chatStateReducer, defaultChatState } from "../Chat/ChatLogic";
import CoveyAppContext from '../../contexts/CoveyAppContext';
import { Socket } from 'socket.io-client';

const mockUseCoveyAppState = jest.fn(() => (Promise.resolve()));
const mockToast = jest.fn();
const mockUseDisclosure = {isOpen: true, onOpen: jest.fn(), onClose: jest.fn()};

jest.mock('../../classes/TownsServiceClient');
jest.mock('../../hooks/useCoveyAppState', () => ({
  __esModule: true, // this property makes it work
  default: () => (mockUseCoveyAppState)
}));
jest.mock("@chakra-ui/react", () => {
  const ui = jest.requireActual("@chakra-ui/react");
  return {
    ...ui,
    useToast: ()=>(mockToast),
    useDisclosure: ()=>(mockUseDisclosure),
  };
})
const [chatState, updateChatState] = useReducer(chatStateReducer, defaultChatState());
// @ts-ignore
mockUseCoveyAppState.apiClient = new TownsServiceClient();

function wrappedChatPanel() {
  return <ChakraProvider><CoveyAppContext.Provider value={{
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
    currentTownID: '',
    currentTownFriendlyName: '',
    currentTownIsPubliclyListed: false,
    sessionToken: '',
    userName: '',
    socket: null,
    currentLocation: {
      x: 0,
      y: 0,
      rotation: 'front',
      moving: false,
    },
    emitMovement: () => {
    },
    apiClient: new TownsServiceClient(),
  }}>
    <ChatPanel chatState={chatState} updateChatState={updateChatState}/></CoveyAppContext.Provider></ChakraProvider>;
}

describe('Tests for Chat Panel', () => {
  let renderData: RenderResult;
  let userListDropdown: HTMLInputElement;
  let chatTypeDropdown: HTMLInputElement;
  let inputTextField: HTMLInputElement;
  let sendButton: TargetElement;

  const openSettingsPane = async (params: { friendlyName: string, isPubliclyListed: boolean, townID: string }) => {
    // @ts-ignore
    mockUseCoveyAppState.currentTownID = params.townID;
    // @ts-ignore
    mockUseCoveyAppState.currentTownFriendlyName = params.friendlyName;
    // @ts-ignore
    mockUseCoveyAppState.currentTownIsPubliclyListed = params.isPubliclyListed;
    renderData = render(wrappedChatPanel());
    // const openMenuButton = renderData.getByTestId('openMenuButton');
    // fireEvent.click(openMenuButton);
    await waitFor(() => (renderData.getByTestId('playerList')));
    userListDropdown = renderData.getByTestId('playerList') as HTMLInputElement;
    chatTypeDropdown = renderData.getByTestId('chatMode') as HTMLInputElement;
    inputTextField = renderData.getByTestId('chatInput') as HTMLInputElement;
    sendButton = renderData.getByTestId('sendChat');
  }
  beforeEach(async () => {
    mockUseDisclosure.onClose.mockReset();
  });
  it("Checks if message has been displayed correctly", async () => {
    
  });
})
