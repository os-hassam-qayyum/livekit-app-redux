import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  Track,
} from 'livekit-client';
import {
  async,
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subscription,
  take,
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { selectLiveKitRoomViewState } from '../+state/livekit/livekit-room.selectors';
import * as LiveKitRoomActions from '../+state/livekit/livekit-room.actions';
import { LivekitService } from '../livekit.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BreakoutRoomService } from '../breakout-room.service';
import { BreakoutRoom } from '../+state/livekit/livekit-room.reducer';
import { ActivatedRoute, Router } from '@angular/router';

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
  9: '1fr 1fr',
  10: '1fr 1fr',
  11: '1fr 1fr 1fr',
  12: '1fr 1fr 1fr',
  13: '1fr 1fr 1fr',
  14: '1fr 1fr 1fr',
  15: '1fr 1fr 1fr',
  16: '1fr 1fr 1fr',
  17: '1fr 1fr 1fr',
  18: '1fr 1fr 1fr',
  19: '1fr 1fr 1fr',
  20: '1fr 1fr 1fr',
  21: '1fr 1fr 1fr 1fr',
};

@Component({
  selector: 'app-livekit-room',
  templateUrl: './livekit-room.component.html',
  styleUrls: ['./livekit-room.component.scss'],
})
export class LivekitRoomComponent {
  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  isVideoOn = false;
  isMicOn = false;
  videoStream: MediaStream | null = null;
  isInitialMeetingStarted: boolean = false;
  meetingUi: boolean = false;
  showCloseRoomModal = false;
  countdown = 60; // Countdown time in seconds
  timerInterval: any;
  isRedirectionModalVisible: boolean = false;
  redirectionMessage: string = 'Please wait while we redirect you.';
  isLeaveAccordionOpen = false;
  isBreakoutRoom = '';
  isRoomAccordionOpen: boolean[] = [];
  nestBreakoutRooms: BreakoutRoom[] = [];
  errorMessage = '';
  isMicDropdownOpen = false; // To toggle mic dropdown visibility
  isVideoDropdownOpen = false; // To toggle video dropdown visibility
  chatSideWindowVisible: boolean = false;
  videoDevices: MediaDeviceInfo[] = [];
  micDevices: MediaDeviceInfo[] = [];
  speakerDevices: MediaDeviceInfo[] = [];

  selectedVideoId: string | null = null;
  selectedMicId: string | null = null;
  selectedSpeakerId: string | null = null;

  videoDevicesLoaded = false;
  audioDevicesLoaded = false;
  // speakerDevices: MediaDeviceInfo[] = [];
  selectedParticipants: { [roomIndex: number]: string[] } = {};
  // websocket variables
  webSocketStatus: 'connected' | 'reconnecting' | 'disconnected' =
    'disconnected';
  private statusSubscription!: Subscription;
  // selectors
  liveKitViewState$!: Observable<any>;
  speakerModeLayout = false;
  // =========mic adjustment ======
  @ViewChild('audioCanvas', { static: true })
  audioCanvasRef!: ElementRef<HTMLCanvasElement>;
  messageContent: string = '';
  participantName: string = '';
  breakoutRoomsData: any[] = [];
  selectedBreakoutRoom = '';
  // pip
  pipWindow: any = null;
  showModal = false; // Controls modal visibility
  @ViewChild('pipModal') pipModal!: ElementRef<HTMLDivElement>;
  @ViewChild('playerContainer') playerContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('pipContainer') pipContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('screensharePiP') screensharePiP!: ElementRef<HTMLDivElement>;

  pipMode = false;
  private originalParent: HTMLElement | null = null;
  private originalNextSibling: Node | null = null;

  public breakoutMessageContent: any[] = [];
  @ViewChild('messageContainer') messageContainer!: ElementRef | any;
  attachedTrack: HTMLElement | null = null;
  startForm!: FormGroup;
  chatForm!: FormGroup;
  screenShareTrackSubscription!: Subscription;
  screenShareTrack!: RemoteTrack | undefined;
  unreadMessagesCount = 0;
  remoteParticipantNames: any;
  localParticipant: any;
  handRaiseStates: { [identity: string]: boolean } = {};
  allMessages: any[] = [];
  allMessagesToMainRoom: any[] = [];
  room!: Room;
  totalParticipants!: number;
  breakoutForm!: FormGroup;
  hostName!: string | undefined;
  roomName: string | null = null;
  isRoomNameAvailable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  ); // Track room name availability
  isRouteInitialized: boolean = false; // Track if route is initialized

  breakoutRoomTypes = [
    { value: 'automatic', viewValue: 'automatic' },
    { value: 'manual', viewValue: 'manual' },
  ];
  private subscription!: Subscription;
  private remoteVideoSubscription!: Subscription;
  private screenShareSubscription!: Subscription;
  constructor(
    private formBuilder: FormBuilder,
    public livekitService: LivekitService,
    private snackBar: MatSnackBar,
    public store: Store,
    private renderer: Renderer2,
    private breakoutRoomService: BreakoutRoomService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const room = params.get('roomName');
      console.log('Route parameter "roomName":', room);
      console.log('Route parameters:', params);
      console.log('ActivatedRoute paramMap:', this.route.snapshot.paramMap);
      if (room) {
        this.roomName = room;
        this.livekitService.setRoomName(room);
        this.isRoomNameAvailable$.next(true);
        console.log(`Room name from route: ${this.roomName}`);
        // this.startMeeting(); // Automatically start the meeting for the room
      } else {
        this.isRoomNameAvailable$.next(false);
        console.error('No room name provided in the route!');
        // this.router.navigate(['/meeting/test-room']); // Fallback to a default room
      }
      // Mark route as initialized to avoid re-rendering the button
      this.isRouteInitialized = true;
    });
    // Initialize WebSocket and audio/video handler
    this.initializeWebSocketAndAudioVideoHandler();

    // Initialize state observables
    this.initializeStateObservables();

    // Initialize forms
    this.initializeForms();

    // Handle message subscriptions
    this.setupMessageSubscriptions();

    // Attach track to remote video container
    this.attachRemoteVideoTrack();

    // store remote participant names
    this.storeRemoteParticipantNames();

    // Store local participant data
    this.storeLocalParticipantData();

    this.livekitService.deviceLists$.subscribe((devices) => {
      this.videoDevices = devices.videoDevices;
      this.micDevices = devices.micDevices;
      this.speakerDevices = devices.speakerDevices;
    });
    // Fetch all devices initially
    try {
      const devices = await this.livekitService.getAllDevices();

      // Populate the devices lists
      this.videoDevices = devices.cameras;
      this.micDevices = devices.microphones;
      this.speakerDevices = devices.speakers;

      // Select the first device from each category by default
      if (this.videoDevices.length > 0) {
        this.selectedVideoId = this.videoDevices[0].deviceId;
        await this.livekitService.switchDevice(
          'videoinput',
          this.selectedVideoId
        );
      }

      if (this.micDevices.length > 0) {
        this.selectedMicId = this.micDevices[0].deviceId;
        await this.livekitService.switchDevice(
          'audioinput',
          this.selectedMicId
        );
      }

      if (this.speakerDevices.length > 0) {
        this.selectedSpeakerId = this.speakerDevices[0].deviceId;
        await this.livekitService.switchDevice(
          'audiooutput',
          this.selectedSpeakerId
        );
      }

      console.log('Default devices selected:');
      console.log('Video:', this.selectedVideoId);
      console.log('Mic:', this.selectedMicId);
      console.log('Speaker:', this.selectedSpeakerId);
    } catch (error) {
      console.error('Error initializing default devices:', error);
    }

    this.store.dispatch(
      LiveKitRoomActions.MeetingActions.setRoomName({ roomName: this.roomName })
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.remoteVideoSubscription) {
      this.remoteVideoSubscription.unsubscribe();
    }
    if (this.screenShareSubscription) {
      this.screenShareSubscription.unsubscribe();
    }
    // Clean up the event listener when the component is destroyed
    // document.removeEventListener('visibilitychange', () => {
    //   if (document.hidden) {
    //     this.enterPiP();
    //   } else {
    //     this.onLeavePiP();
    //   }
    // });
  }
  async onDeviceSelected(kind: MediaDeviceKind, deviceId: string) {
    try {
      console.log(`Selected ${kind}: ${deviceId}`);
      // Update the selected device
      if (kind === 'videoinput') this.selectedVideoId = deviceId;
      if (kind === 'audioinput') this.selectedMicId = deviceId;
      if (kind === 'audiooutput') this.selectedSpeakerId = deviceId;

      // Switch the active device using the LiveKit service
      await this.livekitService.switchDevice(kind, deviceId);

      console.log(`Successfully switched ${kind} to device: ${deviceId}`);
    } catch (error) {
      console.error(`Error switching ${kind} to device: ${deviceId}`, error);
    }
  }

  async toggleVideoDropdown() {
    if (!this.videoDevicesLoaded) {
      try {
        this.videoDevices = await this.livekitService.getDevices('videoinput');
        this.videoDevicesLoaded = true; // Mark as loaded
        console.log('Video devices loaded:', this.videoDevices);
      } catch (error) {
        console.error('Error fetching video devices:', error);
      }
    }
    this.isVideoDropdownOpen = !this.isVideoDropdownOpen;
  }

  async toggleMicDropdown() {
    if (!this.audioDevicesLoaded) {
      try {
        const devices = await this.livekitService.getAllDevices();
        this.micDevices = devices.microphones;
        this.speakerDevices = devices.speakers;
        this.audioDevicesLoaded = true; // Mark as loaded
        console.log(
          'Audio devices loaded:',
          this.micDevices,
          this.speakerDevices
        );
      } catch (error) {
        console.error('Error fetching audio devices:', error);
      }
    }
    this.isMicDropdownOpen = !this.isMicDropdownOpen;
  }

  async selectVideo(deviceId: string) {
    this.selectedVideoId = deviceId;
    await this.livekitService.switchDevice('videoinput', deviceId);
    console.log('Selected video device:', deviceId);
  }

  async selectMic(deviceId: string) {
    this.selectedMicId = deviceId;
    await this.livekitService.switchDevice('audioinput', deviceId);
    console.log('Selected microphone device:', deviceId);
  }

  async selectSpeaker(deviceId: string) {
    this.selectedSpeakerId = deviceId;
    await this.livekitService.switchDevice('audiooutput', deviceId);
    console.log('Selected speaker device:', deviceId);
  }

  private initializeWebSocketAndAudioVideoHandler() {
    // Uncomment this if you want to connect the WebSocket
    // this.livekitService.connectWebSocket();
    this.livekitService.audioVideoHandler();

    this.statusSubscription = this.livekitService.webSocketStatus$.subscribe(
      (status) => {
        this.webSocketStatus = status;
        console.log('WebSocket status updated:', status);
      }
    );
  }

  private initializeStateObservables() {
    this.liveKitViewState$ = this.store.pipe(
      select(selectLiveKitRoomViewState)
    );

    this.liveKitViewState$.subscribe((state) => {
      this.breakoutRoomsData = state.breakoutRoomsData;
      console.log('ngOnInit Breakout Rooms Data:', this.breakoutRoomsData);
      this.chatSideWindowVisible = state.chatSideWindowVisible;
      // if (state.isMeetingStarted) {
      //   document.addEventListener('visibilitychange', () => {
      //     if (document.hidden) {
      //       this.enterPiP();
      //     } else {
      //       this.onLeavePiP();
      //     }
      //   });
      // }
    });
  }

  private initializeForms() {
    this.startForm = this.formBuilder.group({
      token: [''],
    });

    this.chatForm = this.formBuilder.group({
      message: [''],
      participant: [''],
    });

    this.breakoutForm = this.formBuilder.group({
      numberOfRooms: ['', [Validators.required]],
      roomName: ['', Validators.required],
      roomType: ['', Validators.required],
      selectedParticipants: [[]],
    });
  }

  private setupMessageSubscriptions() {
    this.livekitService.messageToMain.subscribe((msgArrayTomainRoom: any[]) => {
      console.log('Received message in main room:', msgArrayTomainRoom);
      msgArrayTomainRoom.forEach((content) => {
        if (content.content === 'I need help') {
          const newMessage = {
            senderName: content.title,
            receivedMsg: content.content,
            receivingTime: new Date(content.timestamp),
            type: 'received',
          };
          this.roomName = content.title;
          console.log('msg to main room', this.roomName);
          this.allMessagesToMainRoom.push(newMessage);
          this.openReceiveMsgModal();
          console.log('Updated chat messages:', this.allMessagesToMainRoom);
        }
      });
    });

    this.livekitService.messageContentReceived.subscribe(
      (contentArray: any[]) => {
        console.log('Received message content array:', contentArray);
        contentArray.forEach((content) => {
          // if (content.content && content.title === 'test-room') {
          if (content.content && content.title === this.roomName) {
            this.handleNewMessage(content);
          }
        });
      }
    );

    // this.livekitService.closeRoomAlert.subscribe((alert) => {
    //   console.log('Close Room Alert received in app.component:', alert);
    //   this.showCloseRoomModal = true;
    //   this.countdown = alert.countdown;
    //   this.startCountdown();
    // });

    this.livekitService.msgDataReceived.subscribe((data) => {
      this.handleMsgDataReceived(data);

      // Safeguard for undefined or incorrect data structure
      if (data?.message?.type) {
        this.isBreakoutRoom = data.message.type;
        console.log('Check is it breakout room:', this.isBreakoutRoom);
      } else {
        console.error('Invalid data structure:', data);
      }
    });

    this.livekitService.messageEmitter.subscribe((data: any) => {
      this.handleMessageEmitter(data);
    });
  }

  handleNewMessage(content: any) {
    const newMessage = {
      senderName: content.title,
      receivedMsg: content.content,
      receivingTime: new Date(content.timestamp),
      type: 'received',
    };

    const isDuplicate = this.allMessages.some((message) => {
      const messageTime = new Date(message.receivingTime);
      return (
        message.receivedMsg === newMessage.receivedMsg &&
        message.senderName === newMessage.senderName &&
        messageTime.getTime() === newMessage.receivingTime.getTime()
      );
    });

    if (!isDuplicate) {
      this.allMessages.push(newMessage);
      if (!this.chatSideWindowVisible) {
        this.store.dispatch(
          LiveKitRoomActions.LiveKitActions.updateUnreadMessagesCount({
            count: this.unreadMessagesCount + 1,
          })
        );
        this.scrollToBottom();
      } else {
        // this.unreadMessagesCount = 0;
        this.store.dispatch(
          LiveKitRoomActions.LiveKitActions.resetUnreadMessagesCount()
        );
      }
    }
    console.log('Updated chat messages:', this.allMessages);
  }

  handleMsgDataReceived(data: any) {
    console.log('Participant Data:', data);
    this.hostName = data.participant?.identity;

    if (data.message.handRaised !== undefined) {
      this.handRaiseStates[data.participant.identity] = data.message.handRaised;
      const action = data.message.handRaised
        ? 'raised its hand'
        : 'lowered its hand';
      this.openSnackBar(`${data.participant.identity} ${action}`);
    }

    if (data.message.type === 'breakoutRoom') {
      console.log(
        'Breakout room created for participant:',
        data.participant?.identity
      );
      this.roomName = data.message.roomName;
      this.hostName = data.participant?.identity;
      this.showInvitationModal();
    }
    // Ensure data.message.type exists before proceeding
    if (data?.message?.type === 'closeRoomAlert') {
      console.log('Close Room Alert received');
      this.showCloseRoomModal = true;
      this.countdown = data.message.countdown || 60;
      this.startCountdown();
    }

    if (
      data.message.type !== 'handRaise' &&
      data.message.type !== 'breakoutRoom' &&
      // data.message.title !== 'test-room' &&
      data.message.title !== this.roomName &&
      data.message.content !== 'I need help' &&
      data.message.type !== 'closeRoomAlert'
    ) {
      const receivedMsg = data?.message?.message || data?.message?.content;
      const senderName = data?.participant?.identity;
      const receivingTime = data?.message?.timestamp;
      this.allMessages.push({
        senderName,
        receivedMsg,
        receivingTime,
        type: 'received',
      });
      this.updateUnreadMessageCount();
      this.scrollToBottom();
      this.sortMessages();
    }
  }

  private handleMessageEmitter(data: any) {
    console.log('data', data);
    const sendMessage = data?.message;
    const sendingTime = data?.timestamp;
    this.allMessages.push({ sendMessage, sendingTime, type: 'sent' });
    this.sortMessages();
    this.scrollToBottom();
  }

  updateUnreadMessageCount() {
    if (!this.chatSideWindowVisible) {
      this.store.dispatch(
        LiveKitRoomActions.LiveKitActions.updateUnreadMessagesCount({
          count: this.unreadMessagesCount + 1,
        })
      );
      this.scrollToBottom();
    }
  }

  private attachRemoteVideoTrack() {
    this.attachedTrack = this.livekitService.attachTrackToElement(
      Track,
      'remoteVideoContainer'
    );
  }

  storeRemoteParticipantNames() {
    if (this.livekitService.participantNamesUpdated) {
      this.livekitService.participantNamesUpdated.subscribe((names: any) => {
        this.remoteParticipantNames = names;
        this.totalParticipants = this.remoteParticipantNames.length;
      });
    } else {
      console.error('participantNamesUpdated is undefined');
    }
  }
  storeLocalParticipantData() {
    this.livekitService.localParticipantData.subscribe((data: any) => {
      this.localParticipant = data;
      console.log('local Participant name updated:', this.localParticipant);
    });
  }

  private exposeLivekitServiceForCypress() {
    if ((window as any).Cypress) {
      (window as any).livekitService = this.livekitService;
    }
  }

  ngAfterViewInit(): void {
    if (this.livekitService.screenShareTrackSubscribed) {
      // Subscribe to the EventEmitter
      this.livekitService.screenShareTrackSubscribed
        .pipe(
          filter(
            (track) => !!track && track.source === Track.Source.ScreenShare
          )
        )
        .subscribe((track: RemoteTrack | undefined) => {
          if (track && track.source === Track.Source.ScreenShare) {
            this.screenShareTrack = track;
            console.log('ss track', track);
          } else {
            this.screenShareTrack = undefined; // Reset if no screen share track
            console.log('else ss track', this.screenShareTrack);
          }
        });
    } else {
      console.error('screenShareTrackSubscribed is undefined');
    }
    this.remoteVideoSubscription =
      this.livekitService.remoteVideoTrackSubscribed
        .pipe(distinctUntilChanged())
        .subscribe({
          next: ({ track, publication, participant }) => {
            this.livekitService.handleTrackSubscribed(
              track,
              publication,
              participant
            );
          },
        });
    this.subscription = this.livekitService.remoteAudioTrackSubscribed
      .pipe(distinctUntilChanged())
      .subscribe(({ track, publication, participant }) => {
        this.livekitService.handleTrackSubscribed(
          track,
          publication,
          participant
        );
      });
    // this.livekitService.initCanvas(this.audioCanvasRef.nativeElement);
  }

  initialStartMeeting() {
    this.isInitialMeetingStarted = true; // Set to true when meeting starts
    this.startMeeting();
  }
  startMeetingUI() {
    this.isInitialMeetingStarted = false;
    this.meetingUi = true;
  }
  /**
   * Initiates the start of a meeting by dispatching a startMeeting action
   * with the WebSocket URL and a dynamic token obtained from the form value.
   *
   * This function:
   * 1. Retrieves the token from the form value.
   * 2. Logs the token to the console.
   * 3. Defines the WebSocket URL.
   * 4. Dispatches the startMeeting action with the WebSocket URL and token.
   *
   * @async
   * @function
   * @returns {Promise<void>} - A promise that resolves when the meeting has been initiated.
   */
  async startMeeting() {
    console.log(`Current roomName: ${this.roomName}`);
    if (this.roomName) {
      console.log(`Current roomName: ${this.roomName}`);
      this.store.dispatch(
        LiveKitRoomActions.MeetingActions.createMeeting({
          participantNames: [this.participantName],
          roomName: this.roomName, // Use the roomName dynamically
        })
      );
      console.log(`Starting meeting in room: ${this.roomName}`);
      this.store.dispatch(
        LiveKitRoomActions.BreakoutActions.loadBreakoutRooms()
      );
    } else {
      console.error('Cannot start meeting: Room name is undefined!');
    }
  }

  /**
   * Calculates the distribution of participants across breakout rooms.
   *
   * This function retrieves the number of breakout rooms from the breakoutForm and
   * the total number of participants. It then dispatches the calculateDistribution action
   * to the store with these values, initiating the distribution calculation.
   *
   * @function
   * @returns {void} - No return value.
   */
  calculateDistribution() {
    const numberOfRooms = this.breakoutForm.get('numberOfRooms')?.value;
    const totalParticipants = this.totalParticipants;

    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.calculateDistribution({
        numberOfRooms,
        totalParticipants,
      })
    );
    this.store.dispatch(LiveKitRoomActions.BreakoutActions.createNewRoom());
  }

  /**
   * Extracts the initials from a given name by taking the first character of each word.
   *
   * This function:
   * 1. Splits the name into words.
   * 2. Maps each word to its first character.
   * 3. Joins the characters to form the initials.
   *
   * @param {any} name - The name from which to extract initials.
   * @returns {string} - The initials derived from the name.
   */
  extractInitials(name: any) {
    const words = name.split(' ').map((word: any) => word.charAt(0));
    return words.join('');
  }

  /**
   * Sorts the allMessages array in ascending order based on the message's timestamp.
   *
   * This function:
   * 1. Sorts messages by their receivingTime or sendingTime in ascending order.
   * 2. Modifies the allMessages array in place.
   *
   * @function
   * @returns {void}
   */
  sortMessages() {
    this.allMessages.sort(
      (a, b) =>
        new Date(a.receivingTime || a.sendingTime).getTime() -
        new Date(b.receivingTime || b.sendingTime).getTime()
    );
  }

  /**
   * Determines whether the avatar should be shown for a message at a given index.
   *
   * This function:
   * 1. Always shows the avatar for the first message.
   * 2. Shows the avatar if the sender of the current message is different from the sender of the previous message.
   *
   * @param {number} index - The index of the message in the allMessages array.
   * @returns {boolean} - true if the avatar should be shown, otherwise false.
   */

  shouldShowAvatar(index: number): boolean {
    if (index === 0) {
      return true;
    }
    const currentMessage = this.allMessages[index];
    const previousMessage = this.allMessages[index - 1];
    return currentMessage.senderName !== previousMessage.senderName;
  }

  /**
   * Sends a chat message using the LiveKit service and resets the chat form.
   *
   * This function:
   * 1. Retrieves the message and recipient from the chat form.
   * 2. Calls the sendChatMessage method of the LiveKit service with the message and recipient.
   * 3. Resets the chat form.
   *
   * @function
   * @returns {void}
   */
  sendMessage() {
    const msg = this.chatForm.value.message;
    const recipient = this.chatForm.value.participant;
    this.store.dispatch(
      LiveKitRoomActions.ChatActions.sendChatMessage({ msg, recipient })
    );

    this.chatForm.reset();
  }

  /**
   * Toggles the raise hand status of the local participant.
   *
   * This function:
   * 1. Checks the current hand raise status of the local participant.
   * 2. If the hand is raised, calls the lowerHand method of the LiveKit service.
   * 3. If the hand is not raised, calls the raiseHand method of the LiveKit service.
   *
   * @function
   * @returns {void}
   */

  toggleRaiseHand() {
    if (this.localParticipant.handRaised) {
      this.localParticipant.handRaised = false;
      this.livekitService.lowerHand(this.localParticipant);
      this.openSnackBar(`${this.localParticipant.identity} lowered hand`);
      this.handRaiseStates[this.localParticipant.identity] = false;

      if (this.pipWindow) {
        const pipBody = this.pipWindow.document.body;
        const raiseHandIcon = pipBody.querySelector('[data-cy="raise-hand"] i');
        if (raiseHandIcon) {
          raiseHandIcon.classList.remove(
            'hand-raised',
            this.localParticipant.handRaised
          );
        }
      }
    } else {
      this.localParticipant.handRaised = true;
      this.livekitService.raiseHand(this.localParticipant);
      this.openSnackBar(`${this.localParticipant.identity} raised hand`);
      this.handRaiseStates[this.localParticipant.identity] = true;
      // Update the "Raise Hand" icon in the PiP window if it exists
      if (this.pipWindow) {
        const pipBody = this.pipWindow.document.body;
        const raiseHandIcon = pipBody.querySelector('[data-cy="raise-hand"] i');
        if (raiseHandIcon) {
          raiseHandIcon.classList.add(
            'hand-raised',
            this.localParticipant.handRaised
          );
        }
      }
    }
  }

  /**
   * Dispatches an action to leave the meeting.
   * And leave the pip window
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async leaveMeetingRoom(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.MeetingActions.leaveMeeting());
    // this.onLeavePiP();
    this.isLeaveAccordionOpen = false;
  }

  /**
   * Dispatches an action to toggle screen sharing.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleScreenShare(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.LiveKitActions.toggleScreenShare());
    this.livekitService.speakerModeLayout = false;
    this.livekitService.switchSpeakerViewLayout();
  }

  /**
   * Dispatches an action to toggle video.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  // async toggleVideo(): Promise<void> {
  //   await this.store.dispatch(LiveKitRoomActions.LiveKitActions.toggleVideo());
  // }
  async toggleVideo(): Promise<void> {
    // await this.livekitService.connectDefaultDevices();

    this.store.dispatch(LiveKitRoomActions.LiveKitActions.toggleVideo());
    this.toggleCamera();
  }

  /**
   * Dispatches an action to toggle the microphone.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleMic(): Promise<void> {
    // await this.livekitService.connectDefaultDevices();
    this.store.dispatch(LiveKitRoomActions.LiveKitActions.toggleMic());
    this.togglePreviewMic();
  }

  /**
   * Dispatches an action to toggle the participant side window.
   *
   * @function
   * @returns {void}
   */
  openParticipantSideWindow(): void {
    this.store.dispatch(
      LiveKitRoomActions.LiveKitActions.toggleParticipantSideWindow()
    );
  }
  /**
   * Dispatches an action to toggle the breakout side window.
   *
   * @function
   * @returns {void}
   */
  openPBreakoutSideWindow(): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.toggleBreakoutSideWindow()
    );
  }

  /**
   * Dispatches an action to toggle the chat side window.
   * Resets the unread messages count and scrolls to the bottom if the chat window is visible.
   *
   * @function
   * @returns {void}
   */
  openChatSideWindow(): void {
    this.store.dispatch(
      LiveKitRoomActions.LiveKitActions.toggleChatSideWindow()
    );
    // if (!this.chatSideWindowVisible) {
    //   this.store.dispatch(
    //     LiveKitRoomActions.LiveKitActions.resetUnreadMessagesCount()
    //   );
    // }
  }

  /**
   * Dispatches an action to close the chat side window.
   *
   * @function
   * @returns {void}
   */
  closeChatSideWindow(): void {
    this.store.dispatch(
      LiveKitRoomActions.LiveKitActions.closeChatSideWindow()
    );
  }

  /**
   * Dispatches an action to close the participant side window.
   *
   * @function
   * @returns {void}
   */
  closeParticipantSideWindow(): void {
    this.store.dispatch(
      LiveKitRoomActions.LiveKitActions.closeParticipantSideWindow()
    );
  }

  /**
   * Dispatches an action to close the breakout side window.
   *
   * @function
   * @returns {void}
   */
  closeBreakoutSideWindow(): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeBreakoutSideWindow()
    );
  }
  /**
   * Returns the CSS grid column style based on the number of participants in the LiveKit room.
   * If the number of participants is 6 or fewer, returns a predefined grid column style.
   * If the number of participants is more than 6, returns a default grid column style.
   *
   * @readonly
   * @type {string}
   */
  get GalleryGridColumnStyle() {
    if (this.pipMode) {
      return PIPGRIDCOLUMN[this.livekitService.room.numParticipants];
    } else if (this.livekitService.room.numParticipants <= 6) {
      return GRIDCOLUMN[this.livekitService.room.numParticipants];
    } else {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }

  /**
   * Scrolls the message container to the bottom.
   * Uses a timeout to ensure the scroll action occurs after the view has updated.
   *
   * @function
   * @returns {void}
   */
  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }, 100);
    } catch (err) {}
  }

  /**
   * Opens a snack bar with a given message.
   * The snack bar includes a 'Close' action and automatically dismisses after 3 seconds.
   *
   * @param {string} message - The message to display in the snack bar.
   * @function
   * @returns {void}
   */
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // duration in milliseconds
    });
  }

  /**
   * Returns the CSS grid column style based on the number of screen shared in the LiveKit room.
   * If the number of shared screens are 6 or fewer, returns a predefined grid column style.
   * If the number of shared screens are more than 6, returns a default grid column style.
   *
   * @readonly
   * @type {string}
   */
  get ScreenGalleryGridColumnStyle() {
    if (this.livekitService.totalScreenShareCount <= 6) {
      return GRIDCOLUMN[this.livekitService.totalScreenShareCount];
    } else {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }
  /**
   * Dispatches an action to open modal when host receive message from  the breakout participants.
   * When any breakout room participant ask for help from host.
   *
   * @function
   * @returns {void}
   */
  openReceiveMsgModal() {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.openHelpMessageModal()
    );
  }
  /**
   * Dispatches an action to close modal when host receive message from the breakout participants.
   * When any breakout room participant ask for help from host. And clears all messages.
   *
   * @function
   * @returns {void}
   */

  closeReceiveMsgModal() {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeHelpMessageModal()
    );
    this.allMessagesToMainRoom = [];
  }

  /**
   * Dispatches an action to open the breakout modal (select participant  automatically or manually).
   * And creating breskout rooms
   * @function
   * @returns {void}
   */
  openBreakoutModal(): void {
    this.store.dispatch(LiveKitRoomActions.BreakoutActions.openBreakoutModal());
  }
  /**
   * Dispatches an action to close the breakout Modal After selecting participants and creating breakout rooms.
   *
   * @function
   * @returns {void}
   */
  closeBreakoutModal(): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeBreakoutModal()
    );
  }
  /**
   * Dispatches an action to open invitation modal in host (come from breakout room) to join breakout room (for help).
   *
   * @function
   * @returns {void}
   */

  showInvitationModal(): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.openInvitationModal()
    );
  }
  /**
   * Dispatches an action to close invitation modal in host (come from breakout room) to join breakout room (for help).
   *
   * @function
   * @returns {void}
   */
  closeInvitationModal(): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeInvitationModal()
    );
  }

  async submitBreakoutInvitation(): Promise<void> {
    // Always use 'manual' room type and dispatch the manual room selection action
    console.log('Manual room selection initiated');
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation()
    );

    console.log('Breakout room invitations sent');
    this.closeBreakoutModal();
  }

  /**
   * Submits the breakout room form to initiate room creation based on selected type.
   *
   * This asynchronous function retrieves the room type and number of rooms from the
   * breakoutForm. It initiates room creation automatically if the room type is 'automatic'
   * and a valid number of rooms is specified, dispatching an action with the list of participants.
   * If the room type is 'manual', it dispatches an action to initiate manual room selection.
   * After processing, it closes the breakout modal.
   *
   * @async
   * @function
   * @returns {Promise<void>} - Resolves with no value when submission is complete.
   */
  async submitBreakoutForm(): Promise<void> {
    const roomType = this.breakoutForm.get('roomType')?.value;
    const numberOfRooms = this.breakoutForm.get('numberOfRooms')?.value;
    console.log('room type is', roomType);
    if (roomType === 'automatic' && numberOfRooms > 0) {
      const participants = this.remoteParticipantNames.map(
        (p: any) => p.identity
      );

      // Dispatch action to create automatic rooms
      this.store.dispatch(
        LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
          participants,
          numberOfRooms,
        })
      );
    } else if (roomType === 'manual') {
      // console.log('Manual room selection initiated');

      // // Dispatch action for manual room selection
      // this.store.dispatch(
      //   LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation()
      // );
      this.submitBreakoutInvitation();
    }

    console.log('Breakout room invitations sent');
    this.closeBreakoutModal();
  }

  isParticipantAvailable(participant: string): boolean {
    return this.remoteParticipantNames.some((p) => p.identity === participant);
  }

  /**
   * Joins a breakout room by first leaving the current room.
   *
   * This function performs a two-step process: it first leaves the current room by
   * calling leaveCurrentMeeting, and upon successful completion, it proceeds to
   * join the breakout room by calling joinBreakoutRoom.
   *
   * @function
   * @returns {void} - No return value.
   */
  // joinNow() {
  //   this.isRedirectionModalVisible = true;
  //   // Step 1: Leave the current room
  //   this.leaveCurrentMeeting().then(() => {
  //     // Step 2: Join the breakout room
  //     this.joinBreakoutRoom();
  //   });
  // }
  joinNow(): void {
    // Step 1: Show the redirection modal
    this.redirectionMessage =
      'Please wait while we redirect you to the breakout room.';
    this.isRedirectionModalVisible = true;

    // Step 2: Leave the current room
    this.leaveCurrentMeeting()
      .then(() => {
        console.log('Left the current meeting.');
        // Step 3: Join the breakout room
        this.joinBreakoutRoom();
      })
      .catch((error) => {
        console.error('Error leaving the current meeting:', error);
      })
      .finally(() => {
        // Step 4: Hide the redirection modal after the operation
        setTimeout(() => {
          this.isRedirectionModalVisible = false;
        }, 2000); // Optional delay for better user experience
      });
  }

  // Step 1: Leave the current meeting
  leaveCurrentMeeting(): Promise<void> {
    return new Promise((resolve) => {
      this.store.dispatch(LiveKitRoomActions.MeetingActions.leaveMeeting());
      resolve();
    });
  }

  // Step 2: Join the breakout room
  /**
   * Joins a specified breakout room and initiates the meeting setup.
   *
   * This function retrieves the breakout room name and participant name, then
   * dispatches the createMeeting action to initiate the meeting in the breakout room.
   * After dispatching the action, it hides the invitation modal.
   *
   * @function
   * @returns {void} - No return value.
   */
  joinBreakoutRoom() {
    const breakoutRoomName = this.roomName;
    console.log('breakout room', this.roomName);
    this.store.dispatch(
      LiveKitRoomActions.MeetingActions.createMeeting({
        participantNames: [this.participantName],
        roomName: breakoutRoomName,
      })
    );
    // Hide modal after dispatching
    this.closeInvitationModal();
  }

  /**
   * Sends a message to a specified breakout room and closes the message modal.
   *
   * This function dispatches the sendMessageToBreakoutRoom action to send a message
   * to the selected breakout room with the provided message content. After sending the
   * message, it closes the host-to-breakout-room message modal.
   *
   * @function
   * @returns {void} - No return value.
   */
  sendMessageToBreakoutRoom() {
    this.store.dispatch(
      LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
        breakoutRoom: this.selectedBreakoutRoom,
        messageContent: this.messageContent,
      })
    );
    this.closeHostToBrMsgModal();
  }

  /**
 * This process starts when Participants ask for help from host by sending message.
 * then host trying to join the meeting to help participants in the breakout room.
 ** Allows the host to join an existing breakout room to assist participants.
*
* This asynchronous function performs the following steps:
* 1. Disconnects the host from the current room by calling leaveBtn.
* 2. Checks if the target breakout room exists in breakoutRoomsData.
* 3. If the room exists, dispatches an action to join the meeting in the existing room,
*    passing the host's identity as a participant name.
* 4. If the room does not exist, displays an error message and alerts the host.
* 5. Closes the message modal after processing.
*
* @async
* @function
* @returns {Promise<void>} - Resolves with no value upon completion.

 */
  async hostJoinNow() {
    // Step 1: Leave the current room (disconnect)
    await this.leaveMeetingRoom();
    const existingRoom = this.livekitService.breakoutRoomsData.find(
      (room: any) => room.roomName === this.roomName
    );
    console.log('existtt', this.livekitService.breakoutRoomsData);
    if (existingRoom) {
      // Step 3: If the room exists, join it using the dispatch action
      const participantNames = [this.localParticipant.identity];

      // Dispatch action to join the meeting (existing room)
      this.store.dispatch(
        LiveKitRoomActions.MeetingActions.createMeeting({
          participantNames: participantNames,
          roomName: this.roomName,
        })
      );

      console.log(
        'Host has successfully joined the existing room:',
        this.roomName
      );
    } else {
      // Step 4: If the room does not exist, show an error and do not create a new room
      console.error(`Room "${this.roomName}" does not exist.`);
      alert(
        `The room "${this.roomName}" does not exist. Please select a valid room.`
      );
    }

    // Step 5: Close the message modal
    this.closeReceiveMsgModal();
  }
  /**
   * Sends a help request message to the main room and dispatches a help request action.
   *
   * This function sends a predefined help message ("I need help") to the main room
   * via the livekitService. It then dispatches the sendHelpRequest action to notify
   * the store that a help request has been made from the current breakout room.
   *
   * @function
   * @returns {void} - No return value.
   */
  sendHelpRequest() {
    const helpMessageContent = 'I need help';
    this.livekitService.sendMessageToMainRoom(
      this.roomName,
      helpMessageContent
    );
    this.store.dispatch(
      LiveKitRoomActions.ChatActions.sendHelpRequest({
        roomName: this.roomName,
      })
    );
  }

  /**
   * Initiates the process to create a new breakout room via the sidebar.
   * Also via the modal where we select automatic or manual participants then
   * we can create room also.
   * This function dispatches the initiateCreateNewRoom action, which triggers
   * the side window for breakout room creation. It supports both automatic and manual
   * room configuration options within the breakout room modal.
   *
   * @function
   * @returns {void} - No return value.
   */
  // Function to submit breakout form
  //side window of the breakout rooms and modal of automatic and manual working
  createNewRoomSidebar() {
    this.store.dispatch(LiveKitRoomActions.BreakoutActions.createNewRoom());
  }

  /**
   * Toggles the visibility of the participants list for a specific breakout room.
   *
   * This function dispatches the toggleParticipantsList action, passing the index of the room
   * to update the state of the participant list for the specified breakout room.
   *
   * @function
   * @param {number} index - The index of the breakout room whose participant list visibility is to be toggled.
   * @returns {void} - No return value.
   */

  toggleParticipantsList(index: number): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.toggleParticipantsList({ index })
    );
  }

  /**
   * Adds or removes a participant to/from a breakout room based on selection.
   *
   * This function handles the logic for selecting or deselecting participants from a breakout room.
   * If the participant is selected (checked), the participant is added to the room. If deselected,
   * the participant is removed from the room.
   *
   * @function
   * @param {any} room - The breakout room object containing the room details, including roomName.
   * @param {any} participant - The participant object representing the selected participant.
   * @param {Event} event - The event object representing the change in selection (checked/unchecked).
   * @returns {void} - No return value.
   */
  onParticipantSelected(room: any, participant: any, event: any): void {
    const roomName = room.roomName;
    if (event.target.checked) {
      this.store.dispatch(
        LiveKitRoomActions.BreakoutActions.addParticipantToRoom({
          roomName,
          participantId: participant.identity,
        })
      );
    } else {
      this.store.dispatch(
        LiveKitRoomActions.BreakoutActions.removeParticipant({
          roomName,
          participantId: participant.identity,
        })
      );
    }
  }

  toggleRoomAccordion(index: number) {
    this.isRoomAccordionOpen[index] = !this.isRoomAccordionOpen[index];
  }

  onRoomSelection(room: any, participant: any) {
    const selectedRoomName = room.roomName;
    if (selectedRoomName) {
      this.store.dispatch(
        LiveKitRoomActions.BreakoutActions.addParticipantToRoom({
          roomName: selectedRoomName,
          participantId: participant.identity,
        })
      );
      console.log(
        `Participant ${participant.identity} assigned to room ${selectedRoomName}`
      );
    }
  }

  /**
   * Returns a list of participants who are not assigned to any breakout room.
   *
   * This function filters through the list of remote participants and returns only those who
   * are not already assigned to any breakout room. It compares each participant's identity
   * with the list of assigned participants in breakoutRoomsData.
   *
   * @function
   * @param {any} room - The breakout room object (not directly used in filtering, but relevant for context).
   * @returns {any[]} - An array of participants who are available (not assigned to any breakout room).
   */
  getAvailableParticipants(room: any): any[] {
    const assignedParticipants = this.breakoutRoomsData.reduce(
      (acc: any[], r: any) => acc.concat(r.participantIds),
      []
    );
    return this.remoteParticipantNames.filter(
      (participant: any) => !assignedParticipants.includes(participant.identity)
    );
  }

  /**
   * Checks if a participant is assigned to a specific breakout room.
   *
   * This function checks if the participant's identity exists in the list of assigned participant IDs
   * for the specified breakout room. It returns true if the participant is assigned to the room,
   * otherwise false.
   *
   * @function
   * @param {any} room - The breakout room object containing a list of participant IDs.
   * @param {any} participant - The participant object representing the participant to check.
   * @returns {boolean} - true if the participant is assigned to the room, false otherwise.
   */
  isParticipantAssigned(room: any, participant: any): boolean {
    return room.participantIds.includes(participant.identity);
  }

  /**
   * Dispatches an action to open that modal which send message from host to breakout room.
   *
   * @function
   * @return {void}
   */
  openHostToBrMsgModal() {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.openHostToBrMsgModal()
    );
  }
  /**
   * Dispatches an action to close that modal which send message from host to breakout room.
   * When close the modal, clears the message content as well as selected breakout rooms.
   * @function
   * @return {void}
   */
  closeHostToBrMsgModal() {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeHostToBrMsgModal()
    );
    this.messageContent = '';
    this.selectedBreakoutRoom = '';
  }
  // ===================pip window styling starting from here===================

  /**
   * Enters Picture-in-Picture (PiP) mode for the video player.
   *
   * This function attempts to enable PiP mode for the video player by creating a new PiP window and
   * copying the styles and content of the main player container into it. It also observes the main
   * player container for changes and updates the PiP window accordingly. It listens for the pagehide
   * event to clean up when PiP mode is exited.
   *
   * @async
   * @function
   * @returns {Promise<void>} - A promise that resolves when PiP mode has been successfully activated.
   */
  // async enterPiP() {
  //   this.pipMode = true;
  //   // if (this.pipWindow) {
  //   //   this.showModal = true;
  //   // }

  //   const playerContainer = this?.playerContainer?.nativeElement;
  //   const mainScreenShareContainer = this?.screensharePiP?.nativeElement;
  //   //   // Store the original parent and next sibling of playerContainer
  //   this.originalParent = playerContainer?.parentElement;
  //   this.originalNextSibling = playerContainer?.nextSibling;

  //   if ((window as any).documentPictureInPicture) {
  //     const pipOptions = {
  //       width: 300,
  //       height: 500,
  //     };

  //     try {
  //       this.pipWindow = await (
  //         window as any
  //       )?.documentPictureInPicture?.requestWindow(pipOptions);
  //       playerContainer.style.height = '75vh';
  //       playerContainer.style.overflow = 'hidden';
  //       // const pipBody = this.pipWindow.document.body;

  //       // pipVideoLayout.style.overflow = 'hidden';
  //       // Copy over initial styles and elements to the PiP window
  //       this.copyStylesToPiP();
  //       this.updatePiPWindow();
  //       // Listen for any changes in the main participant container
  //       // Create a MutationObserver to update the PiP window
  //       const observerPlayerContainer = new MutationObserver(() => {
  //         this.updatePiPWindow(); // Update PiP window when mutation happens in playerContainer
  //       });

  //       const observerScreenShareContainer = new MutationObserver(() => {
  //         this.updatePiPWindow(); // Update PiP window when mutation happens in mainScreenShareContainer
  //       });

  //       // Observe playerContainer and mainScreenShareContainer separately
  //       observerPlayerContainer.observe(playerContainer, {
  //         childList: true,
  //         subtree: true,
  //       });
  //       observerScreenShareContainer.observe(mainScreenShareContainer, {
  //         childList: true,
  //         subtree: true,
  //       });

  //       // Clean up when PiP mode is exited
  //       this.pipWindow.addEventListener(
  //         'pagehide',
  //         () => {
  //           // Disconnect both observers
  //           observerPlayerContainer.disconnect();
  //           observerScreenShareContainer.disconnect();

  //           // Remove the PiP-specific inline styles only
  //           const currentStyle = mainScreenShareContainer.getAttribute('style');

  //           // Check if the attribute includes our PiP styles and remove them
  //           if (currentStyle) {
  //             const newStyle = currentStyle
  //               .replace('--lk-control-bar-height: 380px;', '')
  //               .replace('padding: 10px;', '')
  //               .replace('width: 93%;', '')
  //               .replace(
  //                 'height: calc(100% - var(--lk-control-bar-height));',
  //                 ''
  //               );
  //             if (newStyle.trim()) {
  //               this.renderer.setAttribute(
  //                 mainScreenShareContainer,
  //                 'style',
  //                 newStyle.trim()
  //               );
  //             } else {
  //               this.renderer.removeAttribute(
  //                 mainScreenShareContainer,
  //                 'style'
  //               );
  //             }
  //           }
  //           this.onLeavePiP(); // Perform any PiP exit cleanup
  //         },
  //         { once: true }
  //       );
  //     } catch (error) {
  //       console.error('Error entering PiP mode:', error);
  //     }
  //   } else {
  //     console.error(
  //       'documentPictureInPicture API is not available in this browser.'
  //     );
  //   }
  // }

  /**
   * Copies styles from the main document to the PiP window.
   *
   * This function copies over all stylesheets from the main document to the PiP window. It ensures that
   * the PiP window inherits the same styles as the main player container by appending the necessary
   * styles or links to the PiP window's document head.
   *
   * @function
   * @returns {void}
   */
  // copyStylesToPiP() {
  //   if (!this.pipWindow) return;

  //   Array.from(document.styleSheets).forEach((styleSheet) => {
  //     try {
  //       const cssRules = Array.from(styleSheet.cssRules)
  //         .map((rule) => rule.cssText)
  //         .join('');
  //       const styleEl = this.renderer.createElement('style');
  //       this.renderer.setProperty(styleEl, 'textContent', cssRules);

  //       this.renderer.appendChild(this.pipWindow!.document.head, styleEl);
  //     } catch (e) {
  //       if (styleSheet.href) {
  //         const linkEl = this.renderer.createElement('link');
  //         this.renderer.setAttribute(linkEl, 'rel', 'stylesheet');
  //         this.renderer.setAttribute(linkEl, 'href', styleSheet.href);
  //         this.renderer.appendChild(this.pipWindow!.document.head, linkEl);
  //       }
  //     }
  //   });
  // }

  /**
   * Updates the content and layout of the PiP window.
   *
   * This function clones the current state of the main player container and its header, appends them to
   * the PiP window, and reattaches any necessary event listeners to the buttons in the cloned header.
   * It updates the PiP window with the latest content from the main player container.
   *
   * @function
   * @returns {void}
   */

  // updatePiPWindow() {
  //   console.log('updatePiPWindow called'); // Debugging log

  //   if (!this.pipWindow) return;
  //   this.showModal = true;

  //   const mainContainer = this.playerContainer?.nativeElement;
  //   const mainScreenShareContainer = this.screensharePiP?.nativeElement;
  //   const pipBody = this.pipWindow.document.body;

  //   // Clear existing content in the PiP window
  //   pipBody.innerHTML = '';

  //   // Clone the current state of the main container into the PiP window
  //   const clonedContainer = mainContainer.cloneNode(true) as HTMLElement;
  //   // Clone the modal (if present) into the PiP window
  //   // const modalElement = document.querySelector('#pipModal') as HTMLElement; // Update with your modal's ID or class
  //   const modalElement = this.pipModal.nativeElement;
  //   if (modalElement) {
  //     modalElement.remove();
  //     const clonedModal = modalElement.cloneNode(true) as HTMLElement;
  //     pipBody.appendChild(clonedModal);
  //     // Remove the modal from the main DOM
  //     // this.renderer.setStyle(this.pipModal.nativeElement, 'display', 'none');
  //     // Attach event listeners for modal buttons
  //     const allowButton = clonedModal.querySelector('#allowButton'); // Replace with the ID or selector of your allow button
  //     const cancelButton = clonedModal.querySelector('#cancelButton'); // Replace with the ID or selector of your cancel button

  //     if (allowButton) {
  //       // Attach the click event
  //       this.renderer.listen(allowButton, 'click', () => {
  //         console.log('Allow button clicked in PiP modal!');
  //         this.allowPiP(); // Call the allowPiP function
  //       });
  //     }

  //     if (cancelButton) {
  //       // Attach the click event
  //       this.renderer.listen(cancelButton, 'click', () => {
  //         console.log('Cancel button clicked in PiP modal!');
  //         this.cancelPiP(); // Call the cancelPiP function
  //       });
  //     }
  //   }
  //   // Clone the header from the main document (ng-container with pip header buttons)
  //   const pipContainer = this.pipContainer.nativeElement;
  //   const clonedHeader = pipContainer?.cloneNode(true) as HTMLElement;

  //   const isScreenSharingActive =
  //     this.livekitService.isScreenSharingEnabled ||
  //     this.livekitService.remoteScreenShare;
  //   // Check if screen sharing is active and clone #screensharePiP if so
  //   if (isScreenSharingActive) {
  //     const screenSharePiPElment = this.screensharePiP?.nativeElement;
  //     if (screenSharePiPElment && this.pipWindow) {
  //       this.renderer.setAttribute(
  //         screenSharePiPElment,
  //         'style',
  //         `
  //         --lk-control-bar-height: 380px;
  //         padding: 10px;
  //         width: 93%;
  //         height: calc(100% - var(--lk-control-bar-height));
  //       `
  //       );
  //     }
  //     const clonedScreenShare = screenSharePiPElment?.cloneNode(
  //       true
  //     ) as HTMLElement;

  //     pipBody.appendChild(clonedScreenShare);
  //   }
  //   // Append the cloned player container to the PiP window body
  //   pipBody.appendChild(clonedContainer);
  //   // Append the cloned header to the PiP window body
  //   if (clonedHeader) {
  //     pipBody.appendChild(clonedHeader);
  //   }

  //   const pipVideoContainer = pipBody?.querySelector(
  //     '.screen-share-layout-wrapper'
  //   ) as HTMLDivElement;
  //   if (pipVideoContainer) {
  //     this.renderer.setStyle(pipVideoContainer, 'height', '53vh');
  //     this.renderer.setStyle(pipVideoContainer, 'margin-left', '0');
  //   }
  //   // pipVideoContainer.style.height = '53vh';
  //   const pipVideoLayout = pipBody?.querySelector(
  //     '.lk-grid-layout'
  //   ) as HTMLDivElement;
  //   if (pipVideoLayout) {
  //     this.renderer.setStyle(pipVideoLayout, 'overflow', 'hidden');
  //   }

  //   // Get all screenshare elements with class '.pip-video' inside the PiP window
  //   const pipScreenShareElements = pipBody?.querySelectorAll(
  //     '.pip-screenShare'
  //   ) as NodeListOf<HTMLVideoElement>;

  //   const originalScreenShareElements =
  //     mainScreenShareContainer?.querySelectorAll(
  //       '.pip-screenShare'
  //     ) as NodeListOf<HTMLVideoElement>;
  //   // Ensure there are corresponding screen share elements in both the PiP window and the main container
  //   if (
  //     pipScreenShareElements.length > 0 &&
  //     originalScreenShareElements.length > 0
  //   ) {
  //     pipScreenShareElements.forEach((pipScreenShareElement, index) => {
  //       const originalScreenShareElement = originalScreenShareElements[index];
  //       if (originalScreenShareElement) {
  //         pipScreenShareElement.srcObject =
  //           originalScreenShareElement.srcObject;
  //         pipScreenShareElement.play().catch((error) => {
  //           console.error('Error playing PiP video:', error);
  //         });
  //       }
  //     });
  //   } else {
  //     console.warn('Screen share elements not found in PiP or main container.');
  //   }

  //   // Get all video elements with class '.pip-video' inside the PiP window
  //   const pipVideoElements = pipBody.querySelectorAll(
  //     '.pip-video'
  //   ) as NodeListOf<HTMLVideoElement>;

  //   // Get all original video elements with class '.pip-video' from the main container
  //   const originalVideoElements = mainContainer.querySelectorAll(
  //     '.pip-video'
  //   ) as NodeListOf<HTMLVideoElement>;

  //   // If there are video elements in both PiP window and main container
  //   if (pipVideoElements.length > 0 && originalVideoElements.length > 0) {
  //     // Loop through each pip video element and assign the corresponding original video stream
  //     pipVideoElements.forEach((pipVideoElement, index) => {
  //       const originalVideoElement = originalVideoElements[index];
  //       if (originalVideoElement) {
  //         pipVideoElement.srcObject = originalVideoElement.srcObject;
  //         pipVideoElement.play().catch((error) => {
  //           console.error('Error playing PiP video:', error);
  //         });
  //       }
  //     });
  //   }

  //   // Manually reattach event listeners to each button in the cloned header
  //   const buttons = clonedHeader.querySelectorAll('button');
  //   console.log('Buttons in PiP header:', buttons.length); // Debugging log

  //   buttons.forEach((button: HTMLElement) => {
  //     const tooltipText = button.getAttribute('matTooltip');
  //     const iconElement = button.querySelector('i');

  //     // Observable subscriptions to automatically update the icons in PiP
  //     if (tooltipText === 'Video') {
  //       this.liveKitViewState$.subscribe((viewState) => {
  //         iconElement?.classList.toggle('fa-video', viewState.isVideoOn);
  //         iconElement?.classList.toggle('fa-video-slash', !viewState.isVideoOn);
  //       });
  //       this.renderer.listen(button, 'click', () => {
  //         console.log('Video button clicked!');
  //         this.toggleVideo();
  //       });
  //     } else if (tooltipText === 'Mic') {
  //       this.liveKitViewState$.subscribe((viewState) => {
  //         iconElement?.classList.toggle('fa-microphone', viewState.isMicOn);
  //         iconElement?.classList.toggle(
  //           'fa-microphone-slash',
  //           !viewState.isMicOn
  //         );
  //       });
  //       this.renderer.listen(button, 'click', () => {
  //         console.log('Mic button clicked!');
  //         this.toggleMic();
  //       });
  //     } else if (tooltipText === 'Raise Hand') {
  //       this.renderer.listen(button, 'click', () => {
  //         console.log('Raise Hand button clicked!');
  //         this.toggleRaiseHand();
  //       });
  //     } else if (tooltipText === 'Leave_Meeting') {
  //       this.renderer.listen(button, 'click', () => {
  //         console.log('Leave button clicked!');
  //         this.leaveMeetingRoom();
  //       });
  //     }
  //   });
  // }

  /**
   * Exits Picture-in-Picture (PiP) mode and restores the player container.
   *
   * This function cleans up the PiP mode by restoring the player container to its original position in
   * the document. It also removes the PiP-specific styles and closes the PiP window.
   *
   * @function
   * @returns {void}
   */
  // onLeavePiP() {
  //   if (!this.pipWindow) return;

  //   const playerContainer = this.playerContainer.nativeElement;

  //   // Re-append playerContainer back to its original parent and position
  //   if (this.originalParent) {
  //     if (this.originalNextSibling) {
  //       this.originalParent.insertBefore(
  //         playerContainer,
  //         this.originalNextSibling
  //       );
  //     } else {
  //       this.originalParent.appendChild(playerContainer);
  //     }
  //   }

  //   playerContainer.classList.remove('pip-mode');
  //   this.pipMode = false;
  //   this.pipWindow.close();
  //   this.pipWindow = null;
  // }

  // allowPiP() {
  //   // if (this.pipWindow) {
  //   //   this.showModal = false;
  //   //   this.updatePiPWindow();
  //   // }
  //   this.showModal = false;
  //   if (this.pipWindow) {
  //     const pipBody = this.pipWindow.document.body;

  //     // Hide the modal in PiP window
  //     const modalElement = this.pipModal.nativeElement;
  //     if (modalElement) {
  //       modalElement.style.display = 'none';
  //     }

  //     // Proceed with interaction restrictions
  //     this.updatePiPWindow(); // Update PiP content
  //   }
  // }

  // cancelPiP() {
  //   this.showModal = false; // Hide the modal
  //   if (this.pipWindow) {
  //     this.pipWindow.close(); // Close PiP window
  //     this.pipWindow = null;
  //     this.pipMode = false;
  //   }
  // }

  /**
   * Toggles between speaker mode and grid view layout in the LiveKit service.
   *
   * - When enabling speaker mode, it highlights the current active speaker.
   * - When disabling, it switches back to the default grid view layout.
   */
  speakerMode() {
    this.livekitService.speakerModeLayout =
      !this.livekitService.speakerModeLayout;
    console.log('Speaker mode toggled:', this.livekitService.speakerModeLayout);

    if (this.livekitService.speakerModeLayout) {
      // Highlight the initial speaker in speaker mode
      this.livekitService.showInitialSpeaker();
    } else {
      // Revert to grid view layout
      this.livekitService.switchSpeakerViewLayout();
    }
  }

  /**
   * Checks if there are any remote participants currently connected to the LiveKit room.
   *
   * @returns {boolean} - `true` if there are remote participants, otherwise `false`.
   */
  hasRemoteParticipants(): boolean {
    return (
      Array.from(this.livekitService.room.remoteParticipants.values()).length >
      0
    );
  }

  // leaveBreakoutRoomAndJoinMainRoom(): void {
  //   // Step 1: Leave the breakout room
  //   this.leaveCurrentMeeting().then(() => {
  //     console.log('Left breakout room');
  //     // Step 2: Re-join the main room
  //     this.joinMainRoom();
  //   });
  // }

  leaveBreakoutRoomAndJoinMainRoom(): void {
    this.redirectionMessage =
      'Please wait while we redirect you to the main room.';
    console.log('Showing redirection modal');
    this.isRedirectionModalVisible = true;

    this.leaveCurrentMeeting()
      .then(() => {
        console.log('Left breakout room successfully');
        this.joinMainRoom();
      })
      .catch((error) => {
        console.error('Error while leaving breakout room:', error);
      })
      .finally(() => {
        console.log('Hiding redirection modal');
        setTimeout(() => {
          this.isRedirectionModalVisible = false;
        }, 2000);
      });
    this.isLeaveAccordionOpen = false;
    clearInterval(this.timerInterval);
    this.showCloseRoomModal = false;
    this.isBreakoutRoom = '';
  }
  // Function to re-join the main room
  joinMainRoom(): void {
    // const mainRoomName = 'test-room';
    const mainRoomName = this.roomName;
    console.log('main room name', mainRoomName);
    this.store.dispatch(
      LiveKitRoomActions.MeetingActions.createMeeting({
        participantNames: [this.participantName],
        roomName: mainRoomName,
      })
    );
    console.log('Joined main room');
  }
  leaveBtnAccordion() {
    this.isLeaveAccordionOpen = !this.isLeaveAccordionOpen;
  }

  startCountdown() {
    this.timerInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.timerInterval);
        this.leaveBreakoutRoomAndJoinMainRoom(); // Automatically leave when countdown ends
      }
    }, 1000);
  }
  // Host sends "close-room" message
  closeAllBreakoutRooms() {
    this.livekitService.sendCloseAlertToBreakoutRooms();
    console.log('Close all breakout rooms button clicked');
  }

  async toggleCamera() {
    try {
      if (this.isVideoOn) {
        // Turn off the camera
        this.stopVideoStream();
      } else {
        // Turn on the camera
        await this.startVideoStream();
      }
      this.livekitService.toggleVideo().subscribe(
        (isVideoOn) => {
          this.isVideoOn = isVideoOn;
          console.log('Video turned on by default:', isVideoOn);
        },
        (error) => {
          console.error('Error enabling video by default:', error);
        }
      );
      this.isVideoOn = !this.isVideoOn;
      this.store.dispatch(
        LiveKitRoomActions.LiveKitActions.previewCameraEnable({
          isPreviewVideo: this.isVideoOn,
        })
      );
      this.liveKitViewState$.subscribe((video) => {
        video.isVideoOn = this.isVideoOn;
      });
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  }

  async startVideoStream() {
    try {
      // Request video access
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      console.log('Video element:', this.videoElement);
      console.log('Video stream:', this.videoStream);

      if (this.videoElement && this.videoStream) {
        const video = this.videoElement.nativeElement;

        // Attach stream to video element
        video.srcObject = this.videoStream;

        // Ensure video starts playing
        await video.play();
        console.log('Video is playing');
      } else {
        console.warn('Video element or stream is not available');
      }
    } catch (error) {
      console.error('Error accessing video stream:', error);
    }
  }

  stopVideoStream() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }

    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      video.srcObject = null; // Detach stream
    }
  }

  async togglePreviewMic() {
    try {
      this.livekitService.toggleMicrophone().subscribe(
        (isMicOn) => {
          this.isMicOn = isMicOn;
          console.log('Video turned on by default:', isMicOn);
        },
        (error) => {
          console.error('Error enabling video by default:', error);
        }
      );
      this.isMicOn = !this.isMicOn;
      this.store.dispatch(
        LiveKitRoomActions.LiveKitActions.previewMicEnable({
          isPreviewMic: this.isMicOn,
        })
      );
      this.liveKitViewState$.subscribe((mic) => {
        mic.isMicOn = this.isMicOn;
      });
    } catch (error) {
      console.error('Error toggling Mic:', error);
    }
  }
}
