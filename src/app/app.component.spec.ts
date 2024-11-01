//////////////////////////////////////

import {
  ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LivekitService } from './livekit.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { ElementRef, EventEmitter } from '@angular/core';
import { AppComponent } from './app.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { Store, StoreModule } from '@ngrx/store';
import * as LiveKitRoomActions from './+state/livekit/livekit-room.actions';
import { HttpClientModule } from '@angular/common/http';
import { RemoteTrack, Track } from 'livekit-client';

class MockLiveKitService {
  toggleVideo() {
    return Promise.resolve();
  }
}
describe('AppComponent;', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockMatDialog: MatDialog;
  let mockMatSnackBar: MatSnackBar;
  let mockLivekitService: any;
  let msgDataReceived: Subject<any>;
  let messageEmitter: Subject<any>;
  let screenShareTrackSubscribed: Subject<any>;
  let store: any;
  let dispatchSpy: jasmine.Spy;
  // let liveKitService: jasmine.SpyObj<LiveKitService>;
  let formBuilder: FormBuilder;
  let mockElementRef: ElementRef;
  let mockChatSideWindowVisible$: Subject<boolean>;
  let webSocketStatusSubject: Subject<string>;

  const GRIDCOLUMN: { [key: number]: string } = {
    1: '1fr',
    2: '1fr 1fr',
    3: '1fr 1fr',
    4: '1fr 1fr',
    5: '1fr 1fr 1fr',
    6: '1fr 1fr 1fr',
  };
  beforeEach(async () => {
    mockChatSideWindowVisible$ = new Subject<boolean>();
    mockElementRef = {
      nativeElement: jasmine.createSpyObj('nativeElement', [
        'focus',
        'scrollIntoView',
      ]),
    };

    msgDataReceived = new Subject<any>();
    messageEmitter = new Subject<any>();
    screenShareTrackSubscribed = new Subject<any>();
    webSocketStatusSubject = new Subject<string>();
    mockLivekitService = {
      breakoutRoomAlert: jasmine
        .createSpy('breakoutRoomAlert')
        .and.returnValue(Promise.resolve()),
      initCanvas: jasmine.createSpy('initCanvas'),
      localParticipantData: msgDataReceived.asObservable(),
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
      declarations: [AppComponent],
      providers: [
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

    // mockLiveKitService = TestBed.inject(LiveKitService);
    mockMatDialog = TestBed.inject(MatDialog);
    mockMatSnackBar = TestBed.inject(MatSnackBar);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    // component.chatSideWindowVisible$ = of(false);
    component.participantName = 'Test Participant';
    (component as any).GRIDCOLUMN = GRIDCOLUMN;
    formBuilder = TestBed.inject(FormBuilder);
    component.chatSideWindowVisible$ =
      mockChatSideWindowVisible$.asObservable();
    component.allMessages = [];
    component.unreadMessagesCount = 0;

    // Initialize the form
    component.chatForm = formBuilder.group({
      message: ['Test message'],
      participant: ['Test participant'],
    });
    component.breakoutForm = formBuilder.group({
      roomType: ['automatic'],
      numberOfRooms: [2],
    });
    component.breakoutRoomsData = [
      {
        roomName: 'Room 1',
        participantIds: ['participant1', 'participant2'],
      },
      {
        roomName: 'Room 2',
        participantIds: [],
      },
    ];
    component.audioCanvasRef = mockElementRef;
    // liveKitService = TestBed.inject(
    //   LiveKitService
    // ) as jasmine.SpyObj<LiveKitService>;
    component.localParticipant = {
      identity: 'hostIdentity',
      handRaised: false,
    };
    component.roomName = 'TestRoom';
    component.roomName = undefined;
    component.allMessagesToMainRoom = [];
    component.handRaiseStates = {};
    component.remoteParticipantNames = [
      { identity: 'participant1' },
      { identity: 'participant2' },
      { identity: 'participant3' },
      { identity: 'participant4' },
    ];
    component.ngAfterViewInit();
    fixture.detectChanges();
  });
  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });
  it('should call initCanvas with audioCanvasRef.nativeElement after view init', () => {
    component.ngAfterViewInit();
    expect(mockLivekitService.initCanvas).toHaveBeenCalledWith(
      mockElementRef.nativeElement
    );
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
        roomName: 'test-room',
      });

      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
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
    it('should dispatch toggleScreenShare action when toggleScreenShare is called', async () => {
      await component.toggleScreenShare();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.LiveKitActions.toggleScreenShare()
      );
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
      await component.leaveBtn();
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.MeetingActions.leaveMeeting()
      );
    });

    it('should return a promise that resolves to void', async () => {
      const result = await component.leaveBtn();
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
  it('should scroll to bottom of message container', fakeAsync(() => {
    // Arrange
    const messageContainerElement = new ElementRef<HTMLDivElement>(
      document.createElement('div')
    );
    component.messageContainer = messageContainerElement;
    Object.defineProperty(
      messageContainerElement.nativeElement,
      'scrollHeight',
      { value: 1000, configurable: true }
    );
    Object.defineProperty(messageContainerElement.nativeElement, 'scrollTop', {
      value: 0,
      writable: true,
    });

    // Act
    component.scrollToBottom();
    tick(100); // wait for the setTimeout to complete

    // Assert
    expect(messageContainerElement.nativeElement.scrollTop).toBe(1000);
  }));
  describe('isParticipantAssigned', () => {
    it('should return true if the participant is assigned to the room', () => {
      const room = {
        participantIds: ['user1', 'user2', 'user3'],
      };
      const participant = { identity: 'user2' };

      const result = component.isParticipantAssigned(room, participant);

      expect(result).toBeTrue(); // Expect the result to be true
    });

    it('should return false if the participant is not assigned to the room', () => {
      const room = {
        participantIds: ['user1', 'user2', 'user3'],
      };
      const participant = { identity: 'user4' };

      const result = component.isParticipantAssigned(room, participant);

      expect(result).toBeFalse(); // Expect the result to be false
    });

    it('should return false if the room has no participants', () => {
      const room = {
        participantIds: [],
      };
      const participant = { identity: 'user1' };

      const result = component.isParticipantAssigned(room, participant);

      expect(result).toBeFalse(); // Expect the result to be false
    });
  });

  describe('createNewRoomSidebar', () => {
    it('should dispatch initiateCreateNewRoom action', () => {
      // Call the method
      component.createNewRoomSidebar();

      // Check that the correct action was dispatched
      expect(store.dispatch).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.initiateCreateNewRoom()
      );
    });
  });
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
  describe('Open Breakout Modal for automatic or manual selection of rooms', () => {
    it('should dispatch toggleBreakoutModal action when open breakout Modal is called', () => {
      component.openBreakoutModal();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.openBreakoutModal()
      );
    });
  });
  describe('Close Breakout Modal for automatic or manual selection of rooms', () => {
    it('should dispatch closeBreakoutModal action when closeBreakoutModal is called', () => {
      component.closeBreakoutModal();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.closeBreakoutModal()
      );
    });
  });

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
  describe('participants which are available to enter in breakout room (getAvailableParticipants)', () => {
    it('should return participants not already in the room', () => {
      const room = {
        participantIds: ['participant1', 'participant2'], // participants already in the room
      };

      const availableParticipants = component.getAvailableParticipants(room);

      // Expect available participants to exclude 'participant1' and 'participant2'
      expect(availableParticipants).toEqual([
        { identity: 'participant3' },
        { identity: 'participant4' },
      ]);
    });
  });
  describe('when participant selected (onParticipantSelected)', () => {
    it('should dispatch addParticipant action when checkbox is checked', () => {
      const room = { roomName: 'Room 2', participantIds: [] };
      const participant = { identity: 'participant3' };
      const event = { target: { checked: true } };

      // Call the method
      component.onParticipantSelected(room, participant, event);

      // Check that the correct action was dispatched
      expect(store.dispatch).toHaveBeenCalledWith(
        LiveKitRoomActions.BreakoutActions.addParticipant({
          roomName: 'Room 2',
          participantId: 'participant3',
        })
      );
    });

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
      spyOn(component, 'leaveBtn').and.returnValue(Promise.resolve());

      // Call the hostJoinNow method
      await component.hostJoinNow();

      // Check if leaveBtn was called as expected
      expect(component.leaveBtn).toHaveBeenCalled();
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
    it('should successfully join an existing room', fakeAsync(() => {
      // Arrange
      component.roomName = 'Room 1'; // Set the room name to an existing room
      component.localParticipant = {
        identity: 'hostIdentity',
        handRaised: false,
      };

      // Initialize breakoutRoomsData to contain a room with the expected name
      component.livekitService.breakoutRoomsData = [
        {
          roomName: 'Room 1',
          participantIds: ['participant1', 'participant2'],
        },
        { roomName: 'Room 2', participantIds: [] },
      ];

      // Act
      component.hostJoinNow(); // Call the method to join the room

      tick(); // Simulate the passage of time to let any async operations complete

      // Assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          participantNames: ['hostIdentity'],
          roomName: 'Room 1',
          type: '[[Meeting]] createMeeting', // Make sure this matches the actual action type
        })
      );
    }));
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
        { screenShareCount: 1, expectedStyle: '1fr' },
        { screenShareCount: 2, expectedStyle: '1fr 1fr' },
        { screenShareCount: 3, expectedStyle: '1fr 1fr' },
        { screenShareCount: 4, expectedStyle: '1fr 1fr' },
        { screenShareCount: 5, expectedStyle: '1fr 1fr 1fr' },
        { screenShareCount: 6, expectedStyle: '1fr 1fr 1fr' },
      ];

      testCases.forEach(({ screenShareCount, expectedStyle }) => {
        mockLivekitService.screenShareCount = screenShareCount; // Set the screenShareCount
        fixture.detectChanges(); // Trigger change detection
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
      it('should subscribe to messageContentReceived and call handleNewMessage for valid messages', () => {
        const mockContentArray = [
          { content: 'Hello world', title: 'test-room' },
          { content: 'Ignored message', title: 'other-room' },
          { content: null, title: 'test-room' }, // Should be ignored
        ];

        spyOn(component, 'handleNewMessage'); // Spy on the method to check if it gets called

        // Simulate message content reception by emitting the content array
        mockLivekitService.messageContentReceived.next(mockContentArray);

        expect(component.handleNewMessage).toHaveBeenCalledWith(
          mockContentArray[0]
        ); // Check if handleNewMessage was called for valid message
        expect(component.handleNewMessage).toHaveBeenCalledTimes(1); // Should only be called once
      });
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
  // it('should subscribe to webSocketStatus$ and update webSocketStatus accordingly', () => {

  //   const statusMock = 'connected';

  //   // Trigger the observable
  //   webSocketStatusSubject.next(statusMock);

  //   // Verify that the component's status property was updated
  //   expect(component.webSocketStatus).toBe(statusMock);
  //   expect(console.log).toHaveBeenCalledWith(
  //     'WebSocket status updated:',
  //     statusMock
  //   );
  // });

  it('should subscribe to webSocketStatus$ and update webSocketStatus', () => {
    const mockStatus = 'Connected';

    // Set up the observable to emit the mock status
    mockLivekitService.webSocketStatus$ = of(mockStatus);

    // Initialize the component
    component.ngOnInit();

    // Verify that webSocketStatus is updated
    expect(component.webSocketStatus).toBe(mockStatus);
    console.log = jasmine.createSpy('log'); // Mock console.log to prevent output during tests
    component.ngOnInit();
    expect(console.log).toHaveBeenCalledWith(
      'WebSocket status updated:',
      mockStatus
    );
  });
});
