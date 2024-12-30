import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LivekitService } from './livekit.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ConnectionQuality,
  DataPacket_Kind,
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  TrackPublication,
  VideoQuality,
} from 'livekit-client';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { EventEmitter } from '@angular/core';
import { connect, identity, of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MeetingService } from './meeting.service';

describe('LivekitService', () => {
  TestBed.configureTestingModule({
    providers: [LivekitService],
  });
  let service: LivekitService;
  let roomMock: jasmine.SpyObj<Room>;
  let localParticipantMock: jasmine.SpyObj<LocalParticipant>;
  // let modal: HTMLElement;
  let mockRoom: any;
  // let closeBtn: HTMLElement;
  let mockLocalParticipant: jasmine.SpyObj<any>;
  let mockRemoteParticipants: jasmine.SpyObj<any>;
  let participantConnectedEmitter: EventEmitter<void>;
  let mockKind: DataPacket_Kind | undefined;
  let decoderMock: TextDecoder;
  let mockMeetingService: jasmine.SpyObj<MeetingService>;
  beforeEach(() => {
    const meetingServiceSpy = jasmine.createSpyObj('MeetingService', [
      'sendCloseBreakoutRoomAlert',
    ]);
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
        HttpClientModule,
      ],
      providers: [
        LivekitService,
        { provide: Room, useValue: roomMock },
        { provide: TextDecoder, useValue: mockKind },
        { provide: 'Room', useValue: mockRoom }, // Injecting mock Room
        { provide: MeetingService, useValue: meetingServiceSpy },
      ],
    });

    mockLocalParticipant = {
      identity: 'localParticipant',
    };

    mockRoom = {
      switchActiveDevice: jasmine.createSpy('switchActiveDevice'),
    };

    mockRemoteParticipants = [
      jasmine.createSpyObj('RemoteParticipant', ['identity'], {
        identity: 'remoteParticipant1',
      }),
    ];

    roomMock = jasmine.createSpyObj('Room', ['on', 'connect', 'next'], {
      localParticipant: mockLocalParticipant,
      remoteParticipants: new Map(
        mockRemoteParticipants.map((p: any) => [p.identity, p])
      ),
      numParticipants: 2,
    });

    // Mock the `on` method to subscribe to the `participantConnectedEmitter`
    roomMock.on.and.callFake((event, callback) => {
      if (event === RoomEvent.ParticipantConnected) {
        participantConnectedEmitter.subscribe(callback);
      }
      return roomMock; // Ensure it returns the Room object
    });

    service = TestBed.inject(LivekitService);
    service.room = roomMock;
    service.room = mockRoom;
    mockMeetingService = TestBed.inject(
      MeetingService
    ) as jasmine.SpyObj<MeetingService>;
    service.msgDataReceived = jasmine.createSpyObj('msgDataReceived', ['next']);
    service.handRaised = jasmine.createSpyObj('handRaised', ['next']);
    service.breakoutRoom = jasmine.createSpyObj('breakoutRoom', ['next']);
    service.messageContentReceived = jasmine.createSpyObj(
      'messageContentReceived',
      ['emit']
    );
    service.messageToMain = jasmine.createSpyObj('messageToMain', ['next']);
    service.messageArray = [];
    service.messageArrayToMain = [];
  });

  afterEach(() => {
    // Clean up modal element after each test
    // document.body.removeChild(modal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('should lower and raise hand events', () => {
    it('should raise hand and publish the correct message', async () => {
      // Mock LocalParticipant and Room
      const mockLocalParticipant = jasmine.createSpyObj('LocalParticipant', [
        'publishData',
      ]);
      const mockRoom = jasmine.createSpyObj('Room', [], {
        localParticipant: mockLocalParticipant,
      });
      service['room'] = mockRoom;

      // Spy on the private publishHandRaiseLowerMessage method
      spyOn<any>(service, 'publishHandRaiseLowerMessage').and.callThrough();

      const participant = { identity: 'user-123', handRaised: false };

      await service.raiseHand(participant);

      expect(participant.handRaised).toBeTrue();
      expect(service['publishHandRaiseLowerMessage']).toHaveBeenCalledWith({
        type: 'handRaise',
        participantId: 'user-123',
        handRaised: true,
      });
    });
    it('should lower hand and publish the correct message', async () => {
      // Mock LocalParticipant and Room
      const mockLocalParticipant = jasmine.createSpyObj('LocalParticipant', [
        'publishData',
      ]);
      const mockRoom = jasmine.createSpyObj('Room', [], {
        localParticipant: mockLocalParticipant,
      });
      service['room'] = mockRoom;

      // Spy on the private publishHandRaiseLowerMessage method
      spyOn<any>(service, 'publishHandRaiseLowerMessage').and.callThrough();

      const participant = { identity: 'user-123', handRaised: true };

      await service.lowerHand(participant);

      expect(participant.handRaised).toBeFalse();
      expect(service['publishHandRaiseLowerMessage']).toHaveBeenCalledWith({
        type: 'handRaise',
        participantId: 'user-123',
        handRaised: false,
      });
    });
    it('should publish hand raise/lower message with the correct data', async () => {
      // Mock LocalParticipant and Room
      const mockLocalParticipant = jasmine.createSpyObj('LocalParticipant', [
        'publishData',
      ]);
      const mockRoom = jasmine.createSpyObj('Room', [], {
        localParticipant: mockLocalParticipant,
      });
      service['room'] = mockRoom;

      const message = {
        type: 'handRaise',
        participantId: 'user-123',
        handRaised: true,
      };
      const strData = JSON.stringify(message);
      const encodedData = new TextEncoder().encode(strData);

      await service['publishHandRaiseLowerMessage'](message);

      expect(mockLocalParticipant.publishData).toHaveBeenCalledWith(
        encodedData,
        { reliable: true }
      );
    });
  });
  describe('Test for handleTrackSubscribed function', () => {
    it('should handle track subscription and append video element correctly', () => {
      // Mock track, publication, and participant
      const mockTrack = jasmine.createSpyObj('RemoteTrack', ['attach'], {
        kind: 'video',
        source: Track.Source.Camera,
      });
      const mockPublication = jasmine.createSpyObj('RemoteTrackPublication', [
        'setVideoQuality',
      ]);
      const mockParticipant = jasmine.createSpyObj('RemoteParticipant', [], {
        sid: 'participant-123',
        identity: 'user-123',
      });

      // Spy on the console methods to verify if they're called
      spyOn(console, 'log');
      spyOn(console, 'error');

      // Create a container element in the DOM for testing
      const container = document.createElement('div');
      container.classList.add('lk-grid-layout');
      document.body.appendChild(container);

      // Mock the attach method to return a dummy element
      const mockElement = document.createElement('video');
      mockTrack.attach.and.returnValue(mockElement);

      // Spy on the openSnackBar method
      spyOn(service, 'openSnackBar');

      // Call the method under test
      service.handleTrackSubscribed(
        mockTrack,
        mockPublication,
        mockParticipant
      );

      // Assertions
      expect(console.log).toHaveBeenCalledWith('testing', mockPublication);
      expect(mockTrack.attach).toHaveBeenCalled();
      // expect(mockPublication.setVideoQuality).toHaveBeenCalledWith(VideoQuality.LOW);
      expect(service.openSnackBar).toHaveBeenCalledWith(
        'Participant "user-123" has joined.'
      );

      // Verify the video element is appended to the container
      const appendedElement = container.querySelector('.lk-participant-tile');
      expect(appendedElement).toBeTruthy();

      // Clean up the DOM
      document.body.removeChild(container);
    });
    it('should handle track subscription and append audio element correctly', () => {
      // Mock track, publication, and participant
      const mockTrack = jasmine.createSpyObj('RemoteTrack', ['attach'], {
        kind: 'audio',
        source: Track.Source.Microphone,
      });
      const mockPublication = jasmine.createSpyObj('RemoteTrackPublication', [
        'setVideoQuality',
      ]);
      const mockParticipant = jasmine.createSpyObj('RemoteParticipant', [], {
        sid: 'participant-123',
        identity: 'user-123',
      });

      // Spy on the console methods to verify if they're called
      // spyOn(console, 'log');
      spyOn(console, 'error');

      // Create a container element in the DOM for testing
      const container = document.createElement('div');
      container.setAttribute('id', 'remoteAudioContainer');
      document.body.appendChild(container);

      // Mock the attach method to return a dummy element
      const mockElement = document.createElement('audio');
      mockTrack.attach.and.returnValue(mockElement);

      // Call the method under test
      service.handleTrackSubscribed(
        mockTrack,
        mockPublication,
        mockParticipant
      );

      // Assertions
      // expect(console.log).toHaveBeenCalledWith('testing', mockPublication);
      expect(mockTrack.attach).toHaveBeenCalled();

      // Verify the audio element is appended to the container
      const appendedElement = container.querySelector('audio');
      expect(appendedElement).toBeTruthy();

      // Clean up the DOM
      document.body.removeChild(container);
    });

    it('should handle screen share track subscription and update the DOM', (done) => {
      // Mock track, publication, and participant
      const mockTrack = jasmine.createSpyObj('RemoteTrack', ['attach'], {
        kind: 'video',
        source: Track.Source.ScreenShare,
      });
      const mockPublication = jasmine.createSpyObj(
        'RemoteTrackPublication',
        [],
        { track: mockTrack }
      );
      const mockParticipant = jasmine.createSpyObj('RemoteParticipant', [], {
        sid: 'participant-123',
        identity: 'user-123',
      });

      // Mock the attach method to return a dummy video element
      const mockElement = document.createElement('video');
      mockTrack.attach.and.returnValue(mockElement);

      // Spy on the console methods to verify if they're called
      spyOn(console, 'log');
      spyOn(console, 'error');

      // Spy on the emit method of screenShareTrackSubscribed event emitter
      spyOn(service.screenShareTrackSubscribed, 'next');

      // Create a container element in the DOM for testing
      const container = document.createElement('div');
      container.setAttribute('class', 'lk-focus-layout');
      document.body.appendChild(container);

      // Call the method under test
      service.handleTrackSubscribed(
        mockTrack,
        mockPublication,
        mockParticipant
      );

      // Check immediate effects
      expect(service.remoteScreenShare).toBeTrue();
      expect(service.screenShareTrackSubscribed.next).toHaveBeenCalledWith(
        mockTrack
      );

      // Check the DOM manipulation after setTimeout
      setTimeout(() => {
        const appendedElement = container.querySelector('.lk-participant-tile');
        expect(appendedElement).not.toBeNull(
          'Expected .lk-participant-tile to be present in the DOM'
        );

        const videoElement = appendedElement!.querySelector('video');
        expect(videoElement).not.toBeNull(
          'Expected video element to be present inside .lk-participant-tile'
        );

        const participantNameElement = appendedElement!.querySelector(
          '.lk-participant-name'
        );
        expect(participantNameElement).not.toBeNull(
          'Expected .lk-participant-name to be present inside .lk-participant-tile'
        );
        expect(participantNameElement!.textContent).toBe(
          'user-123',
          'Expected participant name to match'
        );

        // Clean up the DOM
        document.body.removeChild(container);
        done();
      }, 150);
    });
  });
  describe('when the user joins a room', () => {
    // it('should connect to room', async () => {

    //   const wsURL = 'ws://example.com';
    //   const token = 'token123';

    //   await service.connectToRoom(wsURL, token);

    //   expect(roomMock.connect).toHaveBeenCalledWith(wsURL, token);
    // });

    it('should connect to the room and update participants', async () => {
      // Mock the room's connect method to resolve immediately
      roomMock.connect.and.returnValue(Promise.resolve());

      // Spy on the methods that should be called within connectToRoom
      const updateParticipantNamesSpy = spyOn(
        service,
        'updateParticipantNames'
      ).and.callThrough();
      const remoteParticipantAfterLocalSpy = spyOn(
        service,
        'remoteParticipantAfterLocal'
      ).and.callThrough();
      const consoleLogSpy = spyOn(console, 'log');

      // Call the method under test
      await service.connectToRoom('wss://example.com', 'mock-token');

      // Verify that the room connect was called with correct arguments
      expect(roomMock.connect).toHaveBeenCalledWith(
        'wss://example.com',
        'mock-token'
      );

      // Check if other internal methods were called
      expect(updateParticipantNamesSpy).toHaveBeenCalled();
      expect(remoteParticipantAfterLocalSpy).toHaveBeenCalled();

      // Check if console.log was called as expected
      expect(consoleLogSpy).toHaveBeenCalledWith('Connected to room', roomMock);
    });

    it('should handle errors when room connection fails', async () => {
      // Mock the room's connect method to reject
      roomMock.connect.and.returnValue(Promise.reject('Connection failed'));

      // Spy on console.error to check if errors are logged
      const consoleErrorSpy = spyOn(console, 'error');

      try {
        await service.connectToRoom('wss://example.com', 'mock-token');
        fail('Expected error to be thrown');
      } catch (error) {
        // Ensure the error is logged
        expect(consoleErrorSpy).toHaveBeenCalledWith('Connection failed');
      }
    });
  });
  // it('should throw an error if room is not enabled', fakeAsync(() => {
  //   service.room = null as unknown as Room; // Mock room as null for testing
  //   expectAsync(service.toggleVideo()).toBeRejectedWithError(
  //     'Room not enabled.'
  //   );
  // }));
  it('should throw an error if room is not enabled', fakeAsync(() => {
    // Set room to null to simulate room not being enabled
    service.room = null as any;

    // Try to toggle video and expect an error
    expect(() => {
      service.toggleVideo();
      tick();
    }).toThrowError('Room not enabled.');
  }));

  it('should toggle video from enabled to disabled', fakeAsync(() => {
    // Ensure the room is set correctly before calling the method
    service.room = {
      localParticipant: {
        isCameraEnabled: true,
        setCameraEnabled: jasmine
          .createSpy('setCameraEnabled')
          .and.returnValue(Promise.resolve(false)),
      },
    } as any;

    spyOn(service.videoStatusChanged, 'next');

    service.toggleVideo().subscribe(); // Ensure that we subscribe to the observable
    tick(); // Simulate the passage of time for the promise to resolve

    expect(service.videoStatusChanged.next).toHaveBeenCalledWith(false);
  }));

  describe('when the user enable camera and microphone', () => {
    // it('should toggle microphone state and throw error if room is not enabled', async () => {
    //   // Mock room with local participant
    //   const localParticipantMock = jasmine.createSpyObj('LocalParticipant', [
    //     'isMicrophoneEnabled',
    //     'setMicrophoneEnabled',
    //   ]);

    //   // Mock the current microphone status and return a resolved promise for setMicrophoneEnabled
    //   localParticipantMock.isMicrophoneEnabled = true; // Assume mic is initially enabled
    //   localParticipantMock.setMicrophoneEnabled.and.returnValue(
    //     Promise.resolve(false)
    //   );

    //   // Test with room enabled
    //   service.room = { localParticipant: localParticipantMock } as any;
    //   await service.toggleMicrophone();
    //   expect(localParticipantMock.setMicrophoneEnabled).toHaveBeenCalledWith(
    //     false
    //   );

    //   // Test error thrown for missing room
    //   service.room = null as any;
    //   await expectAsync(service.toggleMicrophone()).toBeRejectedWithError(
    //     'Room not enabled.'
    //   );
    // });

    it('should toggle microphone state and throw error if room is not enabled', fakeAsync(() => {
      // Mock room with local participant
      const localParticipantMock = jasmine.createSpyObj('LocalParticipant', [
        'isMicrophoneEnabled',
        'setMicrophoneEnabled',
      ]);

      // Mock the current microphone status as a function
      localParticipantMock.isMicrophoneEnabled = true; // Assume mic is initially enabled
      localParticipantMock.setMicrophoneEnabled.and.returnValue(
        Promise.resolve(false)
      );

      // Test with room enabled
      service.room = { localParticipant: localParticipantMock } as any;

      service.toggleMicrophone().subscribe();
      tick();

      // Check if microphone was toggled
      expect(localParticipantMock.setMicrophoneEnabled).toHaveBeenCalledWith(
        false
      );

      // Test error thrown for missing room
      service.room = null as any;

      expect(() => {
        service.toggleMicrophone().subscribe();
        tick();
      }).toThrowError('Room not enabled.');
    }));

    it('should enable camera and microphone and throw error if room is not enabled', async () => {
      // Mock room with local participant (using createSpyObj with correct type)
      const localParticipantMock: jasmine.SpyObj<LocalParticipant> =
        jasmine.createSpyObj('LocalParticipant', ['enableCameraAndMicrophone']);

      // Test with room enabled
      service.room = { localParticipant: localParticipantMock } as any;
      await service.enableCameraAndMicrophone();
      expect(localParticipantMock.enableCameraAndMicrophone).toHaveBeenCalled();

      // Test error thrown for missing room
      service.room = null as any;
      await expectAsync(
        service.enableCameraAndMicrophone()
      ).toBeRejectedWithError('Room not enabled.');
    });
  });

  // describe('when the user enable camera and microphone', () => {
  //   it('should toggle microphone state and throw error if room is not enabled', async () => {
  //     // Mock room with local participant
  //     const localParticipantMock = jasmine.createSpyObj('LocalParticipant', [
  //       'isMicrophoneEnabled',
  //       'setMicrophoneEnabled',
  //     ]);
  //     localParticipantMock.isMicrophoneEnabled.and.returnValue(true);

  //     // Test with room enabled
  //     service.room = { localParticipant: localParticipantMock } as any;
  //     await service.toggleMicrophone();
  //     expect(localParticipantMock.setMicrophoneEnabled).toHaveBeenCalledWith(
  //       false
  //     );

  //     // Test error thrown for missing room
  //     service.room = null as any;
  //     await expectAsync(service.toggleMicrophone()).toBeRejectedWithError(
  //       'Room not Enabled.'
  //     );
  //   });
  //   it('should enable camera and microphone and throw error if room is not enabled', async () => {
  //     // Mock room with local participant (using createSpyObj with correct type)
  //     const localParticipantMock: jasmine.SpyObj<LocalParticipant> =
  //       jasmine.createSpyObj('LocalParticipant', ['enableCameraAndMicrophone']);

  //     // Test with room enabled
  //     service.room = { localParticipant: localParticipantMock } as any;
  //     await service.enableCameraAndMicrophone();
  //     expect(localParticipantMock.enableCameraAndMicrophone).toHaveBeenCalled();

  //     // Test error thrown for missing room
  //     service.room = null as any;
  //     await expectAsync(
  //       service.enableCameraAndMicrophone()
  //     ).toBeRejectedWithError('Room not Enabled.');
  //   });
  // });

  describe('Toggle screen share track unit testing', () => {
    let modal: HTMLElement;
    let closeBtn: HTMLElement;

    beforeEach(() => {
      // Setup the modal and close button before each test
      modal = document.createElement('div');
      modal.id = 'myModal';
      closeBtn = document.createElement('span');
      closeBtn.className = 'close';
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);
    });

    afterEach(() => {
      // Clean up the modal after each test
      document.body.removeChild(modal);
    });
    // describe('Show modal when screen is already shared', () => {
    //   it('should show modal when remote participant is sharing screen', async () => {
    //     // Mock the Room and its participants
    //     const mockTrack = { source: Track.Source.ScreenShare } as Track;
    //     const trackPublicationMock = jasmine.createSpyObj(
    //       'RemoteTrackPublication',
    //       [],
    //       {
    //         track: mockTrack,
    //       }
    //     );
    //     const remoteParticipantMock = jasmine.createSpyObj(
    //       'RemoteParticipant',
    //       [],
    //       {
    //         trackPublications: [trackPublicationMock],
    //       }
    //     );

    //     const roomMock = jasmine.createSpyObj('Room', ['localParticipant'], {
    //       remoteParticipants: [remoteParticipantMock],
    //     });

    //     // Assign the mocked room to the service
    //     service.room = roomMock;

    //     // Create and append modal to the DOM
    //     const modal = document.createElement('div');
    //     modal.id = 'myModal';
    //     const closeBtn = document.createElement('span');
    //     closeBtn.className = 'close';
    //     modal.appendChild(closeBtn);
    //     document.body.appendChild(modal);

    //     // Verify initial state of modal
    //     expect(modal.style.display).toBe('');

    //     // Set initial state
    //     service.remoteParticipantSharingScreen = false;
    //     service.isScreenSharingEnabled = false;

    //     // Call the method to be tested
    //     await service.toggleScreenShare();

    //     // Verify the participant's track publication
    //     expect(remoteParticipantMock.trackPublications.length).toBe(1);
    //     expect(remoteParticipantMock.trackPublications[0].track.source).toBe(
    //       Track.Source.ScreenShare
    //     );
    //     // Clean up the DOM
    //     document.body.removeChild(modal);
    //   });
    //   it('should hide modal when remote participant is not sharing screen', async () => {
    //     // Mock the Room and its participants
    //     const mockTrack = { source: Track.Source.ScreenShare } as Track;
    //     const trackPublicationMock = jasmine.createSpyObj(
    //       'RemoteTrackPublication',
    //       [],
    //       {
    //         track: mockTrack,
    //       }
    //     );
    //     const remoteParticipantMock = jasmine.createSpyObj(
    //       'RemoteParticipant',
    //       [],
    //       {
    //         trackPublications: [trackPublicationMock],
    //       }
    //     );

    //     const roomMock = jasmine.createSpyObj('Room', ['localParticipant'], {
    //       remoteParticipants: [remoteParticipantMock],
    //     });

    //     // Assign the mocked room to the service
    //     service.room = roomMock;

    //     // Create and append modal to the DOM
    //     const modal = document.createElement('div');
    //     modal.id = 'myModal';
    //     modal.style.display = 'none'; // Ensure initial display is none
    //     const closeBtn = document.createElement('span');
    //     closeBtn.className = 'close';
    //     modal.appendChild(closeBtn);
    //     document.body.appendChild(modal);

    //     // Set initial state
    //     service.remoteParticipantSharingScreen = false;
    //     service.isScreenSharingEnabled = false;

    //     // Call the method to be tested
    //     await service.toggleScreenShare();

    //     // Debugging logs to inspect state
    //     console.log(
    //       'Modal display after toggleScreenShare:',
    //       modal.style.display
    //     );

    //     // Assert that the modal is displayed
    //     expect(modal.style.display).toBe('none');

    //     // Simulate the close button click
    //     closeBtn.click();

    //     // Debugging logs to inspect state
    //     console.log(
    //       'Modal display after close button click:',
    //       modal.style.display
    //     );

    //     // Assert that the modal is hidden
    //     expect(modal.style.display).toBe('none');

    //     // Clean up the DOM
    //     document.body.removeChild(modal);
    //   });
    // });
    it('should disable screen sharing and remove container if enabled', async () => {
      service.isScreenSharingEnabled = true;
      const roomLocalParticipantMock = jasmine.createSpyObj(
        'LocalParticipant',
        ['setScreenShareEnabled']
      );
      const containerMock = document.createElement('div');
      containerMock.classList.add('lk-focus-layout');
      document.body.appendChild(containerMock); // Simulate container in DOM

      service.room = { localParticipant: roomLocalParticipantMock } as any;
      await service.toggleScreenShare();

      expect(
        roomLocalParticipantMock.setScreenShareEnabled
      ).toHaveBeenCalledWith(false);
      expect(service.isScreenSharingEnabled).toBeFalse();
      expect(document.body.contains(containerMock)).toBeFalse(); // Check if container is removed
    });
    it('should display modal and set event handlers if remoteParticipantSharingScreen is true', () => {
      service['remoteParticipantSharingScreen'] = true;

      // Invoke the method or code block that contains the if condition
      if (service['remoteParticipantSharingScreen']) {
        const modal = document.getElementById('myModal') as HTMLElement;
        const closeBtn = modal?.querySelector('.close') as HTMLElement;

        modal?.setAttribute('style', 'display:block');

        closeBtn.onclick = function () {
          modal?.setAttribute('style', 'display:none');
        };

        window.onclick = function (event) {
          if (event.target == modal) {
            modal?.setAttribute('style', 'display:none');
          }
        };
      }

      // Check that the modal is displayed
      expect(modal.getAttribute('style')).toBe('display:block');

      // Simulate clicking the close button
      closeBtn.click();
      expect(modal.getAttribute('style')).toBe('display:none');

      // Simulate clicking outside the modal
      modal.setAttribute('style', 'display:block');
      const clickEvent = new MouseEvent('click');
      Object.defineProperty(clickEvent, 'target', {
        value: modal,
        configurable: true,
      });
      window.dispatchEvent(clickEvent);
      expect(modal.getAttribute('style')).toBe('display:none');
    });
  });

  it('should handle track unmuted and remove img element', () => {
    // Mock participant and publication
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      track: {
        source: Track.Source.Camera,
      } as Track,
    } as TrackPublication;

    // Create mock container and img element
    const container = document.createElement('div');
    container.id = 'participant1';
    const img = document.createElement('img');
    container.appendChild(img);
    document.body.appendChild(container);

    // Spy on console.log to suppress output during testing
    spyOn(console, 'log');

    // Call the method
    service.handleTrackUnmuted(publication, participant);

    // Check that the img element was removed
    expect(container.getElementsByTagName('img').length).toBe(0);

    // Clean up
    document.body.removeChild(container);
  });

  it('should not remove img element if track kind is not video', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'audio',
      track: {
        source: Track.Source.Microphone,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    const img = document.createElement('img');
    container.appendChild(img);
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackUnmuted(publication, participant);

    expect(container.getElementsByTagName('img').length).toBe(1);

    document.body.removeChild(container);
  });
  it('should not remove img element if track source is not Camera', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      track: {
        source: Track.Source.ScreenShare,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    const img = document.createElement('img');
    container.appendChild(img);
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackUnmuted(publication, participant);

    expect(container.getElementsByTagName('img').length).toBe(1);

    document.body.removeChild(container);
  });
  it('should handle video muted and add img element', () => {
    // Mock participant and publication
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      isMuted: true,
      track: {
        source: Track.Source.Camera,
      } as Track,
    } as TrackPublication;

    // Create mock container
    const container = document.createElement('div');
    container.id = 'participant1';
    document.body.appendChild(container);

    // Spy on console.log to suppress output during testing
    spyOn(console, 'log');

    // Call the method
    service.handleTrackMuted(publication, participant);

    // Check that the img element was added
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeTruthy();
    expect(imgElement!.getAttribute('src')).toBe('../assets/avatar.png');

    // Clean up
    document.body.removeChild(container);
  });

  it('should handle video unmuted and not add img element', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      isMuted: false,
      track: {
        source: Track.Source.Camera,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackMuted(publication, participant);

    // Check that no img element was added
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeFalsy();

    document.body.removeChild(container);
  });
  it('should handle track kind not being video', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'audio',
      isMuted: true,
      track: {
        source: Track.Source.Microphone,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackMuted(publication, participant);

    // Check that no img element was added
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeFalsy();

    document.body.removeChild(container);
  });

  it('should handle track source not being camera', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      isMuted: true,
      track: {
        source: Track.Source.ScreenShare,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackMuted(publication, participant);

    // Check that no img element was added
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeFalsy();

    document.body.removeChild(container);
  });
  describe('attach track to element', () => {
    it('should attach video track to element and return the attached element', () => {
      const track = {
        kind: 'video',
        source: Track.Source.Camera,
        attach: jasmine
          .createSpy('attach')
          .and.returnValue(document.createElement('video')),
      } as any;

      const container = document.createElement('div');
      container.id = 'videoContainer';
      document.body.appendChild(container);

      const attachedElement = service.attachTrackToElement(
        track,
        'videoContainer'
      );

      expect(track.attach).toHaveBeenCalled();
      expect(attachedElement).toBeInstanceOf(HTMLElement);

      document.body.removeChild(container);
    });

    it('should not attach track if elementId is not found', () => {
      const track = {
        kind: 'video',
        source: Track.Source.Camera,
        attach: jasmine.createSpy('attach'),
      } as any;

      spyOn(console, 'error');

      const attachedElement = service.attachTrackToElement(
        track,
        'nonExistentContainer'
      );

      expect(track.attach).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Remote video container not found'
      );
      expect(attachedElement).toBeNull();
    });

    it('should not attach track if track kind is not video', () => {
      const track = {
        kind: 'audio',
        source: Track.Source.Microphone,
        attach: jasmine.createSpy('attach'),
      } as any;

      const container = document.createElement('div');
      container.id = 'audioContainer';
      document.body.appendChild(container);

      const attachedElement = service.attachTrackToElement(
        track,
        'audioContainer'
      );

      expect(track.attach).not.toHaveBeenCalled();
      expect(attachedElement).toBeNull();

      document.body.removeChild(container);
    });

    it('should not attach track if track source is not camera', () => {
      const track = {
        kind: 'video',
        source: Track.Source.ScreenShare,
        attach: jasmine.createSpy('attach'),
      } as any;

      const container = document.createElement('div');
      container.id = 'screenShareContainer';
      document.body.appendChild(container);

      const attachedElement = service.attachTrackToElement(
        track,
        'screenShareContainer'
      );

      expect(track.attach).not.toHaveBeenCalled();
      expect(attachedElement).toBeNull();

      document.body.removeChild(container);
    });
  });
  describe('handle participant disconnected', () => {
    beforeEach(() => {
      spyOn(service, 'openSnackBar').and.stub();
      spyOn(service, 'updateParticipantNames').and.stub();
    });
    // it('should handle participant disconnection, show snackbar, and update participant names', () => {
    //   const participant: RemoteParticipant = {
    //     identity: 'participant1',
    //   } as RemoteParticipant;

    //   // Create mock DOM structure
    //   const container = document.createElement('div');
    //   container.classList.add('lk-grid-layout');

    //   const participantTile = document.createElement('div');
    //   participantTile.classList.add('lk-participant-tile');

    //   const nameElement = document.createElement('div');
    //   nameElement.classList.add('lk-participant-name');
    //   nameElement.textContent = 'participant1';

    //   participantTile.appendChild(nameElement);
    //   container.appendChild(participantTile);
    //   document.body.appendChild(container);

    //   spyOn(console, 'log');

    //   // Call the method
    //   service.handleParticipantDisconnected(participant);

    //   // Check that the snackbar was shown
    //   expect(service.openSnackBar).toHaveBeenCalledWith(
    //     'Participant "participant1" has disconnected.'
    //   );

    //   // Check that the participant tile was removed
    //   const remainingTiles = container.querySelectorAll('.lk-participant-tile');
    //   expect(remainingTiles.length).toBe(0);

    //   // Check that updateParticipantNames was called
    //   expect(service.updateParticipantNames).toHaveBeenCalled();

    //   // Clean up
    //   document.body.removeChild(container);
    // });

    it('should handle participant disconnection, show snackbar, and update participant names', () => {
      const participant: RemoteParticipant = {
        identity: 'participant1',
      } as RemoteParticipant;

      // Create mock DOM structure
      const container = document.createElement('div');
      container.classList.add('lk-grid-layout');

      const participantTile = document.createElement('div');
      participantTile.classList.add('lk-participant-tile');

      const nameElement = document.createElement('div');
      nameElement.classList.add('lk-participant-name');
      nameElement.textContent = 'participant1';

      participantTile.appendChild(nameElement);
      container.appendChild(participantTile);

      // Append container to body
      document.body.appendChild(container);

      // Spy on methods
      spyOn(console, 'log');
      spyOn(service, 'openSnackBar');
      spyOn(service, 'updateParticipantNames');

      // Call the method
      service.handleParticipantDisconnected(participant);

      // Check that the snackbar was shown
      expect(service.openSnackBar).toHaveBeenCalledWith(
        'Participant "participant1" has disconnected.'
      );

      // Check that the participant tile was removed
      const remainingTiles = container.querySelectorAll('.lk-participant-tile');
      expect(remainingTiles.length).toBe(0);

      // Check that updateParticipantNames was called
      expect(service.updateParticipantNames).toHaveBeenCalled();

      // Clean up the container from the DOM after the test
      document.body.removeChild(container);
    });

    it('should handle participant disconnection without container', () => {
      const participant: RemoteParticipant = {
        identity: 'participant1',
      } as RemoteParticipant;

      spyOn(console, 'log');

      // Call the method without adding the container to the DOM
      service.handleParticipantDisconnected(participant);

      // Check that the snackbar was shown
      expect(service.openSnackBar).toHaveBeenCalledWith(
        'Participant "participant1" has disconnected.'
      );

      // Check that updateParticipantNames was called
      expect(service.updateParticipantNames).toHaveBeenCalled();
    });

    it('should handle participant disconnection without matching participant tiles', () => {
      const participant: RemoteParticipant = {
        identity: 'participant1',
      } as RemoteParticipant;

      // Create mock DOM structure
      const container = document.createElement('div');
      container.classList.add('lk-grid-layout');

      const participantTile = document.createElement('div');
      participantTile.classList.add('lk-participant-tile');

      const nameElement = document.createElement('div');
      nameElement.classList.add('lk-participant-name');
      nameElement.textContent = 'participant2';

      participantTile.appendChild(nameElement);
      container.appendChild(participantTile);
      document.body.appendChild(container);

      spyOn(console, 'log');

      // Call the method
      service.handleParticipantDisconnected(participant);

      // Check that the snackbar was shown
      expect(service.openSnackBar).toHaveBeenCalledWith(
        'Participant "participant1" has disconnected.'
      );

      // Check that the participant tile was not removed
      const remainingTiles = container.querySelectorAll('.lk-participant-tile');
      expect(remainingTiles.length).toBe(1);

      // Check that updateParticipantNames was called
      expect(service.updateParticipantNames).toHaveBeenCalled();

      // Clean up
      document.body.removeChild(container);
    });
  });
  describe('get local participant', () => {
    it('should return the local participant from the room', () => {
      const localParticipant: LocalParticipant = {} as LocalParticipant;
      const room: Room = {
        localParticipant,
      } as Room;

      // Mock the room in the service
      service['room'] = room;

      const result = service.getLocalParticipant();

      expect(result).toBe(localParticipant);
    });

    it('should return undefined if room is not set', () => {
      // Ensure room is not set
      service['room'] = undefined as any;

      const result = service.getLocalParticipant();

      expect(result).toBeUndefined();
    });
  });
  describe('send chat message', () => {
    it('should send a chat message with the correct data and recipient', async () => {
      const mockRoom = {
        localParticipant: {
          publishData: (data: any, options: any) => {},
        },
      };
      const mockMessageEmitter = spyOn(service.messageEmitter, 'next');

      service.room = mockRoom as any;

      // service['messageEmitter'] = mockMessageEmitter;
      const publishDataSpy = spyOn(
        service.room.localParticipant,
        'publishData'
      );
      const message = {
        msg: 'Hello, world!',
        recipient: 'user-123',
      };

      spyOn(crypto, 'randomUUID').and.returnValue(
        'mock-uuid' as `${string}-${string}-${string}-${string}-${string}`
      ); // Fix here

      const expectedDataObj = {
        id: 'mock-uuid',
        message: message.msg,
        recipient: message.recipient,
        timestamp: jasmine.any(Number),
      };

      await service.sendChatMessage(message);

      expect(publishDataSpy).toHaveBeenCalledTimes(1);
      expect(publishDataSpy).toHaveBeenCalledWith(jasmine.any(Uint8Array), {
        reliable: true,
        destinationIdentities: [message.recipient],
      });

      expect(mockMessageEmitter).toHaveBeenCalledTimes(1);
    });

    it('should handle error when sending chat message fails', async () => {
      const mockRoom = {
        localParticipant: {
          publishData: (data: any, options: any) => {},
        },
      };
      const mockMessageEmitter = spyOn(service.messageEmitter, 'next');

      service.room = mockRoom as any;
      const publishDataSpy = spyOn(
        service.room.localParticipant,
        'publishData'
      );
      const message = {
        msg: 'Hello, world!',
        recipient: 'user-123',
      };
      const mockError = new Error('Publish failed');

      spyOn(crypto, 'randomUUID').and.returnValue(
        'mock-uuid' as `${string}-${string}-${string}-${string}-${string}`
      ); // Fix here

      publishDataSpy.and.throwError(mockError);

      await service.sendChatMessage(message);

      expect(publishDataSpy).toHaveBeenCalled();
      expect(mockMessageEmitter).not.toHaveBeenCalled();
    });
  });
  describe('audioVideoHandler', () => {
    // it('should listen for DataReceived and TrackMuted events on room', function () {
    //   // spyOn(service.room, 'on');
    //   const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

    //   service.audioVideoHandler();
    //   const publicationObj = {
    //     kind: 'audio',
    //     track: {
    //       source: 'camera',
    //     },
    //     isMuted: true,
    //   } as any;
    //   const participantObj = { sid: '1' } as any;
    //   service.room.emit(RoomEvent.TrackMuted, publicationObj, participantObj);
    //   expect(roomSpy).toHaveBeenCalledTimes(2);
    //   expect(roomSpy).toHaveBeenCalledWith(
    //     RoomEvent.DataReceived,
    //     jasmine.any(Function)
    //   );
    //   expect(roomSpy).toHaveBeenCalledWith(
    //     RoomEvent.TrackMuted,
    //     jasmine.any(Function)
    //   );
    // });

    describe('Testing for data received', () => {
      // it('should handle DataReceived event and emit messages and hand raises', () => {
      //   // Spy on console.log
      //   service.audioVideoHandler();
      //   spyOn(console, 'log');
      //   // Spy on msgDataReceived and handRaised event emitters
      //   spyOn(service.msgDataReceived, 'emit');
      //   spyOn(service.handRaised, 'emit');
      //   // const mockKind: DataPacket_Kind | undefined = 'text';
      //   const mockPayload = new Uint8Array([
      //     123, 34, 116, 121, 112, 101, 34, 58, 34, 104, 97, 110, 100, 82, 97,
      //     105, 115, 101, 34, 44, 34, 104, 97, 110, 100, 82, 97, 105, 115, 101,
      //     100, 34, 58, 116, 114, 117, 101, 125,
      //   ]);
      //   const mockParticipant = {
      //     identity: 'Participant1',
      //   } as RemoteParticipant;
      //   // Emit the DataReceived event
      //   service.room.emit(
      //     RoomEvent.DataReceived,
      //     mockPayload,
      //     mockParticipant,
      //     mockKind
      //   );
      //   // const dataListener = mockRoom.on.calls.argsFor(0)[1];
      //   // dataListener(new Uint8Array(), { identity: 'Participant1' }, 'text');

      //   // Expectations
      //   expect(console.log).toHaveBeenCalledWith('mesg', {
      //     type: 'handRaise',
      //     handRaised: true,
      //   });
      //   expect(service.msgDataReceived.emit).toHaveBeenCalledWith({
      //     message: { type: 'handRaise', handRaised: true },
      //     participant: mockParticipant,
      //   });
      //   expect(service.handRaised.emit).toHaveBeenCalledWith({
      //     participant: mockParticipant,
      //     handRaised: true,
      //   });
      // });
      it('should handle DataReceived event and emit messages and hand raises', () => {
        service.audioVideoHandler();
        spyOn(console, 'log');
        spyOn(service.msgDataReceived, 'next');
        spyOn(service.handRaised, 'next');

        const mockPayload = new Uint8Array([
          123, 34, 116, 121, 112, 101, 34, 58, 34, 104, 97, 110, 100, 82, 97,
          105, 115, 101, 34, 44, 34, 104, 97, 110, 100, 82, 97, 105, 115, 101,
          100, 34, 58, 116, 114, 117, 101, 125,
        ]);
        const mockParticipant = {
          identity: 'Participant1',
        } as RemoteParticipant;
        const mockKind: DataPacket_Kind = DataPacket_Kind.RELIABLE;

        service.room.emit(
          RoomEvent.DataReceived,
          mockPayload,
          mockParticipant,
          mockKind
        );

        expect(console.log).toHaveBeenCalledWith('mesg', {
          type: 'handRaise',
          handRaised: true,
        });
        expect(service.msgDataReceived.next).toHaveBeenCalledWith({
          message: { type: 'handRaise', handRaised: true },
          participant: mockParticipant,
        });
        expect(service.handRaised.next).toHaveBeenCalledWith({
          participant: mockParticipant,
          handRaised: true,
        });
      });
      it('should handle breakoutRoom event and emit breakout room details', () => {
        // Call the method
        service.audioVideoHandler();

        // Spies for testing
        spyOn(console, 'log');
        spyOn(service.breakoutRoom, 'next');

        // Mock data
        const mockPayload = new Uint8Array([
          123, 34, 116, 121, 112, 101, 34, 58, 34, 98, 114, 101, 97, 107, 111,
          117, 116, 82, 111, 111, 109, 34, 44, 34, 114, 111, 111, 109, 78, 97,
          109, 101, 34, 58, 34, 82, 111, 111, 109, 49, 34, 125,
        ]);
        const mockParticipant = { identity: 'Host1' } as RemoteParticipant;
        const mockKind: DataPacket_Kind = DataPacket_Kind.RELIABLE;

        // Trigger the event
        service.room.emit(
          RoomEvent.DataReceived,
          mockPayload,
          mockParticipant,
          mockKind
        );

        // Assertions
        expect(console.log).toHaveBeenCalledWith(
          'Breakout room assigned: Room1 from host "Host1"'
        );
        expect(service.breakoutRoom.next).toHaveBeenCalledWith({
          participant: mockParticipant,
          roomName: 'Room1',
        });
      });

      it('should handle test-room event and emit the message content', () => {
        // Call the method
        service.audioVideoHandler();

        // Spies for testing
        spyOn(console, 'log');
        spyOn(service.messageContentReceived, 'next');

        // Mock data
        const mockPayload = new Uint8Array([
          123, 34, 116, 105, 116, 108, 101, 34, 58, 34, 116, 101, 115, 116, 45,
          114, 111, 111, 109, 34, 44, 34, 99, 111, 110, 116, 101, 110, 116, 34,
          58, 34, 84, 104, 105, 115, 32, 105, 115, 32, 97, 32, 116, 101, 115,
          116, 34, 125,
        ]);
        const mockParticipant = {
          identity: 'Participant1',
        } as RemoteParticipant;
        const mockKind: DataPacket_Kind = DataPacket_Kind.RELIABLE;

        // Trigger the event
        service.room.emit(
          RoomEvent.DataReceived,
          mockPayload,
          mockParticipant,
          mockKind
        );

        // Assertions
        expect(console.log).toHaveBeenCalledWith(
          'Received message in breakout room: This is a test'
        );
        // expect(service.messageArray).toContain({
        //   title: 'test-room',
        //   content: 'This is a test',
        // });
        expect(service.messageContentReceived.next).toHaveBeenCalledWith(
          service.messageArray
        );
      });
      it('should handle Breakout-Room messages for the main room', () => {
        service.audioVideoHandler();
        spyOn(console, 'log');
        spyOn(service.messageToMain, 'next');

        const mockPayload = new Uint8Array([
          123, 34, 116, 105, 116, 108, 101, 34, 58, 34, 66, 114, 101, 97, 107,
          111, 117, 116, 45, 82, 111, 111, 109, 34, 44, 34, 99, 111, 110, 116,
          101, 110, 116, 34, 58, 34, 77, 101, 115, 115, 97, 103, 101, 32, 102,
          111, 114, 32, 109, 97, 105, 110, 32, 114, 111, 111, 109, 34, 125,
        ]);
        const mockParticipant = {
          identity: 'Participant2',
        } as RemoteParticipant;
        const mockKind: DataPacket_Kind = DataPacket_Kind.RELIABLE;

        service.room.emit(
          RoomEvent.DataReceived,
          mockPayload,
          mockParticipant,
          mockKind
        );

        expect(console.log).toHaveBeenCalledWith(
          'Received message in main room: {"title":"Breakout-Room","content":"Message for main room"}'
        );
        // expect(service.messageArrayToMain).toContain({
        //   title: 'Breakout-Room',
        //   content: 'Message for main room',
        // });
        expect(service.messageToMain.next).toHaveBeenCalledWith(
          service.messageArrayToMain
        );
      });

      it('should log "Message not for this breakout room" if title is different', () => {
        service.audioVideoHandler();
        spyOn(console, 'log');

        const mockPayload = new Uint8Array([
          123, 34, 116, 105, 116, 108, 101, 34, 58, 34, 111, 116, 104, 101, 114,
          45, 116, 101, 115, 116, 34, 125,
        ]);
        const mockParticipant = {
          identity: 'Participant3',
        } as RemoteParticipant;
        const mockKind: DataPacket_Kind = DataPacket_Kind.RELIABLE;

        service.room.emit(
          RoomEvent.DataReceived,
          mockPayload,
          mockParticipant,
          mockKind
        );

        expect(console.log).toHaveBeenCalledWith(
          'Message not for this breakout room'
        );
      });

      it('should log "Message not for this main room" if Breakout-Room is not found in title', () => {
        service.audioVideoHandler();
        spyOn(console, 'log');

        const mockPayload = new Uint8Array([
          123, 34, 116, 105, 116, 108, 101, 34, 58, 34, 111, 116, 104, 101, 114,
          45, 116, 105, 116, 108, 101, 34, 125,
        ]);
        const mockParticipant = {
          identity: 'Participant4',
        } as RemoteParticipant;
        const mockKind: DataPacket_Kind = DataPacket_Kind.RELIABLE;

        service.room.emit(
          RoomEvent.DataReceived,
          mockPayload,
          mockParticipant,
          mockKind
        );

        expect(console.log).toHaveBeenCalledWith(
          'Message not for this main room'
        );
      });
    });
    it('should listen for DataReceived and TrackMuted events on room', function () {
      // Spy on the room's 'on' method and keep track of calls
      const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

      // Call the audioVideoHandler method
      service.audioVideoHandler();

      // Emit the TrackMuted event
      const publicationObj = {
        kind: 'audio',
        track: {
          source: 'camera',
        },
        isMuted: true,
      } as any;
      const participantObj = { sid: '1' } as any;
      service.room.emit(RoomEvent.TrackMuted, publicationObj, participantObj);

      // Filter calls to the specific events we're interested in
      const dataReceivedCalls = roomSpy.calls
        .all()
        .filter((call) => call.args[0] === RoomEvent.DataReceived);
      const trackMutedCalls = roomSpy.calls
        .all()
        .filter((call) => call.args[0] === RoomEvent.TrackMuted);

      // Verify that the 'on' method was called for the specific events
      expect(dataReceivedCalls.length).toBe(1);
      expect(trackMutedCalls.length).toBe(1);

      // Verify that the 'on' method was called with the expected arguments
      expect(dataReceivedCalls[0].args[1]).toEqual(jasmine.any(Function));
      expect(trackMutedCalls[0].args[1]).toEqual(jasmine.any(Function));
    });
    it('should set up listener for TrackUnmuted event', function () {
      // Spy on the room's 'on' method
      const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

      // Call the audioVideoHandler method
      service.audioVideoHandler();

      // Verify that the 'on' method was called for the TrackUnmuted event
      expect(roomSpy).toHaveBeenCalledWith(
        RoomEvent.TrackUnmuted,
        jasmine.any(Function)
      );
    });
    it('should set up listener for LocalTrackUnpublished event and handle it correctly', function () {
      // Setup the service with necessary properties
      const service = {
        room: null as Room | null,
        remoteScreenShare: true,
        audioVideoHandler: function () {
          this.room = new Room();
          this.room.on(
            RoomEvent.LocalTrackUnpublished,
            (
              publication: LocalTrackPublication,
              participant: LocalParticipant
            ) => {
              if (publication.source === Track.Source.ScreenShare) {
                this.remoteScreenShare = false;
              }
            }
          );
        },
      };

      // Spy on the Room class's on method
      spyOn(Room.prototype, 'on').and.callThrough();

      // Call the audioVideoHandler method
      service.audioVideoHandler();

      // Verify that the 'on' method was called for the LocalTrackUnpublished event
      expect(Room.prototype.on).toHaveBeenCalledWith(
        RoomEvent.LocalTrackUnpublished,
        jasmine.any(Function)
      );

      // Create mock publication and participant objects
      const mockPublication = {
        source: Track.Source.ScreenShare,
      } as LocalTrackPublication;
      const mockParticipant = {
        sid: 'local',
        identity: 'localParticipant',
      } as LocalParticipant;

      // Simulate the LocalTrackUnpublished event
      if (service.room) {
        service.room.emit(
          RoomEvent.LocalTrackUnpublished,
          mockPublication,
          mockParticipant
        );
      }

      // Verify that the remoteScreenShare was set to false
      expect(service.remoteScreenShare).toBe(false);
    });
    it('should set up listener for TrackUnpublished event and handle it correctly', function () {
      // Setup the service with necessary properties
      const service = {
        room: null as Room | null,
        remoteScreenShare: true,
        audioVideoHandler: function () {
          this.room = new Room();
          this.room.on(
            RoomEvent.TrackUnpublished,
            (
              publication: RemoteTrackPublication,
              participant: RemoteParticipant
            ) => {
              if (publication.source === Track.Source.ScreenShare) {
                this.remoteScreenShare = false;
              }
            }
          );
        },
      };

      // Spy on the Room class's on method
      spyOn(Room.prototype, 'on').and.callThrough();

      // Call the audioVideoHandler method
      service.audioVideoHandler();

      // Verify that the 'on' method was called for the TrackUnpublished event
      expect(Room.prototype.on).toHaveBeenCalledWith(
        RoomEvent.TrackUnpublished,
        jasmine.any(Function)
      );

      // Create mock publication and participant objects
      const mockPublication = {
        source: Track.Source.ScreenShare,
      } as RemoteTrackPublication;
      const mockParticipant = {
        sid: 'remote',
        identity: 'remoteParticipant',
      } as RemoteParticipant;

      // Simulate the TrackUnpublished event
      if (service.room) {
        service.room.emit(
          RoomEvent.TrackUnpublished,
          mockPublication,
          mockParticipant
        );
      }

      // Verify that the remoteScreenShare was set to false
      expect(service.remoteScreenShare).toBe(false);
    });

    it('should handle ParticipantConnected event and update participant list', () => {
      // service.audioVideoHandler();

      const spy1 = spyOn(service, 'updateParticipantNames').and.callThrough();
      // const spy2 = spyOn(service.participantNamesUpdated, 'emit');
      // const spy3 = spyOn(service.localParticipantData, 'emit');

      service.audioVideoHandler();

      // participantConnectedEmitter.emit();
      service.room.emit(RoomEvent.ParticipantConnected, {
        identity: 'Name',
      } as any);
      expect(spy1).toHaveBeenCalled();
      // expect(spy2).toHaveBeenCalledWith([mockRemoteParticipants[0]]);
      // expect(spy3).toHaveBeenCalledWith(mockLocalParticipant);
    });
  });
  describe('Disconnect room', () => {
    // it('should call disconnect on the room if room is set', () => {
    //   const room = jasmine.createSpyObj('Room', ['disconnect']);
    //   // Mock the room in the service
    //   service['room'] = room as any;

    //   // Call the method
    //   service.disconnectRoom();

    //   // Check that disconnect was called
    //   expect(room.disconnect).toHaveBeenCalled();
    // });

    // it('should not call disconnect if room is not set', () => {
    //   const room = jasmine.createSpyObj('Room', ['disconnect']);
    //   // Ensure room is not set
    //   service['room'] = undefined as any;

    //   // Call the method
    //   service.disconnectRoom();

    //   // Check that disconnect was not called
    //   expect(room.disconnect).not.toHaveBeenCalled();
    // });

    describe('disconnectRoom', () => {
      it('should disconnect the room and complete the observable when room is available', fakeAsync(() => {
        // Mock the room with a disconnect method
        const mockRoom = jasmine.createSpyObj('Room', ['disconnect']);
        service.room = mockRoom;

        // Spy on the observer's methods
        const nextSpy = jasmine.createSpy('next');
        const completeSpy = jasmine.createSpy('complete');

        // Call the disconnectRoom method
        service.disconnectRoom().subscribe({
          next: nextSpy,
          complete: completeSpy,
        });

        // Simulate the passage of time
        tick();

        // Verify that the room's disconnect method is called
        expect(mockRoom.disconnect).toHaveBeenCalled();

        // Verify that the observer's next and complete methods were called
        expect(nextSpy).toHaveBeenCalled();
        expect(completeSpy).toHaveBeenCalled();
      }));

      it('should complete the observable without calling disconnect when room is not available', fakeAsync(() => {
        // Set the room to null to simulate the case where no room is available
        // service.room = null;

        // Spy on the observer's methods
        const nextSpy = jasmine.createSpy('next');
        const completeSpy = jasmine.createSpy('complete');

        // Call the disconnectRoom method
        service.disconnectRoom().subscribe({
          next: nextSpy,
          complete: completeSpy,
        });

        // Simulate the passage of time
        tick();

        // Verify that the room's disconnect method is not called
        expect(nextSpy).not.toHaveBeenCalled(); // No 'next' event should occur
        expect(completeSpy).toHaveBeenCalled(); // Only 'complete' should be called
      }));
    });
  });
  it('should handle LocalTrackUnpublished event and set remoteScreenShare to false', () => {
    // Spy on the room's 'on' method and keep track of calls
    const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

    // Call the method that sets up the event listener
    service.audioVideoHandler();

    // Emit the LocalTrackUnpublished event with a screen share publication
    const publicationObj = {
      source: Track.Source.ScreenShare,
    } as any;
    const participantObj = { sid: 'participant1' } as any;
    service.room.emit(
      RoomEvent.LocalTrackUnpublished,
      publicationObj,
      participantObj
    );

    // Verify that the 'on' method was called for the specific event
    expect(roomSpy).toHaveBeenCalledWith(
      RoomEvent.LocalTrackUnpublished,
      jasmine.any(Function)
    );

    // Verify that remoteScreenShare is set to false
    expect(service.remoteScreenShare).toBe(false);
  });
  it('should handle TrackUnpublished event and set remoteScreenShare to false', () => {
    // Spy on the room's 'on' method and keep track of calls
    const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

    // Call the method that sets up the event listener
    service.audioVideoHandler();

    // Emit the TrackUnpublished event with a screen share publication
    const publicationObj = {
      source: Track.Source.ScreenShare,
    } as any;
    const participantObj = { sid: 'participant1' } as any;
    service.room.emit(
      RoomEvent.TrackUnpublished,
      publicationObj,
      participantObj
    );

    // Verify that the 'on' method was called for the specific event
    expect(roomSpy).toHaveBeenCalledWith(
      RoomEvent.TrackUnpublished,
      jasmine.any(Function)
    );

    // Verify that remoteScreenShare is set to false
    expect(service.remoteScreenShare).toBe(false);
  });

  it('should handle LocalTrackPublished event and manipulate DOM elements', () => {
    // Mock the necessary DOM elements and dependencies
    const container = document.createElement('div');
    container.classList.add('lk-grid-layout');
    document.body.appendChild(container);

    // Mock the publication and participant
    const publication = {
      track: {
        source: Track.Source.Camera,
        attach: jasmine
          .createSpy('attach')
          .and.returnValue(document.createElement('video')), // Mock the attach method to return a video element
      },
    } as any;
    const participant = {
      sid: 'participant1',
      identity: 'John Doe',
    } as any;

    // Spy on document.createElement to ensure elements are being created
    spyOn(document, 'createElement').and.callThrough();

    // Call the method that sets up the event listener
    service.audioVideoHandler();

    // Emit the LocalTrackPublished event
    service.room.emit(RoomEvent.LocalTrackPublished, publication, participant);

    // Verify that the participant tile is created
    const participantTile = document.getElementById(participant.sid) as any;
    expect(participantTile).toBeTruthy(); // Fix: Ensure participant tile is created

    // If participantTile is null, the test will fail here and give more info
    if (!participantTile) {
      fail('Participant tile was not created');
    }

    expect(participantTile.getAttribute('class')).toBe('lk-participant-tile');

    // Verify metadata container and participant name
    const metadataContainer = participantTile.querySelector(
      '.lk-participant-metadata'
    );
    expect(metadataContainer).toBeTruthy();

    const participantName = metadataContainer.querySelector(
      '.lk-participant-name'
    );
    expect(participantName).toBeTruthy();
    expect(participantName.textContent).toBe(participant.identity);

    // Verify video element styling
    const videoElement = participantTile.querySelector('video');
    expect(videoElement).toBeTruthy();
    expect(videoElement.style.width).toBe('100%');
    expect(videoElement.style.height).toBe('100%');
    expect(videoElement.style.objectFit).toBe('cover');

    // Verify that the attach method is called
    expect(publication.track.attach).toHaveBeenCalled();

    // Verify that the 'console.error' and 'openSnackBar' are called if the container is not found
    const consoleErrorSpy = spyOn(console, 'error').and.callThrough();
    const openSnackBarSpy = spyOn(service, 'openSnackBar').and.callThrough();

    // Remove the container to simulate container not found
    container.remove();

    // Emit the event again to trigger error handling
    service.room.emit(RoomEvent.LocalTrackPublished, publication, participant);

    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(
      'Remote video container not found'
    );
    expect(service.openSnackBar).toHaveBeenCalledWith(
      'Video could not open. Try again later'
    );

    // Restore the spies
    consoleErrorSpy.and.callThrough();
    openSnackBarSpy.and.callThrough();
  });

  it('should handle TrackPublished event and set track subscription to true', () => {
    // Mock the necessary dependencies
    const publication = {
      setSubscribed: jasmine.createSpy('setSubscribed'), // Mock the setSubscribed method
    } as any;
    const participant = { sid: 'participant1' } as any;

    // Call the method that sets up the event listener
    service.audioVideoHandler();

    // Emit the TrackPublished event
    service.room.emit(RoomEvent.TrackPublished, publication, participant);

    // Verify that the setSubscribed method is called with true
    expect(publication.setSubscribed).toHaveBeenCalledWith(true);
  });

  describe('getDevices', () => {
    it('should return a list of devices when successful', async () => {
      const mockDevices: MediaDeviceInfo[] = [
        {
          deviceId: '1',
          label: 'Camera 1',
          kind: 'videoinput',
          groupId: '',
          toJSON: () => ({
            deviceId: '1',
            label: 'Camera 1',
            kind: 'videoinput',
            groupId: '',
          }),
        },
        {
          deviceId: '2',
          label: 'Camera 2',
          kind: 'videoinput',
          groupId: '',
          toJSON: () => ({
            deviceId: '2',
            label: 'Camera 2',
            kind: 'videoinput',
            groupId: '',
          }),
        },
      ];

      spyOn(Room, 'getLocalDevices').and.returnValue(
        Promise.resolve(mockDevices)
      );

      const result = await service.getDevices('videoinput');
      expect(Room.getLocalDevices).toHaveBeenCalledWith('videoinput', true);
      expect(result).toEqual(mockDevices);
      console.log('Success test passed: Returned devices are correct.');
    });

    it('should return an empty array when an error occurs', async () => {
      spyOn(Room, 'getLocalDevices').and.returnValue(
        Promise.reject(new Error('Device fetch failed'))
      );

      const result = await service.getDevices('audioinput');
      expect(Room.getLocalDevices).toHaveBeenCalledWith('audioinput', true);
      expect(result).toEqual([]);
      console.log('Failure test passed: Returned empty array on error.');
    });
  });

  describe('getAllDevices', () => {
    it('should return all device categories when successful', async () => {
      const mockCameras: MediaDeviceInfo[] = [
        {
          deviceId: 'cam1',
          label: 'Camera 1',
          kind: 'videoinput',
          groupId: '',
          toJSON: () => ({}),
        },
      ];
      const mockMicrophones: MediaDeviceInfo[] = [
        {
          deviceId: 'mic1',
          label: 'Microphone 1',
          kind: 'audioinput',
          groupId: '',
          toJSON: () => ({}),
        },
      ];
      const mockSpeakers: MediaDeviceInfo[] = [
        {
          deviceId: 'spk1',
          label: 'Speaker 1',
          kind: 'audiooutput',
          groupId: '',
          toJSON: () => ({}),
        },
      ];

      spyOn(service, 'getDevices').and.callFake((kind: MediaDeviceKind) => {
        switch (kind) {
          case 'videoinput':
            return Promise.resolve(mockCameras);
          case 'audioinput':
            return Promise.resolve(mockMicrophones);
          case 'audiooutput':
            return Promise.resolve(mockSpeakers);
          default:
            return Promise.resolve([]);
        }
      });

      const result = await service.getAllDevices();

      expect(service.getDevices).toHaveBeenCalledWith('videoinput');
      expect(service.getDevices).toHaveBeenCalledWith('audioinput');
      expect(service.getDevices).toHaveBeenCalledWith('audiooutput');
      expect(result).toEqual({
        cameras: mockCameras,
        microphones: mockMicrophones,
        speakers: mockSpeakers,
      });
    });

    it('should return empty arrays for all device categories when an error occurs', async () => {
      spyOn(service, 'getDevices').and.throwError('Device fetch failed');

      const result = await service.getAllDevices();

      expect(service.getDevices).toHaveBeenCalledWith('videoinput');
      expect(service.getDevices).toHaveBeenCalledWith('audioinput');
      expect(service.getDevices).toHaveBeenCalledWith('audiooutput');
      expect(result).toEqual({
        cameras: [],
        microphones: [],
        speakers: [],
      });
    });
  });

  //////////////////////////////////////

  describe('updateDeviceLists', () => {
    it('should update device lists and emit updated lists', async () => {
      // Corrected mock device data with MediaDeviceKind
      const mockVideoDevices: {
        kind: MediaDeviceKind;
        deviceId: string;
        label: string;
      }[] = [{ kind: 'videoinput', deviceId: 'vid1', label: 'Camera 1' }];
      const mockMicDevices: {
        kind: MediaDeviceKind;
        deviceId: string;
        label: string;
      }[] = [{ kind: 'audioinput', deviceId: 'mic1', label: 'Microphone 1' }];
      const mockSpeakerDevices: {
        kind: MediaDeviceKind;
        deviceId: string;
        label: string;
      }[] = [{ kind: 'audiooutput', deviceId: 'spk1', label: 'Speaker 1' }];

      // Spy on getDevices to return mock data
      spyOn(service, 'getDevices').and.callFake((kind: MediaDeviceKind) => {
        switch (kind) {
          case 'videoinput':
            return Promise.resolve(mockVideoDevices);
          case 'audioinput':
            return Promise.resolve(mockMicDevices);
          case 'audiooutput':
            return Promise.resolve(mockSpeakerDevices);
          default:
            return Promise.resolve([]);
        }
      });

      // Spy on deviceListsSubject to track next calls
      const deviceListsSubjectSpy = spyOn(
        service.deviceListsSubject,
        'next'
      ).and.callThrough();

      await service.updateDeviceLists();

      // Verify that getDevices was called with correct arguments
      expect(service.getDevices).toHaveBeenCalledWith('videoinput');
      expect(service.getDevices).toHaveBeenCalledWith('audioinput');
      expect(service.getDevices).toHaveBeenCalledWith('audiooutput');

      // Verify that device lists are updated correctly
      expect(service.videoDevices).toEqual(mockVideoDevices);
      expect(service.micDevices).toEqual(mockMicDevices);
      expect(service.speakerDevices).toEqual(mockSpeakerDevices);

      // Verify that the updated lists are emitted
      expect(deviceListsSubjectSpy).toHaveBeenCalledWith({
        videoDevices: mockVideoDevices,
        micDevices: mockMicDevices,
        speakerDevices: mockSpeakerDevices,
      });
    });

    it('should handle errors gracefully and not emit new lists', async () => {
      // Mock getDevices to throw an error
      spyOn(service, 'getDevices').and.throwError('Device fetch failed');

      // Spy on deviceListsSubject to track next calls
      const deviceListsSubjectSpy = spyOn(
        service.deviceListsSubject,
        'next'
      ).and.callThrough();

      await service.updateDeviceLists();

      // Verify that device lists are not updated
      expect(service.videoDevices).toEqual([]);
      expect(service.micDevices).toEqual([]);
      expect(service.speakerDevices).toEqual([]);

      // Verify that no new lists are emitted
      expect(deviceListsSubjectSpy).not.toHaveBeenCalled();
    });
  });
  /////////////////////////////////
  describe('switchDevices', () => {
    it('should switch device successfully and log the success message', async () => {
      const kind: MediaDeviceKind = 'audioinput';
      const deviceId = 'test-device-id';

      // Mocking switchActiveDevice to return true
      mockRoom.switchActiveDevice.and.returnValue(Promise.resolve(true));

      const consoleLogSpy = spyOn(console, 'log');

      await service.switchDevice(kind, deviceId);

      expect(mockRoom.switchActiveDevice).toHaveBeenCalledWith(kind, deviceId);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Switched ${kind} to device: ${deviceId}`
      );
    });

    it('should fail to switch device and log a warning message', async () => {
      const kind: MediaDeviceKind = 'audioinput';
      const deviceId = 'test-device-id';

      // Mocking switchActiveDevice to return false
      mockRoom.switchActiveDevice.and.returnValue(Promise.resolve(false));

      const consoleWarnSpy = spyOn(console, 'warn');

      await service.switchDevice(kind, deviceId);

      expect(mockRoom.switchActiveDevice).toHaveBeenCalledWith(kind, deviceId);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `Failed to switch ${kind} to device: ${deviceId}`
      );
    });

    it('should handle errors and log an error message', async () => {
      const kind: MediaDeviceKind = 'audioinput';
      const deviceId = 'test-device-id';

      // Mocking switchActiveDevice to throw an error
      const error = new Error('Test error');
      mockRoom.switchActiveDevice.and.returnValue(Promise.reject(error));

      const consoleErrorSpy = spyOn(console, 'error');

      await service.switchDevice(kind, deviceId);

      expect(mockRoom.switchActiveDevice).toHaveBeenCalledWith(kind, deviceId);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error switching ${kind} to device: ${deviceId}`,
        error
      );
    });
  });
  /////////////////////////////////////

  describe('switchSpeakerLayout', () => {
    it('should move the first child of .lk-speaker-layout to .lk-grid-layout', () => {
      // Mocking DOM elements
      const mockGridLayout = document.createElement('div');
      mockGridLayout.classList.add('lk-grid-layout');

      const mockSpeakerLayout = document.createElement('div');
      mockSpeakerLayout.classList.add('lk-speaker-layout');

      const childElement = document.createElement('div');
      childElement.classList.add('speaker-child');
      mockSpeakerLayout.appendChild(childElement);

      // Adding mock elements to the DOM
      document.body.appendChild(mockGridLayout);
      document.body.appendChild(mockSpeakerLayout);

      // Execute the method
      service.switchSpeakerViewLayout();

      // Assertions
      expect(mockSpeakerLayout.firstElementChild).toBeNull();
      expect(mockGridLayout.firstElementChild).toBe(childElement);

      // Clean up the DOM
      document.body.removeChild(mockGridLayout);
      document.body.removeChild(mockSpeakerLayout);
    });

    it('should do nothing if .lk-speaker-layout has no children', () => {
      // Mocking DOM elements
      const mockGridLayout = document.createElement('div');
      mockGridLayout.classList.add('lk-grid-layout');

      const mockSpeakerLayout = document.createElement('div');
      mockSpeakerLayout.classList.add('lk-speaker-layout');

      // Adding mock elements to the DOM
      document.body.appendChild(mockGridLayout);
      document.body.appendChild(mockSpeakerLayout);

      // Execute the method
      service.switchSpeakerViewLayout();

      // Assertions
      expect(mockSpeakerLayout.firstElementChild).toBeNull();
      expect(mockGridLayout.firstElementChild).toBeNull();

      // Clean up the DOM
      document.body.removeChild(mockGridLayout);
      document.body.removeChild(mockSpeakerLayout);
    });
  });
///////////////////////////////////

describe('CloseBreakoutRoomAlert', () => {
it('should send close alert to all breakout rooms', () => {
  const mockBreakoutRoomsData = [
    { roomName: 'Room1' },
    { roomName: 'Room2' },
  ];
  const alertContent = JSON.stringify({
    type: 'closeRoomAlert',
    countdown: 60,
  });

  // Setup
  service.breakoutRoomsData = mockBreakoutRoomsData;
  mockMeetingService.sendCloseBreakoutRoomAlert.and.returnValue(
    of(null) // Simulate successful API call
  );

  // Call the method
  service.sendCloseAlertToBreakoutRooms();

  // Assertions
  expect(mockMeetingService.sendCloseBreakoutRoomAlert).toHaveBeenCalledTimes(
    mockBreakoutRoomsData.length
  );
  expect(mockMeetingService.sendCloseBreakoutRoomAlert).toHaveBeenCalledWith(
    'Room1',
    alertContent
  );
  expect(mockMeetingService.sendCloseBreakoutRoomAlert).toHaveBeenCalledWith(
    'Room2',
    alertContent
  );
});

it('should log a warning if no breakout rooms are available', () => {
  const consoleWarnSpy = spyOn(console, 'warn');
  service.breakoutRoomsData = []; // No breakout rooms

  // Call the method
  service.sendCloseAlertToBreakoutRooms();

  // Assertions
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    'No breakout rooms available to send close alert.'
  );
  expect(
    mockMeetingService.sendCloseBreakoutRoomAlert
  ).not.toHaveBeenCalled();
});

it('should log an error if sending alert fails', () => {
  const mockBreakoutRoomsData = [{ roomName: 'Room1' }];
  const alertContent = JSON.stringify({
    type: 'closeRoomAlert',
    countdown: 60,
  });

  const consoleErrorSpy = spyOn(console, 'error');
  const errorMessage = 'Network error';
  mockMeetingService.sendCloseBreakoutRoomAlert.and.returnValue(
    throwError(() => new Error(errorMessage))
  );
  service.breakoutRoomsData = mockBreakoutRoomsData;

  // Call the method
  service.sendCloseAlertToBreakoutRooms();

  // Assertions
  expect(mockMeetingService.sendCloseBreakoutRoomAlert).toHaveBeenCalledWith(
    'Room1',
    alertContent
  );
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    `Failed to send close alert to breakout room: Room1`,
    jasmine.any(Error)
  );
});
});

});
