// // //////////////////////////////////////

// // import {
// //   ComponentFixture,
// //   TestBed,
// //   async,
// //   fakeAsync,
// //   tick,
// // } from '@angular/core/testing';
// // import { HttpClientTestingModule } from '@angular/common/http/testing';
// // import { RouterTestingModule } from '@angular/router/testing';
// // import { LivekitService } from '../livekit.service';
// // import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
// // import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// // import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// // import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// // import { of, Subject } from 'rxjs';
// // import { ElementRef, EventEmitter } from '@angular/core';
// // import { LivekitRoomComponent } from './livekit-room.component';
// // import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
// // import { Store, StoreModule } from '@ngrx/store';
// // import * as LiveKitRoomActions from '../+state/livekit/livekit-room.actions';
// // import { HttpClientModule } from '@angular/common/http';
// // import { RemoteTrack, Track } from 'livekit-client';

// // class MockLiveKitService {
// //   toggleVideo() {
// //     return Promise.resolve();
// //   }
// // }
// // describe('LivekitRoomComponent;', () => {
// //   let component: LivekitRoomComponent;
// //   let fixture: ComponentFixture<LivekitRoomComponent>;
// //   let mockMatDialog: MatDialog;
// //   let mockMatSnackBar: MatSnackBar;
// //   let mockLivekitService: any;
// //   let msgDataReceived: Subject<any>;
// //   let messageEmitter: Subject<any>;
// //   let screenShareTrackSubscribed: Subject<any>;
// //   let store: any;
// //   let dispatchSpy: jasmine.Spy;
// //   // let liveKitService: jasmine.SpyObj<LiveKitService>;
// //   let formBuilder: FormBuilder;
// //   let mockElementRef: ElementRef;
// //   let mockChatSideWindowVisible$: Subject<boolean>;
// //   let webSocketStatusSubject: Subject<string>;

// //   const GRIDCOLUMN: { [key: number]: string } = {
// //     1: '1fr',
// //     2: '1fr 1fr',
// //     3: '1fr 1fr',
// //     4: '1fr 1fr',
// //     5: '1fr 1fr 1fr',
// //     6: '1fr 1fr 1fr',
// //   };
// //   beforeEach(async () => {
// //     mockChatSideWindowVisible$ = new Subject<boolean>();
// //     mockElementRef = {
// //       nativeElement: jasmine.createSpyObj('nativeElement', [
// //         'focus',
// //         'scrollIntoView',
// //       ]),
// //     };

// //     msgDataReceived = new Subject<any>();
// //     messageEmitter = new Subject<any>();
// //     screenShareTrackSubscribed = new Subject<any>();
// //     webSocketStatusSubject = new Subject<string>();
// //     mockLivekitService = {
// //       breakoutRoomAlert: jasmine
// //         .createSpy('breakoutRoomAlert')
// //         .and.returnValue(Promise.resolve()),
// //       initCanvas: jasmine.createSpy('initCanvas'),
// //       localParticipantData: msgDataReceived.asObservable(),
// //       messageEmitter: messageEmitter.asObservable(),
// //       msgDataReceived: msgDataReceived.asObservable(),
// //       sendChatMessage: jasmine.createSpy('sendChatMessage'),
// //       raiseHand: jasmine.createSpy('raiseHand'),
// //       lowerHand: jasmine.createSpy('lowerHand'),
// //       sendMessageToBreakoutRoom: jasmine.createSpy('sendMessageToBreakoutRoom'),
// //       sendMessageToMainRoom: jasmine.createSpy('sendMessageToMainRoom'),
// //       toggleVideo: jasmine
// //         .createSpy('toggleVideo')
// //         .and.returnValue(Promise.resolve()),
// //       connectToRoom: jasmine
// //         .createSpy('connectToRoom')
// //         .and.returnValue(Promise.resolve()),
// //       enableCameraAndMicrophone: jasmine
// //         .createSpy('enableCameraAndMicrophone')
// //         .and.returnValue(Promise.resolve()),
// //       room: {
// //         _numParticipants: 0,
// //         get numParticipants() {
// //           return this._numParticipants;
// //         },
// //         set numParticipants(value: number) {
// //           this._numParticipants = value;
// //         },
// //       },
// //       audioVideoHandler: jasmine.createSpy('audioVideoHandler'),
// //       webSocketStatus$: new Subject(),
// //       messageToMain: new EventEmitter<string[]>(),
// //       messageContentReceived: new EventEmitter<string[]>(),
// //       attachTrackToElement: jasmine.createSpy('attachTrackToElement'),
// //       participantNamesUpdated: new EventEmitter<string[]>(),
// //       remoteVideoTrackSubscribed: new EventEmitter<RemoteTrack>(),
// //       remoteAudioTrackSubscribed: new EventEmitter<void>(),
// //       breakoutRoomsDataUpdated: jasmine.createSpy('emit'),
// //       screenShareTrackSubscribed: screenShareTrackSubscribed.asObservable(),
// //       handleTrackSubscribed: jasmine.createSpy('handleTrackSubscribed'),
// //     };
// //     await TestBed.configureTestingModule({
// //       imports: [
// //         RouterTestingModule,
// //         ReactiveFormsModule,
// //         FormsModule,
// //         MatSnackBarModule,
// //         MatDialogModule,
// //         NoopAnimationsModule,
// //         StoreModule.forRoot({}),
// //         HttpClientTestingModule,
// //       ],
// //       declarations: [LivekitRoomComponent],
// //       providers: [
// //         { provide: ElementRef, useValue: mockElementRef },
// //         { provide: LivekitService, useValue: mockLivekitService },
// //         FormBuilder,
// //         {
// //           provide: MatDialog,
// //           useValue: jasmine.createSpyObj('MatDialog', ['open']),
// //         },
// //         {
// //           provide: MatSnackBar,
// //           useValue: jasmine.createSpyObj('MatSnackBar', ['open']),
// //         },
// //       ],
// //     });

// //     // mockLiveKitService = TestBed.inject(LiveKitService);
// //     mockMatDialog = TestBed.inject(MatDialog);
// //     mockMatSnackBar = TestBed.inject(MatSnackBar);
// //     fixture = TestBed.createComponent(LivekitRoomComponent);
// //     component = fixture.componentInstance;
// //     store = TestBed.inject(Store);
// //     dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
// //     // component.chatSideWindowVisible$ = of(false);
// //     component.participantName = 'Test Participant';
// //     (component as any).GRIDCOLUMN = GRIDCOLUMN;
// //     formBuilder = TestBed.inject(FormBuilder);
// //     component.liveKitViewState$.subscribe((state) => {
// //       state.chatSideWindowVisible = mockChatSideWindowVisible$.asObservable();
// //     });
// //     component.allMessages = [];
// //     component.unreadMessagesCount = 0;

// //     // Initialize the form
// //     component.chatForm = formBuilder.group({
// //       message: ['Test message'],
// //       participant: ['Test participant'],
// //     });
// //     component.breakoutForm = formBuilder.group({
// //       roomType: ['automatic'],
// //       numberOfRooms: [2],
// //     });
// //     component.breakoutRoomsData = [
// //       {
// //         roomName: 'Room 1',
// //         participantIds: ['participant1', 'participant2'],
// //       },
// //       {
// //         roomName: 'Room 2',
// //         participantIds: [],
// //       },
// //     ];
// //     component.audioCanvasRef = mockElementRef;
// //     // liveKitService = TestBed.inject(
// //     //   LiveKitService
// //     // ) as jasmine.SpyObj<LiveKitService>;
// //     component.localParticipant = {
// //       identity: 'hostIdentity',
// //       handRaised: false,
// //     };
// //     component.roomName = 'TestRoom';
// //     component.roomName = undefined;
// //     component.allMessagesToMainRoom = [];
// //     component.handRaiseStates = {};
// //     component.remoteParticipantNames = [
// //       { identity: 'participant1' },
// //       { identity: 'participant2' },
// //       { identity: 'participant3' },
// //       { identity: 'participant4' },
// //     ];
// //     component.ngAfterViewInit();
// //     fixture.detectChanges();
// //   });
// //   it('should create the app component', () => {
// //     expect(component).toBeTruthy();
// //   });
// //   it('should call initCanvas with audioCanvasRef.nativeElement after view init', () => {
// //     component.ngAfterViewInit();
// //     expect(mockLivekitService.initCanvas).toHaveBeenCalledWith(
// //       mockElementRef.nativeElement
// //     );
// //   });

// //   describe('start meeting', () => {
// //     it('should dispatch createMeeting action with correct payload', async () => {
// //       // Call the startMeeting method
// //       await component.startMeeting();

// //       // Check that the dispatch method was called
// //       expect(store.dispatch).toHaveBeenCalled();

// //       // Check that the dispatch was called with the correct action and payload
// //       const expectedAction = LiveKitRoomActions.MeetingActions.createMeeting({
// //         participantNames: [component.participantName],
// //         roomName: 'test-room',
// //       });

// //       expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
// //     });
// //   });

// //   describe('Sort Messages', () => {
// //     it('should sort messages by receivingTime or sendingTime in ascending order', () => {
// //       const messages = [
// //         { receivingTime: '2022-01-01T10:00:00.000Z' },
// //         { sendingTime: '2022-01-01T09:00:00.000Z' },
// //         { receivingTime: '2022-01-01T11:00:00.000Z' },
// //         { sendingTime: '2022-01-01T08:00:00.000Z' },
// //       ];

// //       component.allMessages = messages;
// //       component.sortMessages();

// //       const expectedOrder = [
// //         { sendingTime: '2022-01-01T08:00:00.000Z' },
// //         { sendingTime: '2022-01-01T09:00:00.000Z' },
// //         { receivingTime: '2022-01-01T10:00:00.000Z' },
// //         { receivingTime: '2022-01-01T11:00:00.000Z' },
// //       ];

// //       expect(component.allMessages).toEqual(expectedOrder);
// //     });

// //     it('should sort messages by receivingTime if both receivingTime and sendingTime are present', () => {
// //       const messages = [
// //         {
// //           receivingTime: '2022-01-01T10:00:00.000Z',
// //           sendingTime: '2022-01-01T09:00:00.000Z',
// //         },
// //         {
// //           receivingTime: '2022-01-01T11:00:00.000Z',
// //           sendingTime: '2022-01-01T10:00:00.000Z',
// //         },
// //       ];

// //       component.allMessages = messages;
// //       component.sortMessages();

// //       const expectedOrder = [
// //         {
// //           receivingTime: '2022-01-01T10:00:00.000Z',
// //           sendingTime: '2022-01-01T09:00:00.000Z',
// //         },
// //         {
// //           receivingTime: '2022-01-01T11:00:00.000Z',
// //           sendingTime: '2022-01-01T10:00:00.000Z',
// //         },
// //       ];

// //       expect(component.allMessages).toEqual(expectedOrder);
// //     });

// //     it('should not throw an error if allMessages is empty', () => {
// //       component.allMessages = [];
// //       expect(() => component.sortMessages()).not.toThrow();
// //     });
// //   });

// //   describe('toggleScreen share', () => {
// //     it('should dispatch toggleScreenShare action when toggleScreenShare is called', async () => {
// //       await component.toggleScreenShare();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.LiveKitActions.toggleScreenShare()
// //       );
// //     });
// //   });
// //   describe('toggle Microphone', () => {
// //     it('should dispatch toggleMic action when toggleMic is called', async () => {
// //       await component.toggleMic();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.LiveKitActions.toggleMic()
// //       );
// //     });
// //   });
// //   describe('Open Participant Side Window', () => {
// //     it('should dispatch toggleParticipantSideWindow action when openParticipantSideWindow is called', () => {
// //       component.openParticipantSideWindow();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.LiveKitActions.toggleParticipantSideWindow()
// //       );
// //     });
// //   });
// //   describe('Open Chat Side Window', () => {
// //     it('should dispatch toggleChatSideWindow action when openChatSideWindow is called', () => {
// //       component.openChatSideWindow();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.LiveKitActions.toggleChatSideWindow()
// //       );
// //     });
// //   });
// //   describe('Close Chat Side Window', () => {
// //     it('should dispatch closeChatSideWindow action when closeChatSideWindow is called', () => {
// //       component.closeChatSideWindow();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.LiveKitActions.closeChatSideWindow()
// //       );
// //     });
// //   });
// //   describe('Close Participant Side Window', () => {
// //     it('should dispatch closeParticipantSideWindow action when closeParticipantSideWindow is called', () => {
// //       component.closeParticipantSideWindow();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.LiveKitActions.closeParticipantSideWindow()
// //       );
// //     });
// //   });
// //   it('should handle snack bar opening', () => {
// //     component.openSnackBar('Test Message');
// //     expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test Message', 'Close', {
// //       duration: 3000,
// //     });
// //   });

// //   describe('shouldShowAvatar', () => {
// //     it('should return true for the first message', () => {
// //       component.allMessages = [{ senderName: 'Alice' }];

// //       expect(component.shouldShowAvatar(0)).toBeTrue();
// //     });

// //     it('should return true for different sender from the previous message', () => {
// //       component.allMessages = [{ senderName: 'Alice' }, { senderName: 'Bob' }];

// //       expect(component.shouldShowAvatar(1)).toBeTrue();
// //     });

// //     it('should return false for the same sender as the previous message', () => {
// //       component.allMessages = [
// //         { senderName: 'Alice' },
// //         { senderName: 'Alice' },
// //       ];

// //       expect(component.shouldShowAvatar(1)).toBeFalse();
// //     });
// //   });
// //   describe('Extract Initials', () => {
// //     it('should extract initials from a single word name', () => {
// //       const name = 'John';
// //       const expectedInitials = 'J';

// //       const initials = component.extractInitials(name);

// //       expect(initials).toBe(expectedInitials);
// //     });

// //     it('should extract initials from a multi-word name', () => {
// //       const name = 'John Doe';
// //       const expectedInitials = 'JD';

// //       const initials = component.extractInitials(name);

// //       expect(initials).toBe(expectedInitials);
// //     });

// //     it('should extract initials from a name with multiple spaces', () => {
// //       const name = 'John  Doe';
// //       const expectedInitials = 'JD';

// //       const initials = component.extractInitials(name);

// //       expect(initials).toBe(expectedInitials);
// //     });

// //     it('should return an empty string for an empty name', () => {
// //       const name = '';
// //       const expectedInitials = '';

// //       const initials = component.extractInitials(name);

// //       expect(initials).toBe(expectedInitials);
// //     });
// //   });

// //   describe('leave button', () => {
// //     it('should dispatch leaveMeeting action when leaveBtn is called', async () => {
// //       await component.leaveMeetingRoom();
// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.MeetingActions.leaveMeeting()
// //       );
// //     });

// //     it('should return a promise that resolves to void', async () => {
// //       const result = await component.leaveMeetingRoom();
// //       expect(result).toBeUndefined();
// //     });
// //   });

// //   it('should dispatch toggleVideo action when toggleVideo is called', async () => {
// //     await component.toggleVideo();

// //     expect(dispatchSpy).toHaveBeenCalledWith(
// //       LiveKitRoomActions.LiveKitActions.toggleVideo()
// //     );
// //   });

// //   it('should return "repeat(auto-fill, minmax(200px, 1fr))" for more than 6 participants', () => {
// //     spyOnProperty(
// //       mockLivekitService.room,
// //       'numParticipants',
// //       'get'
// //     ).and.returnValue(7);
// //     expect(component.GalleryGridColumnStyle).toBe(
// //       'repeat(auto-fill, minmax(200px, 1fr))'
// //     );
// //   });

// //   it('should return correct grid column style for more than 6 screen shares', () => {
// //     // Arrange: Set screenShareCount to a value greater than 6
// //     mockLivekitService.screenShareCount = 7;

// //     // Act: Access the getter
// //     const result = component.ScreenGalleryGridColumnStyle;

// //     // Assert: Check the result matches the expected fallback value
// //     expect(result).toBe('repeat(auto-fill, minmax(200px, 1fr))');
// //   });
// //   it('should scroll to bottom of message container', fakeAsync(() => {
// //     // Arrange
// //     const messageContainerElement = new ElementRef<HTMLDivElement>(
// //       document.createElement('div')
// //     );
// //     component.messageContainer = messageContainerElement;
// //     Object.defineProperty(
// //       messageContainerElement.nativeElement,
// //       'scrollHeight',
// //       { value: 1000, configurable: true }
// //     );
// //     Object.defineProperty(messageContainerElement.nativeElement, 'scrollTop', {
// //       value: 0,
// //       writable: true,
// //     });

// //     // Act
// //     component.scrollToBottom();
// //     tick(100); // wait for the setTimeout to complete

// //     // Assert
// //     expect(messageContainerElement.nativeElement.scrollTop).toBe(1000);
// //   }));
// //   describe('isParticipantAssigned', () => {
// //     it('should return true if the participant is assigned to the room', () => {
// //       const room = {
// //         participantIds: ['user1', 'user2', 'user3'],
// //       };
// //       const participant = { identity: 'user2' };

// //       const result = component.isParticipantAssigned(room, participant);

// //       expect(result).toBeTrue(); // Expect the result to be true
// //     });

// //     it('should return false if the participant is not assigned to the room', () => {
// //       const room = {
// //         participantIds: ['user1', 'user2', 'user3'],
// //       };
// //       const participant = { identity: 'user4' };

// //       const result = component.isParticipantAssigned(room, participant);

// //       expect(result).toBeFalse(); // Expect the result to be false
// //     });

// //     it('should return false if the room has no participants', () => {
// //       const room = {
// //         participantIds: [],
// //       };
// //       const participant = { identity: 'user1' };

// //       const result = component.isParticipantAssigned(room, participant);

// //       expect(result).toBeFalse(); // Expect the result to be false
// //     });
// //   });

// //   describe('createNewRoomSidebar', () => {
// //     it('should dispatch initiateCreateNewRoom action', () => {
// //       // Call the method
// //       component.createNewRoomSidebar();

// //       // Check that the correct action was dispatched
// //       expect(store.dispatch).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.createNewRoom()
// //       );
// //     });
// //   });
// //   describe('Open Breakout Side Window', () => {
// //     it('should dispatch toggleBreakoutSideWindow action when open breakout side window is called', () => {
// //       component.openPBreakoutSideWindow();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.toggleBreakoutSideWindow()
// //       );
// //     });
// //   });
// //   describe('Close Breakout Side Window', () => {
// //     it('should dispatch closeBreakoutSideWindow action when closeBreakoutSideWindow is called', () => {
// //       component.closeBreakoutSideWindow();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.closeBreakoutSideWindow()
// //       );
// //     });
// //   });
// //   describe('Open Breakout Modal for automatic or manual selection of rooms', () => {
// //     it('should dispatch toggleBreakoutModal action when open breakout Modal is called', () => {
// //       component.openBreakoutModal();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.openBreakoutModal()
// //       );
// //     });
// //   });
// //   describe('Close Breakout Modal for automatic or manual selection of rooms', () => {
// //     it('should dispatch closeBreakoutModal action when closeBreakoutModal is called', () => {
// //       component.closeBreakoutModal();

// //       expect(dispatchSpy).toHaveBeenCalledTimes(1);
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.closeBreakoutModal()
// //       );
// //     });
// //   });

// //   it('should process incoming messages and update allMessages when messageEmitter emits', () => {
// //     // Arrange
// //     const messageData = {
// //       message: 'Hello, World!',
// //       timestamp: new Date().toISOString(),
// //     };

// //     spyOn(component, 'sortMessages'); // Spy on sortMessages
// //     spyOn(component, 'scrollToBottom'); // Spy on scrollToBottom

// //     // Act
// //     messageEmitter.next(messageData); // Emit a new message

// //     // Assert
// //     expect(component.allMessages.length).toBe(1); // Check if allMessages has one entry
// //     expect(component.allMessages[0]).toEqual({
// //       sendMessage: 'Hello, World!',
// //       sendingTime: messageData.timestamp,
// //       type: 'sent',
// //     });
// //     expect(component.sortMessages).toHaveBeenCalled();
// //     expect(component.scrollToBottom).toHaveBeenCalled();
// //   });
// //   describe('participants which are available to enter in breakout room (getAvailableParticipants)', () => {
// //     it('should return participants not already in the room', () => {
// //       const room = {
// //         participantIds: ['participant1', 'participant2'], // participants already in the room
// //       };

// //       const availableParticipants = component.getAvailableParticipants(room);

// //       // Expect available participants to exclude 'participant1' and 'participant2'
// //       expect(availableParticipants).toEqual([
// //         { identity: 'participant3' },
// //         { identity: 'participant4' },
// //       ]);
// //     });
// //   });
// //   describe('when participant selected (onParticipantSelected)', () => {
// //     it('should dispatch addParticipant action when checkbox is checked', () => {
// //       const room = { roomName: 'Room 2', participantIds: [] };
// //       const participant = { identity: 'participant3' };
// //       const event = { target: { checked: true } };

// //       // Call the method
// //       component.onParticipantSelected(room, participant, event);

// //       // Check that the correct action was dispatched
// //       expect(store.dispatch).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.addParticipant({
// //           roomName: 'Room 2',
// //           participantId: 'participant3',
// //         })
// //       );
// //     });

// //     it('should dispatch removeParticipant action when checkbox is unchecked', () => {
// //       const room = { roomName: 'Room 2', participantIds: [] };
// //       const participant = { identity: 'participant3' };
// //       const event = { target: { checked: false } };

// //       // Call the method
// //       component.onParticipantSelected(room, participant, event);

// //       // Check that the correct action was dispatched
// //       expect(store.dispatch).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.removeParticipant({
// //           roomName: 'Room 2',
// //           participantId: 'participant3',
// //         })
// //       );
// //     });
// //   });
// //   describe('test to join room by participants when host send invitation (joinNow)', () => {
// //     it('should leave the current meeting and then join the breakout room', async () => {
// //       // Spy on the leaveCurrentMeeting and joinBreakoutRoom methods
// //       const leaveMeetingSpy = spyOn(
// //         component,
// //         'leaveCurrentMeeting'
// //       ).and.returnValue(Promise.resolve());
// //       const joinBreakoutRoomSpy = spyOn(component, 'joinBreakoutRoom');

// //       // Call the joinNow method
// //       await component.joinNow();

// //       // Step 1: Ensure leaveCurrentMeeting was called
// //       expect(leaveMeetingSpy).toHaveBeenCalled();

// //       // Step 2: Ensure joinBreakoutRoom is called after leaveCurrentMeeting resolves
// //       expect(joinBreakoutRoomSpy).toHaveBeenCalled();
// //     });
// //   });
// //   describe('leaveCurrentMeeting', () => {
// //     it('should dispatch the leaveMeeting action and resolve the promise', async () => {
// //       // Reuse the existing spy, assuming it was set up elsewhere
// //       const dispatchSpy = component.store.dispatch as jasmine.Spy;

// //       // Call the leaveCurrentMeeting method
// //       await component.leaveCurrentMeeting();

// //       // Verify that the leaveMeeting action was dispatched
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.MeetingActions.leaveMeeting()
// //       );
// //     });
// //   });
// //   describe('hostJoinNow', () => {
// //     beforeEach(() => {
// //       jasmine.getEnv().allowRespy(true);
// //     });
// //     it('should join the existing breakout room when the room exists', async () => {
// //       // Set up mock breakout room data to include the current participant
// //       mockLivekitService.breakoutRoomsData = [
// //         { roomName: 'TestRoom', participantIds: ['hostIdentity'] },
// //       ];

// //       // Spy on the leaveBtn method and return a resolved promise
// //       spyOn(component, 'leaveMeetingRoom').and.returnValue(Promise.resolve());

// //       // Call the hostJoinNow method
// //       await component.hostJoinNow();

// //       // Check if leaveBtn was called as expected
// //       expect(component.leaveMeetingRoom).toHaveBeenCalled();
// //     });
// //     it('should dispatch createMeeting action and log the join message when room exists', async () => {
// //       // Arrange: Mock necessary values
// //       const participantIdentity = 'HostUser';
// //       component.localParticipant = { identity: participantIdentity };
// //       component.roomName = 'TestRoom';

// //       // Mock livekitService to simulate the existing room
// //       component.livekitService = {
// //         breakoutRoomsData: [{ roomName: 'TestRoom' }],
// //       } as any;

// //       // Spy on store dispatch and console.log
// //       const dispatchSpy = spyOn(component.store, 'dispatch');
// //       const consoleLogSpy = spyOn(console, 'log');

// //       // Act: Call the hostJoinNow function
// //       await component.hostJoinNow();

// //       // Assert: Check dispatch and log
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.MeetingActions.createMeeting({
// //           participantNames: [participantIdentity],
// //           roomName: 'TestRoom',
// //         })
// //       );
// //       expect(consoleLogSpy).toHaveBeenCalledWith(
// //         'Host has successfully joined the existing room:',
// //         'TestRoom'
// //       );
// //     });
// //     it('should successfully join an existing room', fakeAsync(() => {
// //       // Arrange
// //       component.roomName = 'Room 1'; // Set the room name to an existing room
// //       component.localParticipant = {
// //         identity: 'hostIdentity',
// //         handRaised: false,
// //       };

// //       // Initialize breakoutRoomsData to contain a room with the expected name
// //       component.livekitService.breakoutRoomsData = [
// //         {
// //           roomName: 'Room 1',
// //           participantIds: ['participant1', 'participant2'],
// //         },
// //         { roomName: 'Room 2', participantIds: [] },
// //       ];

// //       // Act
// //       component.hostJoinNow(); // Call the method to join the room

// //       tick(); // Simulate the passage of time to let any async operations complete

// //       // Assert
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         jasmine.objectContaining({
// //           participantNames: ['hostIdentity'],
// //           roomName: 'Room 1',
// //           type: '[[Meeting]] createMeeting', // Make sure this matches the actual action type
// //         })
// //       );
// //     }));
// //   });
// //   describe('grid columns for participants(get GalleryGridColumnStyle)', () => {
// //     it('should return correct grid column style for participants <= 6', () => {
// //       const testCases = [
// //         { numParticipants: 1, expectedStyle: '1fr' },
// //         { numParticipants: 2, expectedStyle: '1fr 1fr' },
// //         { numParticipants: 3, expectedStyle: '1fr 1fr' },
// //         { numParticipants: 4, expectedStyle: '1fr 1fr' },
// //         { numParticipants: 5, expectedStyle: '1fr 1fr 1fr' },
// //         { numParticipants: 6, expectedStyle: '1fr 1fr 1fr' },
// //       ];

// //       testCases.forEach(({ numParticipants, expectedStyle }) => {
// //         // Dynamically set the number of participants
// //         mockLivekitService.room.numParticipants = numParticipants;
// //         fixture.detectChanges();
// //         expect(component.GalleryGridColumnStyle).toBe(expectedStyle);
// //       });
// //     });

// //     it('should return auto-fill style when participants > 6', () => {
// //       mockLivekitService.room.numParticipants = 7;
// //       fixture.detectChanges();
// //       expect(component.GalleryGridColumnStyle).toBe(
// //         'repeat(auto-fill, minmax(200px, 1fr))'
// //       );
// //     });
// //   });
// //   describe('grid columns for screen sharing (get ScreenGalleryGridColumnStyle)', () => {
// //     it('should return correct grid column style for screen shares <= 6', () => {
// //       const testCases = [
// //         { screenShareCount: 1, expectedStyle: '1fr' },
// //         { screenShareCount: 2, expectedStyle: '1fr 1fr' },
// //         { screenShareCount: 3, expectedStyle: '1fr 1fr' },
// //         { screenShareCount: 4, expectedStyle: '1fr 1fr' },
// //         { screenShareCount: 5, expectedStyle: '1fr 1fr 1fr' },
// //         { screenShareCount: 6, expectedStyle: '1fr 1fr 1fr' },
// //       ];

// //       testCases.forEach(({ screenShareCount, expectedStyle }) => {
// //         mockLivekitService.screenShareCount = screenShareCount; // Set the screenShareCount
// //         fixture.detectChanges(); // Trigger change detection
// //         expect(component.ScreenGalleryGridColumnStyle).toBe(expectedStyle);
// //       });
// //     });

// //     it('should return "repeat(auto-fill, minmax(200px, 1fr))" for screen shares > 6', () => {
// //       mockLivekitService.screenShareCount = 7; // Set screenShareCount to a value greater than 6
// //       fixture.detectChanges(); // Trigger change detection
// //       expect(component.ScreenGalleryGridColumnStyle).toBe(
// //         'repeat(auto-fill, minmax(200px, 1fr))'
// //       );
// //     });
// //   });
// //   describe('sendMessage()', () => {
// //     beforeEach(() => {
// //       jasmine.getEnv().allowRespy(true);
// //     });
// //     it('should dispatch the sendChatMessage action and reset the form', () => {
// //       const dispatchSpy = spyOn(store, 'dispatch');
// //       spyOn(component.chatForm, 'reset');

// //       component.chatForm.setValue({ message: 'Hello', participant: 'User1' });
// //       component.sendMessage();

// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.ChatActions.sendChatMessage({
// //           msg: 'Hello',
// //           recipient: 'User1',
// //         })
// //       );
// //       expect(component.chatForm.reset).toHaveBeenCalled();
// //     });
// //   });

// //   describe('Help message send from breakout room to host (sendHelpRequest())', () => {
// //     it('should send help request message', () => {
// //       const helpMessageContent = 'I need help';

// //       // Call the method to test
// //       component.sendHelpRequest();

// //       // Verify that sendMessageToMainRoom was called with the correct parameters
// //       expect(mockLivekitService.sendMessageToMainRoom).toHaveBeenCalledWith(
// //         component.roomName,
// //         helpMessageContent
// //       );
// //     });
// //   });
// //   describe('Host send message and invitation to breakout room ', () => {
// //     it('should dispatch sendMessageToBreakoutRoom action and clear message content', () => {
// //       // Set initial values directly in the test
// //       component.selectedBreakoutRoom = 'test-breakout-room';
// //       component.messageContent = 'Hello, participants!';

// //       // Call the method
// //       component.sendMessageToBreakoutRoom();

// //       // Check that the sendMessageToBreakoutRoom action was dispatched with the correct arguments
// //       expect(store.dispatch).toHaveBeenCalledWith(
// //         LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
// //           breakoutRoom: 'test-breakout-room',
// //           messageContent: 'Hello, participants!',
// //         })
// //       );

// //       // Check that closeHostToBrMsgModal action was dispatched
// //       expect(store.dispatch).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.closeHostToBrMsgModal()
// //       );

// //       // Check that messageContent and selectedBreakoutRoom are cleared after sending the message
// //       expect(component.messageContent).toBe('');
// //       expect(component.selectedBreakoutRoom).toBe('');
// //     });

// //     it('should dispatch createMeeting action and hide modal in joinBreakoutRoom()', () => {
// //       // Arrange: Set the required roomName and participantName before calling the method
// //       component.roomName = 'TestRoom';
// //       component.participantName = 'Test Participant';

// //       // Act: Call the method
// //       component.joinBreakoutRoom();

// //       // Assert: Verify that the store.dispatch was called with the correct action
// //       expect(store.dispatch).toHaveBeenCalledWith(
// //         LiveKitRoomActions.MeetingActions.createMeeting({
// //           participantNames: ['Test Participant'],
// //           roomName: 'TestRoom',
// //         })
// //       );

// //       // Assert: Verify that the modal is hidden after dispatching
// //       // expect(component.isModalVisible).toBe(false);
// //     });
// //   });

// //   describe('Raise hand and Lower Hand toggleRaiseHand()', () => {
// //     it('should lower hand and update state when handRaised is true', () => {
// //       // Set initial state: hand is raised
// //       component.localParticipant.handRaised = true;

// //       // Create spy for the openSnackBar method within the test
// //       const snackBarSpy = spyOn(component, 'openSnackBar');

// //       // Call the toggleRaiseHand method
// //       component.toggleRaiseHand();

// //       // Expectations when hand is lowered
// //       expect(component.localParticipant.handRaised).toBeFalse();
// //       expect(mockLivekitService.lowerHand).toHaveBeenCalledWith(
// //         component.localParticipant
// //       ); // lowerHand should be called
// //       expect(snackBarSpy).toHaveBeenCalledWith('hostIdentity lowered hand');
// //     });

// //     it('should raise hand and update state when handRaised is false', () => {
// //       // Set initial state: hand is not raised
// //       component.localParticipant.handRaised = false;
// //       // Create spy for the openSnackBar method within the test
// //       const snackBarSpy = spyOn(component, 'openSnackBar');

// //       // Call the toggleRaiseHand method
// //       component.toggleRaiseHand();

// //       // Expectations when hand is lowered
// //       expect(component.localParticipant.handRaised).toBeTrue();
// //       expect(mockLivekitService.raiseHand).toHaveBeenCalledWith(
// //         component.localParticipant
// //       ); // lowerHand should be called
// //       expect(snackBarSpy).toHaveBeenCalledWith('hostIdentity raised hand');
// //     });
// //   });
// //   describe('openHostToBrMsgModal()', () => {
// //     it('should dispatch the openHostToBrMsgModal action', () => {
// //       // Act: Call the method
// //       component.openHostToBrMsgModal();

// //       // Assert: Check that dispatch was called with the correct action
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.openHostToBrMsgModal()
// //       );
// //     });
// //   });
// //   describe('showInvitationModal()', () => {
// //     it('should dispatch the showInvitationModal action', () => {
// //       // Act: Call the method
// //       component.showInvitationModal();

// //       // Assert: Check that dispatch was called with the correct action
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.openInvitationModal()
// //       );
// //     });
// //   });
// //   describe('openReceiveMsgModal()', () => {
// //     it('should dispatch the openReceiveMsgModal action', () => {
// //       // Act: Call the method
// //       component.openReceiveMsgModal();

// //       // Assert: Check that dispatch was called with the correct action
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.openHelpMessageModal()
// //       );
// //     });
// //   });
// //   describe('toggleParticipantsList()', () => {
// //     it('should dispatch the toggleParticipantsList action with the correct index', () => {
// //       // Define a test index
// //       const testIndex = 1;

// //       // Act: Call the method with the test index
// //       component.toggleParticipantsList(testIndex);

// //       // Assert: Check that dispatch was called with the correct action and payload
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.toggleParticipantsList({
// //           index: testIndex,
// //         })
// //       );
// //     });
// //   });
// //   describe('calculateDistribution() message', () => {
// //     it('should dispatch calculateDistribution action with correct parameters', () => {
// //       // Arrange
// //       const numberOfRooms = 3; // Example number of rooms
// //       const totalParticipants = 12; // Example total participants
// //       component.breakoutForm.get('numberOfRooms')?.setValue(numberOfRooms); // Set value in the form control
// //       component.totalParticipants = totalParticipants; // Set the total participants in the component

// //       // Act
// //       component.calculateDistribution(); // Call the method

// //       // Assert
// //       expect(dispatchSpy).toHaveBeenCalledWith(
// //         LiveKitRoomActions.BreakoutActions.calculateDistribution({
// //           numberOfRooms,
// //           totalParticipants,
// //         })
// //       );
// //     });
// //   });
// //   describe('Different Functions of ngoninit', () => {
// //     describe('storeLocalParticipantData', () => {
// //       it('should update localParticipant when new data is received', () => {
// //         // Arrange
// //         const testData = { name: 'Test Participant', id: 'participant1' };
// //         const mockLocalParticipantData = new Subject<any>(); // Create a new Subject for each test

// //         // Override the livekitService's localParticipantData observable
// //         mockLivekitService.localParticipantData =
// //           mockLocalParticipantData.asObservable();

// //         // Call the method to set up the subscription
// //         component.storeLocalParticipantData();

// //         // Spy on console.log
// //         spyOn(console, 'log'); // Ensure console.log is mocked

// //         // Act
// //         mockLocalParticipantData.next(testData); // Emit new data

// //         // Assert
// //         expect(component.localParticipant).toEqual(testData); // Check if localParticipant is updated
// //         expect(console.log).toHaveBeenCalledWith(
// //           'local Participant name updated:',
// //           testData
// //         );
// //       });
// //     });
// //     describe('storeRemoteParticipantNames', () => {
// //       let mockParticipantNamesUpdated: Subject<any>;

// //       beforeEach(() => {
// //         mockParticipantNamesUpdated = new Subject<any>();
// //         mockLivekitService.participantNamesUpdated =
// //           mockParticipantNamesUpdated.asObservable();
// //       });

// //       it('should update remoteParticipantNames and totalParticipants when new names are received', () => {
// //         // Arrange
// //         const testNames = ['Participant 1', 'Participant 2'];

// //         // Act
// //         component.storeRemoteParticipantNames();
// //         mockParticipantNamesUpdated.next(testNames); // Emit new names

// //         // Assert
// //         expect(component.remoteParticipantNames).toEqual(testNames); // Check remoteParticipantNames update
// //         expect(component.totalParticipants).toEqual(testNames.length); // Check totalParticipants update
// //       });

// //       it('should log an error if participantNamesUpdated is undefined', () => {
// //         // Arrange
// //         mockLivekitService.participantNamesUpdated = undefined;
// //         spyOn(console, 'error'); // Spy on console.error

// //         // Act
// //         component.storeRemoteParticipantNames();

// //         // Assert
// //         expect(console.error).toHaveBeenCalledWith(
// //           'participantNamesUpdated is undefined'
// //         );
// //       });
// //     });
// //     describe('handleMsgDataReceived', () => {
// //       it('should subscribe to msgDataReceived and call handleMsgDataReceived', () => {
// //         const mockData = {
// //           participant: { identity: 'participant1' },
// //           message: { message: 'Hello world' },
// //         };

// //         spyOn(component, 'handleMsgDataReceived'); // Spy on the method to check if it gets called

// //         // Simulate message reception by emitting data
// //         msgDataReceived.next(mockData);

// //         expect(component.handleMsgDataReceived).toHaveBeenCalledWith(mockData);
// //       });
// //     });
// //     describe('setupMessageSubscriptions, when subscribe messageToMain', () => {
// //       it('should subscribe to messageToMain and process messages correctly', () => {
// //         const mockMsgArray = [
// //           { content: 'I need help', title: 'User1', timestamp: Date.now() },
// //           {
// //             content: 'Some other message',
// //             title: 'User2',
// //             timestamp: Date.now(),
// //           },
// //         ];

// //         spyOn(component, 'openReceiveMsgModal'); // Spy on the method to check if it gets called

// //         // Simulate message reception by emitting the message array
// //         mockLivekitService.messageToMain.next(mockMsgArray);

// //         expect(component.allMessagesToMainRoom.length).toBe(1); // Check if one message was added
// //         expect(component.allMessagesToMainRoom[0]).toEqual(
// //           jasmine.objectContaining({
// //             senderName: 'User1',
// //             receivedMsg: 'I need help',
// //             receivingTime: jasmine.any(Date), // Check that it is a Date
// //             type: 'received',
// //           })
// //         );

// //         expect(component.roomName).toBe('User1'); // Check if roomName is set correctly
// //         expect(component.openReceiveMsgModal).toHaveBeenCalled(); // Check if the modal was opened
// //       });

// //       it('should not process messages that do not match the content criteria', () => {
// //         const mockMsgArray = [
// //           { content: 'Not important', title: 'User3', timestamp: Date.now() },
// //         ];

// //         mockLivekitService.messageToMain.next(mockMsgArray); // Emit a message that should be ignored

// //         expect(component.allMessagesToMainRoom.length).toBe(0); // Should not add any messages
// //       });
// //     });
// //     describe('setupMessageSubscriptions, when subscribe messageContentReceived', () => {
// //       it('should subscribe to messageContentReceived and call handleNewMessage for valid messages', () => {
// //         const mockContentArray = [
// //           { content: 'Hello world', title: 'test-room' },
// //           { content: 'Ignored message', title: 'other-room' },
// //           { content: null, title: 'test-room' }, // Should be ignored
// //         ];

// //         spyOn(component, 'handleNewMessage'); // Spy on the method to check if it gets called

// //         // Simulate message content reception by emitting the content array
// //         mockLivekitService.messageContentReceived.next(mockContentArray);

// //         expect(component.handleNewMessage).toHaveBeenCalledWith(
// //           mockContentArray[0]
// //         ); // Check if handleNewMessage was called for valid message
// //         expect(component.handleNewMessage).toHaveBeenCalledTimes(1); // Should only be called once
// //       });
// //       it('should not call handleNewMessage for messages that do not meet criteria', () => {
// //         const mockContentArray = [
// //           { content: 'Hello world', title: 'other-room' }, // Invalid title
// //           { content: null, title: 'test-room' }, // Invalid content
// //         ];

// //         spyOn(component, 'handleNewMessage');

// //         // Simulate message content reception
// //         mockLivekitService.messageContentReceived.next(mockContentArray);

// //         expect(component.handleNewMessage).not.toHaveBeenCalled(); // Should not be called for any invalid messages
// //       });
// //     });
// //   });
// //   describe('Create Automatic breakout room and form submit ()', () => {
// //     it('should dispatch initiateAutomaticRoomCreation action with participants and numberOfRooms if roomType is automatic and numberOfRooms > 0', async () => {
// //       // Arrange
// //       component.breakoutForm.get('roomType')?.setValue('automatic');
// //       component.breakoutForm.get('numberOfRooms')?.setValue(2);

// //       component.remoteParticipantNames = [
// //         { identity: 'participant1' },
// //         { identity: 'participant2' },
// //         { identity: 'participant3' },
// //         { identity: 'participant4' },
// //       ];

// //       const expectedAction =
// //         LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
// //           participants: [
// //             'participant1',
// //             'participant2',
// //             'participant3',
// //             'participant4',
// //           ],
// //           numberOfRooms: 2,
// //         });

// //       // Act
// //       await component.submitBreakoutForm();

// //       // Assert
// //       expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
// //     });

// //     it('should not dispatch initiateAutomaticRoomCreation if roomType is not automatic', async () => {
// //       // Arrange
// //       component.breakoutForm.get('roomType')?.setValue('manual');
// //       component.breakoutForm.get('numberOfRooms')?.setValue(2);

// //       // Act
// //       await component.submitBreakoutForm();

// //       // Assert
// //       expect(store.dispatch).not.toHaveBeenCalledWith(
// //         jasmine.objectContaining({ type: 'initiateAutomaticRoomCreation' })
// //       );
// //     });

// //     it('should not dispatch initiateAutomaticRoomCreation if numberOfRooms is 0 or less', async () => {
// //       // Arrange
// //       component.breakoutForm.get('roomType')?.setValue('automatic');
// //       component.breakoutForm.get('numberOfRooms')?.setValue(0);

// //       // Act
// //       await component.submitBreakoutForm();

// //       // Assert
// //       expect(store.dispatch).not.toHaveBeenCalledWith(
// //         jasmine.objectContaining({ type: 'initiateAutomaticRoomCreation' })
// //       );
// //     });
// //   });
// //   it('should set roomName and hostName and call showInvitationModal when message type is "breakoutRoom"', () => {
// //     const mockData = {
// //       participant: { identity: 'participant1' },
// //       message: {
// //         type: 'breakoutRoom',
// //         roomName: 'NewRoom',
// //       },
// //     };

// //     spyOn(component, 'showInvitationModal'); // Spy on the method to check if it gets called

// //     component.handleMsgDataReceived(mockData);

// //     expect(component.roomName).toBe('NewRoom');
// //     expect(component.hostName).toBe('participant1');
// //     expect(component.showInvitationModal).toHaveBeenCalled();
// //   });
// //   describe('ngAfterViewInit testing', () => {
// //     it('should handle valid screen share track', () => {
// //       const mockTrack: RemoteTrack = {
// //         source: Track.Source.ScreenShare,
// //         // Add other required properties and methods for the RemoteTrack mock
// //       } as RemoteTrack;

// //       // Emit a valid screen share track
// //       screenShareTrackSubscribed.next(mockTrack);

// //       expect(component.screenShareTrack).toBe(mockTrack); // Check if the track is set correctly
// //     });

// //     it('should reset screenShareTrack on invalid track', () => {
// //       // Emit an undefined track
// //       screenShareTrackSubscribed.next(undefined);

// //       expect(component.screenShareTrack).toBeUndefined(); // Check if the track is reset
// //     });

// //     it('should log an error if screenShareTrackSubscribed is undefined', () => {
// //       spyOn(console, 'error'); // Spy on console.error to track calls

// //       // Set screenShareTrackSubscribed to undefined
// //       mockLivekitService.screenShareTrackSubscribed = undefined;

// //       // Call ngAfterViewInit to trigger the code
// //       component.ngAfterViewInit();

// //       // Verify the error was logged
// //       expect(console.error).toHaveBeenCalledWith(
// //         'screenShareTrackSubscribed is undefined'
// //       );
// //     });
// //   });
// //   // it('should subscribe to webSocketStatus$ and update webSocketStatus accordingly', () => {

// //   //   const statusMock = 'connected';

// //   //   // Trigger the observable
// //   //   webSocketStatusSubject.next(statusMock);

// //   //   // Verify that the component's status property was updated
// //   //   expect(component.webSocketStatus).toBe(statusMock);
// //   //   expect(console.log).toHaveBeenCalledWith(
// //   //     'WebSocket status updated:',
// //   //     statusMock
// //   //   );
// //   // });

// //   it('should subscribe to webSocketStatus$ and update webSocketStatus', () => {
// //     const mockStatus = 'Connected';

// //     // Set up the observable to emit the mock status
// //     mockLivekitService.webSocketStatus$ = of(mockStatus);

// //     // Initialize the component
// //     component.ngOnInit();

// //     // Verify that webSocketStatus is updated
// //     expect(component.webSocketStatus).toBe(mockStatus);
// //     console.log = jasmine.createSpy('log'); // Mock console.log to prevent output during tests
// //     component.ngOnInit();
// //     expect(console.log).toHaveBeenCalledWith(
// //       'WebSocket status updated:',
// //       mockStatus
// //     );
// //   });
// // });

// import {
//   ComponentFixture,
//   discardPeriodicTasks,
//   fakeAsync,
//   TestBed,
//   tick,
// } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { LivekitService } from '../livekit.service';
// import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { BehaviorSubject, of, Subject } from 'rxjs';
// import { ElementRef, EventEmitter, Renderer2 } from '@angular/core';
// import { LivekitRoomComponent } from './livekit-room.component';
// import { Store, StoreModule } from '@ngrx/store';
// import * as LiveKitRoomActions from '../+state/livekit/livekit-room.actions';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { RemoteTrack, Track } from 'livekit-client';
// import { ActivatedRoute } from '@angular/router';

// class MockLiveKitService {
//   toggleVideo() {
//     return Promise.resolve();
//   }
// }
// describe('LiveKitRoomComponent;', () => {
//   let component: LivekitRoomComponent;
//   let fixture: ComponentFixture<LivekitRoomComponent>;
//   let mockMatSnackBar: MatSnackBar;
//   let mockLivekitService: any;
//   let msgDataReceived: Subject<any>;
//   let messageEmitter: Subject<any>;
//   let screenShareTrackSubscribed: Subject<any>;
//   let store: any;
//   let dispatchSpy: jasmine.Spy;
//   let formBuilder: FormBuilder;
//   let mockElementRef: ElementRef;
//   let webSocketStatusSubject: Subject<string>;
//   let paramsSubject: BehaviorSubject<any>;

//   const GRIDCOLUMN: { [key: number]: string } = {
//     1: '1fr',
//     2: '1fr 1fr',
//     3: '1fr 1fr',
//     4: '1fr 1fr',
//     5: '1fr 1fr 1fr',
//     6: '1fr 1fr 1fr',
//   };
//   const PIPGRIDCOLUMN: { [key: number]: string } = {
//     1: '1fr',
//     2: '1fr',
//     3: '1fr',
//     4: '1fr 1fr',
//     5: '1fr 1fr',
//     6: '1fr 1fr',
//     7: '1fr 1fr',
//     8: '1fr 1fr',
//     9: '1fr 1fr 1fr',
//     10: '1fr 1fr 1fr',
//     11: '1fr 1fr 1fr',
//     12: '1fr 1fr 1fr',
//     13: '1fr 1fr 1fr',
//     14: '1fr 1fr 1fr',
//     15: '1fr 1fr 1fr',
//     16: '1fr 1fr 1fr 1fr',
//     17: '1fr 1fr 1fr 1fr',
//     18: '1fr 1fr 1fr 1fr',
//     19: '1fr 1fr 1fr 1fr',
//     20: '1fr 1fr 1fr 1fr',
//     21: '1fr 1fr 1fr 1fr',
//   };
//   beforeEach(async () => {
//     paramsSubject = new BehaviorSubject({ roomname: 'test-room' });
//     const deviceListsSubject = new Subject<any>();
//     msgDataReceived = new Subject<any>();
//     messageEmitter = new Subject<any>();
//     screenShareTrackSubscribed = new Subject<any>();
//     webSocketStatusSubject = new Subject<string>();
//     mockLivekitService = {
//       messageEmitter: messageEmitter.asObservable(),
//       msgDataReceived: msgDataReceived.asObservable(),
//       sendChatMessage: jasmine.createSpy('sendChatMessage'),
//       raiseHand: jasmine.createSpy('raiseHand'),
//       lowerHand: jasmine.createSpy('lowerHand'),
//       sendMessageToBreakoutRoom: jasmine.createSpy('sendMessageToBreakoutRoom'),
//       sendMessageToMainRoom: jasmine.createSpy('sendMessageToMainRoom'),
//       toggleVideo: jasmine
//         .createSpy('toggleVideo')
//         .and.returnValue(Promise.resolve()),
//       connectToRoom: jasmine
//         .createSpy('connectToRoom')
//         .and.returnValue(Promise.resolve()),
//       enableCameraAndMicrophone: jasmine
//         .createSpy('enableCameraAndMicrophone')
//         .and.returnValue(Promise.resolve()),
//       room: {
//         _numParticipants: 0,
//         remoteParticipants: new Map(),
//         get numParticipants() {
//           return this._numParticipants;
//         },
//         set numParticipants(value: number) {
//           this._numParticipants = value;
//         },
//       },
//       audioVideoHandler: jasmine.createSpy('audioVideoHandler'),
//       webSocketStatus$: new Subject(),
//       messageToMain: new EventEmitter<string[]>(),
//       messageContentReceived: new EventEmitter<string[]>(),
//       attachTrackToElement: jasmine.createSpy('attachTrackToElement'),
//       participantNamesUpdated: new EventEmitter<string[]>(),
//       remoteVideoTrackSubscribed: new EventEmitter<RemoteTrack>(),
//       remoteAudioTrackSubscribed: new EventEmitter<void>(),
//       breakoutRoomsDataUpdated: jasmine.createSpy('emit'),
//       screenShareTrackSubscribed: screenShareTrackSubscribed.asObservable(),
//       handleTrackSubscribed: jasmine.createSpy('handleTrackSubscribed'),
//       switchSpeakerViewLayout: jasmine.createSpy('switchSpeakerViewLayout'),
//       sendCloseAlertToBreakoutRooms: jasmine.createSpy(
//         'sendCloseAlertToBreakoutRooms'
//       ),
//       speakerModeLayout: false,
//       showInitialSpeaker: jasmine.createSpy('showInitialSpeaker'),
//       switchDevice: jasmine
//         .createSpy('switchDevice')
//         .and.returnValue(Promise.resolve()),
//       deviceLists$: deviceListsSubject,
//       getAllDevices: jasmine.createSpy('getAllDevices').and.returnValue(
//         Promise.resolve({
//           cameras: [{ deviceId: 'video1' }],
//           microphones: [{ deviceId: 'mic1' }],
//           speakers: [{ deviceId: 'speaker1' }],
//         })
//       ),
//       updateDeviceLists: jasmine.createSpy('updateDeviceLists'),
//       params: new Subject<{ roomname: string }>(),
//     };
//     await TestBed.configureTestingModule({
//       imports: [
//         RouterTestingModule,
//         ReactiveFormsModule,
//         FormsModule,
//         MatSnackBarModule,
//         MatDialogModule,
//         NoopAnimationsModule,
//         StoreModule.forRoot({}),
//         HttpClientTestingModule,
//       ],
//       declarations: [LivekitRoomComponent],
//       providers: [
//         {
//           provide: ActivatedRoute,
//           useValue: {
//             params: paramsSubject.asObservable(), // Use BehaviorSubject as params
//           },
//         },
//         { provide: ElementRef, useValue: mockElementRef },
//         { provide: LivekitService, useValue: mockLivekitService },
//         FormBuilder,
//         {
//           provide: MatDialog,
//           useValue: jasmine.createSpyObj('MatDialog', ['open']),
//         },
//         {
//           provide: MatSnackBar,
//           useValue: jasmine.createSpyObj('MatSnackBar', ['open']),
//         },
//       ],
//     });

//     mockMatSnackBar = TestBed.inject(MatSnackBar);
//     fixture = TestBed.createComponent(LivekitRoomComponent);
//     component = fixture.componentInstance;
//     (component as any).PIPGRIDCOLUMN = PIPGRIDCOLUMN;
//     store = TestBed.inject(Store);
//     dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
//     formBuilder = TestBed.inject(FormBuilder);
//     component.chatForm = formBuilder.group({
//       message: ['Test message'],
//       participant: ['Test participant'],
//     });
//     component.breakoutForm = formBuilder.group({
//       roomType: ['automatic'],
//       numberOfRooms: [2],
//     });
//     component.localParticipant = {
//       identity: 'hostIdentity',
//       handRaised: false,
//     };
//     component.roomName = 'TestRoom';
//     // component.dynamicRoomName = 'TestRoom';
//     component.remoteParticipantNames = [
//       { identity: 'participant1' },
//       { identity: 'participant2' },
//       { identity: 'participant3' },
//       { identity: 'participant4' },
//     ];
//     component.allMessages = [];
//     component.handRaiseStates = {};
//     fixture.detectChanges();
//   });
//   it('should create the app component', () => {
//     expect(component).toBeTruthy();
//   });

//   describe('start meeting', () => {
//     it('should dispatch createMeeting action with correct payload', async () => {
//       // Call the startMeeting method
//       await component.startMeeting();

//       // Check that the dispatch method was called
//       expect(store.dispatch).toHaveBeenCalled();

//       // Check that the dispatch was called with the correct action and payload
//       const expectedAction = LiveKitRoomActions.MeetingActions.createMeeting({
//         participantNames: [component.participantName],
//         roomName: '',
//       });

//       expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
//     });
//   });

//   describe('Sort Messages', () => {
//     it('should sort messages by receivingTime or sendingTime in ascending order', () => {
//       const messages = [
//         { receivingTime: '2022-01-01T10:00:00.000Z' },
//         { sendingTime: '2022-01-01T09:00:00.000Z' },
//         { receivingTime: '2022-01-01T11:00:00.000Z' },
//         { sendingTime: '2022-01-01T08:00:00.000Z' },
//       ];

//       component.allMessages = messages;
//       component.sortMessages();

//       const expectedOrder = [
//         { sendingTime: '2022-01-01T08:00:00.000Z' },
//         { sendingTime: '2022-01-01T09:00:00.000Z' },
//         { receivingTime: '2022-01-01T10:00:00.000Z' },
//         { receivingTime: '2022-01-01T11:00:00.000Z' },
//       ];

//       expect(component.allMessages).toEqual(expectedOrder);
//     });

//     it('should sort messages by receivingTime if both receivingTime and sendingTime are present', () => {
//       const messages = [
//         {
//           receivingTime: '2022-01-01T10:00:00.000Z',
//           sendingTime: '2022-01-01T09:00:00.000Z',
//         },
//         {
//           receivingTime: '2022-01-01T11:00:00.000Z',
//           sendingTime: '2022-01-01T10:00:00.000Z',
//         },
//       ];

//       component.allMessages = messages;
//       component.sortMessages();

//       const expectedOrder = [
//         {
//           receivingTime: '2022-01-01T10:00:00.000Z',
//           sendingTime: '2022-01-01T09:00:00.000Z',
//         },
//         {
//           receivingTime: '2022-01-01T11:00:00.000Z',
//           sendingTime: '2022-01-01T10:00:00.000Z',
//         },
//       ];

//       expect(component.allMessages).toEqual(expectedOrder);
//     });

//     it('should not throw an error if allMessages is empty', () => {
//       component.allMessages = [];
//       expect(() => component.sortMessages()).not.toThrow();
//     });
//   });

//   describe('toggleScreen share', () => {
//     // it('should dispatch toggleScreenShare action when toggleScreenShare is called', async () => {
//     //   await component.toggleScreenShare();

//     //   expect(dispatchSpy).toHaveBeenCalledTimes(1);
//     //   expect(dispatchSpy).toHaveBeenCalledWith(
//     //     LiveKitRoomActions.LiveKitActions.toggleScreenShare()
//     //   );
//     // });
//     it('should dispatch toggleScreenShare action, set speakerModeLayout to false, and call switchSpeakerViewLayout', async () => {
//       // Call the method
//       await component.toggleScreenShare();

//       // Assert the action is dispatched
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.LiveKitActions.toggleScreenShare()
//       );

//       // Assert speakerModeLayout is set to false
//       expect(mockLivekitService.speakerModeLayout).toBeFalse();

//       // Assert switchSpeakerViewLayout is called
//       // expect(mockLivekitService.switchSpeakerViewLayout).toHaveBeenCalled();
//     });
//   });
//   describe('toggle Microphone', () => {
//     it('should dispatch toggleMic action when toggleMic is called', async () => {
//       await component.toggleMic();

//       expect(dispatchSpy).toHaveBeenCalledTimes(1);
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.LiveKitActions.toggleMic()
//       );
//     });
//   });
//   describe('Open Participant Side Window', () => {
//     it('should dispatch toggleParticipantSideWindow action when openParticipantSideWindow is called', () => {
//       component.openParticipantSideWindow();

//       expect(dispatchSpy).toHaveBeenCalledTimes(1);
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.LiveKitActions.toggleParticipantSideWindow()
//       );
//     });
//   });
//   describe('Open Chat Side Window', () => {
//     it('should dispatch toggleChatSideWindow action when openChatSideWindow is called', () => {
//       component.openChatSideWindow();

//       expect(dispatchSpy).toHaveBeenCalledTimes(1);
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.LiveKitActions.toggleChatSideWindow()
//       );
//     });
//   });
//   describe('Close Chat Side Window', () => {
//     it('should dispatch closeChatSideWindow action when closeChatSideWindow is called', () => {
//       component.closeChatSideWindow();

//       expect(dispatchSpy).toHaveBeenCalledTimes(1);
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.LiveKitActions.closeChatSideWindow()
//       );
//     });
//   });
//   describe('Close Participant Side Window', () => {
//     it('should dispatch closeParticipantSideWindow action when closeParticipantSideWindow is called', () => {
//       component.closeParticipantSideWindow();

//       expect(dispatchSpy).toHaveBeenCalledTimes(1);
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.LiveKitActions.closeParticipantSideWindow()
//       );
//     });
//   });
//   it('should handle snack bar opening', () => {
//     component.openSnackBar('Test Message');
//     expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test Message', 'Close', {
//       duration: 3000,
//     });
//   });

//   describe('shouldShowAvatar', () => {
//     it('should return true for the first message', () => {
//       component.allMessages = [{ senderName: 'Alice' }];

//       expect(component.shouldShowAvatar(0)).toBeTrue();
//     });

//     it('should return true for different sender from the previous message', () => {
//       component.allMessages = [{ senderName: 'Alice' }, { senderName: 'Bob' }];

//       expect(component.shouldShowAvatar(1)).toBeTrue();
//     });

//     it('should return false for the same sender as the previous message', () => {
//       component.allMessages = [
//         { senderName: 'Alice' },
//         { senderName: 'Alice' },
//       ];

//       expect(component.shouldShowAvatar(1)).toBeFalse();
//     });
//   });
//   describe('Extract Initials', () => {
//     it('should extract initials from a single word name', () => {
//       const name = 'John';
//       const expectedInitials = 'J';

//       const initials = component.extractInitials(name);

//       expect(initials).toBe(expectedInitials);
//     });

//     it('should extract initials from a multi-word name', () => {
//       const name = 'John Doe';
//       const expectedInitials = 'JD';

//       const initials = component.extractInitials(name);

//       expect(initials).toBe(expectedInitials);
//     });

//     it('should extract initials from a name with multiple spaces', () => {
//       const name = 'John  Doe';
//       const expectedInitials = 'JD';

//       const initials = component.extractInitials(name);

//       expect(initials).toBe(expectedInitials);
//     });

//     it('should return an empty string for an empty name', () => {
//       const name = '';
//       const expectedInitials = '';

//       const initials = component.extractInitials(name);

//       expect(initials).toBe(expectedInitials);
//     });
//   });

//   describe('leave button', () => {
//     it('should dispatch leaveMeeting action when leaveBtn is called', async () => {
//       await component.leaveMeetingRoom();
//       expect(dispatchSpy).toHaveBeenCalledTimes(1);
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.MeetingActions.leaveMeeting()
//       );
//     });

//     it('should return a promise that resolves to void', async () => {
//       const result = await component.leaveMeetingRoom();
//       expect(result).toBeUndefined();
//     });
//   });

//   it('should dispatch toggleVideo action when toggleVideo is called', async () => {
//     await component.toggleVideo();

//     expect(dispatchSpy).toHaveBeenCalledWith(
//       LiveKitRoomActions.LiveKitActions.toggleVideo()
//     );
//   });

//   it('should return "repeat(auto-fill, minmax(200px, 1fr))" for more than 6 participants', () => {
//     spyOnProperty(
//       mockLivekitService.room,
//       'numParticipants',
//       'get'
//     ).and.returnValue(7);
//     expect(component.GalleryGridColumnStyle).toBe(
//       'repeat(auto-fill, minmax(200px, 1fr))'
//     );
//   });

//   it('should return correct grid column style for more than 6 screen shares', () => {
//     // Arrange: Set screenShareCount to a value greater than 6
//     mockLivekitService.screenShareCount = 7;

//     // Act: Access the getter
//     const result = component.ScreenGalleryGridColumnStyle;

//     // Assert: Check the result matches the expected fallback value
//     expect(result).toBe('repeat(auto-fill, minmax(200px, 1fr))');
//   });

//   // // it('should scroll to bottom of message container', fakeAsync(() => {
//   // //   // Arrange
//   // //   const messageContainerElement = new ElementRef<HTMLDivElement>(
//   // //     document.createElement('div')
//   // //   );
//   // //   component.messageContainer = messageContainerElement;
//   // //   Object.defineProperty(
//   // //     messageContainerElement.nativeElement,
//   // //     'scrollHeight',
//   // //     { value: 1000, configurable: true }
//   // //   );
//   // //   Object.defineProperty(messageContainerElement.nativeElement, 'scrollTop', {
//   // //     value: 0,
//   // //     writable: true,
//   // //   });

//   // //   // Act
//   // //   component.scrollToBottom();
//   // //   tick(100); // wait for the setTimeout to complete

//   // //   // Assert
//   // //   expect(messageContainerElement.nativeElement.scrollTop).toBe(1000);
//   // // }));
//   // describe('isParticipantAssigned', () => {
//   //   it('should return true if the participant is assigned to the room', () => {
//   //     const room = {
//   //       participantIds: ['user1', 'user2', 'user3'],
//   //     };
//   //     const participant = { identity: 'user2' };

//   //     const result = component.isParticipantAssigned(room, participant);

//   //     expect(result).toBeTrue(); // Expect the result to be true
//   //   });

//   //   it('should return false if the participant is not assigned to the room', () => {
//   //     const room = {
//   //       participantIds: ['user1', 'user2', 'user3'],
//   //     };
//   //     const participant = { identity: 'user4' };

//   //     const result = component.isParticipantAssigned(room, participant);

//   //     expect(result).toBeFalse(); // Expect the result to be false
//   //   });

//   //   it('should return false if the room has no participants', () => {
//   //     const room = {
//   //       participantIds: [],
//   //     };
//   //     const participant = { identity: 'user1' };

//   //     const result = component.isParticipantAssigned(room, participant);

//   //     expect(result).toBeFalse(); // Expect the result to be false
//   //   });
//   // });

//   // // describe('createNewRoomSidebar', () => {
//   // //   it('should dispatch initiateCreateNewRoom action', () => {
//   // //     // Call the method
//   // //     component.createNewRoomSidebar();

//   // //     // Check that the correct action was dispatched
//   // //     expect(store.dispatch).toHaveBeenCalledWith(
//   // //       LiveKitRoomActions.BreakoutActions.initiateCreateNewRoom()
//   // //     );
//   // //   });
//   // // });
//   describe('Open Breakout Side Window', () => {
//     it('should dispatch toggleBreakoutSideWindow action when open breakout side window is called', () => {
//       component.openPBreakoutSideWindow();

//       expect(dispatchSpy).toHaveBeenCalledTimes(1);
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.toggleBreakoutSideWindow()
//       );
//     });
//   });
//   describe('Close Breakout Side Window', () => {
//     it('should dispatch closeBreakoutSideWindow action when closeBreakoutSideWindow is called', () => {
//       component.closeBreakoutSideWindow();

//       expect(dispatchSpy).toHaveBeenCalledTimes(1);
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.closeBreakoutSideWindow()
//       );
//     });
//   });
//   // describe('Open Breakout Modal for automatic or manual selection of rooms', () => {
//   //   it('should dispatch toggleBreakoutModal action when open breakout Modal is called', () => {
//   //     component.openBreakoutModal();

//   //     expect(dispatchSpy).toHaveBeenCalledTimes(1);
//   //     expect(dispatchSpy).toHaveBeenCalledWith(
//   //       LiveKitRoomActions.BreakoutActions.openBreakoutModal()
//   //     );
//   //   });
//   // });
//   // describe('Close Breakout Modal for automatic or manual selection of rooms', () => {
//   //   it('should dispatch closeBreakoutModal action when closeBreakoutModal is called', () => {
//   //     component.closeBreakoutModal();

//   //     expect(dispatchSpy).toHaveBeenCalledTimes(1);
//   //     expect(dispatchSpy).toHaveBeenCalledWith(
//   //       LiveKitRoomActions.BreakoutActions.closeBreakoutModal()
//   //     );
//   //   });
//   // });

//   it('should process incoming messages and update allMessages when messageEmitter emits', () => {
//     // Arrange
//     const messageData = {
//       message: 'Hello, World!',
//       timestamp: new Date().toISOString(),
//     };

//     spyOn(component, 'sortMessages'); // Spy on sortMessages
//     spyOn(component, 'scrollToBottom'); // Spy on scrollToBottom

//     // Act
//     messageEmitter.next(messageData); // Emit a new message

//     // Assert
//     expect(component.allMessages.length).toBe(1); // Check if allMessages has one entry
//     expect(component.allMessages[0]).toEqual({
//       sendMessage: 'Hello, World!',
//       sendingTime: messageData.timestamp,
//       type: 'sent',
//     });
//     expect(component.sortMessages).toHaveBeenCalled();
//     expect(component.scrollToBottom).toHaveBeenCalled();
//   });
//   // describe('participants which are available to enter in breakout room (getAvailableParticipants)', () => {
//   //   it('should return participants not already in the room', () => {
//   //     const room = {
//   //       participantIds: ['participant1', 'participant2'], // participants already in the room
//   //     };

//   //     const availableParticipants = component.getAvailableParticipants(room);

//   //     // Expect available participants to exclude 'participant1' and 'participant2'
//   //     expect(availableParticipants).toEqual([
//   //       { identity: 'participant3' },
//   //       { identity: 'participant4' },
//   //     ]);
//   //   });
//   // });
//   describe('when participant selected (onParticipantSelected)', () => {
//     // it('should dispatch addParticipant action when checkbox is checked', () => {
//     //   const room = { roomName: 'Room 2', participantIds: [] };
//     //   const participant = { identity: 'participant3' };
//     //   const event = { target: { checked: true } };

//     //   // Call the method
//     //   component.onParticipantSelected(room, participant, event);

//     //   // Check that the correct action was dispatched
//     //   expect(store.dispatch).toHaveBeenCalledWith(
//     //     LiveKitRoomActions.BreakoutActions.addParticipant({
//     //       roomName: 'Room 2',
//     //       participantId: 'participant3',
//     //     })
//     //   );
//     // });

//     it('should dispatch removeParticipant action when checkbox is unchecked', () => {
//       const room = { roomName: 'Room 2', participantIds: [] };
//       const participant = { identity: 'participant3' };
//       const event = { target: { checked: false } };

//       // Call the method
//       component.onParticipantSelected(room, participant, event);

//       // Check that the correct action was dispatched
//       expect(store.dispatch).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.removeParticipant({
//           roomName: 'Room 2',
//           participantId: 'participant3',
//         })
//       );
//     });
//   });
//   describe('test to join room by participants when host send invitation (joinNow)', () => {
//     it('should leave the current meeting and then join the breakout room', async () => {
//       // Spy on the leaveCurrentMeeting and joinBreakoutRoom methods
//       const leaveMeetingSpy = spyOn(
//         component,
//         'leaveCurrentMeeting'
//       ).and.returnValue(Promise.resolve());
//       const joinBreakoutRoomSpy = spyOn(component, 'joinBreakoutRoom');

//       // Call the joinNow method
//       await component.joinNow();

//       // Step 1: Ensure leaveCurrentMeeting was called
//       expect(leaveMeetingSpy).toHaveBeenCalled();

//       // Step 2: Ensure joinBreakoutRoom is called after leaveCurrentMeeting resolves
//       expect(joinBreakoutRoomSpy).toHaveBeenCalled();
//     });
//   });
//   describe('leaveCurrentMeeting', () => {
//     it('should dispatch the leaveMeeting action and resolve the promise', async () => {
//       // Reuse the existing spy, assuming it was set up elsewhere
//       const dispatchSpy = component.store.dispatch as jasmine.Spy;

//       // Call the leaveCurrentMeeting method
//       await component.leaveCurrentMeeting();

//       // Verify that the leaveMeeting action was dispatched
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.MeetingActions.leaveMeeting()
//       );
//     });
//   });
//   describe('hostJoinNow', () => {
//     beforeEach(() => {
//       jasmine.getEnv().allowRespy(true);
//     });
//     it('should join the existing breakout room when the room exists', async () => {
//       // Set up mock breakout room data to include the current participant
//       mockLivekitService.breakoutRoomsData = [
//         { roomName: 'TestRoom', participantIds: ['hostIdentity'] },
//       ];

//       // Spy on the leaveBtn method and return a resolved promise
//       spyOn(component, 'leaveMeetingRoom').and.returnValue(Promise.resolve());

//       // Call the hostJoinNow method
//       await component.hostJoinNow();

//       // Check if leaveBtn was called as expected
//       expect(component.leaveMeetingRoom).toHaveBeenCalled();
//     });
//     it('should dispatch createMeeting action and log the join message when room exists', async () => {
//       // Arrange: Mock necessary values
//       const participantIdentity = 'HostUser';
//       component.localParticipant = { identity: participantIdentity };
//       component.roomName = 'TestRoom';

//       // Mock livekitService to simulate the existing room
//       component.livekitService = {
//         breakoutRoomsData: [{ roomName: 'TestRoom' }],
//       } as any;

//       // Spy on store dispatch and console.log
//       const dispatchSpy = spyOn(component.store, 'dispatch');
//       const consoleLogSpy = spyOn(console, 'log');

//       // Act: Call the hostJoinNow function
//       await component.hostJoinNow();

//       // Assert: Check dispatch and log
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.MeetingActions.createMeeting({
//           participantNames: [participantIdentity],
//           roomName: 'TestRoom',
//         })
//       );
//       expect(consoleLogSpy).toHaveBeenCalledWith(
//         'Host has successfully joined the existing room:',
//         'TestRoom'
//       );
//     });
//   });
//   describe('grid columns for participants(get GalleryGridColumnStyle)', () => {
//     it('should return correct grid column style for participants <= 6', () => {
//       const testCases = [
//         { numParticipants: 1, expectedStyle: '1fr' },
//         { numParticipants: 2, expectedStyle: '1fr 1fr' },
//         { numParticipants: 3, expectedStyle: '1fr 1fr' },
//         { numParticipants: 4, expectedStyle: '1fr 1fr' },
//         { numParticipants: 5, expectedStyle: '1fr 1fr 1fr' },
//         { numParticipants: 6, expectedStyle: '1fr 1fr 1fr' },
//       ];

//       testCases.forEach(({ numParticipants, expectedStyle }) => {
//         // Dynamically set the number of participants
//         mockLivekitService.room.numParticipants = numParticipants;
//         fixture.detectChanges();
//         expect(component.GalleryGridColumnStyle).toBe(expectedStyle);
//       });
//     });
//     it('should return correct PIP grid column style when pipMode is true', () => {
//       // Mock pipMode as true
//       component.pipMode = true;

//       // Test for valid participant numbers that return the correct value from PIPGRIDCOLUMN
//       Object.keys(PIPGRIDCOLUMN).forEach((num) => {
//         mockLivekitService.room.numParticipants = Number(num);
//         fixture.detectChanges();
//         expect(component.GalleryGridColumnStyle).toBe(
//           PIPGRIDCOLUMN[Number(num)]
//         );
//       });
//     });

//     it('should return auto-fill style when participants > 6', () => {
//       mockLivekitService.room.numParticipants = 7;
//       fixture.detectChanges();
//       expect(component.GalleryGridColumnStyle).toBe(
//         'repeat(auto-fill, minmax(200px, 1fr))'
//       );
//     });
//   });
//   describe('grid columns for screen sharing (get ScreenGalleryGridColumnStyle)', () => {
//     it('should return correct grid column style for screen shares <= 6', () => {
//       const testCases = [
//         { totalScreenShareCount: 1, expectedStyle: '1fr' },
//         { totalScreenShareCount: 2, expectedStyle: '1fr 1fr' },
//         { totalScreenShareCount: 3, expectedStyle: '1fr 1fr' },
//         { totalScreenShareCount: 4, expectedStyle: '1fr 1fr' },
//         { totalScreenShareCount: 5, expectedStyle: '1fr 1fr 1fr' },
//         { totalScreenShareCount: 6, expectedStyle: '1fr 1fr 1fr' },
//       ];

//       testCases.forEach(({ totalScreenShareCount, expectedStyle }) => {
//         // Dynamically set the totalScreenShareCount
//         mockLivekitService.totalScreenShareCount = totalScreenShareCount;
//         fixture.detectChanges();
//         expect(component.ScreenGalleryGridColumnStyle).toBe(expectedStyle);
//       });
//     });
//     it('should return "repeat(auto-fill, minmax(200px, 1fr))" for screen shares > 6', () => {
//       mockLivekitService.screenShareCount = 7; // Set screenShareCount to a value greater than 6
//       fixture.detectChanges(); // Trigger change detection
//       expect(component.ScreenGalleryGridColumnStyle).toBe(
//         'repeat(auto-fill, minmax(200px, 1fr))'
//       );
//     });
//   });
//   describe('sendMessage()', () => {
//     beforeEach(() => {
//       jasmine.getEnv().allowRespy(true);
//     });
//     it('should dispatch the sendChatMessage action and reset the form', () => {
//       const dispatchSpy = spyOn(store, 'dispatch');
//       spyOn(component.chatForm, 'reset');

//       component.chatForm.setValue({ message: 'Hello', participant: 'User1' });
//       component.sendMessage();

//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.ChatActions.sendChatMessage({
//           msg: 'Hello',
//           recipient: 'User1',
//         })
//       );
//       expect(component.chatForm.reset).toHaveBeenCalled();
//     });
//   });

//   describe('Help message send from breakout room to host (sendHelpRequest())', () => {
//     it('should send help request message', () => {
//       const helpMessageContent = 'I need help';

//       // Call the method to test
//       component.sendHelpRequest();

//       // Verify that sendMessageToMainRoom was called with the correct parameters
//       expect(mockLivekitService.sendMessageToMainRoom).toHaveBeenCalledWith(
//         component.roomName,
//         helpMessageContent
//       );
//     });
//   });
//   describe('Host send message and invitation to breakout room ', () => {
//     it('should dispatch sendMessageToBreakoutRoom action and clear message content', () => {
//       // Set initial values directly in the test
//       component.selectedBreakoutRoom = 'test-breakout-room';
//       component.messageContent = 'Hello, participants!';

//       // Call the method
//       component.sendMessageToBreakoutRoom();

//       // Check that the sendMessageToBreakoutRoom action was dispatched with the correct arguments
//       expect(store.dispatch).toHaveBeenCalledWith(
//         LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
//           breakoutRoom: 'test-breakout-room',
//           messageContent: 'Hello, participants!',
//         })
//       );

//       // Check that closeHostToBrMsgModal action was dispatched
//       expect(store.dispatch).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.closeHostToBrMsgModal()
//       );

//       // Check that messageContent and selectedBreakoutRoom are cleared after sending the message
//       expect(component.messageContent).toBe('');
//       expect(component.selectedBreakoutRoom).toBe('');
//     });

//     it('should dispatch createMeeting action and hide modal in joinBreakoutRoom()', () => {
//       // Arrange: Set the required roomName and participantName before calling the method
//       component.roomName = 'TestRoom';
//       component.participantName = 'Test Participant';

//       // Act: Call the method
//       component.joinBreakoutRoom();

//       // Assert: Verify that the store.dispatch was called with the correct action
//       expect(store.dispatch).toHaveBeenCalledWith(
//         LiveKitRoomActions.MeetingActions.createMeeting({
//           participantNames: ['Test Participant'],
//           roomName: 'TestRoom',
//         })
//       );

//       // Assert: Verify that the modal is hidden after dispatching
//       // expect(component.isModalVisible).toBe(false);
//     });
//   });

//   describe('Raise hand and Lower Hand toggleRaiseHand()', () => {
//     it('should lower hand and update state when handRaised is true', () => {
//       // Set initial state: hand is raised
//       component.localParticipant.handRaised = true;

//       // Create spy for the openSnackBar method within the test
//       const snackBarSpy = spyOn(component, 'openSnackBar');

//       // Call the toggleRaiseHand method
//       component.toggleRaiseHand();

//       // Expectations when hand is lowered
//       expect(component.localParticipant.handRaised).toBeFalse();
//       expect(mockLivekitService.lowerHand).toHaveBeenCalledWith(
//         component.localParticipant
//       ); // lowerHand should be called
//       expect(snackBarSpy).toHaveBeenCalledWith('hostIdentity lowered hand');
//     });

//     it('should raise hand and update state when handRaised is false', () => {
//       // Set initial state: hand is not raised
//       component.localParticipant.handRaised = false;
//       // Create spy for the openSnackBar method within the test
//       const snackBarSpy = spyOn(component, 'openSnackBar');

//       // Call the toggleRaiseHand method
//       component.toggleRaiseHand();

//       // Expectations when hand is lowered
//       expect(component.localParticipant.handRaised).toBeTrue();
//       expect(mockLivekitService.raiseHand).toHaveBeenCalledWith(
//         component.localParticipant
//       ); // lowerHand should be called
//       expect(snackBarSpy).toHaveBeenCalledWith('hostIdentity raised hand');
//     });
//   });
//   describe('openHostToBrMsgModal()', () => {
//     it('should dispatch the openHostToBrMsgModal action', () => {
//       // Act: Call the method
//       component.openHostToBrMsgModal();

//       // Assert: Check that dispatch was called with the correct action
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.openHostToBrMsgModal()
//       );
//     });
//   });
//   describe('showInvitationModal()', () => {
//     it('should dispatch the showInvitationModal action', () => {
//       // Act: Call the method
//       component.showInvitationModal();

//       // Assert: Check that dispatch was called with the correct action
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.openInvitationModal()
//       );
//     });
//   });
//   describe('openReceiveMsgModal()', () => {
//     it('should dispatch the openReceiveMsgModal action', () => {
//       // Act: Call the method
//       component.openReceiveMsgModal();

//       // Assert: Check that dispatch was called with the correct action
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.openHelpMessageModal()
//       );
//     });
//   });
//   describe('toggleParticipantsList()', () => {
//     it('should dispatch the toggleParticipantsList action with the correct index', () => {
//       // Define a test index
//       const testIndex = 1;

//       // Act: Call the method with the test index
//       component.toggleParticipantsList(testIndex);

//       // Assert: Check that dispatch was called with the correct action and payload
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.toggleParticipantsList({
//           index: testIndex,
//         })
//       );
//     });
//   });
//   describe('calculateDistribution() message', () => {
//     it('should dispatch calculateDistribution action with correct parameters', () => {
//       // Arrange
//       const numberOfRooms = 3; // Example number of rooms
//       const totalParticipants = 12; // Example total participants
//       component.breakoutForm.get('numberOfRooms')?.setValue(numberOfRooms); // Set value in the form control
//       component.totalParticipants = totalParticipants; // Set the total participants in the component

//       // Act
//       component.calculateDistribution(); // Call the method

//       // Assert
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.calculateDistribution({
//           numberOfRooms,
//           totalParticipants,
//         })
//       );
//     });
//   });
//   describe('Different Functions of ngoninit', () => {
//     describe('storeLocalParticipantData', () => {
//       it('should update localParticipant when new data is received', () => {
//         // Arrange
//         const testData = { name: 'Test Participant', id: 'participant1' };
//         const mockLocalParticipantData = new Subject<any>(); // Create a new Subject for each test

//         // Override the livekitService's localParticipantData observable
//         mockLivekitService.localParticipantData =
//           mockLocalParticipantData.asObservable();

//         // Call the method to set up the subscription
//         component.storeLocalParticipantData();

//         // Spy on console.log
//         spyOn(console, 'log'); // Ensure console.log is mocked

//         // Act
//         mockLocalParticipantData.next(testData); // Emit new data

//         // Assert
//         expect(component.localParticipant).toEqual(testData); // Check if localParticipant is updated
//         expect(console.log).toHaveBeenCalledWith(
//           'local Participant name updated:',
//           testData
//         );
//       });
//     });
//     describe('storeRemoteParticipantNames', () => {
//       let mockParticipantNamesUpdated: Subject<any>;

//       beforeEach(() => {
//         mockParticipantNamesUpdated = new Subject<any>();
//         mockLivekitService.participantNamesUpdated =
//           mockParticipantNamesUpdated.asObservable();
//       });

//       it('should update remoteParticipantNames and totalParticipants when new names are received', () => {
//         // Arrange
//         const testNames = ['Participant 1', 'Participant 2'];

//         // Act
//         component.storeRemoteParticipantNames();
//         mockParticipantNamesUpdated.next(testNames); // Emit new names

//         // Assert
//         expect(component.remoteParticipantNames).toEqual(testNames); // Check remoteParticipantNames update
//         expect(component.totalParticipants).toEqual(testNames.length); // Check totalParticipants update
//       });

//       it('should log an error if participantNamesUpdated is undefined', () => {
//         // Arrange
//         mockLivekitService.participantNamesUpdated = undefined;
//         spyOn(console, 'error'); // Spy on console.error

//         // Act
//         component.storeRemoteParticipantNames();

//         // Assert
//         expect(console.error).toHaveBeenCalledWith(
//           'participantNamesUpdated is undefined'
//         );
//       });
//     });
//     describe('handleMsgDataReceived', () => {
//       it('should subscribe to msgDataReceived and call handleMsgDataReceived', () => {
//         const mockData = {
//           participant: { identity: 'participant1' },
//           message: { message: 'Hello world' },
//         };

//         spyOn(component, 'handleMsgDataReceived'); // Spy on the method to check if it gets called

//         // Simulate message reception by emitting data
//         msgDataReceived.next(mockData);

//         expect(component.handleMsgDataReceived).toHaveBeenCalledWith(mockData);
//       });
//     });

//     describe('setupMessageSubscriptions, when subscribe messageToMain', () => {
//       it('should subscribe to messageToMain and process messages correctly', () => {
//         const mockMsgArray = [
//           { content: 'I need help', title: 'User1', timestamp: Date.now() },
//           {
//             content: 'Some other message',
//             title: 'User2',
//             timestamp: Date.now(),
//           },
//         ];

//         spyOn(component, 'openReceiveMsgModal'); // Spy on the method to check if it gets called

//         // Simulate message reception by emitting the message array
//         mockLivekitService.messageToMain.next(mockMsgArray);

//         expect(component.allMessagesToMainRoom.length).toBe(1); // Check if one message was added
//         expect(component.allMessagesToMainRoom[0]).toEqual(
//           jasmine.objectContaining({
//             senderName: 'User1',
//             receivedMsg: 'I need help',
//             receivingTime: jasmine.any(Date), // Check that it is a Date
//             type: 'received',
//           })
//         );

//         expect(component.roomName).toBe('User1'); // Check if roomName is set correctly
//         expect(component.openReceiveMsgModal).toHaveBeenCalled(); // Check if the modal was opened
//       });

//       it('should not process messages that do not match the content criteria', () => {
//         const mockMsgArray = [
//           { content: 'Not important', title: 'User3', timestamp: Date.now() },
//         ];

//         mockLivekitService.messageToMain.next(mockMsgArray); // Emit a message that should be ignored

//         expect(component.allMessagesToMainRoom.length).toBe(0); // Should not add any messages
//       });
//     });
//     describe('setupMessageSubscriptions, when subscribe messageContentReceived', () => {
//       // it('should subscribe to messageContentReceived and call handleNewMessage for valid messages', () => {
//       //   const mockContentArray = [
//       //     { content: 'Hello world', title: 'test-room' },
//       //     { content: 'Ignored message', title: 'other-room' },
//       //     { content: null, title: 'test-room' }, // Should be ignored
//       //   ];

//       //   spyOn(component, 'handleNewMessage'); // Spy on the method to check if it gets called

//       //   // Simulate message content reception by emitting the content array
//       //   mockLivekitService.messageContentReceived.next(mockContentArray);

//       //   expect(component.handleNewMessage).toHaveBeenCalledWith(
//       //     mockContentArray[0]
//       //   ); // Check if handleNewMessage was called for valid message
//       //   expect(component.handleNewMessage).toHaveBeenCalledTimes(1); // Should only be called once
//       // });
//       it('should not call handleNewMessage for messages that do not meet criteria', () => {
//         const mockContentArray = [
//           { content: 'Hello world', title: 'other-room' }, // Invalid title
//           { content: null, title: 'test-room' }, // Invalid content
//         ];

//         spyOn(component, 'handleNewMessage');

//         // Simulate message content reception
//         mockLivekitService.messageContentReceived.next(mockContentArray);

//         expect(component.handleNewMessage).not.toHaveBeenCalled(); // Should not be called for any invalid messages
//       });
//     });
//   });
//   describe('Create Automatic breakout room and form submit ()', () => {
//     it('should dispatch initiateAutomaticRoomCreation action with participants and numberOfRooms if roomType is automatic and numberOfRooms > 0', async () => {
//       // Arrange
//       component.breakoutForm.get('roomType')?.setValue('automatic');
//       component.breakoutForm.get('numberOfRooms')?.setValue(2);

//       component.remoteParticipantNames = [
//         { identity: 'participant1' },
//         { identity: 'participant2' },
//         { identity: 'participant3' },
//         { identity: 'participant4' },
//       ];

//       const expectedAction =
//         LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
//           participants: [
//             'participant1',
//             'participant2',
//             'participant3',
//             'participant4',
//           ],
//           numberOfRooms: 2,
//         });

//       // Act
//       await component.submitBreakoutForm();

//       // Assert
//       expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
//     });

//     it('should not dispatch initiateAutomaticRoomCreation if roomType is not automatic', async () => {
//       // Arrange
//       component.breakoutForm.get('roomType')?.setValue('manual');
//       component.breakoutForm.get('numberOfRooms')?.setValue(2);

//       // Act
//       await component.submitBreakoutForm();

//       // Assert
//       expect(store.dispatch).not.toHaveBeenCalledWith(
//         jasmine.objectContaining({ type: 'initiateAutomaticRoomCreation' })
//       );
//     });

//     it('should not dispatch initiateAutomaticRoomCreation if numberOfRooms is 0 or less', async () => {
//       // Arrange
//       component.breakoutForm.get('roomType')?.setValue('automatic');
//       component.breakoutForm.get('numberOfRooms')?.setValue(0);

//       // Act
//       await component.submitBreakoutForm();

//       // Assert
//       expect(store.dispatch).not.toHaveBeenCalledWith(
//         jasmine.objectContaining({ type: 'initiateAutomaticRoomCreation' })
//       );
//     });
//   });
//   it('should set roomName and hostName and call showInvitationModal when message type is "breakoutRoom"', () => {
//     const mockData = {
//       participant: { identity: 'participant1' },
//       message: {
//         type: 'breakoutRoom',
//         roomName: 'NewRoom',
//       },
//     };

//     spyOn(component, 'showInvitationModal'); // Spy on the method to check if it gets called

//     component.handleMsgDataReceived(mockData);

//     expect(component.roomName).toBe('NewRoom');
//     expect(component.hostName).toBe('participant1');
//     expect(component.showInvitationModal).toHaveBeenCalled();
//   });
//   describe('ngAfterViewInit testing', () => {
//     it('should handle valid screen share track', () => {
//       const mockTrack: RemoteTrack = {
//         source: Track.Source.ScreenShare,
//         // Add other required properties and methods for the RemoteTrack mock
//       } as RemoteTrack;

//       // Emit a valid screen share track
//       screenShareTrackSubscribed.next(mockTrack);

//       expect(component.screenShareTrack).toBe(mockTrack); // Check if the track is set correctly
//     });

//     it('should reset screenShareTrack on invalid track', () => {
//       // Emit an undefined track
//       screenShareTrackSubscribed.next(undefined);

//       expect(component.screenShareTrack).toBeUndefined(); // Check if the track is reset
//     });

//     it('should log an error if screenShareTrackSubscribed is undefined', () => {
//       spyOn(console, 'error'); // Spy on console.error to track calls

//       // Set screenShareTrackSubscribed to undefined
//       mockLivekitService.screenShareTrackSubscribed = undefined;

//       // Call ngAfterViewInit to trigger the code
//       component.ngAfterViewInit();

//       // Verify the error was logged
//       expect(console.error).toHaveBeenCalledWith(
//         'screenShareTrackSubscribed is undefined'
//       );
//     });
//   });
//   it('should call sendCloseAlertToBreakoutRooms on livekitService when closeAllBreakoutRooms is called', () => {
//     // Arrange
//     spyOn(console, 'log');

//     // Act
//     component.closeAllBreakoutRooms();

//     // Assert
//     expect(mockLivekitService.sendCloseAlertToBreakoutRooms).toHaveBeenCalled();
//     expect(console.log).toHaveBeenCalledWith(
//       'Close all breakout rooms button clicked'
//     );
//   });
//   describe('openBreakoutModal()', () => {
//     it('should dispatch the openBreakoutModal action', () => {
//       // Act: Call the method
//       component.openBreakoutModal();

//       // Assert: Check that dispatch was called with the correct action
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.openBreakoutModal()
//       );
//     });
//   });

//   describe('createRoomFromSideWindow()', () => {
//     it('should dispatch the createRoomFromSideWindow action', () => {
//       // Act: Call the method
//       component.createNewRoomSidebar();

//       // Assert: Check that dispatch was called with the correct action
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation()
//       );
//     });
//   });

//   describe('createNewRoomSidebar()', () => {
//     it('should dispatch the createNewRoomSidebar action', () => {
//       // Act: Call the method
//       component.createNewRoomSidebar();

//       // Assert: Check that dispatch was called with the correct action
//       expect(dispatchSpy).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.createNewRoom()
//       );
//     });
//   });

//   describe('getAvailableParticipants()', () => {
//     let mockBreakoutRoomsData: any[];
//     let mockRemoteParticipantNames: any[];

//     beforeEach(() => {
//       // Mock data
//       mockBreakoutRoomsData = [
//         { participantIds: ['user1', 'user2'] },
//         { participantIds: ['user3'] },
//       ];
//       mockRemoteParticipantNames = [
//         { identity: 'user1', name: 'User 1' },
//         { identity: 'user2', name: 'User 2' },
//         { identity: 'user3', name: 'User 3' },
//         { identity: 'user4', name: 'User 4' },
//       ];

//       // Mocking the component properties
//       component.breakoutRoomsData = mockBreakoutRoomsData;
//       component.remoteParticipantNames = mockRemoteParticipantNames;
//     });

//     it('should return participants who are not assigned to breakout rooms', () => {
//       const availableParticipants = component.getAvailableParticipants(null);

//       // The assigned participants are user1, user2, and user3
//       // So, the available participant should be only user4
//       expect(availableParticipants.length).toBe(1);
//       expect(availableParticipants[0].identity).toBe('user4');
//     });

//     it('should return an empty array if all participants are assigned', () => {
//       // Modify the mock to include all participants as assigned
//       mockBreakoutRoomsData = [
//         { participantIds: ['user1', 'user2', 'user3', 'user4'] },
//       ];
//       component.breakoutRoomsData = mockBreakoutRoomsData;

//       const availableParticipants = component.getAvailableParticipants(null);

//       expect(availableParticipants.length).toBe(0);
//     });

//     it('should return all participants if no breakout rooms exist', () => {
//       // No breakout rooms, so all remote participants should be available
//       component.breakoutRoomsData = [];

//       const availableParticipants = component.getAvailableParticipants(null);

//       expect(availableParticipants.length).toBe(4); // All four participants
//       expect(availableParticipants).toEqual(mockRemoteParticipantNames);
//     });
//   });

//   describe('isParticipantAssigned', () => {
//     it('should return true if the participant is assigned to the room', () => {
//       const room = { participantIds: ['user1', 'user2', 'user3'] };
//       const participant = { identity: 'user2' };

//       const result = component.isParticipantAssigned(room, participant);

//       expect(result).toBeTrue(); // The participant 'user2' is assigned to the room
//     });

//     it('should return false if the participant is not assigned to the room', () => {
//       const room = { participantIds: ['user1', 'user2', 'user3'] };
//       const participant = { identity: 'user4' };

//       const result = component.isParticipantAssigned(room, participant);

//       expect(result).toBeFalse(); // The participant 'user4' is not assigned to the room
//     });

//     it('should return false if the room has no participants', () => {
//       const room = { participantIds: [] };
//       const participant = { identity: 'user2' };

//       const result = component.isParticipantAssigned(room, participant);

//       expect(result).toBeFalse(); // The room has no participants, so no one is assigned
//     });

//     it('should return true if the participant is the only one in the room', () => {
//       const room = { participantIds: ['user2'] };
//       const participant = { identity: 'user2' };

//       const result = component.isParticipantAssigned(room, participant);

//       expect(result).toBeTrue(); // The participant 'user2' is the only one in the room
//     });
//   });

//   describe('speakerMode', () => {
//     it('should toggle speakerModeLayout and call showInitialSpeaker when speakerModeLayout becomes true', () => {
//       // Call speakerMode once
//       component.speakerMode();

//       // Verify the speakerModeLayout is toggled
//       expect(mockLivekitService.speakerModeLayout).toBeTrue();

//       // Ensure showInitialSpeaker was called
//       expect(mockLivekitService.showInitialSpeaker).toHaveBeenCalled();

//       // Ensure switchSpeakerViewLayout was NOT called
//       expect(mockLivekitService.switchSpeakerViewLayout).not.toHaveBeenCalled();
//     });

//     it('should toggle speakerModeLayout and call switchSpeakerViewLayout when speakerModeLayout becomes false', () => {
//       // Set the speakerModeLayout to true initially
//       mockLivekitService.speakerModeLayout = true;

//       // Call speakerMode once
//       component.speakerMode();

//       // Verify the speakerModeLayout is toggled back to false
//       expect(mockLivekitService.speakerModeLayout).toBeFalse();

//       // Ensure switchSpeakerViewLayout was called
//       expect(mockLivekitService.switchSpeakerViewLayout).toHaveBeenCalled();

//       // Ensure showInitialSpeaker was NOT called
//       expect(mockLivekitService.showInitialSpeaker).not.toHaveBeenCalled();
//     });

//     it('should log the correct message when toggling speaker mode', () => {
//       // Spy on the console.log method to check the logged message
//       spyOn(console, 'log');

//       // Call speakerMode once
//       component.speakerMode();

//       // Check that the correct message is logged
//       expect(console.log).toHaveBeenCalledWith('Speaker mode toggled:', true);

//       // Call speakerMode again to toggle the value back
//       component.speakerMode();

//       // Check that the correct message is logged again
//       expect(console.log).toHaveBeenCalledWith('Speaker mode toggled:', false);
//     });
//   });

//   describe('toggleRoomAccordion', () => {
//     beforeEach(() => {
//       // Initialize the isRoomAccordionOpen array
//       component.isRoomAccordionOpen = [false, false, false]; // Example with 3 items
//     });

//     it('should toggle the accordion state for the given index', () => {
//       // Initial state before toggle
//       expect(component.isRoomAccordionOpen[0]).toBe(false);
//       expect(component.isRoomAccordionOpen[1]).toBe(false);
//       expect(component.isRoomAccordionOpen[2]).toBe(false);

//       // Call toggleRoomAccordion for index 0
//       component.toggleRoomAccordion(0);

//       // Assert that the value at index 0 is now toggled to true
//       expect(component.isRoomAccordionOpen[0]).toBe(true);

//       // Call toggleRoomAccordion again for index 0
//       component.toggleRoomAccordion(0);

//       // Assert that the value at index 0 is now toggled back to false
//       expect(component.isRoomAccordionOpen[0]).toBe(false);
//     });

//     it('should not affect other indexes when toggling a specific index', () => {
//       // Initial state before toggle
//       expect(component.isRoomAccordionOpen[0]).toBe(false);
//       expect(component.isRoomAccordionOpen[1]).toBe(false);
//       expect(component.isRoomAccordionOpen[2]).toBe(false);

//       // Call toggleRoomAccordion for index 1
//       component.toggleRoomAccordion(1);

//       // Assert that the value at index 1 is now true
//       expect(component.isRoomAccordionOpen[1]).toBe(true);

//       // Assert that other indexes remain unaffected
//       expect(component.isRoomAccordionOpen[0]).toBe(false);
//       expect(component.isRoomAccordionOpen[2]).toBe(false);
//     });
//   });

//   describe('onRoomSelection', () => {
//     it('should dispatch addParticipantToRoom action with correct payload', () => {
//       // Mock data
//       const room = { roomName: 'TestRoom' };
//       const participant = { identity: 'Participant123' };

//       // Call the method onRoomSelection
//       component.onRoomSelection(room, participant);

//       // Verify that the dispatch method was called with the correct action
//       expect(store.dispatch).toHaveBeenCalledWith(
//         LiveKitRoomActions.BreakoutActions.addParticipantToRoom({
//           roomName: 'TestRoom',
//           participantId: 'Participant123',
//         })
//       );
//     });
//   });

//   describe('leaveBtnAccordion', () => {
//     it('should toggle the isLeaveAccordionOpen state', () => {
//       // Initial state is false
//       expect(component.isLeaveAccordionOpen).toBe(false);

//       // Call the leaveBtnAccordion method to toggle the state
//       component.leaveBtnAccordion();
//       expect(component.isLeaveAccordionOpen).toBe(true); // Should be true after first toggle

//       // Call the method again to toggle back to false
//       component.leaveBtnAccordion();
//       expect(component.isLeaveAccordionOpen).toBe(false); // Should be false after second toggle
//     });
//   });

//   describe('joinMainRoom', () => {
//     beforeEach(() => {
//       component.roomName = 'TestRoom';
//       component.participantName = 'TestParticipant';
//     });
//     it('should dispatch createMeeting action with correct parameters', () => {
//       // Call the joinMainRoom method
//       component.joinMainRoom();

//       // Check if the dispatch method was called with the correct action
//       expect(store.dispatch).toHaveBeenCalledWith(
//         LiveKitRoomActions.MeetingActions.createMeeting({
//           participantNames: ['TestParticipant'],
//           roomName: 'TestRoom',
//         })
//       );
//     });

//     it('should log "Joined main room" to the console', () => {
//       const consoleLogSpy = spyOn(console, 'log');

//       // Call the joinMainRoom method
//       component.joinMainRoom();

//       // Check if the console.log was called
//       expect(consoleLogSpy).toHaveBeenCalledWith('Joined main room');
//     });
//   });

//   describe('leaveBreakoutRoomAndJoinMainRoom', () => {
//     beforeEach(() => {
//       // Mock the leaveCurrentMeeting and joinMainRoom methods
//       spyOn(component, 'leaveCurrentMeeting').and.returnValue(
//         Promise.resolve()
//       );
//       spyOn(component, 'joinMainRoom');
//       spyOn(console, 'log');
//       spyOn(console, 'error');
//     });

//     it('should reset necessary variables and show the redirection modal', () => {
//       component.leaveBreakoutRoomAndJoinMainRoom();

//       expect(component.isLeaveAccordionOpen).toBeFalse();
//       expect(component.isBreakoutRoom).toBe('');
//       expect(component.redirectionMessage).toBe(
//         'Please wait while we redirect you to the main room.'
//       );
//       expect(component.isRedirectionModalVisible).toBeTrue();
//       expect(component.showCloseRoomModal).toBeFalse();
//       expect(console.log).toHaveBeenCalledWith('Showing redirection modal');
//     });

//     it('should call joinMainRoom after successfully leaving the current meeting', async () => {
//       await component.leaveBreakoutRoomAndJoinMainRoom();

//       expect(component.leaveCurrentMeeting).toHaveBeenCalled();
//       expect(console.log).toHaveBeenCalledWith(
//         'Left breakout room successfully'
//       );
//       expect(component.joinMainRoom).toHaveBeenCalled();
//     });
//   });

//   describe('Audio, Video and Speaker Devices', () => {
//     it('should select a video device and call switchDevice', async () => {
//       const deviceId = 'test-device-id';
//       spyOn(console, 'log'); // Spy on console.log

//       await component.selectVideo(deviceId);

//       expect(component.selectedVideoId).toBe(deviceId);
//       expect(mockLivekitService.switchDevice).toHaveBeenCalledWith(
//         'videoinput',
//         deviceId
//       );
//       expect(console.log).toHaveBeenCalledWith(
//         'Selected video device:',
//         deviceId
//       );
//     });

//     it('should select an audio device and call switchDevice', async () => {
//       const deviceId = 'test-device-id';
//       spyOn(console, 'log'); // Spy on console.log

//       await component.selectMic(deviceId);

//       expect(component.selectedMicId).toBe(deviceId);
//       expect(mockLivekitService.switchDevice).toHaveBeenCalledWith(
//         'audioinput',
//         deviceId
//       );
//       expect(console.log).toHaveBeenCalledWith(
//         'Selected microphone device:',
//         deviceId
//       );
//     });

//     it('should select an speaker device and call switchDevice', async () => {
//       const deviceId = 'test-device-id';
//       spyOn(console, 'log'); // Spy on console.log

//       await component.selectSpeaker(deviceId);

//       expect(component.selectedSpeakerId).toBe(deviceId);
//       expect(mockLivekitService.switchDevice).toHaveBeenCalledWith(
//         'audiooutput',
//         deviceId
//       );
//       expect(console.log).toHaveBeenCalledWith(
//         'Selected speaker device:',
//         deviceId
//       );
//     });
//   });

//   describe('toggleMicDropdown ', () => {
//     beforeEach(async () => {
//       // Mock the LivekitService
//       mockLivekitService = jasmine.createSpyObj('LivekitService', [
//         'getAllDevices',
//         'switchDevice',
//       ]);

//       component = fixture.componentInstance;
//     });

//     it('should toggle mic dropdown without fetching devices if already loaded', async () => {
//       // Arrange
//       component.audioDevicesLoaded = true; // Simulate devices already loaded
//       component.isMicDropdownOpen = false; // Initial dropdown state

//       // Act
//       await component.toggleMicDropdown();

//       // Assert
//       expect(mockLivekitService.getAllDevices).not.toHaveBeenCalled(); // Ensure no fetch
//       expect(component.isMicDropdownOpen).toBeTrue(); // Dropdown state toggled
//     });
//   });
//   describe('toggleVideoDropdown', () => {
//     it('should fetch video devices and toggle dropdown if not loaded', async () => {
//       // Arrange
//       const mockDevices = [
//         { deviceId: '1', label: 'Camera 1' },
//         { deviceId: '2', label: 'Camera 2' },
//       ] as any;
//       // Ensure to add getDevices to the mock setup
//       mockLivekitService.getDevices = jasmine
//         .createSpy('getDevices')
//         .and.returnValue(Promise.resolve(mockDevices));

//       // Set initial state
//       component.videoDevicesLoaded = false;

//       // Act
//       await component.toggleVideoDropdown();

//       // Assert
//       expect(mockLivekitService.getDevices).toHaveBeenCalledWith('videoinput');
//       expect(component.videoDevices).toEqual(mockDevices);
//       expect(component.videoDevicesLoaded).toBeTrue();
//       expect(component.isVideoDropdownOpen).toBeTrue();
//     });

//     it('should log an error when fetching video devices fails', async () => {
//       // Arrange
//       const errorMessage = 'Failed to fetch devices';
//       const error = new Error(errorMessage);

//       // Mock getDevices to reject with an error
//       mockLivekitService.getDevices = jasmine
//         .createSpy('getDevices')
//         .and.returnValue(Promise.reject(error));

//       // Set initial state
//       component.videoDevicesLoaded = false;

//       // Spy on console.error
//       const consoleErrorSpy = spyOn(console, 'error');

//       // Act
//       await component.toggleVideoDropdown();

//       // Assert
//       expect(consoleErrorSpy).toHaveBeenCalledWith(
//         'Error fetching video devices:',
//         error
//       );
//       expect(component.videoDevicesLoaded).toBeFalse(); // Ensure the state remains unchanged
//       expect(component.isVideoDropdownOpen).toBeTrue(); // Ensure dropdown state changes
//     });
//   });
//   describe('toggleMicDropdown', () => {
//     it('should load audio devices and toggle dropdown if not loaded', async () => {
//       // Arrange
//       const mockDevices = {
//         microphones: [{ deviceId: 'mic1', label: 'Microphone 1' }],
//         speakers: [{ deviceId: 'speaker1', label: 'Speaker 1' }],
//       } as any;
//       mockLivekitService.getAllDevices = jasmine
//         .createSpy('getAllDevices')
//         .and.returnValue(Promise.resolve(mockDevices));
//       component.audioDevicesLoaded = false; // Ensure devices are not loaded initially
//       const consoleLogSpy = spyOn(console, 'log');

//       // Act
//       await component.toggleMicDropdown();

//       // Assert
//       expect(component.micDevices).toEqual(mockDevices.microphones); // Check if micDevices are set
//       expect(component.speakerDevices).toEqual(mockDevices.speakers); // Check if speakerDevices are set
//       expect(component.audioDevicesLoaded).toBeTrue(); // Ensure devices are marked as loaded
//       expect(consoleLogSpy).toHaveBeenCalledWith(
//         'Audio devices loaded:',
//         mockDevices.microphones,
//         mockDevices.speakers
//       ); // Check log
//       expect(component.isMicDropdownOpen).toBeTrue(); // Ensure dropdown state is toggled
//     });

//     it('should log an error if fetching devices fails', async () => {
//       // Arrange
//       const errorMessage = 'Failed to fetch audio devices';
//       const error = new Error(errorMessage);
//       mockLivekitService.getAllDevices = jasmine
//         .createSpy('getAllDevices')
//         .and.returnValue(Promise.reject(error));
//       component.audioDevicesLoaded = false; // Ensure devices are not loaded initially
//       const consoleErrorSpy = spyOn(console, 'error');

//       // Act
//       await component.toggleMicDropdown();

//       // Assert
//       expect(consoleErrorSpy).toHaveBeenCalledWith(
//         'Error fetching audio devices:',
//         error
//       ); // Check error log
//       expect(component.audioDevicesLoaded).toBeFalse(); // Ensure devices are not marked as loaded
//       expect(component.isMicDropdownOpen).toBeTrue(); // Ensure dropdown state is toggled
//     });
//   });
//   describe('onDeviceSelected', () => {
//     it('should update selectedSpeakerId when kind is audiooutput', async () => {
//       // Arrange
//       const kind = 'audiooutput';
//       const deviceId = 'speaker1';
//       mockLivekitService.switchDevice = jasmine
//         .createSpy('switchDevice')
//         .and.returnValue(Promise.resolve());

//       // Act
//       await component.onDeviceSelected(kind, deviceId);

//       // Assert
//       expect(component.selectedSpeakerId).toBe(deviceId); // Check if selectedSpeakerId is updated
//       expect(mockLivekitService.switchDevice).toHaveBeenCalledWith(
//         kind,
//         deviceId
//       ); // Ensure switchDevice was called
//     });
//     it('should update selected device and switch device successfully', async () => {
//       // Arrange
//       const kind = 'videoinput';
//       const deviceId = 'video1';
//       const consoleLogSpy = spyOn(console, 'log');
//       const mockSwitchDevice = jasmine
//         .createSpy('switchDevice')
//         .and.returnValue(Promise.resolve());
//       mockLivekitService.switchDevice = mockSwitchDevice;

//       // Act
//       await component.onDeviceSelected(kind, deviceId);

//       // Assert
//       expect(component.selectedVideoId).toBe(deviceId); // Check if selectedVideoId is updated
//       expect(mockSwitchDevice).toHaveBeenCalledWith(kind, deviceId); // Ensure switchDevice was called
//       expect(consoleLogSpy).toHaveBeenCalledWith(
//         `Successfully switched ${kind} to device: ${deviceId}`
//       ); // Check success log
//     });

//     it('should log an error if switching devices fails', async () => {
//       // Arrange
//       const kind = 'audioinput';
//       const deviceId = 'mic1';
//       const errorMessage = 'Failed to switch device';
//       const error = new Error(errorMessage);
//       const consoleErrorSpy = spyOn(console, 'error');
//       mockLivekitService.switchDevice = jasmine
//         .createSpy('switchDevice')
//         .and.returnValue(Promise.reject(error));

//       // Act
//       await component.onDeviceSelected(kind, deviceId);

//       // Assert
//       expect(consoleErrorSpy).toHaveBeenCalledWith(
//         `Error switching ${kind} to device: ${deviceId}`,
//         error
//       ); // Check error log
//     });
//   });
//   describe('to test handleMsgDataReceived', () => {
//     it('should handle breakoutRoom message type correctly', () => {
//       const mockData = {
//         participant: { identity: 'User2' },
//         message: { type: 'breakoutRoom', roomName: 'TestRoom' },
//       };

//       spyOn(component, 'showInvitationModal');

//       component.handleMsgDataReceived(mockData);

//       expect(component.hostName).toBe('User2');
//       expect(component.roomName).toBe('TestRoom');
//       expect(component.showInvitationModal).toHaveBeenCalled();
//     });

//     it('should handle closeRoomAlert message type correctly', () => {
//       const mockData = {
//         participant: { identity: 'User3' },
//         message: { type: 'closeRoomAlert', countdown: 30 },
//       };

//       spyOn(component, 'startCountdown');

//       component.handleMsgDataReceived(mockData);

//       expect(component.showCloseRoomModal).toBeTrue();
//       expect(component.countdown).toBe(30);
//       expect(component.startCountdown).toHaveBeenCalled();
//     });

//     it('should add a received message to allMessages when message type is not handled', () => {
//       const mockData = {
//         participant: { identity: 'User4' },
//         message: {
//           type: 'generalMessage',
//           message: 'Hello',
//           timestamp: '2024-12-30T12:00:00Z',
//         },
//       };

//       spyOn(component, 'updateUnreadMessageCount');
//       spyOn(component, 'scrollToBottom');
//       spyOn(component, 'sortMessages');

//       component.handleMsgDataReceived(mockData);

//       expect(component.allMessages.length).toBe(1);
//       expect(component.allMessages[0]).toEqual({
//         senderName: 'User4',
//         receivedMsg: 'Hello',
//         receivingTime: '2024-12-30T12:00:00Z',
//         type: 'received',
//       });
//       expect(component.updateUnreadMessageCount).toHaveBeenCalled();
//       expect(component.scrollToBottom).toHaveBeenCalled();
//       expect(component.sortMessages).toHaveBeenCalled();
//     });
//   });

//   it('should return true if there are remote participants', () => {
//     // Set up the mock to have remote participants
//     mockLivekitService.room.remoteParticipants.set('participant1', {});

//     // Call the function
//     const result = component.hasRemoteParticipants();

//     // Check that the function returns true
//     expect(result).toBe(true);
//   });

//   it('should return false if there are no remote participants', () => {
//     // Ensure no participants are added
//     mockLivekitService.room.remoteParticipants.clear();

//     // Call the function
//     const result = component.hasRemoteParticipants();

//     // Check that the function returns false
//     expect(result).toBe(false);
//   });
// });

import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LivekitService } from '../livekit.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ElementRef, EventEmitter, Renderer2 } from '@angular/core';
import { LivekitRoomComponent } from './livekit-room.component';
import { Store, StoreModule } from '@ngrx/store';
import * as LiveKitRoomActions from '../+state/livekit/livekit-room.actions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RemoteTrack, Track } from 'livekit-client';
import { ActivatedRoute } from '@angular/router';

class MockLiveKitService {
  toggleVideo() {
    return Promise.resolve();
  }
}
describe('LiveKitRoomComponent;', () => {
  let component: LivekitRoomComponent;
  let fixture: ComponentFixture<LivekitRoomComponent>;
  let mockMatSnackBar: MatSnackBar;
  let mockLivekitService: any;
  let msgDataReceived: Subject<any>;
  let messageEmitter: Subject<any>;
  let screenShareTrackSubscribed: Subject<any>;
  let store: any;
  let dispatchSpy: jasmine.Spy;
  let formBuilder: FormBuilder;
  let mockElementRef: ElementRef;
  let webSocketStatusSubject: Subject<string>;
  let paramsSubject: BehaviorSubject<any>;

  const GRIDCOLUMN: { [key: number]: string } = {
    1: '1fr',
    2: '1fr 1fr',
    3: '1fr 1fr',
    4: '1fr 1fr',
    5: '1fr 1fr 1fr',
    6: '1fr 1fr 1fr',
  };
  const PIPGRIDCOLUMN: { [key: number]: string } = {
    1: '1fr',
    2: '1fr',
    3: '1fr',
    4: '1fr 1fr',
    5: '1fr 1fr',
    6: '1fr 1fr',
    7: '1fr 1fr',
    8: '1fr 1fr',
    9: '1fr 1fr 1fr',
    10: '1fr 1fr 1fr',
    11: '1fr 1fr 1fr',
    12: '1fr 1fr 1fr',
    13: '1fr 1fr 1fr',
    14: '1fr 1fr 1fr',
    15: '1fr 1fr 1fr',
    16: '1fr 1fr 1fr 1fr',
    17: '1fr 1fr 1fr 1fr',
    18: '1fr 1fr 1fr 1fr',
    19: '1fr 1fr 1fr 1fr',
    20: '1fr 1fr 1fr 1fr',
    21: '1fr 1fr 1fr 1fr',
  };
  beforeEach(async () => {
    paramsSubject = new BehaviorSubject({ roomname: 'test-room' });
    const deviceListsSubject = new Subject<any>();
    msgDataReceived = new Subject<any>();
    messageEmitter = new Subject<any>();
    screenShareTrackSubscribed = new Subject<any>();
    webSocketStatusSubject = new Subject<string>();
    mockLivekitService = {
      messageEmitter: messageEmitter.asObservable(),
      msgDataReceived: msgDataReceived.asObservable(),
      sendChatMessage: jasmine.createSpy('sendChatMessage'),
      raiseHand: jasmine.createSpy('raiseHand'),
      lowerHand: jasmine.createSpy('lowerHand'),
      sendMessageToBreakoutRoom: jasmine.createSpy('sendMessageToBreakoutRoom'),
      sendMessageToMainRoom: jasmine.createSpy('sendMessageToMainRoom'),
      toggleVideo: jasmine
        .createSpy('toggleVideo')
        .and.returnValue(Promise.resolve()),
      connectToRoom: jasmine
        .createSpy('connectToRoom')
        .and.returnValue(Promise.resolve()),
      enableCameraAndMicrophone: jasmine
        .createSpy('enableCameraAndMicrophone')
        .and.returnValue(Promise.resolve()),
      room: {
        _numParticipants: 0,
        remoteParticipants: new Map(),
        get numParticipants() {
          return this._numParticipants;
        },
        set numParticipants(value: number) {
          this._numParticipants = value;
        },
      },
      audioVideoHandler: jasmine.createSpy('audioVideoHandler'),
      webSocketStatus$: new Subject(),
      messageToMain: new EventEmitter<string[]>(),
      messageContentReceived: new EventEmitter<string[]>(),
      attachTrackToElement: jasmine.createSpy('attachTrackToElement'),
      participantNamesUpdated: new EventEmitter<string[]>(),
      remoteVideoTrackSubscribed: new EventEmitter<RemoteTrack>(),
      remoteAudioTrackSubscribed: new EventEmitter<void>(),
      breakoutRoomsDataUpdated: jasmine.createSpy('emit'),
      screenShareTrackSubscribed: screenShareTrackSubscribed.asObservable(),
      handleTrackSubscribed: jasmine.createSpy('handleTrackSubscribed'),
      switchSpeakerViewLayout: jasmine.createSpy('switchSpeakerViewLayout'),
      sendCloseAlertToBreakoutRooms: jasmine.createSpy(
        'sendCloseAlertToBreakoutRooms'
      ),
      speakerModeLayout: false,
      showInitialSpeaker: jasmine.createSpy('showInitialSpeaker'),
      switchDevice: jasmine
        .createSpy('switchDevice')
        .and.returnValue(Promise.resolve()),
      deviceLists$: deviceListsSubject,
      getAllDevices: jasmine.createSpy('getAllDevices').and.returnValue(
        Promise.resolve({
          cameras: [{ deviceId: 'video1' }],
          microphones: [{ deviceId: 'mic1' }],
          speakers: [{ deviceId: 'speaker1' }],
        })
      ),
      updateDeviceLists: jasmine.createSpy('updateDeviceLists'),
      params: new Subject<{ roomname: string }>(),
    };
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
        StoreModule.forRoot({}),
        HttpClientTestingModule,
      ],
      declarations: [LivekitRoomComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject.asObservable(), // Use BehaviorSubject as params
          },
        },
        { provide: ElementRef, useValue: mockElementRef },
        { provide: LivekitService, useValue: mockLivekitService },
        FormBuilder,
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('MatDialog', ['open']),
        },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('MatSnackBar', ['open']),
        },
      ],
    });

    mockMatSnackBar = TestBed.inject(MatSnackBar);
    fixture = TestBed.createComponent(LivekitRoomComponent);
    component = fixture.componentInstance;
    (component as any).PIPGRIDCOLUMN = PIPGRIDCOLUMN;
    store = TestBed.inject(Store);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    formBuilder = TestBed.inject(FormBuilder);
    component.chatForm = formBuilder.group({
      message: ['Test message'],
      participant: ['Test participant'],
    });
    component.breakoutForm = formBuilder.group({
      roomType: ['automatic'],
      numberOfRooms: [2],
    });
    component.localParticipant = {
      identity: 'hostIdentity',
      handRaised: false,
    };
    component.roomName = 'TestRoom';
    // component.dynamicRoomName = 'TestRoom';
    component.remoteParticipantNames = [
      { identity: 'participant1' },
      { identity: 'participant2' },
      { identity: 'participant3' },
      { identity: 'participant4' },
    ];
    component.allMessages = [];
    component.handRaiseStates = {};
    fixture.detectChanges();
  });
  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  describe('start meeting', () => {
    it('should dispatch createMeeting action with correct payload', async () => {
      // Call the startMeeting method
      await component.startMeeting();

      // Check that the dispatch method was called
      expect(store.dispatch).toHaveBeenCalled();

      // Check that the dispatch was called with the correct action and payload
      const expectedAction = LiveKitRoomActions.MeetingActions.createMeeting({
        participantNames: [component.participantName],
        roomName: component.roomName,
      });
      const expectedAnotherAction =
        LiveKitRoomActions.BreakoutActions.loadBreakoutRooms();

      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAnotherAction);
    });
  });

  describe('Sort Messages', () => {
    it('should sort messages by receivingTime or sendingTime in ascending order', () => {
      const messages = [
        { receivingTime: '2022-01-01T10:00:00.000Z' },
        { sendingTime: '2022-01-01T09:00:00.000Z' },
        { receivingTime: '2022-01-01T11:00:00.000Z' },
        { sendingTime: '2022-01-01T08:00:00.000Z' },
      ];

      component.allMessages = messages;
      component.sortMessages();

      const expectedOrder = [
        { sendingTime: '2022-01-01T08:00:00.000Z' },
        { sendingTime: '2022-01-01T09:00:00.000Z' },
        { receivingTime: '2022-01-01T10:00:00.000Z' },
        { receivingTime: '2022-01-01T11:00:00.000Z' },
      ];

      expect(component.allMessages).toEqual(expectedOrder);
    });

    it('should sort messages by receivingTime if both receivingTime and sendingTime are present', () => {
      const messages = [
        {
          receivingTime: '2022-01-01T10:00:00.000Z',
          sendingTime: '2022-01-01T09:00:00.000Z',
        },
        {
          receivingTime: '2022-01-01T11:00:00.000Z',
          sendingTime: '2022-01-01T10:00:00.000Z',
        },
      ];

      component.allMessages = messages;
      component.sortMessages();

      const expectedOrder = [
        {
          receivingTime: '2022-01-01T10:00:00.000Z',
          sendingTime: '2022-01-01T09:00:00.000Z',
        },
        {
          receivingTime: '2022-01-01T11:00:00.000Z',
          sendingTime: '2022-01-01T10:00:00.000Z',
        },
      ];

      expect(component.allMessages).toEqual(expectedOrder);
    });

    it('should not throw an error if allMessages is empty', () => {
      component.allMessages = [];
      expect(() => component.sortMessages()).not.toThrow();
    });
  });

  describe('toggleScreen share', () => {
    // it('should dispatch toggleScreenShare action when toggleScreenShare is called', async () => {
    //   await component.toggleScreenShare();

    //   expect(dispatchSpy).toHaveBeenCalledTimes(1);
    //   expect(dispatchSpy).toHaveBeenCalledWith(
    //     LiveKitRoomActions.LiveKitActions.toggleScreenShare()
    //   );
    // });
    it('should dispatch toggleScreenShare action, set speakerModeLayout to false, and call switchSpeakerViewLayout', async () => {
      // Call the method
      await component.toggleScreenShare();

      // Assert the action is dispatched
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.LiveKitActions.toggleScreenShare()
      );

      // Assert speakerModeLayout is set to false
      expect(mockLivekitService.speakerModeLayout).toBeFalse();

      // Assert switchSpeakerViewLayout is called
      // expect(mockLivekitService.switchSpeakerViewLayout).toHaveBeenCalled();
    });
  });
  describe('toggle Microphone', () => {
    it('should dispatch toggleMic action when toggleMic is called', async () => {
      await component.toggleMic();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.LiveKitActions.toggleMic()
      );
    });
  });
  describe('Open Participant Side Window', () => {
    it('should dispatch toggleParticipantSideWindow action when openParticipantSideWindow is called', () => {
      component.openParticipantSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.LiveKitActions.toggleParticipantSideWindow()
      );
    });
  });
  describe('Open Chat Side Window', () => {
    it('should dispatch toggleChatSideWindow action when openChatSideWindow is called', () => {
      component.openChatSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.LiveKitActions.toggleChatSideWindow()
      );
    });
  });
  describe('Close Chat Side Window', () => {
    it('should dispatch closeChatSideWindow action when closeChatSideWindow is called', () => {
      component.closeChatSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.LiveKitActions.closeChatSideWindow()
      );
    });
  });
  describe('Close Participant Side Window', () => {
    it('should dispatch closeParticipantSideWindow action when closeParticipantSideWindow is called', () => {
      component.closeParticipantSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.LiveKitActions.closeParticipantSideWindow()
      );
    });
  });
  it('should handle snack bar opening', () => {
    component.openSnackBar('Test Message');
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test Message', 'Close', {
      duration: 3000,
    });
  });

  describe('shouldShowAvatar', () => {
    it('should return true for the first message', () => {
      component.allMessages = [{ senderName: 'Alice' }];

      expect(component.shouldShowAvatar(0)).toBeTrue();
    });

    it('should return true for different sender from the previous message', () => {
      component.allMessages = [{ senderName: 'Alice' }, { senderName: 'Bob' }];

      expect(component.shouldShowAvatar(1)).toBeTrue();
    });

    it('should return false for the same sender as the previous message', () => {
      component.allMessages = [
        { senderName: 'Alice' },
        { senderName: 'Alice' },
      ];

      expect(component.shouldShowAvatar(1)).toBeFalse();
    });
  });
  describe('Extract Initials', () => {
    it('should extract initials from a single word name', () => {
      const name = 'John';
      const expectedInitials = 'J';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should extract initials from a multi-word name', () => {
      const name = 'John Doe';
      const expectedInitials = 'JD';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should extract initials from a name with multiple spaces', () => {
      const name = 'John  Doe';
      const expectedInitials = 'JD';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should return an empty string for an empty name', () => {
      const name = '';
      const expectedInitials = '';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });
  });

  describe('leave button', () => {
    it('should dispatch leaveMeeting action when leaveBtn is called', async () => {
      await component.leaveMeetingRoom();
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.MeetingActions.leaveMeeting()
      );
    });

    it('should return a promise that resolves to void', async () => {
      const result = await component.leaveMeetingRoom();
      expect(result).toBeUndefined();
    });
  });

  it('should dispatch toggleVideo action when toggleVideo is called', async () => {
    await component.toggleVideo();

    expect(dispatchSpy).toHaveBeenCalledWith(
      LiveKitRoomActions.LiveKitActions.toggleVideo()
    );
  });

  it('should return "repeat(auto-fill, minmax(200px, 1fr))" for more than 6 participants', () => {
    spyOnProperty(
      mockLivekitService.room,
      'numParticipants',
      'get'
    ).and.returnValue(7);
    expect(component.GalleryGridColumnStyle).toBe(
      'repeat(auto-fill, minmax(200px, 1fr))'
    );
  });

  it('should return correct grid column style for more than 6 screen shares', () => {
    // Arrange: Set screenShareCount to a value greater than 6
    mockLivekitService.screenShareCount = 7;

    // Act: Access the getter
    const result = component.ScreenGalleryGridColumnStyle;

    // Assert: Check the result matches the expected fallback value
    expect(result).toBe('repeat(auto-fill, minmax(200px, 1fr))');
  });

  // // it('should scroll to bottom of message container', fakeAsync(() => {
  // //   // Arrange
  // //   const messageContainerElement = new ElementRef<HTMLDivElement>(
  // //     document.createElement('div')
  // //   );
  // //   component.messageContainer = messageContainerElement;
  // //   Object.defineProperty(
  // //     messageContainerElement.nativeElement,
  // //     'scrollHeight',
  // //     { value: 1000, configurable: true }
  // //   );
  // //   Object.defineProperty(messageContainerElement.nativeElement, 'scrollTop', {
  // //     value: 0,
  // //     writable: true,
  // //   });

  // //   // Act
  // //   component.scrollToBottom();
  // //   tick(100); // wait for the setTimeout to complete

  // //   // Assert
  // //   expect(messageContainerElement.nativeElement.scrollTop).toBe(1000);
  // // }));
  // describe('isParticipantAssigned', () => {
  //   it('should return true if the participant is assigned to the room', () => {
  //     const room = {
  //       participantIds: ['user1', 'user2', 'user3'],
  //     };
  //     const participant = { identity: 'user2' };

  //     const result = component.isParticipantAssigned(room, participant);

  //     expect(result).toBeTrue(); // Expect the result to be true
  //   });

  //   it('should return false if the participant is not assigned to the room', () => {
  //     const room = {
  //       participantIds: ['user1', 'user2', 'user3'],
  //     };
  //     const participant = { identity: 'user4' };

  //     const result = component.isParticipantAssigned(room, participant);

  //     expect(result).toBeFalse(); // Expect the result to be false
  //   });

  //   it('should return false if the room has no participants', () => {
  //     const room = {
  //       participantIds: [],
  //     };
  //     const participant = { identity: 'user1' };

  //     const result = component.isParticipantAssigned(room, participant);

  //     expect(result).toBeFalse(); // Expect the result to be false
  //   });
  // });

  // // describe('createNewRoomSidebar', () => {
  // //   it('should dispatch initiateCreateNewRoom action', () => {
  // //     // Call the method
  // //     component.createNewRoomSidebar();

  // //     // Check that the correct action was dispatched
  // //     expect(store.dispatch).toHaveBeenCalledWith(
  // //       LiveKitRoomActions.BreakoutActions.initiateCreateNewRoom()
  // //     );
  // //   });
  // // });
  describe('Open Breakout Side Window', () => {
    it('should dispatch toggleBreakoutSideWindow action when open breakout side window is called', () => {
      component.openPBreakoutSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.toggleBreakoutSideWindow()
      );
    });
  });
  describe('Close Breakout Side Window', () => {
    it('should dispatch closeBreakoutSideWindow action when closeBreakoutSideWindow is called', () => {
      component.closeBreakoutSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.closeBreakoutSideWindow()
      );
    });
  });
  // describe('Open Breakout Modal for automatic or manual selection of rooms', () => {
  //   it('should dispatch toggleBreakoutModal action when open breakout Modal is called', () => {
  //     component.openBreakoutModal();

  //     expect(dispatchSpy).toHaveBeenCalledTimes(1);
  //     expect(dispatchSpy).toHaveBeenCalledWith(
  //       LiveKitRoomActions.BreakoutActions.openBreakoutModal()
  //     );
  //   });
  // });
  // describe('Close Breakout Modal for automatic or manual selection of rooms', () => {
  //   it('should dispatch closeBreakoutModal action when closeBreakoutModal is called', () => {
  //     component.closeBreakoutModal();

  //     expect(dispatchSpy).toHaveBeenCalledTimes(1);
  //     expect(dispatchSpy).toHaveBeenCalledWith(
  //       LiveKitRoomActions.BreakoutActions.closeBreakoutModal()
  //     );
  //   });
  // });

  it('should process incoming messages and update allMessages when messageEmitter emits', () => {
    // Arrange
    const messageData = {
      message: 'Hello, World!',
      timestamp: new Date().toISOString(),
    };

    spyOn(component, 'sortMessages'); // Spy on sortMessages
    spyOn(component, 'scrollToBottom'); // Spy on scrollToBottom

    // Act
    messageEmitter.next(messageData); // Emit a new message

    // Assert
    expect(component.allMessages.length).toBe(1); // Check if allMessages has one entry
    expect(component.allMessages[0]).toEqual({
      sendMessage: 'Hello, World!',
      sendingTime: messageData.timestamp,
      type: 'sent',
    });
    expect(component.sortMessages).toHaveBeenCalled();
    expect(component.scrollToBottom).toHaveBeenCalled();
  });
  // describe('participants which are available to enter in breakout room (getAvailableParticipants)', () => {
  //   it('should return participants not already in the room', () => {
  //     const room = {
  //       participantIds: ['participant1', 'participant2'], // participants already in the room
  //     };

  //     const availableParticipants = component.getAvailableParticipants(room);

  //     // Expect available participants to exclude 'participant1' and 'participant2'
  //     expect(availableParticipants).toEqual([
  //       { identity: 'participant3' },
  //       { identity: 'participant4' },
  //     ]);
  //   });
  // });
  describe('when participant selected (onParticipantSelected)', () => {
    // it('should dispatch addParticipant action when checkbox is checked', () => {
    //   const room = { roomName: 'Room 2', participantIds: [] };
    //   const participant = { identity: 'participant3' };
    //   const event = { target: { checked: true } };

    //   // Call the method
    //   component.onParticipantSelected(room, participant, event);

    //   // Check that the correct action was dispatched
    //   expect(store.dispatch).toHaveBeenCalledWith(
    //     LiveKitRoomActions.BreakoutActions.addParticipant({
    //       roomName: 'Room 2',
    //       participantId: 'participant3',
    //     })
    //   );
    // });

    it('should dispatch removeParticipant action when checkbox is unchecked', () => {
      const room = { roomName: 'Room 2', participantIds: [] };
      const participant = { identity: 'participant3' };
      const event = { target: { checked: false } };

      // Call the method
      component.onParticipantSelected(room, participant, event);

      // Check that the correct action was dispatched
      expect(store.dispatch).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.removeParticipant({
          roomName: 'Room 2',
          participantId: 'participant3',
        })
      );
    });
  });
  describe('test to join room by participants when host send invitation (joinNow)', () => {
    it('should leave the current meeting and then join the breakout room', async () => {
      // Spy on the leaveCurrentMeeting and joinBreakoutRoom methods
      const leaveMeetingSpy = spyOn(
        component,
        'leaveCurrentMeeting'
      ).and.returnValue(Promise.resolve());
      const joinBreakoutRoomSpy = spyOn(component, 'joinBreakoutRoom');

      // Call the joinNow method
      await component.joinNow();

      // Step 1: Ensure leaveCurrentMeeting was called
      expect(leaveMeetingSpy).toHaveBeenCalled();

      // Step 2: Ensure joinBreakoutRoom is called after leaveCurrentMeeting resolves
      expect(joinBreakoutRoomSpy).toHaveBeenCalled();
    });
  });
  describe('leaveCurrentMeeting', () => {
    it('should dispatch the leaveMeeting action and resolve the promise', async () => {
      // Reuse the existing spy, assuming it was set up elsewhere
      const dispatchSpy = component.store.dispatch as jasmine.Spy;

      // Call the leaveCurrentMeeting method
      await component.leaveCurrentMeeting();

      // Verify that the leaveMeeting action was dispatched
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.MeetingActions.leaveMeeting()
      );
    });
  });
  describe('hostJoinNow', () => {
    beforeEach(() => {
      jasmine.getEnv().allowRespy(true);
    });
    it('should join the existing breakout room when the room exists', async () => {
      // Set up mock breakout room data to include the current participant
      mockLivekitService.breakoutRoomsData = [
        { roomName: 'TestRoom', participantIds: ['hostIdentity'] },
      ];

      // Spy on the leaveBtn method and return a resolved promise
      spyOn(component, 'leaveMeetingRoom').and.returnValue(Promise.resolve());

      // Call the hostJoinNow method
      await component.hostJoinNow();

      // Check if leaveBtn was called as expected
      expect(component.leaveMeetingRoom).toHaveBeenCalled();
    });
    it('should dispatch createMeeting action and log the join message when room exists', async () => {
      // Arrange: Mock necessary values
      const participantIdentity = 'HostUser';
      component.localParticipant = { identity: participantIdentity };
      component.roomName = 'TestRoom';

      // Mock livekitService to simulate the existing room
      component.livekitService = {
        breakoutRoomsData: [{ roomName: 'TestRoom' }],
      } as any;

      // Spy on store dispatch and console.log
      const dispatchSpy = spyOn(component.store, 'dispatch');
      const consoleLogSpy = spyOn(console, 'log');

      // Act: Call the hostJoinNow function
      await component.hostJoinNow();

      // Assert: Check dispatch and log
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.MeetingActions.createMeeting({
          participantNames: [participantIdentity],
          roomName: 'TestRoom',
        })
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Host has successfully joined the existing room:',
        'TestRoom'
      );
    });
  });
  describe('grid columns for participants(get GalleryGridColumnStyle)', () => {
    it('should return correct grid column style for participants <= 6', () => {
      const testCases = [
        { numParticipants: 1, expectedStyle: '1fr' },
        { numParticipants: 2, expectedStyle: '1fr 1fr' },
        { numParticipants: 3, expectedStyle: '1fr 1fr' },
        { numParticipants: 4, expectedStyle: '1fr 1fr' },
        { numParticipants: 5, expectedStyle: '1fr 1fr 1fr' },
        { numParticipants: 6, expectedStyle: '1fr 1fr 1fr' },
      ];

      testCases.forEach(({ numParticipants, expectedStyle }) => {
        // Dynamically set the number of participants
        mockLivekitService.room.numParticipants = numParticipants;
        fixture.detectChanges();
        expect(component.GalleryGridColumnStyle).toBe(expectedStyle);
      });
    });
    it('should return correct PIP grid column style when pipMode is true', () => {
      // Mock pipMode as true
      component.pipMode = true;

      // Test for valid participant numbers that return the correct value from PIPGRIDCOLUMN
      Object.keys(PIPGRIDCOLUMN).forEach((num) => {
        mockLivekitService.room.numParticipants = Number(num);
        fixture.detectChanges();
        expect(component.GalleryGridColumnStyle).toBe(
          PIPGRIDCOLUMN[Number(num)]
        );
      });
    });

    it('should return auto-fill style when participants > 6', () => {
      mockLivekitService.room.numParticipants = 7;
      fixture.detectChanges();
      expect(component.GalleryGridColumnStyle).toBe(
        'repeat(auto-fill, minmax(200px, 1fr))'
      );
    });
  });
  describe('grid columns for screen sharing (get ScreenGalleryGridColumnStyle)', () => {
    it('should return correct grid column style for screen shares <= 6', () => {
      const testCases = [
        { totalScreenShareCount: 1, expectedStyle: '1fr' },
        { totalScreenShareCount: 2, expectedStyle: '1fr 1fr' },
        { totalScreenShareCount: 3, expectedStyle: '1fr 1fr' },
        { totalScreenShareCount: 4, expectedStyle: '1fr 1fr' },
        { totalScreenShareCount: 5, expectedStyle: '1fr 1fr 1fr' },
        { totalScreenShareCount: 6, expectedStyle: '1fr 1fr 1fr' },
      ];

      testCases.forEach(({ totalScreenShareCount, expectedStyle }) => {
        // Dynamically set the totalScreenShareCount
        mockLivekitService.totalScreenShareCount = totalScreenShareCount;
        fixture.detectChanges();
        expect(component.ScreenGalleryGridColumnStyle).toBe(expectedStyle);
      });
    });
    it('should return "repeat(auto-fill, minmax(200px, 1fr))" for screen shares > 6', () => {
      mockLivekitService.screenShareCount = 7; // Set screenShareCount to a value greater than 6
      fixture.detectChanges(); // Trigger change detection
      expect(component.ScreenGalleryGridColumnStyle).toBe(
        'repeat(auto-fill, minmax(200px, 1fr))'
      );
    });
  });
  describe('sendMessage()', () => {
    beforeEach(() => {
      jasmine.getEnv().allowRespy(true);
    });
    it('should dispatch the sendChatMessage action and reset the form', () => {
      const dispatchSpy = spyOn(store, 'dispatch');
      spyOn(component.chatForm, 'reset');

      component.chatForm.setValue({ message: 'Hello', participant: 'User1' });
      component.sendMessage();

      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.ChatActions.sendChatMessage({
          msg: 'Hello',
          recipient: 'User1',
        })
      );
      expect(component.chatForm.reset).toHaveBeenCalled();
    });
  });

  describe('Help message send from breakout room to host (sendHelpRequest())', () => {
    it('should send help request message', () => {
      const helpMessageContent = 'I need help';

      // Call the method to test
      component.sendHelpRequest();

      // Verify that sendMessageToMainRoom was called with the correct parameters
      expect(mockLivekitService.sendMessageToMainRoom).toHaveBeenCalledWith(
        component.roomName,
        helpMessageContent
      );
    });
  });
  describe('Host send message and invitation to breakout room ', () => {
    it('should dispatch sendMessageToBreakoutRoom action and clear message content', () => {
      // Set initial values directly in the test
      component.selectedBreakoutRoom = 'test-breakout-room';
      component.messageContent = 'Hello, participants!';

      // Call the method
      component.sendMessageToBreakoutRoom();

      // Check that the sendMessageToBreakoutRoom action was dispatched with the correct arguments
      expect(store.dispatch).toHaveBeenCalledWith(
        LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
          breakoutRoom: 'test-breakout-room',
          messageContent: 'Hello, participants!',
        })
      );

      // Check that closeHostToBrMsgModal action was dispatched
      expect(store.dispatch).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.closeHostToBrMsgModal()
      );

      // Check that messageContent and selectedBreakoutRoom are cleared after sending the message
      expect(component.messageContent).toBe('');
      expect(component.selectedBreakoutRoom).toBe('');
    });

    it('should dispatch createMeeting action and hide modal in joinBreakoutRoom()', () => {
      // Arrange: Set the required roomName and participantName before calling the method
      component.roomName = 'TestRoom';
      component.participantName = 'Test Participant';

      // Act: Call the method
      component.joinBreakoutRoom();

      // Assert: Verify that the store.dispatch was called with the correct action
      expect(store.dispatch).toHaveBeenCalledWith(
        LiveKitRoomActions.MeetingActions.createMeeting({
          participantNames: ['Test Participant'],
          roomName: 'TestRoom',
        })
      );

      // Assert: Verify that the modal is hidden after dispatching
      // expect(component.isModalVisible).toBe(false);
    });
  });

  describe('Raise hand and Lower Hand toggleRaiseHand()', () => {
    it('should lower hand and update state when handRaised is true', () => {
      // Set initial state: hand is raised
      component.localParticipant.handRaised = true;

      // Create spy for the openSnackBar method within the test
      const snackBarSpy = spyOn(component, 'openSnackBar');

      // Call the toggleRaiseHand method
      component.toggleRaiseHand();

      // Expectations when hand is lowered
      expect(component.localParticipant.handRaised).toBeFalse();
      expect(mockLivekitService.lowerHand).toHaveBeenCalledWith(
        component.localParticipant
      ); // lowerHand should be called
      expect(snackBarSpy).toHaveBeenCalledWith('hostIdentity lowered hand');
    });

    it('should raise hand and update state when handRaised is false', () => {
      // Set initial state: hand is not raised
      component.localParticipant.handRaised = false;
      // Create spy for the openSnackBar method within the test
      const snackBarSpy = spyOn(component, 'openSnackBar');

      // Call the toggleRaiseHand method
      component.toggleRaiseHand();

      // Expectations when hand is lowered
      expect(component.localParticipant.handRaised).toBeTrue();
      expect(mockLivekitService.raiseHand).toHaveBeenCalledWith(
        component.localParticipant
      ); // lowerHand should be called
      expect(snackBarSpy).toHaveBeenCalledWith('hostIdentity raised hand');
    });
  });
  describe('openHostToBrMsgModal()', () => {
    it('should dispatch the openHostToBrMsgModal action', () => {
      // Act: Call the method
      component.openHostToBrMsgModal();

      // Assert: Check that dispatch was called with the correct action
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.openHostToBrMsgModal()
      );
    });
  });
  describe('showInvitationModal()', () => {
    it('should dispatch the showInvitationModal action', () => {
      // Act: Call the method
      component.showInvitationModal();

      // Assert: Check that dispatch was called with the correct action
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.openInvitationModal()
      );
    });
  });
  describe('openReceiveMsgModal()', () => {
    it('should dispatch the openReceiveMsgModal action', () => {
      // Act: Call the method
      component.openReceiveMsgModal();

      // Assert: Check that dispatch was called with the correct action
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.openHelpMessageModal()
      );
    });
  });
  describe('toggleParticipantsList()', () => {
    it('should dispatch the toggleParticipantsList action with the correct index', () => {
      // Define a test index
      const testIndex = 1;

      // Act: Call the method with the test index
      component.toggleParticipantsList(testIndex);

      // Assert: Check that dispatch was called with the correct action and payload
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.toggleParticipantsList({
          index: testIndex,
        })
      );
    });
  });
  describe('calculateDistribution() message', () => {
    it('should dispatch calculateDistribution action with correct parameters', () => {
      // Arrange
      const numberOfRooms = 3; // Example number of rooms
      const totalParticipants = 12; // Example total participants
      component.breakoutForm.get('numberOfRooms')?.setValue(numberOfRooms); // Set value in the form control
      component.totalParticipants = totalParticipants; // Set the total participants in the component

      // Act
      component.calculateDistribution(); // Call the method

      // Assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.calculateDistribution({
          numberOfRooms,
          totalParticipants,
        })
      );
    });
  });
  describe('Different Functions of ngoninit', () => {
    describe('storeLocalParticipantData', () => {
      it('should update localParticipant when new data is received', () => {
        // Arrange
        const testData = { name: 'Test Participant', id: 'participant1' };
        const mockLocalParticipantData = new Subject<any>(); // Create a new Subject for each test

        // Override the livekitService's localParticipantData observable
        mockLivekitService.localParticipantData =
          mockLocalParticipantData.asObservable();

        // Call the method to set up the subscription
        component.storeLocalParticipantData();

        // Spy on console.log
        spyOn(console, 'log'); // Ensure console.log is mocked

        // Act
        mockLocalParticipantData.next(testData); // Emit new data

        // Assert
        expect(component.localParticipant).toEqual(testData); // Check if localParticipant is updated
        expect(console.log).toHaveBeenCalledWith(
          'local Participant name updated:',
          testData
        );
      });
    });
    describe('storeRemoteParticipantNames', () => {
      let mockParticipantNamesUpdated: Subject<any>;

      beforeEach(() => {
        mockParticipantNamesUpdated = new Subject<any>();
        mockLivekitService.participantNamesUpdated =
          mockParticipantNamesUpdated.asObservable();
      });

      it('should update remoteParticipantNames and totalParticipants when new names are received', () => {
        // Arrange
        const testNames = ['Participant 1', 'Participant 2'];

        // Act
        component.storeRemoteParticipantNames();
        mockParticipantNamesUpdated.next(testNames); // Emit new names

        // Assert
        expect(component.remoteParticipantNames).toEqual(testNames); // Check remoteParticipantNames update
        expect(component.totalParticipants).toEqual(testNames.length); // Check totalParticipants update
      });

      it('should log an error if participantNamesUpdated is undefined', () => {
        // Arrange
        mockLivekitService.participantNamesUpdated = undefined;
        spyOn(console, 'error'); // Spy on console.error

        // Act
        component.storeRemoteParticipantNames();

        // Assert
        expect(console.error).toHaveBeenCalledWith(
          'participantNamesUpdated is undefined'
        );
      });
    });
    describe('handleMsgDataReceived', () => {
      it('should subscribe to msgDataReceived and call handleMsgDataReceived', () => {
        const mockData = {
          participant: { identity: 'participant1' },
          message: { message: 'Hello world' },
        };

        spyOn(component, 'handleMsgDataReceived'); // Spy on the method to check if it gets called

        // Simulate message reception by emitting data
        msgDataReceived.next(mockData);

        expect(component.handleMsgDataReceived).toHaveBeenCalledWith(mockData);
      });
    });

    describe('setupMessageSubscriptions, when subscribe messageToMain', () => {
      it('should subscribe to messageToMain and process messages correctly', () => {
        const mockMsgArray = [
          { content: 'I need help', title: 'User1', timestamp: Date.now() },
          {
            content: 'Some other message',
            title: 'User2',
            timestamp: Date.now(),
          },
        ];

        spyOn(component, 'openReceiveMsgModal'); // Spy on the method to check if it gets called

        // Simulate message reception by emitting the message array
        mockLivekitService.messageToMain.next(mockMsgArray);

        expect(component.allMessagesToMainRoom.length).toBe(1); // Check if one message was added
        expect(component.allMessagesToMainRoom[0]).toEqual(
          jasmine.objectContaining({
            senderName: 'User1',
            receivedMsg: 'I need help',
            receivingTime: jasmine.any(Date), // Check that it is a Date
            type: 'received',
          })
        );

        expect(component.roomName).toBe('User1'); // Check if roomName is set correctly
        expect(component.openReceiveMsgModal).toHaveBeenCalled(); // Check if the modal was opened
      });

      it('should not process messages that do not match the content criteria', () => {
        const mockMsgArray = [
          { content: 'Not important', title: 'User3', timestamp: Date.now() },
        ];

        mockLivekitService.messageToMain.next(mockMsgArray); // Emit a message that should be ignored

        expect(component.allMessagesToMainRoom.length).toBe(0); // Should not add any messages
      });
    });
    describe('setupMessageSubscriptions, when subscribe messageContentReceived', () => {
      // it('should subscribe to messageContentReceived and call handleNewMessage for valid messages', () => {
      //   const mockContentArray = [
      //     { content: 'Hello world', title: 'test-room' },
      //     { content: 'Ignored message', title: 'other-room' },
      //     { content: null, title: 'test-room' }, // Should be ignored
      //   ];

      //   spyOn(component, 'handleNewMessage'); // Spy on the method to check if it gets called

      //   // Simulate message content reception by emitting the content array
      //   mockLivekitService.messageContentReceived.next(mockContentArray);

      //   expect(component.handleNewMessage).toHaveBeenCalledWith(
      //     mockContentArray[0]
      //   ); // Check if handleNewMessage was called for valid message
      //   expect(component.handleNewMessage).toHaveBeenCalledTimes(1); // Should only be called once
      // });
      it('should not call handleNewMessage for messages that do not meet criteria', () => {
        const mockContentArray = [
          { content: 'Hello world', title: 'other-room' }, // Invalid title
          { content: null, title: 'test-room' }, // Invalid content
        ];

        spyOn(component, 'handleNewMessage');

        // Simulate message content reception
        mockLivekitService.messageContentReceived.next(mockContentArray);

        expect(component.handleNewMessage).not.toHaveBeenCalled(); // Should not be called for any invalid messages
      });
    });
  });
  describe('Create Automatic breakout room and form submit ()', () => {
    it('should dispatch initiateAutomaticRoomCreation action with participants and numberOfRooms if roomType is automatic and numberOfRooms > 0', async () => {
      // Arrange
      component.breakoutForm.get('roomType')?.setValue('automatic');
      component.breakoutForm.get('numberOfRooms')?.setValue(2);

      component.remoteParticipantNames = [
        { identity: 'participant1' },
        { identity: 'participant2' },
        { identity: 'participant3' },
        { identity: 'participant4' },
      ];

      const expectedAction =
        LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
          participants: [
            'participant1',
            'participant2',
            'participant3',
            'participant4',
          ],
          numberOfRooms: 2,
        });

      // Act
      await component.submitBreakoutForm();

      // Assert
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not dispatch initiateAutomaticRoomCreation if roomType is not automatic', async () => {
      // Arrange
      component.breakoutForm.get('roomType')?.setValue('manual');
      component.breakoutForm.get('numberOfRooms')?.setValue(2);

      // Act
      await component.submitBreakoutForm();

      // Assert
      expect(store.dispatch).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'initiateAutomaticRoomCreation' })
      );
    });

    it('should not dispatch initiateAutomaticRoomCreation if numberOfRooms is 0 or less', async () => {
      // Arrange
      component.breakoutForm.get('roomType')?.setValue('automatic');
      component.breakoutForm.get('numberOfRooms')?.setValue(0);

      // Act
      await component.submitBreakoutForm();

      // Assert
      expect(store.dispatch).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'initiateAutomaticRoomCreation' })
      );
    });
  });
  it('should set roomName and hostName and call showInvitationModal when message type is "breakoutRoom"', () => {
    const mockData = {
      participant: { identity: 'participant1' },
      message: {
        type: 'breakoutRoom',
        roomName: 'NewRoom',
      },
    };

    spyOn(component, 'showInvitationModal'); // Spy on the method to check if it gets called

    component.handleMsgDataReceived(mockData);

    expect(component.roomName).toBe('NewRoom');
    expect(component.hostName).toBe('participant1');
    expect(component.showInvitationModal).toHaveBeenCalled();
  });
  describe('ngAfterViewInit testing', () => {
    it('should handle valid screen share track', () => {
      const mockTrack: RemoteTrack = {
        source: Track.Source.ScreenShare,
        // Add other required properties and methods for the RemoteTrack mock
      } as RemoteTrack;

      // Emit a valid screen share track
      screenShareTrackSubscribed.next(mockTrack);

      expect(component.screenShareTrack).toBe(mockTrack); // Check if the track is set correctly
    });

    it('should reset screenShareTrack on invalid track', () => {
      // Emit an undefined track
      screenShareTrackSubscribed.next(undefined);

      expect(component.screenShareTrack).toBeUndefined(); // Check if the track is reset
    });

    it('should log an error if screenShareTrackSubscribed is undefined', () => {
      spyOn(console, 'error'); // Spy on console.error to track calls

      // Set screenShareTrackSubscribed to undefined
      mockLivekitService.screenShareTrackSubscribed = undefined;

      // Call ngAfterViewInit to trigger the code
      component.ngAfterViewInit();

      // Verify the error was logged
      expect(console.error).toHaveBeenCalledWith(
        'screenShareTrackSubscribed is undefined'
      );
    });
  });
  it('should call sendCloseAlertToBreakoutRooms on livekitService when closeAllBreakoutRooms is called', () => {
    // Arrange
    spyOn(console, 'log');

    // Act
    component.closeAllBreakoutRooms();

    // Assert
    expect(mockLivekitService.sendCloseAlertToBreakoutRooms).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      'Close all breakout rooms button clicked'
    );
  });
  describe('openBreakoutModal()', () => {
    it('should dispatch the openBreakoutModal action', () => {
      // Act: Call the method
      component.openBreakoutModal();

      // Assert: Check that dispatch was called with the correct action
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.openBreakoutModal()
      );
    });
  });

  describe('createRoomFromSideWindow()', () => {
    it('should dispatch the createRoomFromSideWindow action', () => {
      // Act: Call the method
      component.createNewRoomSidebar();

      // Assert: Check that dispatch was called with the correct action
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.createNewRoom()
      );
    });
  });

  describe('createNewRoomSidebar()', () => {
    it('should dispatch the createNewRoomSidebar action', () => {
      // Act: Call the method
      component.createNewRoomSidebar();

      // Assert: Check that dispatch was called with the correct action
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.createNewRoom()
      );
    });
  });

  describe('getAvailableParticipants()', () => {
    let mockBreakoutRoomsData: any[];
    let mockRemoteParticipantNames: any[];

    beforeEach(() => {
      // Mock data
      mockBreakoutRoomsData = [
        { participantIds: ['user1', 'user2'] },
        { participantIds: ['user3'] },
      ];
      mockRemoteParticipantNames = [
        { identity: 'user1', name: 'User 1' },
        { identity: 'user2', name: 'User 2' },
        { identity: 'user3', name: 'User 3' },
        { identity: 'user4', name: 'User 4' },
      ];

      // Mocking the component properties
      component.breakoutRoomsData = mockBreakoutRoomsData;
      component.remoteParticipantNames = mockRemoteParticipantNames;
    });

    it('should return participants who are not assigned to breakout rooms', () => {
      const availableParticipants = component.getAvailableParticipants(null);

      // The assigned participants are user1, user2, and user3
      // So, the available participant should be only user4
      expect(availableParticipants.length).toBe(1);
      expect(availableParticipants[0].identity).toBe('user4');
    });

    it('should return an empty array if all participants are assigned', () => {
      // Modify the mock to include all participants as assigned
      mockBreakoutRoomsData = [
        { participantIds: ['user1', 'user2', 'user3', 'user4'] },
      ];
      component.breakoutRoomsData = mockBreakoutRoomsData;

      const availableParticipants = component.getAvailableParticipants(null);

      expect(availableParticipants.length).toBe(0);
    });

    it('should return all participants if no breakout rooms exist', () => {
      // No breakout rooms, so all remote participants should be available
      component.breakoutRoomsData = [];

      const availableParticipants = component.getAvailableParticipants(null);

      expect(availableParticipants.length).toBe(4); // All four participants
      expect(availableParticipants).toEqual(mockRemoteParticipantNames);
    });
  });

  describe('isParticipantAssigned', () => {
    it('should return true if the participant is assigned to the room', () => {
      const room = { participantIds: ['user1', 'user2', 'user3'] };
      const participant = { identity: 'user2' };

      const result = component.isParticipantAssigned(room, participant);

      expect(result).toBeTrue(); // The participant 'user2' is assigned to the room
    });

    it('should return false if the participant is not assigned to the room', () => {
      const room = { participantIds: ['user1', 'user2', 'user3'] };
      const participant = { identity: 'user4' };

      const result = component.isParticipantAssigned(room, participant);

      expect(result).toBeFalse(); // The participant 'user4' is not assigned to the room
    });

    it('should return false if the room has no participants', () => {
      const room = { participantIds: [] };
      const participant = { identity: 'user2' };

      const result = component.isParticipantAssigned(room, participant);

      expect(result).toBeFalse(); // The room has no participants, so no one is assigned
    });

    it('should return true if the participant is the only one in the room', () => {
      const room = { participantIds: ['user2'] };
      const participant = { identity: 'user2' };

      const result = component.isParticipantAssigned(room, participant);

      expect(result).toBeTrue(); // The participant 'user2' is the only one in the room
    });
  });

  describe('speakerMode', () => {
    it('should toggle speakerModeLayout and call showInitialSpeaker when speakerModeLayout becomes true', () => {
      // Call speakerMode once
      component.speakerMode();

      // Verify the speakerModeLayout is toggled
      expect(mockLivekitService.speakerModeLayout).toBeTrue();

      // Ensure showInitialSpeaker was called
      expect(mockLivekitService.showInitialSpeaker).toHaveBeenCalled();

      // Ensure switchSpeakerViewLayout was NOT called
      expect(mockLivekitService.switchSpeakerViewLayout).not.toHaveBeenCalled();
    });

    it('should toggle speakerModeLayout and call switchSpeakerViewLayout when speakerModeLayout becomes false', () => {
      // Set the speakerModeLayout to true initially
      mockLivekitService.speakerModeLayout = true;

      // Call speakerMode once
      component.speakerMode();

      // Verify the speakerModeLayout is toggled back to false
      expect(mockLivekitService.speakerModeLayout).toBeFalse();

      // Ensure switchSpeakerViewLayout was called
      expect(mockLivekitService.switchSpeakerViewLayout).toHaveBeenCalled();

      // Ensure showInitialSpeaker was NOT called
      expect(mockLivekitService.showInitialSpeaker).not.toHaveBeenCalled();
    });

    it('should log the correct message when toggling speaker mode', () => {
      // Spy on the console.log method to check the logged message
      spyOn(console, 'log');

      // Call speakerMode once
      component.speakerMode();

      // Check that the correct message is logged
      expect(console.log).toHaveBeenCalledWith('Speaker mode toggled:', true);

      // Call speakerMode again to toggle the value back
      component.speakerMode();

      // Check that the correct message is logged again
      expect(console.log).toHaveBeenCalledWith('Speaker mode toggled:', false);
    });
  });

  describe('toggleRoomAccordion', () => {
    beforeEach(() => {
      // Initialize the isRoomAccordionOpen array
      component.isRoomAccordionOpen = [false, false, false]; // Example with 3 items
    });

    it('should toggle the accordion state for the given index', () => {
      // Initial state before toggle
      expect(component.isRoomAccordionOpen[0]).toBe(false);
      expect(component.isRoomAccordionOpen[1]).toBe(false);
      expect(component.isRoomAccordionOpen[2]).toBe(false);

      // Call toggleRoomAccordion for index 0
      component.toggleRoomAccordion(0);

      // Assert that the value at index 0 is now toggled to true
      expect(component.isRoomAccordionOpen[0]).toBe(true);

      // Call toggleRoomAccordion again for index 0
      component.toggleRoomAccordion(0);

      // Assert that the value at index 0 is now toggled back to false
      expect(component.isRoomAccordionOpen[0]).toBe(false);
    });

    it('should not affect other indexes when toggling a specific index', () => {
      // Initial state before toggle
      expect(component.isRoomAccordionOpen[0]).toBe(false);
      expect(component.isRoomAccordionOpen[1]).toBe(false);
      expect(component.isRoomAccordionOpen[2]).toBe(false);

      // Call toggleRoomAccordion for index 1
      component.toggleRoomAccordion(1);

      // Assert that the value at index 1 is now true
      expect(component.isRoomAccordionOpen[1]).toBe(true);

      // Assert that other indexes remain unaffected
      expect(component.isRoomAccordionOpen[0]).toBe(false);
      expect(component.isRoomAccordionOpen[2]).toBe(false);
    });
  });

  describe('onRoomSelection', () => {
    it('should dispatch addParticipantToRoom action with correct payload', () => {
      // Mock data
      const room = { roomName: 'TestRoom' };
      const participant = { identity: 'Participant123' };

      // Call the method onRoomSelection
      component.onRoomSelection(room, participant);

      // Verify that the dispatch method was called with the correct action
      expect(store.dispatch).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.addParticipantToRoom({
          roomName: 'TestRoom',
          participantId: 'Participant123',
        })
      );
    });
  });

  describe('leaveBtnAccordion', () => {
    it('should toggle the isLeaveAccordionOpen state', () => {
      // Initial state is false
      expect(component.isLeaveAccordionOpen).toBe(false);

      // Call the leaveBtnAccordion method to toggle the state
      component.leaveBtnAccordion();
      expect(component.isLeaveAccordionOpen).toBe(true); // Should be true after first toggle

      // Call the method again to toggle back to false
      component.leaveBtnAccordion();
      expect(component.isLeaveAccordionOpen).toBe(false); // Should be false after second toggle
    });
  });

  describe('joinMainRoom', () => {
    beforeEach(() => {
      component.roomName = 'TestRoom';
      component.participantName = 'TestParticipant';
    });
    it('should dispatch createMeeting action with correct parameters', () => {
      // Call the joinMainRoom method
      component.joinMainRoom();

      // Check if the dispatch method was called with the correct action
      expect(store.dispatch).toHaveBeenCalledWith(
        LiveKitRoomActions.MeetingActions.createMeeting({
          participantNames: ['TestParticipant'],
          roomName: 'TestRoom',
        })
      );
    });

    it('should log "Joined main room" to the console', () => {
      const consoleLogSpy = spyOn(console, 'log');

      // Call the joinMainRoom method
      component.joinMainRoom();

      // Check if the console.log was called
      expect(consoleLogSpy).toHaveBeenCalledWith('Joined main room');
    });
  });

  describe('leaveBreakoutRoomAndJoinMainRoom', () => {
    beforeEach(() => {
      // Mock the leaveCurrentMeeting and joinMainRoom methods
      spyOn(component, 'leaveCurrentMeeting').and.returnValue(
        Promise.resolve()
      );
      spyOn(component, 'joinMainRoom');
      spyOn(console, 'log');
      spyOn(console, 'error');
    });

    it('should reset necessary variables and show the redirection modal', () => {
      component.leaveBreakoutRoomAndJoinMainRoom();

      expect(component.isLeaveAccordionOpen).toBeFalse();
      expect(component.isBreakoutRoom).toBe('');
      expect(component.redirectionMessage).toBe(
        'Please wait while we redirect you to the main room.'
      );
      expect(component.isRedirectionModalVisible).toBeTrue();
      expect(component.showCloseRoomModal).toBeFalse();
      expect(console.log).toHaveBeenCalledWith('Showing redirection modal');
    });

    it('should call joinMainRoom after successfully leaving the current meeting', async () => {
      await component.leaveBreakoutRoomAndJoinMainRoom();

      expect(component.leaveCurrentMeeting).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        'Left breakout room successfully'
      );
      expect(component.joinMainRoom).toHaveBeenCalled();
    });
  });

  describe('Audio, Video and Speaker Devices', () => {
    it('should select a video device and call switchDevice', async () => {
      const deviceId = 'test-device-id';
      spyOn(console, 'log'); // Spy on console.log

      await component.selectVideo(deviceId);

      expect(component.selectedVideoId).toBe(deviceId);
      expect(mockLivekitService.switchDevice).toHaveBeenCalledWith(
        'videoinput',
        deviceId
      );
      expect(console.log).toHaveBeenCalledWith(
        'Selected video device:',
        deviceId
      );
    });

    it('should select an audio device and call switchDevice', async () => {
      const deviceId = 'test-device-id';
      spyOn(console, 'log'); // Spy on console.log

      await component.selectMic(deviceId);

      expect(component.selectedMicId).toBe(deviceId);
      expect(mockLivekitService.switchDevice).toHaveBeenCalledWith(
        'audioinput',
        deviceId
      );
      expect(console.log).toHaveBeenCalledWith(
        'Selected microphone device:',
        deviceId
      );
    });

    it('should select an speaker device and call switchDevice', async () => {
      const deviceId = 'test-device-id';
      spyOn(console, 'log'); // Spy on console.log

      await component.selectSpeaker(deviceId);

      expect(component.selectedSpeakerId).toBe(deviceId);
      expect(mockLivekitService.switchDevice).toHaveBeenCalledWith(
        'audiooutput',
        deviceId
      );
      expect(console.log).toHaveBeenCalledWith(
        'Selected speaker device:',
        deviceId
      );
    });
  });

  describe('toggleMicDropdown ', () => {
    beforeEach(async () => {
      // Mock the LivekitService
      mockLivekitService = jasmine.createSpyObj('LivekitService', [
        'getAllDevices',
        'switchDevice',
      ]);

      component = fixture.componentInstance;
    });

    it('should toggle mic dropdown without fetching devices if already loaded', async () => {
      // Arrange
      component.audioDevicesLoaded = true; // Simulate devices already loaded
      component.isMicDropdownOpen = false; // Initial dropdown state

      // Act
      await component.toggleMicDropdown();

      // Assert
      expect(mockLivekitService.getAllDevices).not.toHaveBeenCalled(); // Ensure no fetch
      expect(component.isMicDropdownOpen).toBeTrue(); // Dropdown state toggled
    });
  });
  describe('toggleVideoDropdown', () => {
    it('should fetch video devices and toggle dropdown if not loaded', async () => {
      // Arrange
      const mockDevices = [
        { deviceId: '1', label: 'Camera 1' },
        { deviceId: '2', label: 'Camera 2' },
      ] as any;
      // Ensure to add getDevices to the mock setup
      mockLivekitService.getDevices = jasmine
        .createSpy('getDevices')
        .and.returnValue(Promise.resolve(mockDevices));

      // Set initial state
      component.videoDevicesLoaded = false;

      // Act
      await component.toggleVideoDropdown();

      // Assert
      expect(mockLivekitService.getDevices).toHaveBeenCalledWith('videoinput');
      expect(component.videoDevices).toEqual(mockDevices);
      expect(component.videoDevicesLoaded).toBeTrue();
      expect(component.isVideoDropdownOpen).toBeTrue();
    });

    it('should log an error when fetching video devices fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch devices';
      const error = new Error(errorMessage);

      // Mock getDevices to reject with an error
      mockLivekitService.getDevices = jasmine
        .createSpy('getDevices')
        .and.returnValue(Promise.reject(error));

      // Set initial state
      component.videoDevicesLoaded = false;

      // Spy on console.error
      const consoleErrorSpy = spyOn(console, 'error');

      // Act
      await component.toggleVideoDropdown();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching video devices:',
        error
      );
      expect(component.videoDevicesLoaded).toBeFalse(); // Ensure the state remains unchanged
      expect(component.isVideoDropdownOpen).toBeTrue(); // Ensure dropdown state changes
    });
  });
  describe('toggleMicDropdown', () => {
    it('should load audio devices and toggle dropdown if not loaded', async () => {
      // Arrange
      const mockDevices = {
        microphones: [{ deviceId: 'mic1', label: 'Microphone 1' }],
        speakers: [{ deviceId: 'speaker1', label: 'Speaker 1' }],
      } as any;
      mockLivekitService.getAllDevices = jasmine
        .createSpy('getAllDevices')
        .and.returnValue(Promise.resolve(mockDevices));
      component.audioDevicesLoaded = false; // Ensure devices are not loaded initially
      const consoleLogSpy = spyOn(console, 'log');

      // Act
      await component.toggleMicDropdown();

      // Assert
      expect(component.micDevices).toEqual(mockDevices.microphones); // Check if micDevices are set
      expect(component.speakerDevices).toEqual(mockDevices.speakers); // Check if speakerDevices are set
      expect(component.audioDevicesLoaded).toBeTrue(); // Ensure devices are marked as loaded
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Audio devices loaded:',
        mockDevices.microphones,
        mockDevices.speakers
      ); // Check log
      expect(component.isMicDropdownOpen).toBeTrue(); // Ensure dropdown state is toggled
    });

    it('should log an error if fetching devices fails', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch audio devices';
      const error = new Error(errorMessage);
      mockLivekitService.getAllDevices = jasmine
        .createSpy('getAllDevices')
        .and.returnValue(Promise.reject(error));
      component.audioDevicesLoaded = false; // Ensure devices are not loaded initially
      const consoleErrorSpy = spyOn(console, 'error');

      // Act
      await component.toggleMicDropdown();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching audio devices:',
        error
      ); // Check error log
      expect(component.audioDevicesLoaded).toBeFalse(); // Ensure devices are not marked as loaded
      expect(component.isMicDropdownOpen).toBeTrue(); // Ensure dropdown state is toggled
    });
  });
  describe('onDeviceSelected', () => {
    it('should update selectedSpeakerId when kind is audiooutput', async () => {
      // Arrange
      const kind = 'audiooutput';
      const deviceId = 'speaker1';
      mockLivekitService.switchDevice = jasmine
        .createSpy('switchDevice')
        .and.returnValue(Promise.resolve());

      // Act
      await component.onDeviceSelected(kind, deviceId);

      // Assert
      expect(component.selectedSpeakerId).toBe(deviceId); // Check if selectedSpeakerId is updated
      expect(mockLivekitService.switchDevice).toHaveBeenCalledWith(
        kind,
        deviceId
      ); // Ensure switchDevice was called
    });
    it('should update selected device and switch device successfully', async () => {
      // Arrange
      const kind = 'videoinput';
      const deviceId = 'video1';
      const consoleLogSpy = spyOn(console, 'log');
      const mockSwitchDevice = jasmine
        .createSpy('switchDevice')
        .and.returnValue(Promise.resolve());
      mockLivekitService.switchDevice = mockSwitchDevice;

      // Act
      await component.onDeviceSelected(kind, deviceId);

      // Assert
      expect(component.selectedVideoId).toBe(deviceId); // Check if selectedVideoId is updated
      expect(mockSwitchDevice).toHaveBeenCalledWith(kind, deviceId); // Ensure switchDevice was called
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Successfully switched ${kind} to device: ${deviceId}`
      ); // Check success log
    });

    it('should log an error if switching devices fails', async () => {
      // Arrange
      const kind = 'audioinput';
      const deviceId = 'mic1';
      const errorMessage = 'Failed to switch device';
      const error = new Error(errorMessage);
      const consoleErrorSpy = spyOn(console, 'error');
      mockLivekitService.switchDevice = jasmine
        .createSpy('switchDevice')
        .and.returnValue(Promise.reject(error));

      // Act
      await component.onDeviceSelected(kind, deviceId);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error switching ${kind} to device: ${deviceId}`,
        error
      ); // Check error log
    });
  });
  describe('to test handleMsgDataReceived', () => {
    it('should handle breakoutRoom message type correctly', () => {
      const mockData = {
        participant: { identity: 'User2' },
        message: { type: 'breakoutRoom', roomName: 'TestRoom' },
      };

      spyOn(component, 'showInvitationModal');

      component.handleMsgDataReceived(mockData);

      expect(component.hostName).toBe('User2');
      expect(component.roomName).toBe('TestRoom');
      expect(component.showInvitationModal).toHaveBeenCalled();
    });

    it('should handle closeRoomAlert message type correctly', () => {
      const mockData = {
        participant: { identity: 'User3' },
        message: { type: 'closeRoomAlert', countdown: 30 },
      };

      spyOn(component, 'startCountdown');

      component.handleMsgDataReceived(mockData);

      expect(component.showCloseRoomModal).toBeTrue();
      expect(component.countdown).toBe(30);
      expect(component.startCountdown).toHaveBeenCalled();
    });

    it('should add a received message to allMessages when message type is not handled', () => {
      const mockData = {
        participant: { identity: 'User4' },
        message: {
          type: 'generalMessage',
          message: 'Hello',
          timestamp: '2024-12-30T12:00:00Z',
        },
      };

      spyOn(component, 'updateUnreadMessageCount');
      spyOn(component, 'scrollToBottom');
      spyOn(component, 'sortMessages');

      component.handleMsgDataReceived(mockData);

      expect(component.allMessages.length).toBe(1);
      expect(component.allMessages[0]).toEqual({
        senderName: 'User4',
        receivedMsg: 'Hello',
        receivingTime: '2024-12-30T12:00:00Z',
        type: 'received',
      });
      expect(component.updateUnreadMessageCount).toHaveBeenCalled();
      expect(component.scrollToBottom).toHaveBeenCalled();
      expect(component.sortMessages).toHaveBeenCalled();
    });
  });

  it('should return true if there are remote participants', () => {
    // Set up the mock to have remote participants
    mockLivekitService.room.remoteParticipants.set('participant1', {});

    // Call the function
    const result = component.hasRemoteParticipants();

    // Check that the function returns true
    expect(result).toBe(true);
  });

  it('should return false if there are no remote participants', () => {
    // Ensure no participants are added
    mockLivekitService.room.remoteParticipants.clear();

    // Call the function
    const result = component.hasRemoteParticipants();

    // Check that the function returns false
    expect(result).toBe(false);
  });
});
