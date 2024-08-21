# Breakout Rooms Implementation Plan

## Overview

Breakout rooms are a feature that allows participants in a larger meeting to split into smaller groups for discussions or activities. This document outlines the plan to implement breakout rooms in a LiveKit-based application.

## Objectives

- **Create Breakout Rooms:** Allow the host to create multiple breakout rooms within an ongoing meeting.
- **Manage Participants:** Provide the ability to move participants between the main room and breakout rooms.
- **Timers & Notifications:** Implement timers for breakout sessions and notifications for participants when the session is about to end.
- **Merge & Close Rooms:** Allow the host to merge breakout rooms back into the main room or close them entirely.
- **Recording:** Ensure breakout sessions can be recorded, if needed.
- **Dynamic UI Updates:** Update the UI dynamically to reflect the breakout room states and participant movements.

## Implementation Steps

### 1. **Room Creation & Management**

- **Extend Room Model**:

  - Add support for creating sub-rooms within the main room.
  - Define a `BreakoutRoom` class that extends the existing `Room` class.

- **API Endpoints**:
  - Create API endpoints for managing breakout rooms:
    - `POST /rooms/:id/breakout`: Create breakout rooms.
    - `POST /rooms/:id/breakout/:breakoutId/join`: Join a specific breakout room.
    - `POST /rooms/:id/breakout/:breakoutId/close`: Close a breakout room and move participants back to the main room.

### 2. **Participant Management**

- **Joining/Moving Participants**:

  - Implement the ability for the host to move participants between rooms.
  - Develop a `moveParticipant` function that handles the transition of participants between the main room and breakout rooms.

- **User Interface**:
  - Create a UI panel that allows the host to see all participants and their current rooms.
  - Add drag-and-drop functionality to move participants between rooms.

### 3. **Timers & Notifications**

- **Breakout Session Timer**:

  - Implement a timer that counts down the breakout session duration.
  - Provide options for the host to extend or end the session early.

- **Participant Notifications**:
  - Notify participants when the session is about to end (e.g., with a pop-up or banner).
  - Automatically move participants back to the main room when the timer ends.

### 4. **Merge & Close Rooms**

- **Merging Rooms**:

  - Allow the host to merge multiple breakout rooms into one.
  - Implement a `mergeRooms` function that handles the merging process, combining participants and chat histories.

- **Closing Rooms**:
  - Develop functionality to close breakout rooms and return all participants to the main room.
  - Ensure that any ongoing sessions in breakout rooms are gracefully ended.

### 5. **Recording Breakout Sessions**

- **Recording Support**:
  - Integrate recording capabilities for breakout rooms.
  - Ensure that breakout sessions are recorded separately from the main room, with clear file naming and storage.

### 6. **Dynamic UI Updates**

- **UI/UX Enhancements**:
  - Update the UI to reflect the state of breakout rooms dynamically (e.g., room creation, participant movement).
  - Implement real-time updates using WebSocket or similar technologies to ensure all participants see the current room states.

### 7. **Testing**

- **Unit Tests**:
  - Write unit tests for breakout room creation, participant management, and room merging/closing.
