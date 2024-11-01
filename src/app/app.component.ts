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
import { async, map, Observable, Subscription, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import {
  isBreakoutModalOpen,
  isHostMsgModalOpen,
  isInvitationModalOpen,
  selectAllMessages,
  selectBreakoutRoomsData,
  selectBreakoutSideWindowVisible,
  selectChatSideWindowVisible,
  selectDistributionMessage,
  selectHelpMessageModal,
  selectIconColor,
  selectIsMeetingStarted,
  selectIsMicOn,
  selectIsScreenSharing,
  selectIsVideoOn,
  selectNextRoomIndex,
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
  selectedParticipants: { [roomIndex: number]: string[] } = {};
  // websocket variables
  webSocketStatus: 'connected' | 'reconnecting' | 'disconnected' =
    'disconnected';
  private statusSubscription!: Subscription;
  // selectors
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
  distributionMessage$!: Observable<any>;
  isBreakoutModal$!: Observable<boolean>;
  isInvitationModal$!: Observable<boolean>;
  isHelpMsgModal$!: Observable<boolean>;
  isHostMsgModal$!: Observable<boolean>;
  breakoutRoomsData$!: Observable<any[]>;
  nextRoomIndex$!: Observable<number>;
  remoteParticipantNames$!: Observable<{ [roomIndex: number]: string[] }>;
  // =========mic adjustment ======
  @ViewChild('audioCanvas', { static: true })
  audioCanvasRef!: ElementRef<HTMLCanvasElement>;
  messageContent: string = '';
  participantName: string = '';
  breakoutRoomsData: any[] = [];
  selectedBreakoutRoom = '';

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
  roomName: any;

  breakoutRoomTypes = [
    { value: 'automatic', viewValue: 'automatic' },
    { value: 'manual', viewValue: 'manual' },
  ];
  constructor(
    private formBuilder: FormBuilder,
    public livekitService: LivekitService,
    private snackBar: MatSnackBar,
    public store: Store
  ) {}

  ngOnInit() {
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

    // Expose livekitService for Cypress
    this.exposeLivekitServiceForCypress();
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
    this.isBreakoutModal$ = this.store.select(isBreakoutModalOpen);
    this.isInvitationModal$ = this.store.select(isInvitationModalOpen);
    this.isHostMsgModal$ = this.store.select(isHostMsgModalOpen);
    this.distributionMessage$ = this.store.select(selectDistributionMessage);
    this.breakoutRoomsData$ = this.store.select(selectBreakoutRoomsData);
    this.nextRoomIndex$ = this.store.select(selectNextRoomIndex);
    this.store.select(selectBreakoutRoomsData).subscribe((rooms) => {
      this.breakoutRoomsData = rooms;
    });
    this.isHelpMsgModal$ = this.store.select(selectHelpMessageModal);
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

    this.chatSideWindowVisible$.subscribe((visible) => {
      if (visible) {
        // this.unreadMessagesCount = 0;
        this.store.dispatch(
          LiveKitRoomActions.LiveKitActions.resetUnreadMessagesCount()
        );
        this.scrollToBottom();
      }
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
          if (content.content && content.title === 'test-room') {
            this.handleNewMessage(content);
          }
        });
      }
    );

    this.livekitService.msgDataReceived.subscribe((data) => {
      this.handleMsgDataReceived(data);
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
      this.chatSideWindowVisible$.subscribe((visible) => {
        if (!visible) {
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
      });
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

    if (
      data.message.type !== 'handRaise' &&
      data.message.type !== 'breakoutRoom' &&
      data.message.title !== 'test-room' &&
      // data.message.title !== this.roomName &&
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

  private updateUnreadMessageCount() {
    this.chatSideWindowVisible$.subscribe((visible) => {
      if (!visible) {
        this.store.dispatch(
          LiveKitRoomActions.LiveKitActions.updateUnreadMessagesCount({
            count: this.unreadMessagesCount + 1,
          })
        );
        this.scrollToBottom();
      }
    });
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
      this.livekitService.screenShareTrackSubscribed.subscribe(
        (track: RemoteTrack | undefined) => {
          if (track && track.source === Track.Source.ScreenShare) {
            this.screenShareTrack = track;
            console.log('ss track', track);
          } else {
            this.screenShareTrack = undefined; // Reset if no screen share track
            console.log('else ss track', this.screenShareTrack);
          }
        }
      );
    } else {
      console.error('screenShareTrackSubscribed is undefined');
    }
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
    this.livekitService.initCanvas(this.audioCanvasRef.nativeElement);
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
      LiveKitRoomActions.MeetingActions.createMeeting({
        participantNames: [this.participantName],
        roomName: 'test-room',
      })
    );
  }

  calculateDistribution() {
    const numberOfRooms = this.breakoutForm.get('numberOfRooms')?.value;
    const totalParticipants = this.totalParticipants;

    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.calculateDistribution({
        numberOfRooms,
        totalParticipants,
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

  /**
   * Dispatches an action to leave the meeting.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async leaveBtn(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.MeetingActions.leaveMeeting());
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
  }

  /**
   * Dispatches an action to toggle video.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleVideo(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.LiveKitActions.toggleVideo());
  }

  /**
   * Dispatches an action to toggle the microphone.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleMic(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.LiveKitActions.toggleMic());
    // this.livekitService.toggleMicrophone().subscribe((isMicOn: boolean) => {
    //   if (isMicOn) {
    //     this.livekitService.startAudioCapture();
    //   } else {
    //     this.livekitService.stopAudioCapture();
    //   }
    // });
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
    this.chatSideWindowVisible$.subscribe((visible) => {
      if (!visible) {
        this.store.dispatch(
          LiveKitRoomActions.LiveKitActions.resetUnreadMessagesCount()
        );
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
        this.messageContainer!.nativeElement.scrollTop =
          this.messageContainer!.nativeElement.scrollHeight;
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
  get ScreenGalleryGridColumnStyle() {
    if (this.livekitService.screenShareCount <= 6) {
      return GRIDCOLUMN[this.livekitService.screenShareCount];
    } else {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }

  openReceiveMsgModal() {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.openHelpMessageModal()
    );
  }

  closeReceiveMsgModal() {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeHelpMessageModal()
    );
    this.allMessagesToMainRoom = [];
  }

  openBreakoutModal(): void {
    this.store.dispatch(LiveKitRoomActions.BreakoutActions.openBreakoutModal());
  }

  closeBreakoutModal(): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeBreakoutModal()
    );
  }

  showInvitationModal(): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.openInvitationModal()
    );
  }

  closeInvitationModal(): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeInvitationModal()
    );
  }

  async submitBreakoutForm(): Promise<void> {
    const roomType = this.breakoutForm.get('roomType')?.value;
    const numberOfRooms = this.breakoutForm.get('numberOfRooms')?.value;

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
      console.log('Manual room selection initiated');

      // Dispatch action for manual room selection
      this.store.dispatch(
        LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection({
          roomType: 'manual',
        })
      );
    }

    console.log('Breakout room invitations sent');
    this.closeBreakoutModal();
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
      this.store.dispatch(LiveKitRoomActions.MeetingActions.leaveMeeting());
      resolve();
    });
  }

  // Step 2: Join the breakout room
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

  sendMessageToBreakoutRoom() {
    this.store.dispatch(
      LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
        breakoutRoom: this.selectedBreakoutRoom,
        messageContent: this.messageContent,
      })
    );
    this.closeHostToBrMsgModal();
  }

  // send helping message to host and then host join meeting to help participants in the breakout room
  async hostJoinNow() {
    // Step 1: Leave the current room (disconnect)
    await this.leaveBtn();
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

  // Function to submit breakout form
  //side window of the breakout rooms and modal of automatic and manual working
  createNewRoomSidebar() {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.initiateCreateNewRoom()
    );
  }

  toggleParticipantsList(index: number): void {
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.toggleParticipantsList({ index })
    );
  }

  onParticipantSelected(room: any, participant: any, event: any): void {
    const roomName = room.roomName;
    if (event.target.checked) {
      this.store.dispatch(
        LiveKitRoomActions.BreakoutActions.addParticipant({
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

  getAvailableParticipants(room: any): any[] {
    const assignedParticipants = this.breakoutRoomsData.reduce(
      (acc: any[], r: any) => acc.concat(r.participantIds),
      []
    );
    return this.remoteParticipantNames.filter(
      (participant: any) => !assignedParticipants.includes(participant.identity)
    );
  }

  isParticipantAssigned(room: any, participant: any): boolean {
    return room.participantIds.includes(participant.identity);
  }

  openHostToBrMsgModal() {
    // this.isHostToBrMsgModalOpen = true;
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.openHostToBrMsgModal()
    );
  }

  closeHostToBrMsgModal() {
    // this.isHostToBrMsgModalOpen = false;
    this.store.dispatch(
      LiveKitRoomActions.BreakoutActions.closeHostToBrMsgModal()
    );
    this.messageContent = '';
    this.selectedBreakoutRoom = '';
  }
}
