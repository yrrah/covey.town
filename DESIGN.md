# DESIGN.md

## Backend

1) CoveyTypes.ts
>• Added new types for payload such as [ChatData](https://github.com/yrrah/covey.town/blob/93ef479a0205c2c13bacedecc50bfdf4105cd172/services/roomService/src/CoveyTypes.ts#L19-L27), [ReceivingPlayerID](https://github.com/yrrah/covey.town/blob/93ef479a0205c2c13bacedecc50bfdf4105cd172/services/roomService/src/CoveyTypes.ts#L9-L11), [SecretKeySet](https://github.com/yrrah/covey.town/blob/93ef479a0205c2c13bacedecc50bfdf4105cd172/services/roomService/src/CoveyTypes.ts#L13-L15), and [ChatType](https://github.com/yrrah/covey.town/blob/93ef479a0205c2c13bacedecc50bfdf4105cd172/services/roomService/src/CoveyTypes.ts#L2)


2) CoveyTownListener.ts
>• Added a new function [‘onMessageSent’](https://github.com/yrrah/covey.town/blob/93ef479a0205c2c13bacedecc50bfdf4105cd172/services/roomService/src/types/CoveyTownListener.ts#L31-L34) to send messages to all listeners.

>• The method takes in a ChatData type.


3) CoveyTownController.ts
>• Added a new function ['sendChatMessage'](https://github.com/yrrah/covey.town/blob/93ef479a0205c2c13bacedecc50bfdf4105cd172/services/roomService/src/lib/CoveyTownController.ts#L125-L131) to send the message to all the listeners connected to the room.

>• The method takes in a ChatData type that is passed to all the listeners connected to the room.



4) CoveyTownRequestHandler.ts

>• The [townSocketAdapter](https://github.com/yrrah/covey.town/blob/09865aef29a82139b19351ea53e1dd641278a7ba/services/roomService/src/requestHandlers/CoveyTownRequestHandlers.ts#L193-L195) is extended to allow the soket to emit the chat message to all other users. 

>• On receiving the 'newChatMessage' by the socket, the controller [calls the sendChatMessage function](https://github.com/yrrah/covey.town/blob/09865aef29a82139b19351ea53e1dd641278a7ba/services/roomService/src/requestHandlers/CoveyTownRequestHandlers.ts#L239-L243) to send the chat data to all the listeners connected to that controller.

5) router/files.ts
>• Added this file containing REST endpoints for file upload & download

6) db.ts 
>• Added this file containing functions to create a shared, persistent connection to the Mongo Database and to cleanup and close the connection upon shutdown. 

7) server.ts
>• Added call to connect to MongoDB  
>• Added call to add file upload/download REST routes  
>• Added a cleanup function that is called when the server shuts down to close all open connections  
>• Also [changed the signal](https://github.com/yrrah/covey.town/blob/fb75849fbd649ecfd75e9b019c54ce9dfba968b2/services/roomService/package.json#L22) sent by nodemon when it restarts due to code changes to 'SIGINT' to avoid EADDRINUSE errors. With the default signal it would not wait for the server to close connections before starting a new instance.  

8) Dependencies Added
>• busboy  
>• mongodb  
>• supertest  

## Frontend

1) App.tsx
>• Moved CoveyAppState logic (unmodified) to components/Town/TownLogic.ts  
>• Moved the town page to components/Town/TownPage.tsx  
>• In the GameController function, added setup of a chatStateReducer similar to appStateReducer (ChatLogic.ts)

2) components/Town/TownPage.tsx
>• Pulled MenuBar component up out of VideoOverlay and moved it to the top of the page
>• Added collapisble chat window (ChatPanel.tsx)
>• Added a menu button for chat that gets passed to MenuBar as a prop

3) components/Town/WorldMap.ts
>• moved from components/world folder  
>• [changed scaling](https://github.com/yrrah/covey.town/blob/e3ff46acd87158677948ebb37f87dcd428880a35/frontend/src/components/Town/WorldMap.tsx#L444) of the game map so that it would be responsive to the chat opening or window resizing

4) components/VideoCall/VideoFrontend/components/MenuBar/MenuBar.tsx
>• moved instantiation of this menu from VideoOverlay.tsx to TownPage.tsx  
>• added a chat button  
>• made the menu collapsible and responsive to chat opening and window resizing  

5) components/VideoCall/VideoFrontend/components/SnackBar/Snackbar.tsx  
>• changed display location to top left so it doesn't cover up chat   

6) components/Chat/ChatLogic.ts  
>• Added this file that handles communication with the socket for chat messages  

7) components/Chat/ChatPanel.tsx  
>• Added this component that is the main chat window  
