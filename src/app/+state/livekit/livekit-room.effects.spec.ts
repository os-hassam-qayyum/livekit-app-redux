// import { TestBed } from '@angular/core/testing';
// import { provideMockActions } from '@ngrx/effects/testing';
// import { Observable, of, throwError } from 'rxjs';
// import { LivekitService } from '../../livekit.service';
// import * as LiveKitRoomActions from './livekit-room.actions';
// import { Action, Store, StoreModule } from '@ngrx/store';
// import { LiveKitRoomEffects } from './livekit-room.effects';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MockStore, provideMockStore } from '@ngrx/store/testing';
// import { HttpClientModule } from '@angular/common/http';
// import { liveKitRoomReducer } from './livekit-room.reducer';
// import {
//   selectNextRoomIndex,
//   selectBreakoutRoomsData,
// } from './livekit-room.selectors';
// import { MeetingService } from 'src/app/meeting.service';
// import { Room } from 'livekit-client';
// import { BreakoutRoomService } from 'src/app/breakout-room.service';

// describe('LiveKitRoomEffects', () => {
//   let actions$: Observable<Action>;
//   let effects: LiveKitRoomEffects;
//   let livekitService: jasmine.SpyObj<LivekitService>;
//   const initialState = { nextRoomIndex: 1 };
//   let store: MockStore;
//   let breakoutRoomService: jasmine.SpyObj<BreakoutRoomService>;
//   let snackBar: jasmine.SpyObj<MatSnackBar>;
//   let meetingService = jasmine.createSpyObj('MeetingService', [
//     'createMeeting',
//   ]);

//   beforeEach(() => {
//     const livekitServiceSpy = jasmine.createSpyObj('LiveKitService', [
//       'connectToRoom',
//       'toggleScreenShare',
//       'toggleVideo',
//       'toggleMicrophone',
//       'enableCameraAndMicrophone',
//       'disconnectRoom',
//       'sendChatMessage',
//       'sendMessageToBreakoutRoom',
//       'sendMessageToMainRoom',
//       'breakoutRoomAlert',
//     ]);
//     livekitServiceSpy.breakoutRoomsDataUpdated = {
//       emit: jasmine.createSpy('emit'),
//     };
//     const breakoutRoomServiceSpy = jasmine.createSpyObj(
//       'BreakoutRoomService',
//       []
//     );
//     const storeSpy = jasmine.createSpyObj('Store', ['select']);
//     const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

//     TestBed.configureTestingModule({
//       imports: [MatSnackBarModule, HttpClientModule, StoreModule.forRoot({})],
//       providers: [
//         LiveKitRoomEffects,
//         provideMockActions(() => actions$),
//         provideMockStore({ initialState }),
//         { provide: LivekitService, useValue: livekitServiceSpy },
//         {
//           provide: MatSnackBar,
//           useValue: jasmine.createSpyObj('MatSnackBar', ['open']),
//         },
//         { provide: BreakoutRoomService, useValue: breakoutRoomServiceSpy },
//         { provide: Store, useValue: storeSpy },
//         { provide: MatSnackBar, useValue: snackBarSpy },
//       ],
//     });

//     effects = TestBed.inject(LiveKitRoomEffects);
//     livekitService = TestBed.inject(
//       LivekitService
//     ) as jasmine.SpyObj<LivekitService>;
//     breakoutRoomService = TestBed.inject(
//       BreakoutRoomService
//     ) as jasmine.SpyObj<BreakoutRoomService>;
//     snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
//     store = TestBed.inject(Store) as MockStore;
//     livekitService = TestBed.inject(
//       LivekitService
//     ) as jasmine.SpyObj<LivekitService>;
//     meetingService = TestBed.inject(
//       MeetingService
//     ) as jasmine.SpyObj<MeetingService>;
//   });

//   it('should dispatch startMeeting on successful meeting creation', (done) => {
//     const action = LiveKitRoomActions.MeetingActions.createMeeting({
//       roomName: 'test-room',
//       participantNames: ['participant1', 'participant2'],
//     });

//     const response = { token: 'token1' };
//     meetingService.createMeeting.and.returnValue(of(response)); // Mocking the service call

//     const expectedAction = LiveKitRoomActions.LiveKitActions.startMeeting({
//       wsURL: 'wss://hassam-app-fu1y3ybu.livekit.cloud',
//       token: response.token,
//     });

//     actions$ = of(action);

//     effects.createMeeting$.subscribe((result) => {
//       expect(result).toEqual(expectedAction); // Check that the correct action is dispatched
//       done();
//     });
//   });

//   it('should dispatch createMeetingFailure on error', (done) => {
//     const action = LiveKitRoomActions.MeetingActions.createMeeting({
//       roomName: 'test-room',
//       participantNames: ['participant1', 'participant2'],
//     });

//     const error = new Error('Failed to create meeting');
//     meetingService.createMeeting.and.returnValue(of({ error })); // Mocking the error response

//     const expectedFailureAction =
//       LiveKitRoomActions.MeetingActions.createMeetingFailure({
//         error: error.message,
//       });

//     actions$ = of(action);

//     effects.createMeeting$.subscribe((result) => {
//       expect(result).toEqual(expectedFailureAction); // Check that failure action is dispatched
//       done();
//     });
//   });
//   describe('startMeeting$', () => {
//     it('should dispatch startMeetingSuccess on successful connection', (done) => {
//       const wsURL = 'wss://example.com';
//       const token = 'example-token';
//       const action = LiveKitRoomActions.LiveKitActions.startMeeting({
//         wsURL,
//         token,
//       });
//       const successAction =
//         LiveKitRoomActions.LiveKitActions.startMeetingSuccess();

//       actions$ = of(action);
//       livekitService.connectToRoom.and.returnValue(Promise.resolve());

//       effects.startMeeting$.subscribe((result) => {
//         expect(result).toEqual(successAction);
//         done();
//       });
//     });

//     it('should dispatch startMeetingFailure on failed connection', (done) => {
//       const wsURL = 'wss://example.com';
//       const token = 'example-token';
//       const error = new Error('Connection failed');
//       const action = LiveKitRoomActions.LiveKitActions.startMeeting({
//         wsURL,
//         token,
//       });
//       const failureAction =
//         LiveKitRoomActions.LiveKitActions.startMeetingFailure({
//           error: error.message,
//         });

//       actions$ = of(action);
//       livekitService.connectToRoom.and.returnValue(Promise.reject(error));

//       effects.startMeeting$.subscribe((result) => {
//         expect(result).toEqual(failureAction);
//         done();
//       });
//     });
//   });
//   describe('toggleScreenShare$', () => {
//     it('should dispatch toggleScreenShareSuccess on successful toggle', (done) => {
//       const isScreenSharing = true;
//       const action = LiveKitRoomActions.LiveKitActions.toggleScreenShare();
//       const successAction =
//         LiveKitRoomActions.LiveKitActions.toggleScreenShareSuccess({
//           isScreenSharing,
//         });

//       actions$ = of(action);
//       livekitService.toggleScreenShare.and.returnValue(
//         Promise.resolve(isScreenSharing)
//       );

//       effects.toggleScreenShare$.subscribe((result) => {
//         expect(result).toEqual(successAction);
//         done();
//       });
//     });

//     it('should dispatch toggleScreenShareFailure on failed toggle', (done) => {
//       const error = new Error('Toggle failed');
//       const action = LiveKitRoomActions.LiveKitActions.toggleScreenShare();
//       const failureAction =
//         LiveKitRoomActions.LiveKitActions.toggleScreenShareFailure({
//           error: error.message,
//         });

//       actions$ = of(action);
//       livekitService.toggleScreenShare.and.returnValue(Promise.reject(error));

//       effects.toggleScreenShare$.subscribe((result) => {
//         expect(result).toEqual(failureAction);
//         done();
//       });
//     });
//   });

//   describe('toggleVideo$', () => {
//     it('should dispatch toggleVideoSuccess on successful toggle', (done) => {
//       const isVideoOn = true;
//       const action = LiveKitRoomActions.LiveKitActions.toggleVideo();
//       const successAction =
//         LiveKitRoomActions.LiveKitActions.toggleVideoSuccess({
//           isVideoOn,
//         });

//       actions$ = of(action);
//       livekitService.toggleVideo.and.returnValue(of(isVideoOn));

//       effects.toggleVideo$.subscribe((result) => {
//         expect(result).toEqual(successAction);
//         done();
//       });
//     });

//     it('should dispatch toggleVideoFailure on failed toggle', (done) => {
//       const error = new Error('Toggle failed');
//       const action = LiveKitRoomActions.LiveKitActions.toggleVideo();
//       const failureAction =
//         LiveKitRoomActions.LiveKitActions.toggleVideoFailure({
//           error: error.message,
//         });

//       actions$ = of(action);
//       livekitService.toggleVideo.and.returnValue(throwError(error));

//       effects.toggleVideo$.subscribe((result) => {
//         expect(result).toEqual(failureAction);
//         done();
//       });
//     });
//   });

//   describe('toggleMicrophone$', () => {
//     it('should dispatch toggleMicSuccess on successful toggle', (done) => {
//       const isMicOn = true;
//       const action = LiveKitRoomActions.LiveKitActions.toggleMic();
//       const successAction = LiveKitRoomActions.LiveKitActions.toggleMicSuccess({
//         isMicOn,
//       });

//       actions$ = of(action);
//       livekitService.toggleMicrophone.and.returnValue(of(isMicOn));

//       effects.toggleMicrophone$.subscribe((result) => {
//         expect(result).toEqual(successAction);
//         done();
//       });
//     });

//     it('should dispatch toggleMicFailure on failed toggle', (done) => {
//       const error = 'Toggle failed'; // Use a string for consistency
//       const action = LiveKitRoomActions.LiveKitActions.toggleMic();
//       const failureAction = LiveKitRoomActions.LiveKitActions.toggleMicFailure({
//         error,
//       });

//       actions$ = of(action);
//       livekitService.toggleMicrophone.and.returnValue(throwError(error));

//       effects.toggleMicrophone$.subscribe((result) => {
//         expect(result).toEqual(failureAction);
//         done();
//       });
//     });
//   });

//   describe('enableCameraAndMicrophone$', () => {
//     it('should dispatch enableCameraAndMicrophoneSuccess on successful enable', (done) => {
//       const action =
//         LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophone();
//       const successAction =
//         LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneSuccess();

//       actions$ = of(action);
//       livekitService.enableCameraAndMicrophone.and.returnValue(
//         Promise.resolve()
//       ); // Simulate success with resolved Promise

//       effects.enableCameraAndMicrophone$.subscribe((result) => {
//         expect(result).toEqual(successAction);
//         done();
//       });
//     });

//     it('should dispatch enableCameraAndMicrophoneFailure on failed enable', (done) => {
//       const error = new Error('Enable failed');
//       const action =
//         LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophone();
//       const failureAction =
//         LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneFailure({
//           error: error.message,
//         });

//       actions$ = of(action);
//       livekitService.enableCameraAndMicrophone.and.returnValue(
//         Promise.reject(error)
//       ); // Simulate failure with rejected Promise

//       effects.enableCameraAndMicrophone$.subscribe((result) => {
//         expect(result).toEqual(failureAction);
//         done();
//       });
//     });
//   });
//   describe('leaveMeeting$', () => {
//     it('should dispatch leaveMeetingSuccess on successful disconnect', (done) => {
//       const action = LiveKitRoomActions.MeetingActions.leaveMeeting();
//       const successAction =
//         LiveKitRoomActions.MeetingActions.leaveMeetingSuccess();

//       actions$ = of(action);
//       livekitService.disconnectRoom.and.returnValue(of(void 0)); // Simulate successful disconnect

//       effects.leaveMeeting$.subscribe((result) => {
//         expect(result).toEqual(successAction);
//         expect(livekitService.disconnectRoom).toHaveBeenCalled();
//         done();
//       });
//     });

//     it('should dispatch leaveMeetingFailure on failed disconnect', (done) => {
//       const error = new Error('Disconnect failed');
//       const action = LiveKitRoomActions.MeetingActions.leaveMeeting();
//       const failureAction =
//         LiveKitRoomActions.MeetingActions.leaveMeetingFailure({
//           error: error.message, // Ensure it's error.message to compare strings
//         });

//       actions$ = of(action);
//       livekitService.disconnectRoom.and.returnValue(throwError(() => error)); // Simulate failed disconnect

//       effects.leaveMeeting$.subscribe((result) => {
//         expect(result).toEqual(failureAction);
//         done();
//       });
//     });
//   });
//   describe('sendChatMessage$', () => {
//     it('should call sendChatMessage on LiveKitService with correct parameters', () => {
//       const msg = 'Hello!';
//       const recipient = 'user123';
//       const action = LiveKitRoomActions.ChatActions.sendChatMessage({
//         msg,
//         recipient,
//       });

//       // Set the actions$ observable to emit the action
//       actions$ = of(action);

//       effects.sendChatMessage$.subscribe(() => {
//         expect(livekitService.sendChatMessage).toHaveBeenCalledWith({
//           msg,
//           recipient,
//         });
//       });
//     });

//     it('should not dispatch any action', () => {
//       const msg = 'Hello!';
//       const recipient = 'user123';
//       const action = LiveKitRoomActions.ChatActions.sendChatMessage({
//         msg,
//         recipient,
//       });

//       actions$ = of(action);

//       effects.sendChatMessage$.subscribe(() => {
//         // No actions should be dispatched
//         expect(livekitService.sendChatMessage).toHaveBeenCalledWith({
//           msg,
//           recipient,
//         });
//       });
//     });
//   });

//   describe('sendMessageToBreakoutRoom$', () => {
//     it('should dispatch sendMessageToBreakoutRoomSuccess on success', (done) => {
//       const breakoutRoom = 'room1';
//       const messageContent = 'Hello, Breakout Room!';
//       const action = LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
//         breakoutRoom,
//         messageContent,
//       });

//       // Set the actions$ observable to emit the action
//       actions$ = of(action);
//       livekitService.sendMessageToBreakoutRoom.and.returnValue(of(null)); // Simulate success

//       effects.sendMessageToBreakoutRoom$.subscribe((result) => {
//         expect(result).toEqual(
//           LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomSuccess()
//         );
//         done();
//       });
//     });

//     it('should dispatch sendMessageToBreakoutRoomFailure on error', (done) => {
//       const breakoutRoom = 'room1';
//       const messageContent = 'Hello, Breakout Room!';
//       const action = LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
//         breakoutRoom,
//         messageContent,
//       });

//       // Set the actions$ observable to emit the action
//       actions$ = of(action);
//       const error = new Error('Failed to send message');
//       livekitService.sendMessageToBreakoutRoom.and.returnValue(
//         throwError(error)
//       ); // Simulate error

//       effects.sendMessageToBreakoutRoom$.subscribe((result) => {
//         expect(result).toEqual(
//           LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomFailure({
//             error,
//           })
//         );
//         done();
//       });
//     });
//   });

//   describe('sendHelpRequest$', () => {
//     it('should dispatch sendHelpRequestSuccess on successful request', (done) => {
//       const roomName = 'mainRoom';
//       const action = LiveKitRoomActions.ChatActions.sendHelpRequest({
//         roomName,
//       });

//       // Set the actions$ observable to emit the action
//       actions$ = of(action);
//       livekitService.sendMessageToMainRoom.and.returnValue(of(null)); // Simulate success

//       effects.sendHelpRequest$.subscribe((result) => {
//         expect(result).toEqual(
//           LiveKitRoomActions.ChatActions.sendHelpRequestSuccess()
//         );
//         done();
//       });
//     });

//     it('should dispatch sendHelpRequestFailure on error', (done) => {
//       const roomName = 'mainRoom';
//       const action = LiveKitRoomActions.ChatActions.sendHelpRequest({
//         roomName,
//       });

//       // Set the actions$ observable to emit the action
//       actions$ = of(action);
//       const error = new Error('Failed to send help request');
//       livekitService.sendMessageToMainRoom.and.returnValue(throwError(error)); // Simulate error

//       effects.sendHelpRequest$.subscribe((result) => {
//         expect(result).toEqual(
//           LiveKitRoomActions.ChatActions.sendHelpRequestFailure({ error })
//         );
//         done();
//       });
//     });
//   });
//   // describe('initiateManualRoomSelection$', () => {
//   //   it('should call breakoutRoomAlert if breakoutRoomsData has participants', (done) => {
//   //     const action =
//   //       LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection({
//   //         roomType: 'manual',
//   //       });
//   //     actions$ = of(action);

//   //     // Mock the selector to return an array of breakout rooms with participants
//   //     const breakoutRoomsData: Room[] = [
//   //       {
//   //         roomName: 'Room 1',
//   //         participantIds: ['user1', 'user2'],
//   //         showAvailableParticipants: true,
//   //       },
//   //       {
//   //         roomName: 'Room 2',
//   //         participantIds: [],
//   //         showAvailableParticipants: false,
//   //       },
//   //     ];
//   //     store.overrideSelector(selectBreakoutRoomsData, breakoutRoomsData);

//   //     effects.initiateManualRoomSelection$.subscribe(() => {
//   //       expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
//   //         ['user1', 'user2'],
//   //         'Room 1'
//   //       );
//   //       expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalledWith(
//   //         [],
//   //         'Room 2'
//   //       );
//   //       expect(
//   //         livekitService.breakoutRoomsDataUpdated.emit
//   //       ).toHaveBeenCalledWith(breakoutRoomsData);
//   //       done();
//   //     });
//   //   });

//   //   it('should not call breakoutRoomAlert if no breakout rooms are configured', (done) => {
//   //     const action =
//   //       LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection({
//   //         roomType: 'manual',
//   //       });
//   //     actions$ = of(action);

//   //     // Mock the selector to return an empty array
//   //     store.overrideSelector(selectBreakoutRoomsData, []);

//   //     effects.initiateManualRoomSelection$.subscribe(() => {
//   //       expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalled();
//   //       expect(
//   //         livekitService.breakoutRoomsDataUpdated.emit
//   //       ).toHaveBeenCalledWith([]); // If needed
//   //       done();
//   //     });
//   //   });
//   // });
//   describe('initiateManualRoomSelection$', () => {
//     it('should call breakoutRoomAlert if breakoutRoomsData has participants', (done) => {
//       const action =
//         LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();
//       actions$ = of(action);

//       // Mock the selector to return an array of breakout rooms with participants
//       const breakoutRoomsData = [
//         {
//           roomName: 'Room 1',
//           participantIds: ['user1', 'user2'],
//           showAvailableParticipants: true,
//         },
//         {
//           roomName: 'Room 2',
//           participantIds: [],
//           showAvailableParticipants: false,
//         },
//       ];
//       store.overrideSelector(selectBreakoutRoomsData, breakoutRoomsData);

//       // Mock breakoutRoomAlert to return a resolved promise
//       livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

//       effects.initiateManualRoomSelection$.subscribe(() => {
//         expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
//           ['user1', 'user2'],
//           'Room 1'
//         );
//         expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalledWith(
//           [],
//           'Room 2'
//         );

//         // Ensure that breakoutRoomsDataUpdated is emitted with the data
//         expect(
//           livekitService.breakoutRoomsDataUpdated.next
//         ).toHaveBeenCalledWith(breakoutRoomsData);

//         done(); // Mark test as done
//       });
//     });

//     it('should not call breakoutRoomAlert if no breakout rooms are configured', (done) => {
//       const action =
//         LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();
//       actions$ = of(action);

//       // Mock the selector to return an empty array (no breakout rooms)
//       store.overrideSelector(selectBreakoutRoomsData, []);

//       livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

//       effects.initiateManualRoomSelection$.subscribe(() => {
//         // Verify that breakoutRoomAlert is not called
//         expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalled();

//         // Ensure breakoutRoomsDataUpdated is emitted with an empty array
//         expect(
//           livekitService.breakoutRoomsDataUpdated.next
//         ).toHaveBeenCalledWith([]);

//         done(); // Mark test as done
//       });
//     });

//     it('should dispatch breakoutRoomsInvitationSuccess when invitations are sent successfully', (done) => {
//       const action =
//         LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();
//       actions$ = of(action);

//       // Mock the selector to return an array of breakout rooms with participants
//       const breakoutRoomsData = [
//         {
//           roomName: 'Room 1',
//           participantIds: ['user1', 'user2'],
//           showAvailableParticipants: true,
//         },
//       ];
//       store.overrideSelector(selectBreakoutRoomsData, breakoutRoomsData);

//       // Mock breakoutRoomAlert to return a resolved promise
//       livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

//       effects.initiateManualRoomSelection$.subscribe((resultAction) => {
//         expect(resultAction).toEqual(
//           LiveKitRoomActions.BreakoutActions.breakoutRoomsInvitationSuccess({
//             roomName: 'Invitations sent successfully',
//           })
//         );

//         done(); // Mark test as done
//       });
//     });

//     it('should dispatch breakoutRoomsInvitationFailure when there is an error sending invitations', (done) => {
//       const action =
//         LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();
//       actions$ = of(action);

//       // Mock the selector to return an array of breakout rooms with participants
//       const breakoutRoomsData = [
//         {
//           roomName: 'Room 1',
//           participantIds: ['user1', 'user2'],
//           showAvailableParticipants: true,
//         },
//       ];
//       store.overrideSelector(selectBreakoutRoomsData, breakoutRoomsData);

//       // Simulate an error when sending invitations
//       livekitService.breakoutRoomAlert.and.returnValue(Promise.reject('Error'));

//       effects.initiateManualRoomSelection$.subscribe((resultAction) => {
//         expect(resultAction).toEqual(
//           LiveKitRoomActions.BreakoutActions.breakoutRoomsInvitationFailure({
//             error: 'Failed to send invitations',
//           })
//         );

//         done(); // Mark test as done
//       });
//     });
//   });
//   describe('Participant Room Splitter', () => {
//     let splitter: any; // Replace with the actual class type if needed

//     beforeEach(() => {
//       // Assuming the method is part of a class, instantiate the class here
//       splitter = {
//         splitParticipantsIntoRooms: (
//           participants: string[],
//           numberOfRooms: number
//         ) => {
//           const rooms: string[][] = Array.from(
//             { length: numberOfRooms },
//             () => []
//           );
//           participants.forEach((participant, index) => {
//             const roomIndex = index % numberOfRooms;
//             rooms[roomIndex].push(participant);
//           });
//           return rooms;
//         },
//       };
//     });

//     it('should split participants evenly into rooms', () => {
//       const participants = ['Alice', 'Bob', 'Charlie', 'David'];
//       const numberOfRooms = 2;
//       const expected = [
//         ['Alice', 'Charlie'],
//         ['Bob', 'David'],
//       ]; // Adjusted expected output

//       const result = splitter.splitParticipantsIntoRooms(
//         participants,
//         numberOfRooms
//       );
//       expect(result).toEqual(expected);
//     });

//     it('should handle more participants than rooms', () => {
//       const participants = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
//       const numberOfRooms = 3;
//       const expected = [['Alice', 'David'], ['Bob', 'Eve'], ['Charlie']];

//       const result = splitter.splitParticipantsIntoRooms(
//         participants,
//         numberOfRooms
//       );
//       expect(result).toEqual(expected);
//     });

//     it('should handle fewer participants than rooms', () => {
//       const participants = ['Alice'];
//       const numberOfRooms = 3;
//       const expected = [['Alice'], [], []];

//       const result = splitter.splitParticipantsIntoRooms(
//         participants,
//         numberOfRooms
//       );
//       expect(result).toEqual(expected);
//     });

//     it('should return empty rooms when there are no participants', () => {
//       const participants: string[] = [];
//       const numberOfRooms = 3;
//       const expected = [[], [], []];

//       const result = splitter.splitParticipantsIntoRooms(
//         participants,
//         numberOfRooms
//       );
//       expect(result).toEqual(expected);
//     });

//     it('should return empty rooms when number of rooms is zero', () => {
//       const participants = ['Alice', 'Bob'];
//       const numberOfRooms = 0;
//       const expected: string[][] = [];

//       const result = splitter.splitParticipantsIntoRooms(
//         participants,
//         numberOfRooms
//       );
//       expect(result).toEqual(expected);
//     });

//     it('should return empty rooms when number of rooms is negative', () => {
//       const participants = ['Alice', 'Bob'];
//       const numberOfRooms = -1;
//       const expected: string[][] = [];

//       const result = splitter.splitParticipantsIntoRooms(
//         participants,
//         numberOfRooms
//       );
//       expect(result).toEqual(expected);
//     });
//   });
//   it('should create automatic breakout rooms and send invitations', (done) => {
//     const participants = [
//       'participant1',
//       'participant2',
//       'participant3',
//       'participant4',
//     ];
//     const numberOfRooms = 2;
//     const action =
//       LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
//         participants,
//         numberOfRooms,
//       });

//     // Prepare expected breakout rooms data
//     const breakoutRoomsData = [
//       {
//         participantIds: ['participant1', 'participant3'],
//         roomName: 'Breakout_Room_1',
//         type: 'automatic',
//       },
//       {
//         participantIds: ['participant2', 'participant4'],
//         roomName: 'Breakout_Room_2',
//         type: 'automatic',
//       },
//     ];

//     // Mock the breakoutRoomAlert method to return a resolved Promise
//     livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

//     livekitService.breakoutRoomsDataUpdated.next = jasmine.createSpy('emit');

//     actions$ = of(action);

//     effects.createAutomaticRooms$.subscribe(() => {
//       // Verify breakoutRoomAlert was called with correct data
//       expect(livekitService.breakoutRoomAlert).toHaveBeenCalledTimes(2); // It should have been called for each room
//       expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
//         ['participant1', 'participant3'],
//         'Breakout_Room_1'
//       );
//       expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
//         ['participant2', 'participant4'],
//         'Breakout_Room_2'
//       );

//       // Verify that breakoutRoomsDataUpdated.emit was triggered
//       expect(livekitService.breakoutRoomsDataUpdated.next).toHaveBeenCalledWith(
//         breakoutRoomsData
//       );

//       done(); // Mark test as done
//     });
//   });

//   it('should handle empty participant list gracefully', (done) => {
//     const participants: string[] = [];
//     const numberOfRooms = 2;
//     const action =
//       LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
//         participants,
//         numberOfRooms,
//       });

//     // Mock the breakoutRoomAlert method to return a resolved Promise
//     livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

//     livekitService.breakoutRoomsDataUpdated.next = jasmine.createSpy('emit');

//     actions$ = of(action);

//     effects.createAutomaticRooms$.subscribe(() => {
//       // Verify that no breakoutRoomAlert method was called due to empty participants
//       expect(livekitService.breakoutRoomAlert).toHaveBeenCalledTimes(0); // No alerts should be sent

//       // Verify that breakoutRoomsDataUpdated.emit was not triggered
//       expect(
//         livekitService.breakoutRoomsDataUpdated.next
//       ).toHaveBeenCalledTimes(0);

//       done(); // Mark test as done
//     });
//   });
// });

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { LivekitService } from '../../livekit.service';
import * as LiveKitRoomActions from './livekit-room.actions';
import { Action, Store, StoreModule } from '@ngrx/store';
import { LiveKitRoomEffects } from './livekit-room.effects';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HttpClientModule } from '@angular/common/http';
import {
  selectNextRoomIndex,
  selectBreakoutRoomsData,
} from './livekit-room.selectors';
import { MeetingService } from '../../meeting.service';
import { Room } from 'livekit-client';
import { BreakoutRoomService } from '../../breakout-room.service';
import { ActivatedRoute } from '@angular/router';

describe('LiveKitRoomEffects', () => {
  let actions$: Observable<Action>;
  let effects: LiveKitRoomEffects;
  let livekitService: jasmine.SpyObj<LivekitService>;
  const initialState = { nextRoomIndex: 1 };
  let store: MockStore;
  let breakoutRoomService: jasmine.SpyObj<BreakoutRoomService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let meetingService = jasmine.createSpyObj('MeetingService', [
    'createMeeting',
  ]);

  beforeEach(() => {
    const livekitServiceSpy = jasmine.createSpyObj('LiveKitService', [
      'connectToRoom',
      'toggleScreenShare',
      'toggleVideo',
      'toggleMicrophone',
      'enableCameraAndMicrophone',
      'disconnectRoom',
      'sendChatMessage',
      'sendMessageToBreakoutRoom',
      'sendMessageToMainRoom',
      'breakoutRoomAlert',
    ]);
    livekitServiceSpy.breakoutRoomsDataUpdated = {
      emit: jasmine.createSpy('emit'),
    };

    const breakoutRoomServiceSpy = jasmine.createSpyObj('BreakoutRoomService', [
      'getBreakoutRooms',
      'joinBreakoutRoom',
    ]);

    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const activatedRouteSpy = { snapshot: { params: {}, queryParams: {} } };

    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, HttpClientModule, StoreModule.forRoot({})],
      providers: [
        LiveKitRoomEffects,
        provideMockActions(() => actions$), // Mock Actions
        provideMockStore({ initialState }),
        { provide: LivekitService, useValue: livekitServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: BreakoutRoomService, useValue: breakoutRoomServiceSpy },
        { provide: Store, useValue: storeSpy },
        {
          provide: MeetingService,
          useValue: jasmine.createSpyObj('MeetingService', ['createMeeting']),
        },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    });

    // effects = TestBed.inject(LiveKitRoomEffects);
    effects = TestBed.inject(LiveKitRoomEffects);
    // store = TestBed.inject(Store) as MockStore;
    store = TestBed.inject(MockStore);
    livekitService = TestBed.inject(
      LivekitService
    ) as jasmine.SpyObj<LivekitService>;
    meetingService = TestBed.inject(
      MeetingService
    ) as jasmine.SpyObj<MeetingService>;
  });

  it('should dispatch startMeeting on successful meeting creation', (done) => {
    const action = LiveKitRoomActions.MeetingActions.createMeeting({
      roomName: 'test-room',
      participantNames: ['participant1', 'participant2'],
    });

    const response = { token: 'token1' };
    meetingService.createMeeting.and.returnValue(of(response)); // Mocking the service call

    const expectedAction = LiveKitRoomActions.LiveKitActions.startMeeting({
      wsURL: 'wss://hassam-app-fu1y3ybu.livekit.cloud',
      token: response.token,
    });

    actions$ = of(action);

    effects.createMeeting$.subscribe((result) => {
      expect(result).toEqual(expectedAction); // Check that the correct action is dispatched
      done();
    });
  });

  it('should dispatch createMeetingFailure on error', (done) => {
    const action = LiveKitRoomActions.MeetingActions.createMeeting({
      roomName: 'test-room',
      participantNames: ['participant1', 'participant2'],
    });

    const error = new Error('Failed to create meeting');
    meetingService.createMeeting.and.returnValue(of({ error })); // Mocking the error response

    const expectedFailureAction =
      LiveKitRoomActions.MeetingActions.createMeetingFailure({
        error: error.message,
      });

    actions$ = of(action);

    effects.createMeeting$.subscribe((result) => {
      expect(result).toEqual(expectedFailureAction); // Check that failure action is dispatched
      done();
    });
  });
  describe('startMeeting$', () => {
    it('should dispatch startMeetingSuccess on successful connection', (done) => {
      const wsURL = 'wss://example.com';
      const token = 'example-token';
      const action = LiveKitRoomActions.LiveKitActions.startMeeting({
        wsURL,
        token,
      });
      const successAction =
        LiveKitRoomActions.LiveKitActions.startMeetingSuccess();

      actions$ = of(action);
      livekitService.connectToRoom.and.returnValue(Promise.resolve());

      effects.startMeeting$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch startMeetingFailure on failed connection', (done) => {
      const wsURL = 'wss://example.com';
      const token = 'example-token';
      const error = new Error('Connection failed');
      const action = LiveKitRoomActions.LiveKitActions.startMeeting({
        wsURL,
        token,
      });
      const failureAction =
        LiveKitRoomActions.LiveKitActions.startMeetingFailure({
          error: error.message,
        });

      actions$ = of(action);
      livekitService.connectToRoom.and.returnValue(Promise.reject(error));

      effects.startMeeting$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });
  describe('toggleScreenShare$', () => {
    it('should dispatch toggleScreenShareSuccess on successful toggle', (done) => {
      const isScreenSharing = true;
      const action = LiveKitRoomActions.LiveKitActions.toggleScreenShare();
      const successAction =
        LiveKitRoomActions.LiveKitActions.toggleScreenShareSuccess({
          isScreenSharing,
        });

      actions$ = of(action);
      livekitService.toggleScreenShare.and.returnValue(
        Promise.resolve(isScreenSharing)
      );

      effects.toggleScreenShare$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleScreenShareFailure on failed toggle', (done) => {
      const error = new Error('Toggle failed');
      const action = LiveKitRoomActions.LiveKitActions.toggleScreenShare();
      const failureAction =
        LiveKitRoomActions.LiveKitActions.toggleScreenShareFailure({
          error: error.message,
        });

      actions$ = of(action);
      livekitService.toggleScreenShare.and.returnValue(Promise.reject(error));

      effects.toggleScreenShare$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('toggleVideo$', () => {
    it('should dispatch toggleVideoSuccess on successful toggle', (done) => {
      const isVideoOn = true;
      const action = LiveKitRoomActions.LiveKitActions.toggleVideo();
      const successAction =
        LiveKitRoomActions.LiveKitActions.toggleVideoSuccess({
          isVideoOn,
        });

      actions$ = of(action);
      livekitService.toggleVideo.and.returnValue(of(isVideoOn));

      effects.toggleVideo$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleVideoFailure on failed toggle', (done) => {
      const error = new Error('Toggle failed');
      const action = LiveKitRoomActions.LiveKitActions.toggleVideo();
      const failureAction =
        LiveKitRoomActions.LiveKitActions.toggleVideoFailure({
          error: error.message,
        });

      actions$ = of(action);
      livekitService.toggleVideo.and.returnValue(throwError(error));

      effects.toggleVideo$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('toggleMicrophone$', () => {
    it('should dispatch toggleMicSuccess on successful toggle', (done) => {
      const isMicOn = true;
      const action = LiveKitRoomActions.LiveKitActions.toggleMic();
      const successAction = LiveKitRoomActions.LiveKitActions.toggleMicSuccess({
        isMicOn,
      });

      actions$ = of(action);
      livekitService.toggleMicrophone.and.returnValue(of(isMicOn));

      effects.toggleMicrophone$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleMicFailure on failed toggle', (done) => {
      const error = 'Toggle failed'; // Use a string for consistency
      const action = LiveKitRoomActions.LiveKitActions.toggleMic();
      const failureAction = LiveKitRoomActions.LiveKitActions.toggleMicFailure({
        error,
      });

      actions$ = of(action);
      livekitService.toggleMicrophone.and.returnValue(throwError(error));

      effects.toggleMicrophone$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('enableCameraAndMicrophone$', () => {
    it('should dispatch enableCameraAndMicrophoneSuccess on successful enable', (done) => {
      const action =
        LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophone();
      const successAction =
        LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneSuccess();

      actions$ = of(action);
      livekitService.enableCameraAndMicrophone.and.returnValue(
        Promise.resolve()
      ); // Simulate success with resolved Promise

      effects.enableCameraAndMicrophone$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch enableCameraAndMicrophoneFailure on failed enable', (done) => {
      const error = new Error('Enable failed');
      const action =
        LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophone();
      const failureAction =
        LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneFailure({
          error: error.message,
        });

      actions$ = of(action);
      livekitService.enableCameraAndMicrophone.and.returnValue(
        Promise.reject(error)
      ); // Simulate failure with rejected Promise

      effects.enableCameraAndMicrophone$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });
  describe('leaveMeeting$', () => {
    it('should dispatch leaveMeetingSuccess on successful disconnect', (done) => {
      const action = LiveKitRoomActions.MeetingActions.leaveMeeting();
      const successAction =
        LiveKitRoomActions.MeetingActions.leaveMeetingSuccess();

      actions$ = of(action);
      livekitService.disconnectRoom.and.returnValue(of(void 0)); // Simulate successful disconnect

      effects.leaveMeeting$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(livekitService.disconnectRoom).toHaveBeenCalled();
        done();
      });
    });

    it('should dispatch leaveMeetingFailure on failed disconnect', (done) => {
      const error = new Error('Disconnect failed');
      const action = LiveKitRoomActions.MeetingActions.leaveMeeting();
      const failureAction =
        LiveKitRoomActions.MeetingActions.leaveMeetingFailure({
          error: error.message, // Ensure it's error.message to compare strings
        });

      actions$ = of(action);
      livekitService.disconnectRoom.and.returnValue(throwError(() => error)); // Simulate failed disconnect

      effects.leaveMeeting$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });
  describe('sendChatMessage$', () => {
    it('should call sendChatMessage on LiveKitService with correct parameters', () => {
      const msg = 'Hello!';
      const recipient = 'user123';
      const action = LiveKitRoomActions.ChatActions.sendChatMessage({
        msg,
        recipient,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);

      effects.sendChatMessage$.subscribe(() => {
        expect(livekitService.sendChatMessage).toHaveBeenCalledWith({
          msg,
          recipient,
        });
      });
    });

    it('should not dispatch any action', () => {
      const msg = 'Hello!';
      const recipient = 'user123';
      const action = LiveKitRoomActions.ChatActions.sendChatMessage({
        msg,
        recipient,
      });

      actions$ = of(action);

      effects.sendChatMessage$.subscribe(() => {
        // No actions should be dispatched
        expect(livekitService.sendChatMessage).toHaveBeenCalledWith({
          msg,
          recipient,
        });
      });
    });
  });

  describe('sendMessageToBreakoutRoom$', () => {
    it('should dispatch sendMessageToBreakoutRoomSuccess on success', (done) => {
      const breakoutRoom = 'room1';
      const messageContent = 'Hello, Breakout Room!';
      const action = LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
        breakoutRoom,
        messageContent,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);
      livekitService.sendMessageToBreakoutRoom.and.returnValue(of(null)); // Simulate success

      effects.sendMessageToBreakoutRoom$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomSuccess()
        );
        done();
      });
    });

    it('should dispatch sendMessageToBreakoutRoomFailure on error', (done) => {
      const breakoutRoom = 'room1';
      const messageContent = 'Hello, Breakout Room!';
      const action = LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
        breakoutRoom,
        messageContent,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);
      const error = new Error('Failed to send message');
      livekitService.sendMessageToBreakoutRoom.and.returnValue(
        throwError(error)
      ); // Simulate error

      effects.sendMessageToBreakoutRoom$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomFailure({
            error,
          })
        );
        done();
      });
    });
  });

  describe('sendHelpRequest$', () => {
    it('should dispatch sendHelpRequestSuccess on successful request', (done) => {
      const roomName = 'mainRoom';
      const action = LiveKitRoomActions.ChatActions.sendHelpRequest({
        roomName,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);
      livekitService.sendMessageToMainRoom.and.returnValue(of(null)); // Simulate success

      effects.sendHelpRequest$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.ChatActions.sendHelpRequestSuccess()
        );
        done();
      });
    });

    it('should dispatch sendHelpRequestFailure on error', (done) => {
      const roomName = 'mainRoom';
      const action = LiveKitRoomActions.ChatActions.sendHelpRequest({
        roomName,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);
      const error = new Error('Failed to send help request');
      livekitService.sendMessageToMainRoom.and.returnValue(throwError(error)); // Simulate error

      effects.sendHelpRequest$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.ChatActions.sendHelpRequestFailure({ error })
        );
        done();
      });
    });
  });
  // describe('initiateManualRoomSelection$', () => {
  //   it('should call breakoutRoomAlert if breakoutRoomsData has participants', (done) => {
  //     const action =
  //       LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection({
  //         roomType: 'manual',
  //       });
  //     actions$ = of(action);

  //     // Mock the selector to return an array of breakout rooms with participants
  //     const breakoutRoomsData: Room[] = [
  //       {
  //         roomName: 'Room 1',
  //         participantIds: ['user1', 'user2'],
  //         showAvailableParticipants: true,
  //       },
  //       {
  //         roomName: 'Room 2',
  //         participantIds: [],
  //         showAvailableParticipants: false,
  //       },
  //     ];
  //     store.overrideSelector(selectBreakoutRoomsData, breakoutRoomsData);

  //     effects.initiateManualRoomSelection$.subscribe(() => {
  //       expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
  //         ['user1', 'user2'],
  //         'Room 1'
  //       );
  //       expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalledWith(
  //         [],
  //         'Room 2'
  //       );
  //       expect(
  //         livekitService.breakoutRoomsDataUpdated.emit
  //       ).toHaveBeenCalledWith(breakoutRoomsData);
  //       done();
  //     });
  //   });

  //   it('should not call breakoutRoomAlert if no breakout rooms are configured', (done) => {
  //     const action =
  //       LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection({
  //         roomType: 'manual',
  //       });
  //     actions$ = of(action);

  //     // Mock the selector to return an empty array
  //     store.overrideSelector(selectBreakoutRoomsData, []);

  //     effects.initiateManualRoomSelection$.subscribe(() => {
  //       expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalled();
  //       expect(
  //         livekitService.breakoutRoomsDataUpdated.emit
  //       ).toHaveBeenCalledWith([]); // If needed
  //       done();
  //     });
  //   });
  // });
  describe('initiateManualRoomSelection$', () => {
    // it('should call breakoutRoomAlert if breakoutRoomsData has participants', (done) => {
    //   const action =
    //     LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();
    //   actions$ = of(action);

    //   // Mock the selector to return an array of breakout rooms with participants
    //   const breakoutRoomsData = [
    //     {
    //       roomName: 'Room 1',
    //       participantIds: ['user1', 'user2'],
    //       showAvailableParticipants: true,
    //     },
    //     {
    //       roomName: 'Room 2',
    //       participantIds: [],
    //       showAvailableParticipants: false,
    //     },
    //   ];
    //   // store.overrideSelector(selectBreakoutRoomsData, breakoutRoomsData);
    //   store.setState({
    //     selectBreakoutRoomsData,
    //     breakoutRoomsData, // Mock the state directly
    //   });

    //   // Mock breakoutRoomAlert to return a resolved promise
    //   livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

    //   effects.initiateManualRoomSelection$.subscribe(() => {
    //     expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
    //       ['user1', 'user2'],
    //       'Room 1'
    //     );
    //     expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalledWith(
    //       [],
    //       'Room 2'
    //     );

    //     // Ensure that breakoutRoomsDataUpdated is emitted with the data
    //     expect(
    //       livekitService.breakoutRoomsDataUpdated.next
    //     ).toHaveBeenCalledWith(breakoutRoomsData);

    //     done(); // Mark test as done
    //   });
    // });
    it('should call breakoutRoomAlert if breakoutRoomsData has participants', (done) => {
      const action =
        LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();

      actions$ = of(action); // Ensure this line is present and correctly assigns the stream to actions$

      store.setState({
        breakoutRoomsData: [
          {
            roomName: 'Room 1',
            participantIds: ['user1', 'user2'],
            showAvailableParticipants: true,
          },
          {
            roomName: 'Room 2',
            participantIds: [],
            showAvailableParticipants: false,
          },
        ], // Mock store state
      });

      // Mock breakoutRoomAlert to return a resolved promise
      livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

      effects.initiateManualRoomSelection$.subscribe(() => {
        expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
          ['user1', 'user2'],
          'Room 1'
        );
        expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalledWith(
          [],
          'Room 2'
        );

        // Ensure that breakoutRoomsDataUpdated is emitted with the data
        expect(
          livekitService.breakoutRoomsDataUpdated.next
        ).toHaveBeenCalledWith([
          {
            roomName: 'Room 1',
            participantIds: ['user1', 'user2'],
            showAvailableParticipants: true,
          },
          {
            roomName: 'Room 2',
            participantIds: [],
            showAvailableParticipants: false,
          },
        ]);

        done(); // Mark test as done
      });
    });

    it('should not call breakoutRoomAlert if no breakout rooms are configured', (done) => {
      const action =
        LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();
      actions$ = of(action);

      // Mock the selector to return an empty array (no breakout rooms)
      store.overrideSelector(selectBreakoutRoomsData, []);

      livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

      effects.initiateManualRoomSelection$.subscribe(() => {
        // Verify that breakoutRoomAlert is not called
        expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalled();

        // Ensure breakoutRoomsDataUpdated is emitted with an empty array
        expect(
          livekitService.breakoutRoomsDataUpdated.next
        ).toHaveBeenCalledWith([]);

        done(); // Mark test as done
      });
    });

    it('should dispatch breakoutRoomsInvitationSuccess when invitations are sent successfully', (done) => {
      const action =
        LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();
      actions$ = of(action);

      // Mock the selector to return an array of breakout rooms with participants
      const breakoutRoomsData = [
        {
          roomName: 'Room 1',
          participantIds: ['user1', 'user2'],
          showAvailableParticipants: true,
        },
      ];
      store.overrideSelector(selectBreakoutRoomsData, breakoutRoomsData);

      // Mock breakoutRoomAlert to return a resolved promise
      livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

      effects.initiateManualRoomSelection$.subscribe((resultAction) => {
        expect(resultAction).toEqual(
          LiveKitRoomActions.BreakoutActions.breakoutRoomsInvitationSuccess({
            message: 'Invitations sent successfully',
          })
        );

        done(); // Mark test as done
      });
    });

    it('should dispatch breakoutRoomsInvitationFailure when there is an error sending invitations', (done) => {
      const action =
        LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation();
      actions$ = of(action);

      // Mock the selector to return an array of breakout rooms with participants
      const breakoutRoomsData = [
        {
          roomName: 'Room 1',
          participantIds: ['user1', 'user2'],
          showAvailableParticipants: true,
        },
      ];
      store.overrideSelector(selectBreakoutRoomsData, breakoutRoomsData);

      // Simulate an error when sending invitations
      livekitService.breakoutRoomAlert.and.returnValue(Promise.reject('Error'));

      effects.initiateManualRoomSelection$.subscribe((resultAction) => {
        expect(resultAction).toEqual(
          LiveKitRoomActions.BreakoutActions.breakoutRoomsInvitationFailure({
            error: 'Failed to send invitations',
          })
        );

        done(); // Mark test as done
      });
    });
  });
  describe('Participant Room Splitter', () => {
    let splitter: any; // Replace with the actual class type if needed

    beforeEach(() => {
      // Assuming the method is part of a class, instantiate the class here
      splitter = {
        splitParticipantsIntoRooms: (
          participants: string[],
          numberOfRooms: number
        ) => {
          const rooms: string[][] = Array.from(
            { length: numberOfRooms },
            () => []
          );
          participants.forEach((participant, index) => {
            const roomIndex = index % numberOfRooms;
            rooms[roomIndex].push(participant);
          });
          return rooms;
        },
      };
    });

    it('should split participants evenly into rooms', () => {
      const participants = ['Alice', 'Bob', 'Charlie', 'David'];
      const numberOfRooms = 2;
      const expected = [
        ['Alice', 'Charlie'],
        ['Bob', 'David'],
      ]; // Adjusted expected output

      const result = splitter.splitParticipantsIntoRooms(
        participants,
        numberOfRooms
      );
      expect(result).toEqual(expected);
    });

    it('should handle more participants than rooms', () => {
      const participants = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
      const numberOfRooms = 3;
      const expected = [['Alice', 'David'], ['Bob', 'Eve'], ['Charlie']];

      const result = splitter.splitParticipantsIntoRooms(
        participants,
        numberOfRooms
      );
      expect(result).toEqual(expected);
    });

    it('should handle fewer participants than rooms', () => {
      const participants = ['Alice'];
      const numberOfRooms = 3;
      const expected = [['Alice'], [], []];

      const result = splitter.splitParticipantsIntoRooms(
        participants,
        numberOfRooms
      );
      expect(result).toEqual(expected);
    });

    it('should return empty rooms when there are no participants', () => {
      const participants: string[] = [];
      const numberOfRooms = 3;
      const expected = [[], [], []];

      const result = splitter.splitParticipantsIntoRooms(
        participants,
        numberOfRooms
      );
      expect(result).toEqual(expected);
    });

    it('should return empty rooms when number of rooms is zero', () => {
      const participants = ['Alice', 'Bob'];
      const numberOfRooms = 0;
      const expected: string[][] = [];

      const result = splitter.splitParticipantsIntoRooms(
        participants,
        numberOfRooms
      );
      expect(result).toEqual(expected);
    });

    it('should return empty rooms when number of rooms is negative', () => {
      const participants = ['Alice', 'Bob'];
      const numberOfRooms = -1;
      const expected: string[][] = [];

      const result = splitter.splitParticipantsIntoRooms(
        participants,
        numberOfRooms
      );
      expect(result).toEqual(expected);
    });
  });
  it('should create automatic breakout rooms and send invitations', (done) => {
    const participants = [
      'participant1',
      'participant2',
      'participant3',
      'participant4',
    ];
    const numberOfRooms = 2;
    const action =
      LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
        participants,
        numberOfRooms,
      });

    // Prepare expected breakout rooms data
    const breakoutRoomsData = [
      {
        participantIds: ['participant1', 'participant3'],
        roomName: 'Breakout_Room_1',
        type: 'automatic',
      },
      {
        participantIds: ['participant2', 'participant4'],
        roomName: 'Breakout_Room_2',
        type: 'automatic',
      },
    ];

    // Mock the breakoutRoomAlert method to return a resolved Promise
    livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

    livekitService.breakoutRoomsDataUpdated.next = jasmine.createSpy('emit');

    actions$ = of(action);

    effects.createAutomaticRooms$.subscribe(() => {
      // Verify breakoutRoomAlert was called with correct data
      expect(livekitService.breakoutRoomAlert).toHaveBeenCalledTimes(2); // It should have been called for each room
      expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
        ['participant1', 'participant3'],
        'Breakout_Room_1'
      );
      expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
        ['participant2', 'participant4'],
        'Breakout_Room_2'
      );

      // Verify that breakoutRoomsDataUpdated.emit was triggered
      expect(livekitService.breakoutRoomsDataUpdated.next).toHaveBeenCalledWith(
        breakoutRoomsData
      );

      done(); // Mark test as done
    });
  });

  it('should handle empty participant list gracefully', (done) => {
    const participants: string[] = [];
    const numberOfRooms = 2;
    const action =
      LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
        participants,
        numberOfRooms,
      });

    // Mock the breakoutRoomAlert method to return a resolved Promise
    livekitService.breakoutRoomAlert.and.returnValue(Promise.resolve());

    livekitService.breakoutRoomsDataUpdated.next = jasmine.createSpy('emit');

    actions$ = of(action);

    effects.createAutomaticRooms$.subscribe(() => {
      // Verify that no breakoutRoomAlert method was called due to empty participants
      expect(livekitService.breakoutRoomAlert).toHaveBeenCalledTimes(0); // No alerts should be sent

      // Verify that breakoutRoomsDataUpdated.emit was not triggered
      expect(
        livekitService.breakoutRoomsDataUpdated.next
      ).toHaveBeenCalledTimes(0);

      done(); // Mark test as done
    });
  });
});
