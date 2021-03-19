import React from 'react';

import {
  Button,
  Select,
  Flex,
  Spacer,
  Box,
  Input
} from '@chakra-ui/react';


const ChatPanel: React.FunctionComponent = () => {
  const someText = "Placeholder text";

  return <Flex bg='lightgrey' direction='column' height='100%'>
    <Flex justify='flex-end'>
      <Button colorScheme="teal" variant="ghost">
        X
      </Button>
    </Flex>
    <Box bg='white' flex={1} m={2}>
      <span>{someText}</span>
    </Box>
    <Select variant="filled" placeholder="Player List" />
    <Select variant="filled" placeholder="Chat Mode" />
    <Flex direction='row'>
      <Input placeholder="Basic usage" />
      <Spacer flex={1} />
      <Button color="blue">Send</Button>
    </Flex>
  </Flex>
}

export default ChatPanel;
