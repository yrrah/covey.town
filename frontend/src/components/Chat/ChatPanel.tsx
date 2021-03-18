import React from 'react';

import {
  Button,
} from '@chakra-ui/react';

const ChatPanel: React.FunctionComponent = () => {
  const someText = "Placeholder text";

  return <>
    <span>{someText}</span>
    <Button variant="outline" mr={3} >Cancel</Button>
    <Button color="blue">Save</Button>
  </>
}

export default ChatPanel;
