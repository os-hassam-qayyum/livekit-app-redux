import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  Track,
} from 'livekit-client';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import {
  isBreakoutModalOpen,
  selectAllMessages,
  selectBreakoutSideWindowVisible,
  selectChatSideWindowVisible,
  selectIconColor,
  selectIsMeetingStarted,
  selectIsMicOn,
  selectIsScreenSharing,
  selectIsVideoOn,
  selectParticipantSideWindowVisible,
  selectUnreadMessagesCount,
} from './+state/livekit/livekit-room.selectors';
import * as LiveKitRoomActions from './+state/livekit/livekit-room.actions';
import { LivekitService } from './livekit.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

const GRIDCOLUMN: { [key: number]: string } = {
  1: '1fr',
  2: '1fr 1fr',
  3: '1fr 1fr',
  4: '1fr 1fr',
  5: '1fr 1fr 1fr',
  6: '1fr 1fr 1fr',
};
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  //////////////////////////////////////////
  isHostToBrMsgModalOpen: boolean = false;
  participantName: string = '';
  // websocket variables
  webSocketStatus: 'connected' | 'reconnecting' | 'disconnected' =
    'disconnected';
  private statusSubscription!: Subscription;
  // selectors
  allMessagesToMainRoom: any[] = [];
  isMsgModalOpen = false;
  isMeetingStarted$!: Observable<boolean>;
  allMessages$!: Observable<any[]>;
  unreadMessagesCount$!: Observable<number>;
  isVideoOn$!: Observable<boolean>;
  isMicOn$!: Observable<boolean>;
  participantSideWindowVisible$!: Observable<boolean>;
  breakoutSideWindowVisible$!: Observable<boolean>;
  chatSideWindowVisible$!: Observable<boolean>;
  isScreenSharing$!: Observable<boolean>;
  iconColor$!: Observable<string>;
  isBreakoutModal$!: Observable<boolean>;
  // iconColor = 'black';
  selectedParticipants: { [roomIndex: number]: string[] } = {};
  // =========mic adjustment ======
  @ViewChild('audioCanvas', { static: true })
  micCanvasRef!: ElementRef<HTMLCanvasElement>;
  private micCanvas!: HTMLCanvasElement;
  isMicOn = false;
  private micCtx!: CanvasRenderingContext2D;
  private micAnalyzer!: AnalyserNode;
  private audioCtx!: AudioContext;
  private micBufferLength!: number;
  private micDataArray!: Uint8Array;
  private WIDTH = 1500;
  private HEIGHT = 1000;
  audioStream!: MediaStream;
  messageContent: string = '';
  breakoutRoomsData: any[] = [];
  previouslySubmittedRooms: string[] = [];
  selectedBreakoutRoom: string = '';
  breakoutRooms: {
    name: string;
    participants: string[];
    showParticipants: boolean;
  }[] = [];
  roomCounter: number = 1;
  // private subscriptions: Subscription[] = [];
  @ViewChild('messageContainer') messageContainer!: ElementRef;
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
  room!: Room;
  isModalOpen = false;
  isModalVisible: boolean = false;
  totalParticipants!: number;
  breakoutForm!: FormGroup;
  distributionMessage: string = '';
  hostName!: string | undefined;
  roomName: any;

  breakoutRoomTypes = [
    { value: 'automatic', viewValue: 'automatic' },
    { value: 'manual', viewValue: 'manual' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    public livekitService: LivekitService,
    private snackBar: MatSnackBar,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // this.livekitService.connectWebSocket();
    this.livekitService.audioVideoHandler();
    this.isMeetingStarted$ = this.store.pipe(select(selectIsMeetingStarted));
    this.isScreenSharing$ = this.store.pipe(select(selectIsScreenSharing));

    this.iconColor$ = this.store.pipe(select(selectIconColor));
    this.isVideoOn$ = this.store.pipe(select(selectIsVideoOn));
    this.participantSideWindowVisible$ = this.store.pipe(
      select(selectParticipantSideWindowVisible)
    );
    this.breakoutSideWindowVisible$ = this.store.pipe(
      select(selectBreakoutSideWindowVisible)
    );
    this.chatSideWindowVisible$ = this.store.pipe(
      select(selectChatSideWindowVisible)
    );
    this.allMessages$ = this.store.pipe(select(selectAllMessages));
    this.unreadMessagesCount$ = this.store.pipe(
      select(selectUnreadMessagesCount)
    );
    this.isMicOn$ = this.store.pipe(select(selectIsMicOn));
    this.isMicOn$.subscribe((isMicOn) => {
      console.log('Microphone status in UI:', isMicOn); // Debug
      // Update UI or handle mic toggle logic
    });
    // web socket
    this.statusSubscription = this.livekitService.webSocketStatus$.subscribe(
      (status) => {
        this.webSocketStatus = status;
        console.log('WebSocket status updated:', status); // Log the current WebSocket status
      }
    );
    this.isBreakoutModal$ = this.store.select(isBreakoutModalOpen);

    // ==============================
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
    this.chatSideWindowVisible$.subscribe((visible) => {
      if (visible) {
        this.unreadMessagesCount = 0;
        this.scrollToBottom();
      }
    });
    console.log('Updated alll chat messages:', this.allMessages);
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
          console.log('content', content);
          this.allMessagesToMainRoom.push(newMessage);
          this.isMsgModalOpen = true;
          console.log('Updated chat messages:', this.allMessagesToMainRoom);
        }
      });
    });
    this.livekitService.messageContentReceived.subscribe(
      (contentArray: any[]) => {
        // Update contentArray to be an array of objects
        console.log('Received message content array:', contentArray);
        // Map breakoutMessageContent to your chat data structure while filtering out invalid messages
        contentArray.forEach((content) => {
          // Check if the content is valid
          if (content.content && content.title === 'test-room') {
            const newMessage = {
              senderName: content.title, // Assuming title is used as senderName
              receivedMsg: content.content, // Actual message content
              receivingTime: new Date(content.timestamp), // Convert timestamp to Date object
              type: 'received',
            };

            // Check for duplicates
            const isDuplicate = this.allMessages.some((message) => {
              const messageTime = new Date(message.receivingTime); // Ensure it's a Date object
              return (
                message.receivedMsg === newMessage.receivedMsg &&
                message.senderName === newMessage.senderName &&
                messageTime.getTime() === newMessage.receivingTime.getTime()
              );
            });

            // Push valid messages into allMessages if not a duplicate
            if (!isDuplicate) {
              this.allMessages.push(newMessage);
              this.chatSideWindowVisible$.subscribe((visible) => {
                if (!visible) {
                  this.unreadMessagesCount++;
                  this.scrollToBottom();
                } else {
                  this.unreadMessagesCount = 0;
                }
              });
            }
          }
        });
        console.log('Updated chat messages:', this.allMessages);
      }
    );
    this.livekitService.msgDataReceived.subscribe((data) => {
      console.log('Participant Daata:', data);
      this.hostName = data.participant?.identity;

      if (data.message.handRaised === true) {
        // console.log(${data.participant} raised its hand);
        if (data.participant) {
          this.handRaiseStates[data.participant.identity] = true;
          this.openSnackBar(`${data.participant.identity} raised its hand`);
        }
      }
      if (data.message.type === 'breakoutRoom') {
        console.log('data from br is', data);

        console.log(
          'Breakout room created for participant:',
          data.participant?.identity
        );

        // Set the room name and host name in the modal
        this.roomName = data.message.roomName; // Room name received from the message
        this.hostName = data.participant?.identity; // The participant who received the invite

        this.showModal(); // Show the modal with the correct room information
      }

      if (data.message.handRaised === true) {
        // console.log(${data.participant} raised its hand);
        if (data.participant) {
          this.handRaiseStates[data.participant.identity] = true;
          this.openSnackBar(`${data.participant.identity} raised its hand`);
        }
      }
      if (data.message.handRaised === false) {
        // console.log(${data.participant} lowered its hand);
        if (data.participant) {
          this.handRaiseStates[data.participant.identity] = false;
          this.openSnackBar(`${data.participant.identity} lowered its hand`);
        }
      }
      if (
        data.message.type !== 'handRaise' &&
        data.message.type !== 'breakoutRoom' &&
        data.message.title !== 'test-room' &&
        data.message.content !== 'I need help'
      ) {
        const receivedMsg = data?.message?.message;
        const senderName = data?.participant?.identity;
        const receivingTime = data?.message?.timestamp;
        this.allMessages.push({
          senderName,
          receivedMsg,
          receivingTime,
          type: 'received',
        });
        this.chatSideWindowVisible$.subscribe((visible) => {
          if (!visible) {
            this.unreadMessagesCount++;
            this.scrollToBottom();
          }
        });

        this.scrollToBottom();
        this.sortMessages();
      }
    });
    this.livekitService.messageEmitter.subscribe((data: any) => {
      console.log('data', data);
      const sendMessage = data?.message;
      const sendingTime = data?.timestamp;
      this.allMessages.push({
        sendMessage,
        sendingTime,
        type: 'sent',
      });
      this.sortMessages();
      this.scrollToBottom();
    });

    this.attachedTrack = this.livekitService.attachTrackToElement(
      Track,
      'remoteVideoContainer'
    );
    this.livekitService.participantNamesUpdated.subscribe((names: any) => {
      this.remoteParticipantNames = names;
      this.totalParticipants = this.remoteParticipantNames.length;
      console.log(
        'Participant names updated:',
        this.remoteParticipantNames.length
      );
    });

    this.livekitService.localParticipantData.subscribe((data: any) => {
      this.localParticipant = data;
      // this.localParticipant = data.find((p: any) => p.isLocal);
      console.log('local Participant name updated:', this.localParticipant);
    });
    if ((window as any).Cypress) {
      (window as any).livekitService = this.livekitService;
    }
  }
  // Scrolls to the bottom after the view is updated
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  onRoomTypeChange() {
    const roomType = this.breakoutForm.get('roomType')?.value;

    if (roomType === 'automatic') {
      // Reset manual selection when switching to automatic
      this.breakoutForm.get('selectedParticipants')?.setValue([]);
    } else if (roomType === 'manual') {
      // Reset number of rooms when switching to manual
      this.breakoutForm.get('numberOfRooms')?.setValue('');
    }
  }

  calculateDistribution() {
    const numberOfRooms = this.breakoutForm.get('numberOfRooms')?.value;

    if (numberOfRooms > 0 && this.totalParticipants > 0) {
      const participantsPerRoom = Math.floor(
        this.totalParticipants / numberOfRooms
      );
      const remainder = this.totalParticipants % numberOfRooms;
      console.log('check', remainder);
      let message = '';

      if (remainder > 0) {
        message = `${remainder} room(s) will have ${
          participantsPerRoom + 1
        } participants. `;
        message += `${
          numberOfRooms - remainder
        } room(s) will have ${participantsPerRoom} participants.`;
      } else {
        message = `${numberOfRooms} room(s), each will have ${participantsPerRoom} participants.`;
      }

      this.distributionMessage = message;
    } else {
      this.distributionMessage =
        'Please enter valid number of rooms and participants.';
    }
  }
  /**
   * Initiates the start of a meeting by dispatching a `startMeeting` action
   * with the WebSocket URL and a dynamic token obtained from the form value.
   *
   * This function:
   * 1. Retrieves the token from the form value.
   * 2. Logs the token to the console.
   * 3. Defines the WebSocket URL.
   * 4. Dispatches the `startMeeting` action with the WebSocket URL and token.
   *
   * @async
   * @function
   * @returns {Promise<void>} - A promise that resolves when the meeting has been initiated.
   */
  async startMeeting() {
    this.store.dispatch(
      LiveKitRoomActions.createMeeting({
        // participantNames: crypto.randomUUID(),
        participantName: this.participantName,
        roomName: 'test-room',
      })
    );
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
   * Sorts the `allMessages` array in ascending order based on the message's timestamp.
   *
   * This function:
   * 1. Sorts messages by their `receivingTime` or `sendingTime` in ascending order.
   * 2. Modifies the `allMessages` array in place.
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
   * @param {number} index - The index of the message in the `allMessages` array.
   * @returns {boolean} - `true` if the avatar should be shown, otherwise `false`.
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
   * 2. Calls the `sendChatMessage` method of the LiveKit service with the message and recipient.
   * 3. Resets the chat form.
   *
   * @function
   * @returns {void}
   */
  sendMessage() {
    const msg = this.chatForm.value.message;
    const recipient = this.chatForm.value.participant;
    this.livekitService.sendChatMessage({ msg, recipient });

    this.chatForm.reset();
  }

  /**
   * Toggles the raise hand status of the local participant.
   *
   * This function:
   * 1. Checks the current hand raise status of the local participant.
   * 2. If the hand is raised, calls the `lowerHand` method of the LiveKit service.
   * 3. If the hand is not raised, calls the `raiseHand` method of the LiveKit service.
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
    } else {
      this.localParticipant.handRaised = true;
      this.livekitService.raiseHand(this.localParticipant);
      this.openSnackBar(`${this.localParticipant.identity} raised hand`);
      this.handRaiseStates[this.localParticipant.identity] = true;
    }
  }

  ngAfterViewInit(): void {
    this.screenShareTrackSubscription =
      this.livekitService.screenShareTrackSubscribed.subscribe(
        (track: RemoteTrack | undefined) => {
          // this.screenShareTrack = track.source === Track.Source.ScreenShare;
          // console.log('check condition', this.screenShareTrack);
          if (track && track.source === Track.Source.ScreenShare) {
            this.screenShareTrack = track;
            console.log('ss track', track);
          } else {
            this.screenShareTrack = undefined; // Reset to null if no screen share track
            console.log('else ss track', this.screenShareTrack);
          }
        }
      );
    this.livekitService.remoteVideoTrackSubscribed.subscribe(
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        this.livekitService.handleTrackSubscribed(
          track,
          publication,
          participant
        );
      }
    );
    this.livekitService.remoteAudioTrackSubscribed.subscribe(
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        this.livekitService.handleTrackSubscribed(
          track,
          publication,
          participant
        );
      }
    );
    this.micCanvas = this.micCanvasRef.nativeElement;
    this.micCtx = this.micCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.micCanvas.width = this.WIDTH;
    this.micCanvas.height = this.HEIGHT;
  }

  /**
   * Dispatches an action to leave the meeting.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async leaveBtn(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.leaveMeeting());
  }

  /**
   * Dispatches an action to toggle screen sharing.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleScreenShare(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.toggleScreenShare());
  }

  /**
   * Dispatches an action to toggle video.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleVideo(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.toggleVideo());
  }

  /**
   * Dispatches an action to toggle the microphone.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleMic(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.toggleMic());
    if (this.isMicOn) {
      this.stopAudioCapture();
    } else {
      await this.startAudioCapture();
    }
    this.isMicOn = !this.isMicOn;
  }

  async startAudioCapture(): Promise<void> {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.audioCtx = new AudioContext();
      this.micAnalyzer = this.audioCtx.createAnalyser();
      const source = this.audioCtx.createMediaStreamSource(this.audioStream);
      source.connect(this.micAnalyzer);

      this.micAnalyzer.fftSize = 1024;
      this.micBufferLength = this.micAnalyzer.frequencyBinCount;
      this.micDataArray = new Uint8Array(this.micBufferLength);

      this.drawMicData();
    } catch (err) {
      this.handleError(err);
    }
  }

  stopAudioCapture(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }

  handleError(err: any): void {
    console.error('You must give access to your mic in order to proceed', err);
  }
  private drawMicData(): void {
    this.micAnalyzer.getByteFrequencyData(this.micDataArray);
    this.micCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    const barWidth = (this.WIDTH / this.micBufferLength) * 7;
    let x = 0;

    for (let i = 0; i < this.micBufferLength / 2; i++) {
      const v = this.micDataArray[i] / 255;
      const barHeight = (v * this.HEIGHT) / 2;

      const gradient = this.micCtx.createLinearGradient(0, 0, 0, this.HEIGHT);
      gradient.addColorStop(0, '#00bfff');
      gradient.addColorStop(1, '#000080');

      this.micCtx.fillStyle = gradient;
      this.micCtx.fillRect(x, this.HEIGHT / 2 - barHeight, barWidth, barHeight);
      this.micCtx.fillRect(x, this.HEIGHT / 2, barWidth, barHeight);

      x += barWidth + 2;
    }

    requestAnimationFrame(() => this.drawMicData());
  }
  /**
   * Dispatches an action to toggle the participant side window.
   *
   * @function
   * @returns {void}
   */
  openParticipantSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.toggleParticipantSideWindow());
  }
  openPBreakoutSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.toggleBreakoutSideWindow());
  }

  /**
   * Dispatches an action to toggle the chat side window.
   * Resets the unread messages count and scrolls to the bottom if the chat window is visible.
   *
   * @function
   * @returns {void}
   */
  openChatSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.toggleChatSideWindow());

    this.chatSideWindowVisible$.subscribe((visible) => {
      if (visible) {
        this.unreadMessagesCount = 0;
        this.scrollToBottom();
      }
    });
  }

  /**
   * Dispatches an action to close the chat side window.
   *
   * @function
   * @returns {void}
   */
  closeChatSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.closeChatSideWindow());
  }

  /**
   * Dispatches an action to close the participant side window.
   *
   * @function
   * @returns {void}
   */
  closeParticipantSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.closeParticipantSideWindow());
  }

  closeBreakoutSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.closeBreakoutSideWindow());
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
    if (this.livekitService.room.numParticipants <= 6) {
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
        if (this.messageContainer) {
          this.messageContainer.nativeElement.scrollTop =
            this.messageContainer.nativeElement.scrollHeight;
        }
      }, 150);
    } catch (err) {
      console.error('Scroll error:', err);
    }
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
  get ScreenGalleryGridColumnStyle() {
    if (this.livekitService.screenShareCount <= 6) {
      return GRIDCOLUMN[this.livekitService.screenShareCount];
    } else {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }
  openBreakoutModal(): void {
    this.store.dispatch(LiveKitRoomActions.openBreakoutModal());
  }

  closeBreakoutModal(): void {
    this.store.dispatch(LiveKitRoomActions.closeBreakoutModal());
  }

  showModal(): void {
    this.isModalVisible = true;
  }

  // Hide the modal
  closeModal(): void {
    this.isModalVisible = false;
  }

  joinNow() {
    // Step 1: Leave the current room
    this.leaveCurrentMeeting().then(() => {
      // Step 2: Join the breakout room
      this.joinBreakoutRoom();
    });
  }

  // Step 1: Leave the current meeting
  leaveCurrentMeeting(): Promise<void> {
    return new Promise((resolve) => {
      this.store.dispatch(LiveKitRoomActions.leaveMeeting());
      resolve();
    });
  }

  // Step 2: Join the breakout room
  joinBreakoutRoom() {
    const breakoutRoomName = this.roomName;
    console.log('breakout room', this.roomName);

    this.store.dispatch(
      LiveKitRoomActions.createMeeting({
        participantName: this.participantName,
        roomName: breakoutRoomName,
      })
    );
    // Hide modal after dispatching
    this.isModalVisible = false;
  }

  async submitBreakoutForm(): Promise<void> {
    const roomType = this.breakoutForm.get('roomType')?.value;
    const numberOfRooms = this.breakoutForm.get('numberOfRooms')?.value;

    if (roomType === 'automatic' && numberOfRooms > 0) {
      const participants = this.remoteParticipantNames.map(
        (p: any) => p.identity
      );
      const rooms = this.splitParticipantsIntoRooms(
        participants,
        numberOfRooms
      );

      rooms.forEach((roomParticipants, index) => {
        const roomName = `Breakout-Room-${index + 1}`;

        // Check if the room already exists in the data
        let existingRoom = this.breakoutRoomsData.find(
          (room) => room.roomName === roomName
        );

        if (existingRoom) {
          // Add new participants to the existing room
          existingRoom.participantIds.push(
            ...roomParticipants.filter(
              (p) => !existingRoom.participantIds.includes(p)
            )
          );
        } else {
          // Create a new room if it doesn't exist
          this.breakoutRoomsData.push({
            participantIds: roomParticipants,
            roomName: roomName,
            type: 'automatic',
          });
        }

        // Send breakout room invitation for new participants only
        this.livekitService.breakoutRoomAlert(roomParticipants, roomName);
      });

      // Emit the updated breakout rooms data
      this.livekitService.breakoutRoomsDataUpdated.emit(this.breakoutRoomsData);
    } else if (roomType === 'manual') {
      if (this.breakoutRooms.length > 0) {
        this.breakoutRooms.forEach((room, index) => {
          const roomParticipants = room.participants;
          const roomName = `Breakout-Room-${index + 1}`;

          // Check if the room already exists in the data
          let existingRoom = this.breakoutRoomsData.find(
            (room) => room.roomName === roomName
          );

          if (existingRoom) {
            // Add new participants to the existing room
            roomParticipants.forEach((participant) => {
              if (!existingRoom.participantIds.includes(participant)) {
                existingRoom.participantIds.push(participant);
              }
            });
          } else {
            // Create a new room if it doesn't exist
            this.breakoutRoomsData.push({
              participantIds: roomParticipants,
              roomName: roomName,
              type: 'manual',
            });
          }

          // Send breakout room invitation for new participants only
          if (roomParticipants.length > 0) {
            this.livekitService.breakoutRoomAlert(roomParticipants, roomName);
          }
        });

        // Emit the updated breakout rooms data
        this.livekitService.breakoutRoomsDataUpdated.emit(
          this.breakoutRoomsData
        );
      }
    }

    console.log('Breakout room invitations sent');
    this.closeBreakoutModal();
  }

  resetForm(): void {
    // Reset the form back to its initial state
    this.breakoutForm.reset({
      roomType: '', // Optionally, set default values here
      numberOfRooms: null, // Reset the number of rooms field
    });

    // Clear breakoutRoomsData and other related states
    this.breakoutRooms = [];
    this.breakoutRoomsData = [];
    this.distributionMessage = '';
  }
  // Function to split participants into rooms
  splitParticipantsIntoRooms(participants: any[], numberOfRooms: number) {
    const rooms: any[][] = [];

    // Initialize empty arrays for each room
    for (let i = 0; i < numberOfRooms; i++) {
      rooms.push([]);
    }

    // Distribute participants across rooms
    participants.forEach((participant, index) => {
      const roomIndex = index % numberOfRooms;
      rooms[roomIndex].push(participant);
    });

    return rooms;
  }

  toggleParticipants(event: any, roomIndex: number) {
    this.breakoutRooms[roomIndex].showParticipants =
      !this.breakoutRooms[roomIndex].showParticipants;
  }

  // Add a participant to the room or remove them if unchecked
  onParticipantSelection(event: any, roomIndex: number) {
    const participantIdentity = event.target.value;
    const isChecked = event.target.checked;
    const room = this.breakoutRooms[roomIndex];
    room.name = `Breakout-Room-${roomIndex + 1}`;

    if (isChecked) {
      // Add participant to the room
      if (!room.participants.includes(participantIdentity)) {
        room.participants.push(participantIdentity);
      }
      console.log(
        `Added participant: ${participantIdentity} to room ${room.name}`
      );
      // Remove from available participants
      this.remoteParticipantNames = this.remoteParticipantNames.filter(
        (p: any) => p.identity !== participantIdentity
      );
    } else {
      // Move the participant back to available list
      this.remoteParticipantNames.push({ identity: participantIdentity });
      // Remove from assigned participants
      room.participants = room.participants.filter(
        (p) => p !== participantIdentity
      );
      console.log(
        `Removed participant: ${participantIdentity} from room ${this.breakoutRooms[roomIndex].name}`
      );
    }
  }

  // Unassign a participant from the room
  onUnassignParticipant(event: any, roomIndex: number) {
    const participantIdentity = event.target.value;
    const isChecked = event.target.checked;
    const room = this.breakoutRooms[roomIndex];

    if (!isChecked) {
      // Remove participant from the room
      room.participants = room.participants.filter(
        (p) => p !== participantIdentity
      );
      // Add back to available participants
      this.remoteParticipantNames.push({ identity: participantIdentity });
    }
  }

  createNewRoom(event: any) {
    const newRoomName = `Breakout-Room-${this.breakoutRooms.length + 1}`;
    this.breakoutRooms.push({
      name: newRoomName,
      participants: [],
      showParticipants: false,
    });
  }
  sendMessageToBreakoutRoom() {
    if (!this.selectedBreakoutRoom || !this.messageContent) {
      alert('Please select a breakout room and enter a message.');
      return;
    }

    this.livekitService.sendMessageToBreakoutRoom(
      this.selectedBreakoutRoom,
      this.messageContent
    );
    // Optionally clear the input field after sending
    this.messageContent = '';
  }

  async hostJoinNow() {
    console.log('Joining the existing breakout room...');

    // Step 1: Leave the current room (disconnect)
    await this.leaveBtn();

    // Step 2: Check if the room already exists in breakoutRoomsData
    const existingRoom = this.livekitService.breakoutRoomsData.find(
      (room: any) => room.roomName === this.roomName
    );

    if (existingRoom) {
      // Step 3: If the room exists, join it using the dispatch action
      console.log(`Room "${this.roomName}" exists, joining now...`);

      const participantName = this.localParticipant.identity;

      // Dispatch action to join the meeting (existing room)
      this.store.dispatch(
        LiveKitRoomActions.createMeeting({
          participantName: participantName, // Pass the list of participant names
          roomName: this.roomName, // Name of the existing breakout room
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
    this.isMsgModalOpen = !this.isMsgModalOpen;
  }

  sendHelpRequest() {
    const helpMessageContent = 'I need help';
    this.livekitService.sendMessageToMainRoom(
      this.roomName,
      helpMessageContent
    );
  }
  closeReceiveMsgModal() {
    this.isMsgModalOpen = !this.isMsgModalOpen;
  }

  submitUnallocatedParticipants() {
    if (this.breakoutRooms.length > 0) {
      this.breakoutRooms.forEach((room, index) => {
        const roomParticipants = room.participants;
        const roomName = `Breakout-Room-${index + 1}`;

        // Check if the room already exists in the data
        let existingRoom = this.breakoutRoomsData.find(
          (room) => room.roomName === roomName
        );

        if (existingRoom) {
          // Add new participants to the existing room
          roomParticipants.forEach((participant) => {
            if (!existingRoom.participantIds.includes(participant)) {
              existingRoom.participantIds.push(participant);
            }
          });
        } else {
          // Create a new room if it doesn't exist
          this.breakoutRoomsData.push({
            participantIds: roomParticipants,
            roomName: roomName,
            type: 'manual',
          });
        }

        // Send breakout room invitation for new participants only
        if (roomParticipants.length > 0) {
          this.livekitService.breakoutRoomAlert(roomParticipants, roomName);
        }
      });

      // Emit the updated breakout rooms data
      this.livekitService.breakoutRoomsDataUpdated.emit(this.breakoutRoomsData);
    }
  }
  openHostToBrMsgModal() {
    this.isHostToBrMsgModalOpen = true;
    console.log('helo');
  }

  closeHostToBrMsgModal() {
    this.isHostToBrMsgModalOpen = false;
    this.messageContent = '';
    this.selectedBreakoutRoom = '';
  }
}
