All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2024-10-14] -[2024-10-22]

### Added

- `Breakout Rooms` : Implementing Breakout room functionality
- Added Breakout room side bar new functionality so user can add the new participant.
- Added the functionality to send the invitation to the participant from the side bar.
- Added the functionality to send the `HelpRequestToMainRoom` message from the breakout room to the main room
- Added the functionality when the host clicks on the requestHelp message button then it will join the breakout room to help the participant in the breakoutRoom.
- Automatic and manual Selection of Participants in `BreakoutRoom`
- Unit testing

### Fixed

- when the host click on the `requestHelpButton` then it will not join that particular breakoutRoom where helpRequest received. So i have fixed that issue.
- when the late comer join the breakout room then it will not added to that particular BreakoutRoom and create a new BreakoutRoom is fixed.

### Changed

- change the `SendMessageToBreakoutRoom` Form to send the message to the breakout room.

## [2024-10-23]

### Changed

- Change the business logic into ngrx `BreakoutRooms`

## [2024-10-26] -[2024-11-04]

### Changed

- **Refactored Component Logic to NgRx**:
  - Shifted existing component logic to leverage NgRx, reducing direct manipulation of component state and centralizing logic in the store for improved testability and performance.

### Added

- **NgRx Store Configuration**:

  - Migrated component business logic to use NgRx for a more robust and scalable state management solution. This includes actions, reducers, and selectors for handling UI and data flow.
  - Introduced NgRx selectors and effects for managing the LiveKit project's state, enhancing maintainability and separation of concerns.

- **Unit Testing**:

  - Added comprehensive unit tests for the LiveKit project, covering:
    - **NgRx Store**: Verified actions, reducers, and selectors to ensure the store behaves as expected.
    - **Service File**: Tested livekit service methods to confirm reliable and correct interactions with backend logic.
    - **Component File**: Validated livekit component interactions, including UI updates in response to NgRx store changes.

## [2024.08.05]

### Added

- **PiP Mode**:
  - Introduced Picture-in-Picture (PiP) mode support for enhanced multitasking. Users can now view a separate, smaller PiP window containing the main video feed and controls.
- **Icon Synchronization**:
  - Implemented logic to synchronize icons (Video, Mic, Raise Hand) between the main interface and PiP window to maintain consistent UI states.

### Changed

- **Button Interactions in PiP Window**:
  - Updated the `updatePiPWindow()` method to ensure all interactive buttons in the PiP window correctly trigger associated functions in the main application.
  - Enhanced PiP event listeners to toggle appropriate icons within the PiP window based on observable or direct state changes.

### Fixed

- **Toggle State Issues**:
  - Resolved issue with `Raise Hand` icon not updating in the PiP window upon state change.
  - Ensured all icons for Video, Mic, and Raise Hand states reflect accurate states immediately without needing multiple clicks.
  - Corrected logic to apply `hand-raised` class dynamically in PiP window for `Raise Hand` button based on `localParticipant.handRaised`.

---

## [2024.08.10]

### Added

- **Base Functionality for PiP Window**:
  - Initial implementation of PiP mode, allowing users to pop out the main video and participant interface into a smaller floating window.

### Added

- **Button Event Listeners**:
  - Added interactive button listeners (Video, Mic, Raise Hand, and Leave Meeting) within PiP window, enabling full functionality outside the main interface.
