**FEATURES.md**

**User Stories:**

1.  As a **Player** , I need to send text chats to everyone in the Room (Public Chat)

- Click the &quot;Show Chat&quot; button on the top Navigation bar.
- The chat window should open up on the right side of the screen
- Ensure &quot;Everyone&quot; is selected in the dropdown menu above the Text input.
- Type in your desired text in the chat input and Click &quot;Send&quot; or hit Enter
- The message sent by &quot;Me&quot; is right aligned in the chat window and a green bubble
- Open Covey.town in one or more new windows to chat as other users and see that messages sent to &quot;Everyone&quot; are actually delivered to all the users in a town.

2 . As a **Player** I need to communicate privately with one other Player (Private Chat)

- Click the &quot;Show Chat&quot; button on the top Navigation bar.
- The chat window should open up on the right side of the screen
- Select the player&#39;s username in the dropdown menu above the Text input.
- Type in your desired text in the chat input and Click &quot;Send&quot; or hit Enter
- The message sent by &quot;Me&quot; is right aligned in the chat window and a green bubble
- Open Covey.town in a new window to chat as the other user and see that messages sent to that user are only delivered to them.
- The message is in a different color from the Public chat and there is an label &quot;Private Chat&quot; above the message to make it clear.
- No other client can read this message as the messages are encrypted and intended to be viewed only by the desired recipient.

3 . As a **Player** in a room, I would want to text chat only to the users in certain proximity around me. (Proximity Chat)

- Click the &quot;Show Chat&quot; button on the top Navigation bar.
- The chat window should open up on the right side of the screen
- Select the &quot;Proximity Chat&#39; option in the dropdown menu above the Text input.
- Type in your desired text in the chat input and Click &quot;Send&quot; or hit Enter
- The message sent by &quot;Me&quot; is right aligned in the chat window and a green bubble
- Open Covey.town one or more new windows to chat as other users and see that messages sent to that user are only delivered to them.
- The message is in a different color from the Public chat and there is an label &quot;Proximity Chat&quot; above the message to make it clear.
- No other client can read this message as the messages are encrypted and intended to be viewed only by the desired recipient.
- The recipients are only the players that are within the radius calculated to turn the video on for the players. The message is delivered to only these players.

4 . As a **Player** I need to share files with the room I am in

- Click the &quot;Show Chat&quot; button on the top Navigation bar.
- The chat window should open up on the right side of the screen
- Click the &quot;Upload File&quot; button on the top of the Chat Panel.
- Select your desired file from your File Explorer.
- The file is now sent to the desired recipients.
- The file name is hyperlinked in the chat, clicking it downloads the file.
- The behaviour of the chat bubble is the same as described above for each type of Chat (Public, Private or Proximity)

5 . As a **Player** I need to be able to save a copy of my chat messages

- Click the &quot;Show Chat&quot; button on the top Navigation bar.
- The chat window should open up on the right side of the screen
- After your desired chats are on the chat panel, Click on &quot;Save&quot;
- A txt file named ChatFile.txt is downloaded with the chat history of that user.

**Featured Added:**

1. Chat Panel

- Clicking on the &quot;Show Chat&quot; option on the top navigation course makes the Chat Panel visible.
- Clicking on &quot;Hide Chat&quot; or the &quot;X&quot; on the corner closes the Chat Panel.
- The Panel hosts all the features implemented by our group.
- The First row has the option to share files.
- The Dropdown has options to send Public, Private or Proximity chats.
- The &quot;Save&quot; button downloads a txt file with all the chats received by the client.

2 . Public Chat

- Functionality to chat with all the players in the town.
- A chat sent by Player 1 is sent to the server and the server through the already established socket connection, sends it to all the other players in the town.
- There is no encryption incase of public chat as all the recipients are allowed to view the message.
- Pressing Enter sends a new message
- When a new message arrives, the chat window auto scrolls to the latest message.
- When this option is selected, files sent are received by all the players in the town.

3 . Private Chat

- Functionality to chat with a player individually in the same town.
- The dropdown is updated every time a new player enters the town or a player leaves the town.
- The drop down allows us to select the recipient of the chat.
- The messages are send to all the sockets like in Public chat, but the messages are encrypted
- The message can be decrypted only by the intended user.
- The messages are labeled as &quot;Private Chat&quot; and are in a different color from the public chats so that the recipient can tell them apart.
- When this option is selected, files sent are received by only that player.

4 . Proximity Chat

- Functionality to chat with players within a radius of the sending player.
- The list of players within the proximity is updated every time a player moves.
- If there are no players within the desired proximity of a player, they are not shown the &quot;Proximity Chat&quot; option in the dropdown.
- The messages are send to all the sockets like in Public chat, but the messages are encrypted
- The message can be decrypted only by the intended users.
- The recipient list is calculated at the time of sending the message.
- The messages are labeled as &quot;Proximity Chat&quot; and are in a different color from the public chats so that the recipient can tell them apart.
- When this option is selected, files sent are received by only those players.

5 . File Sharing

- Functionality to allow the users to share files among the players in a room
- The recipients can be selected the same way a text chat&#39;s recipients are selected.
- File types are limited to text files, images, word documents, PDFs, powerpoint, spreadsheets. The family type filter is added to not allow the user to send potentially harmful files.
- The player clicks the &quot;Upload File&quot; button and the File selector opens. On selecting a file, it is sent to the desired recipients.
- The file name is hyperlinked in a chat bubble (color coded according to the chat type)
- Clicking the hyperlink downloads the file.
- The files are stored in a MongoDB database, and we added REST endpoints to allow upload and download of files.

6 . Save the Chat

- Functionality to save the messages currently in the chat window.
- The data in a chat panel is different for every player depending on the time they entered the town and the different types of chats exchanged.
- When a player clicks the &quot;Save&quot; button, all the messages in the Chat panel are extracted into a .txt file and this is downloaded and saved locally.
- This has all the messages and the sender details.

7 . Encryption

- As mentioned above, the private and proximity chats are sent to all the players in the room but can be read only by the intended recipients.
- The payload containing the message and the receiving player ids are sent to all the players in the room.
- Receiving player id is undefined for Public chats, one id for Private chat and multiple ids for the Proximity Chat.
- As the public chats are intended to be read by everyone, they are not encrypted.
- We use AES encryption. The messages are encrypted with a randomly generated key and this key is concatenated with the key identifier.
- This is then encrypted with the receiving player ids. A list of these encrypted keys is attached to the payload.
- The client used their player id to decrypt the key and then the decrypted key is used to decrypt the message.
- Examination of the messages sent through the Web Sockets shows us that only the public chats can be read by everyone.

8 . Keys when focused on Chat Input

- As some of the keys are used to control the players in the town, typing in the chat input would make the characters move.
- When the chat panel is open, the movement of players is temporarily disabled.
- Closing the chat panel resumes normal working of the town.

9 . UI - Auto Scroll, Chat Bubbles, Wrap the text

- We added a few more UI enhancements to improve the usability of the application
- When a player receives a new message, the chat panel auto scrolls to show the new message.
- The chat bubbles are right aligned for the sending player.
- Proximity and Private chats are labeled to differentiate them from the public chats. These chats are also in different colored bubbles on the receiving end.
- The text in a message is wrapped for aesthetics. No more than 32 chars are allowed, if more than that the text is wrapped to the next line.
