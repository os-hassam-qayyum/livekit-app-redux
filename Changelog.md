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
