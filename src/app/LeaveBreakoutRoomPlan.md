# Plan: Redirect Participant from Breakout Room to Main Room

## Objective

Enable participants in a breakout room to leave the room and join the main room upon clicking the "Leave" button in the LiveKit video conferencing project.

## Steps to Implement

### 1. **UI/UX Design**

- Add a `Leave Breakout Room` button to the breakout room interface.
- Use a confirmation modal to ask participants if they want to leave the breakout room and join the main room.

### 2. **Backend Updates**

- Ensure the backend supports reassigning participants from breakout rooms to the main room.
- Maintain the state of active rooms and participants.

### 3. Identify Participant's Current Room

- Use the LiveKit SDK to check the participant's current room status when they leave a breakout room.
- Track the participant's roomId and ensure it's cleared upon leaving the breakout room.

### 4. Trigger Redirection Logic

- Listen for the _Leave Breakout Room_ event:
- Define the isInBreakoutRoom function to validate if the participant was in a breakout room.

### 5. Join the Main Room

- Use the connect function provided by LiveKit to connect the participant to the main room.

### 6. Handle UI Updates

- Notify the user that they are being redirected to the main room.
- Show a message during the transition.

### 7. Manage Errors

- If redirection fails, notify the user and provide an option to retry:

### 8. Test Cases

- _Scenario 1:_ A participant leaves the breakout room and is successfully redirected to the main room.
- _Scenario 2:_ Network interruption during redirection.
- _Scenario 3:_ Participant is already in the main room and attempts to leave the breakout room.

#### API Requirements:

- Endpoint to update the participant's room:
  - **Request**: `{ participantId: string, targetRoom: string }`
  - **Response**: `success` or `error` message.
- Update the token to include the new room assignment.
