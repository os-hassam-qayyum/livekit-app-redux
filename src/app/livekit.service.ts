import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DataPacket_Kind,
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  ParticipantEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  setLogLevel,
  Track,
  TrackPublication,
  VideoQuality,
} from 'livekit-client';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BehaviorSubject,
  Observable,
  RetryConfig,
  Subject,
  from,
  of,
} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { MeetingService } from './meeting.service';

@Injectable({
  providedIn: 'root',
})
export class LivekitService {
  private roomNameSubject = new BehaviorSubject<string | null>(null);
  roomName$ = this.roomNameSubject.asObservable();
  activeSpeakers: Participant[] = []; // Track current active speakers
  speakerDevices: {
    kind: MediaDeviceKind;
    deviceId: string;
    label: string;
  }[] = []; // Combined list of audio devices
  currentSpeakerDeviceId: string = '';
  createdAvatars = new Set();
  selectedMicId: string = ''; // Selected microphone device ID
  selectedVideoId: string = ''; // Selected video device ID
  selectedSpeakerId: string = ''; // Selected video device ID
  devicesFetched: boolean = false; // Flag to indicate if devices have been fetched
  micDevices: {
    kind: MediaDeviceKind;
    deviceId: string;
    label: string;
  }[] = []; // Combined list of audio devices
  videoDevices: { kind: MediaDeviceKind; deviceId: string; label: string }[] =
    []; // Video devices
  // audio visualizer logic
  allParticipants: Array<{
    sid: string;
    videoSrc: any;
    identity: string;
  }> = [];
  private micCanvas!: HTMLCanvasElement;
  private micCtx!: CanvasRenderingContext2D;
  private micAnalyzer!: AnalyserNode;
  private audioCtx!: AudioContext;
  private micBufferLength!: number;
  private micDataArray!: Uint8Array;
  private WIDTH = 1500;
  private HEIGHT = 1000;
  audioStream!: MediaStream;
  isMicOn = false;
  speakerModeLayout = false;
  pipMode: boolean = false;
  // websocket variables
  // private webSocketUrl = 'wss://ws.postman-echo.com/raw';
  private webSocketUrl = 'wss://echo.websocket.org/';

  private socket$: WebSocketSubject<any> | undefined;
  // Declare the BehaviorSubject for WebSocket status
  private webSocketStatusSubject = new BehaviorSubject<
    'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');
  public webSocketStatus$: Observable<
    'connected' | 'disconnected' | 'reconnecting'
  > = this.webSocketStatusSubject.asObservable();
  private maxReconnectAttempts = 10;
  private reconnectAttempts = 0;
  /**
   * Represents the current room for the video conference.
   * @type {Room}
   */
  room!: Room;

  // /**
  //  * Event emitter for when a remote video track is subscribed.
  //  * @type {EventEmitter<RemoteTrack>}
  //  */
  // remoteVideoTrackSubscribed = new EventEmitter<RemoteTrack>();

  /**
   * Event emitter for when a remote video track is subscribed.
   * @type {subject<RemoteTrack>}
   */
  remoteVideoTrackSubscribed = new Subject<{
    track: RemoteTrack;
    publication: RemoteTrackPublication;
    participant: RemoteParticipant;
  }>();

  /**
   * The name of the remote participant.
   * @type {string}
   */
  remoteParticipantName: string = '';

  // /**
  //  * Event emitter for when a remote audio track is subscribed.
  //  * @type {EventEmitter<void>}
  //  */
  // remoteAudioTrackSubscribed = new EventEmitter<void>();

  /**
   * Event emitter for when a remote audio track is subscribed.
   * @type {subject<void>}
   */
  remoteAudioTrackSubscribed = new Subject<{
    track: RemoteTrack;
    publication: RemoteTrackPublication;
    participant: RemoteParticipant;
  }>();

  /**
   * Indicates whether screen sharing is enabled.
   * @type {boolean}
   */
  isScreenSharingEnabled = false;

  // /**
  //  * Event emitter for when the video status changes.
  //  * @type {EventEmitter<boolean>}
  //  */
  // videoStatusChanged = new EventEmitter<boolean>();

  /**
   * Event emitter for when the video status changes.
   * @type {BehaviorSubject<boolean>}
   */
  videoStatusChanged = new BehaviorSubject<boolean>(false);
  /**
   * Indicates whether the remote participant is sharing their screen.
   * @type {boolean}
   */
  // remoteParticipantSharingScreen!: boolean;

  /**
   * The number of participants in the room.
   * @type {number}
   */
  participants!: number;

  // /**
  //  * Event emitter for when a screen share track is subscribed.
  //  * @type {EventEmitter<any>}
  //  */
  // screenShareTrackSubscribed = new EventEmitter<any>();

  /**
   * Event emitter for when a screen share track is subscribed.
   * @type {subject<any>}
   */
  screenShareTrackSubscribed = new Subject<any>();

  /**
   * Indicates whether remote screen sharing is active.
   * @type {boolean}
   */
  remoteScreenShare = false;

  /**
   * A text encoder instance for encoding text.
   * @private
   * @type {TextEncoder}
   */
  // private encoder = new TextEncoder();

  /**
   * A text decoder instance for decoding text.
   * @type {TextDecoder}
   */
  decoder = new TextDecoder();

  /**
   * Event emitter for when participant names are updated.
   * @type {Subject<string[]>}
   */
  participantNamesUpdated = new Subject<string[]>();

  /**
   * Event emitter for local participant data.
   * @type {Subject<any>}
   */
  localParticipantData = new Subject<any>();

  /**
   * Holds participant names, used internally.
   * @private
   * @type {any}
   */
  public participantNames: any;

  /**
   * Holds local participant data, used internally.
   * @private
   * @type {any}
   */
  private loacalParticipant: any;

  /**
   * Event emitter for when the microphone status changes.
   * @type {Subject<boolean>}
   */
  microphoneStatusChanged = new Subject<boolean>();
  localScreenShareCount = 0;
  remoteScreenShareCount = 0;
  isExpanded: boolean = false;

  /**
   * Event emitter for when a message is received.
   * @type {subject<{ message: any; participant: RemoteParticipant | undefined }>}
   */
  msgDataReceived = new Subject<{
    message: any;
    participant: RemoteParticipant | undefined;
  }>();

  /**
   * Event emitter for when a participant raises or lowers their hand.
   * @type {subject<{ participant: RemoteParticipant | undefined; handRaised: boolean }>}
   */
  public handRaised = new Subject<{
    participant: RemoteParticipant | undefined;
    handRaised: boolean;
  }>();

  public breakoutRoom = new Subject<{
    participant: any;
    roomName: string;
  }>();
  public closeRoomAlert = new Subject<{
    participant: any;
    countdown: number;
  }>();
  breakoutRoomsData: Array<any> = [];
  breakoutRoomsDataUpdated: Subject<any[]> = new Subject<any[]>();
  /**
   * Event emitter for sending messages.
   * @type {Subject<any>}
   */
  messageEmitter = new Subject<any>();

  // Subjects to broadcast device changes
  private deviceListsSubject = new BehaviorSubject({
    videoDevices: [],
    micDevices: [],
    speakerDevices: [],
  });
  /**
   * Array of message objects containing sender, text, and timestamp information.
   * @type {{ sender: string; text: string; timestamp: Date }[]}
   */
  messages: { sender: string; text: string; timestamp: Date }[] = [];
  // Observable for components to subscribe to
  deviceLists$ = this.deviceListsSubject.asObservable();
  /**
   * Constructor for initializing the class.
   * @param {MatSnackBar} snackBar - The snack bar service for displaying notifications.
   */
  constructor(
    public snackBar: MatSnackBar,
    public meetingService: MeetingService
  ) {
    this.updateDeviceLists(); // Fetch initial devices
  }

  public breakoutRoomCounter = 0;
  public messageContentReceived: Subject<string[]> = new Subject<string[]>();
  public messageToMain: Subject<string[]> = new Subject<string[]>();
  // public messageContentReceived: EventEmitter<string[]> = new EventEmitter<
  //   string[]
  // >();
  // public messageToMain: EventEmitter<string[]> = new EventEmitter<string[]>();
  messageArray: string[] = [];
  messageArrayToMain: string[] = [];
  /**
   * Connects to a LiveKit room using the provided WebSocket URL and token.
   *
   * @async
   * @param {string} wsURL - The WebSocket URL for connecting to the room.
   * @param {string} token - The token used for authentication.
   * @returns {Promise<void>} A promise that resolves when the connection is established.
   */

  setRoomName(roomName: string) {
    this.roomNameSubject.next(roomName);
  }

  getRoomName() {
    return this.roomNameSubject.value;
  }
  async connectToRoom(wsURL: string, token: string): Promise<void> {
    // this.audioVideoHandler();
    await this.room.connect(wsURL, token);
    console.log('Connected to room', this.room);
    // this.connectWebSocket();
    // this.remoteVideoTrackSubscribed.asObservable;
    this.updateParticipantNames();
    this.remoteParticipantAfterLocal();
  }

  // connectWebSocket() {
  //   if (!this.socket$ || this.socket$.closed) {
  //     this.socket$ = webSocket({
  //       url: this.webSocketUrl,
  //       closeObserver: {
  //         next: () => {
  //           this.webSocketStatusSubject.next('disconnected');
  //           console.log('WebSocket connection closed');
  //           this.socket$ = undefined;
  //           this.triggerReconnectingState();
  //         },
  //       },
  //       openObserver: {
  //         next: () => {
  //           this.webSocketStatusSubject.next('connected');
  //           console.log('WebSocket connection established');
  //           this.reconnectAttempts = 0;
  //         },
  //       },
  //     });

  //     this.socket$.subscribe(
  //       (msg) => console.log('Received message:', msg),
  //       (err) => {
  //         console.error('WebSocket error:', err);
  //         this.webSocketStatusSubject.next('reconnecting');
  //         console.log('reconnecting...................');
  //         this.triggerReconnectingState();
  //         this.socket$ = undefined;
  //       },
  //       () => {
  //         console.log('WebSocket completed');
  //         this.webSocketStatusSubject.next('disconnected');
  //         this.triggerReconnectingState();
  //       }
  //     );
  //   } else {
  //     console.log('WebSocket connection already established');
  //   }
  // }

  // private triggerReconnectingState() {
  //   if (this.reconnectAttempts < this.maxReconnectAttempts) {
  //     const delay = this.calculateBackoffDelay(this.reconnectAttempts);
  //     this.webSocketStatusSubject.next('reconnecting');
  //     console.log(
  //       `Reconnecting in ${delay / 1000} seconds... (Attempt ${
  //         this.reconnectAttempts + 1
  //       })`
  //     );

  //     setTimeout(() => {
  //       this.reconnectAttempts++;
  //       console.log('Attempting to reconnect WebSocket...');
  //       this.connectWebSocket();
  //     }, delay);
  //   } else {
  //     console.log('Max reconnect attempts reached. Giving up.');
  //     this.webSocketStatusSubject.next('disconnected');
  //   }
  // }
  // private calculateBackoffDelay(attempt: number): number {
  //   const baseDelay = 1000; // Start with 1 second
  //   const maxDelay = 30000; // Cap the delay at 30 seconds
  //   const exponentialBackoffDelay = Math.min(
  //     baseDelay * Math.pow(2, attempt),
  //     maxDelay
  //   );
  //   return exponentialBackoffDelay;
  // }

  /**
   * Raises the hand for a given participant and publishes a hand raise message.
   *
   * @async
   * @param {object} participant - The participant object whose hand is to be raised.
   * @param {string} participant.identity - The unique identity of the participant.
   * @returns {Promise<void>} A promise that resolves when the hand raise message is published.
   */
  async raiseHand(participant: any) {
    participant.handRaised = true;
    const message = {
      type: 'handRaise',
      participantId: participant.identity,
      handRaised: true,
    };
    await this.publishHandRaiseLowerMessage(message);
  }

  /**
   * Raises the hand for a given participant and publishes a hand raise message.
   *
   * @async
   * @param {object} participant - The participant object whose hand is to be lowered.
   * @param {string} participant.identity - The unique identity of the participant.
   * @returns {Promise<void>} A promise that resolves when the hand lower message is published.
   */
  async lowerHand(participant: any) {
    participant.handRaised = false;
    const message = {
      type: 'handRaise',
      participantId: participant.identity,
      handRaised: false,
    };
    await this.publishHandRaiseLowerMessage(message);
  }

  /**
   * Publishes a hand raise/lower message to the room.
   *
   * @private
   * @async
   * @param {object} message - The message object containing the hand raise/lower information.
   * @param {string} message.type - The type of the message, e.g., 'handRaise' or 'handLower'.
   * @param {string} message.participantId - The unique identity of the participant.
   * @param {boolean} message.handRaised - Indicates if the hand is raised or lowered.
   * @returns {Promise<void>} A promise that resolves when the message is published.
   */
  private async publishHandRaiseLowerMessage(message: any) {
    const strData = JSON.stringify(message);
    const data = new TextEncoder().encode(strData);
    await this.room!.localParticipant.publishData(data, { reliable: true });
  }

  // async breakoutRoomAlert(participants: string[], roomName: string) {
  //   this.breakoutRoomCounter++;

  //   const message = {
  //     type: 'breakoutRoom',
  //     participantIds: participants, // The selected participants
  //     roomName: roomName,
  //   };
  //   console.log(`Publishing breakout room alert:`, message);
  //   await this.publishBreakoutRoom(message, participants);
  //   // Find if the room already exists in breakoutRoomsData
  //   const existingRoomIndex = this.breakoutRoomsData.findIndex(
  //     (room) => room.roomName === roomName
  //   );

  //   if (existingRoomIndex !== -1) {
  //     // If the room already exists, update its participantIds
  //     const existingRoom = this.breakoutRoomsData[existingRoomIndex];

  //     // Ensure no duplicate participants are added
  //     const updatedParticipants = [
  //       ...existingRoom.participantIds,
  //       ...participants.filter((p) => !existingRoom.participantIds.includes(p)),
  //     ];

  //     // Update the room with the new participant list
  //     this.breakoutRoomsData[existingRoomIndex] = {
  //       ...existingRoom,
  //       participantIds: updatedParticipants,
  //     };
  //   } else {
  //     // Store the room data for tracking
  //     this.breakoutRoomsData.push({
  //       participantIds: message.participantIds,
  //       roomName: message.roomName,
  //       type: message.type,
  //     });
  //   }

  //   // Emit the updated breakout rooms data
  //   this.breakoutRoomsDataUpdated.emit(this.breakoutRoomsData);
  //   console.log('checking help message', this.breakoutRoomsData);

  //   console.log(
  //     `Breakout room '${roomName}' assigned to participants: ${participants.join(
  //       ', '
  //     )}`
  //   );
  // }

  async breakoutRoomAlert(participants: string[], roomName: string) {
    this.breakoutRoomCounter++;

    const message = {
      type: 'breakoutRoom',
      participantIds: participants, // The selected participants
      roomName: roomName,
    };
    console.log(`Publishing breakout room alert:`, message);
    await this.publishBreakoutRoom(message, participants);
    // Find if the room already exists in breakoutRoomsData
    const existingRoomIndex = this.breakoutRoomsData.findIndex(
      (room) => room.roomName === roomName
    );

    if (existingRoomIndex !== -1) {
      // If the room already exists, update its participantIds
      const existingRoom = this.breakoutRoomsData[existingRoomIndex];

      // Ensure no duplicate participants are added
      const updatedParticipants = [
        ...existingRoom.participantIds,
        ...participants.filter((p) => !existingRoom.participantIds.includes(p)),
      ];

      // Update the room with the new participant list
      this.breakoutRoomsData[existingRoomIndex] = {
        ...existingRoom,
        participantIds: updatedParticipants,
      };
    } else {
      // Store the room data for tracking
      this.breakoutRoomsData.push({
        participantIds: message.participantIds,
        roomName: message.roomName,
        type: message.type,
      });
    }

    // Emit the updated breakout rooms data
    this.breakoutRoomsDataUpdated.next(this.breakoutRoomsData);
    console.log('checking help message', this.breakoutRoomsData);

    console.log(
      `Breakout room '${roomName}' assigned to participants: ${participants.join(
        ', '
      )}`
    );
  }

  async publishBreakoutRoom(message: any, recipientIds: string[]) {
    const strData = JSON.stringify(message);
    const data = new TextEncoder().encode(strData);

    // Make sure to pass the recipient IDs (selected participants)
    const destinationIdentities = recipientIds.length ? recipientIds : [];

    await this.room!.localParticipant.publishData(data, {
      reliable: true,
      destinationIdentities: destinationIdentities,
    });
  }

  /**
   * Disconnects from the current LiveKit room if connected.
   *
   * @returns {void}
   */
  // disconnectRoom() {
  //   if (this.room) {
  //     this.room.disconnect();
  //   }
  // }
  disconnectRoom() {
    return new Observable<void>((observer) => {
      if (this.room) {
        this.room.disconnect();
        observer.next();
        observer.complete();
      } else {
        observer.complete();
      }
    });
  }

  /**
   * Sends a chat message to a recipient or all participants in the room.
   *
   * @async
   * @param {object} message - The message object containing the chat details.
   * @param {string} message.msg - The content of the chat message.
   * @param {string} [message.recipient] - The optional recipient of the chat message. If not provided, the message is sent to all participants.
   * @returns {Promise<void>} A promise that resolves when the chat message is sent.
   * @throws {Error} Throws an error if the message sending fails.
   */
  async sendChatMessage(message: any) {
    try {
      // Encode message
      const strData = JSON.stringify({
        id: crypto.randomUUID(),
        message: message.msg,
        recipient: message.recipient,
        timestamp: Date.now(),
      });
      const data = new TextEncoder().encode(strData);
      const dataObj = JSON.parse(strData);

      const destinationIdentities = message.recipient
        ? [message.recipient]
        : [];
      // Publish data with recipient information
      await this.room.localParticipant.publishData(data, {
        reliable: true,
        destinationIdentities: destinationIdentities,
      });

      // Emit the message
      this.messageEmitter.next(dataObj);
      console.log('Message sent successfully:', dataObj);
    } catch (error: any) {
      console.error('Error sending message:', error);
      this.openSnackBar(`Send message Failed. ${error}`);
    }
  }

  remoteParticipantAfterLocal() {
    // also subscribe to tracks published before participant joined

    const remoteParticipants = Array.from(
      this.room.remoteParticipants.values()
    );
    remoteParticipants.forEach((participant) => {
      this.createAvatar(participant);
      const eachRemoteParticipant = Array.from(
        participant.trackPublications.values()
      );
      eachRemoteParticipant.forEach((publication) => {
        publication.setSubscribed(true);
      });
    });
  }
  /**
   * Handles audio and video events in the LiveKit room.
   *
   * @returns {void}
   */
  audioVideoHandler() {
    this.room = new Room();
    this.participants = this.room.numParticipants;

    console.log('total participants', this.participants);
    /**
     * Event triggered when the room is connected.
     * Creates an avatar for the local participant.
     *
     * @event RoomEvent.Connected
     */
    this.room.on(RoomEvent.Connected, () => {
      this.createAvatar(this.room.localParticipant);
    });

    /**
     * Event triggered when data is received.
     * Emits the received message and handles hand raise events.
     *
     * @event RoomEvent.DataReceived
     * @param {Uint8Array} payload - The data payload.
     * @param {RemoteParticipant} [participant] - The participant who sent the data.
     * @param {DataPacket_Kind} [kind] - The kind of data packet.
     */
    // this.room.on(
    //   RoomEvent.DataReceived,
    //   (
    //     payload: Uint8Array,
    //     participant: RemoteParticipant | undefined,
    //     kind: DataPacket_Kind | undefined
    //   ) => {
    //     const strData = this.decoder.decode(payload);
    //     const message = JSON.parse(strData);
    //     console.log('mesg', JSON.parse(strData));
    //     console.log('participant', participant);
    //     this.msgDataReceived.emit({ message, participant });
    //     if (message.type === 'handRaise') {
    //       this.handRaised.emit({
    //         participant: participant,
    //         handRaised: message.handRaised,
    //       });
    //     }
    //     if (message.type === 'breakoutRoom') {
    //       console.log(
    //         `Breakout room assigned: ${message.roomName} from host "${participant?.identity}"`
    //       );

    //       // Ensure the message is only sent to the intended participant
    //       if (participant) {
    //         this.breakoutRoom.emit({
    //           participant: participant,
    //           roomName: message.roomName, // Use the room name from the message
    //         });
    //       }
    //     }
    //     if (message.title === 'test-room') {
    //       console.log(`Received message in breakout room: ${message}`);

    //       // Add the new message content to the array
    //       this.messageArray.push(message);

    //       // Emit the updated message array
    //       this.messageContentReceived.emit(this.messageArray);
    //     } else {
    //       console.log(`Message not for this breakout room`);
    //     }
    //     //======
    //     if (message.title.includes('Breakout_Room')) {
    //       console.log(`Received message in main room: ${message}`);

    //       // Add the new message content to the array
    //       this.messageArrayToMain.push(message);

    //       // Emit the updated message array
    //       this.messageToMain.emit(this.messageArrayToMain);
    //     } else {
    //       console.log(`Message not for this main room`);
    //     }
    //   }
    // );
    this.room.on(
      RoomEvent.DataReceived,
      (
        payload: Uint8Array,
        participant: RemoteParticipant | undefined,
        kind: DataPacket_Kind | undefined
      ) => {
        const strData = this.decoder.decode(payload);
        const message = JSON.parse(strData);
        console.log('mesg', JSON.parse(strData));
        console.log('participant', participant);
        // Parse the content field if it exists
        if (message.content) {
          try {
            const parsedContent = JSON.parse(message.content);
            message.type = parsedContent.type;
            message.countdown = parsedContent.countdown;
          } catch (error) {
            console.error(
              'Failed to parse content field:',
              message.content,
              error
            );
          }
        }
        console.log('Processed Message:', message);
        // Use next() instead of emit()
        this.msgDataReceived.next({ message, participant });

        if (message.type === 'handRaise') {
          this.handRaised.next({
            participant: participant,
            handRaised: message.handRaised,
          });
        }

        if (message.type === 'breakoutRoom') {
          console.log(
            `Breakout room assigned: ${message.roomName} from host "${participant?.identity}"`
          );

          // Ensure the message is only sent to the intended participant
          if (participant) {
            this.breakoutRoom.next({
              participant: participant,
              roomName: message.roomName, // Use the room name from the message
            });
          }
        }
        if (message.type === 'closeRoomAlert') {
          console.log(
            `Close Room Alert received: Countdown = ${message.countdown}`
          );
          this.closeRoomAlert.next({
            participant: participant,
            countdown: message.countdown || 60,
          });
        }

        // if (message.title === 'test-room') {
        if (message.title === this.getRoomName()) {
          console.log(`Received message in breakout room: ${message}`);

          // Add the new message content to the array
          this.messageArray.push(message);

          // Emit the updated message array
          this.messageContentReceived.next(this.messageArray);
        } else {
          console.log(`Message not for this breakout room`);
        }

        //======
        if (message.title.includes(`${this.getRoomName()} Room`)) {
          console.log(`Received message in main room: ${message}`);

          // Add the new message content to the array
          this.messageArrayToMain.push(message);

          // Emit the updated message array
          this.messageToMain.next(this.messageArrayToMain);
        } else {
          console.log(`Message not for this main room`);
        }
      }
    );

    /**
     * Event triggered when a track is muted.
     *
     * @event RoomEvent.TrackMuted
     * @param {Track} track - The muted track.
     * @param {Participant} participant - The participant who muted the track.
     */
    this.room.on(RoomEvent.TrackMuted, this.handleTrackMuted.bind(this));
    /**
     * Event triggered when a track is unmuted.
     *
     * @event RoomEvent.TrackUnmuted
     * @param {Track} track - The unmuted track.
     * @param {Participant} participant - The participant who unmuted the track.
     */
    this.room.on(RoomEvent.TrackUnmuted, this.handleTrackUnmuted.bind(this));
    /**
     * Event triggered when a track is subscribed.
     *
     * @event RoomEvent.TrackSubscribed
     * @param {Track} track - The subscribed track.
     * @param {TrackPublication} publication - The track publication.
     * @param {Participant} participant - The participant who published the track.
     */
    this.room.on(
      RoomEvent.TrackSubscribed,
      this.handleTrackSubscribed.bind(this)
    );

    /**
     * Event triggered when a participant connects to the room.
     * Updates the participant names.
     *
     * @event RoomEvent.ParticipantConnected
     * @param {Participant} participant - The participant who connected.
     */
    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      this.updateParticipantNames();
      this.createAvatar(participant);
    });
    /**
     * Event triggered when a participant disconnects from the room.
     *
     * @event RoomEvent.ParticipantDisconnected
     * @param {Participant} participant - The participant who disconnected.
     */
    this.room.on(
      RoomEvent.ParticipantDisconnected,
      this.handleParticipantDisconnected.bind(this)
    );

    /**
     * Event triggered when a track is published.
     * Automatically subscribes to the track.
     *
     * @event RoomEvent.TrackPublished
     * @param {TrackPublication} publication - The track publication.
     * @param {Participant} participant - The participant who published the track.
     */
    this.room.on(RoomEvent.TrackPublished, (publication, participant) => {
      publication.setSubscribed(true);
    });

    /**
     * Event triggered when a local track is unpublished.
     * Handles the unpublishing of screen share tracks.
     *
     * @event RoomEvent.LocalTrackUnpublished
     * @param {LocalTrackPublication} publication - The track publication.
     * @param {LocalParticipant} participant - The participant who unpublished the track.
     */
    this.room.on(
      RoomEvent.LocalTrackUnpublished,
      (publication: LocalTrackPublication, participant: LocalParticipant) => {
        if (publication.source === Track.Source.ScreenShare) {
          this.isScreenSharingEnabled = false;
          this.localScreenShareCount--;
          console.error(
            'Local Screen Share count Unpublished',
            this.localScreenShareCount
          );
          const screenShareTile = document.getElementById(
            `screenshare-${participant.sid}`
          );
          if (screenShareTile) {
            screenShareTile.remove();
          } else {
            console.log('Local screen share container not found');
          }
        }
      }
    );

    /**
     * Event triggered when a remote track is unpublished.
     * Handles the unpublishing of screen share tracks.
     *
     * @event RoomEvent.TrackUnpublished
     * @param {RemoteTrackPublication} publication - The track publication.
     * @param {RemoteParticipant} participant - The participant who unpublished the track.
     */

    this.room.on(
      RoomEvent.TrackUnpublished,
      (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (publication.source === Track.Source.ScreenShare) {
          this.remoteScreenShare = false;
          this.remoteScreenShareCount--;
          console.error(
            'Remote Screen Share count Unpublished',
            this.remoteScreenShareCount
          );
          const screenShareTile = document.getElementById(
            `screenshare-${participant.sid}`
          );
          if (screenShareTile) {
            screenShareTile.remove();
          } else {
            console.log('Local screen share container not found');
          }
        }
      }
    );

    /**
     * Event triggered when a local track is published.
     * Handles the publishing of camera and screen share tracks.
     *
     * @event RoomEvent.LocalTrackPublished
     * @param {LocalTrackPublication} publication - The track publication.
     * @param {LocalParticipant} participant - The participant who published the track.
     */
    this.room.on(
      RoomEvent.LocalTrackPublished,
      async (
        publication: LocalTrackPublication,
        participant: LocalParticipant
      ) => {
        if (publication.track?.source === Track.Source.Camera) {
          const participantTile = document.getElementById(`${participant.sid}`);
          console.log('testing avatar', participantTile);
          if (participantTile) {
            // Remove the avatar image if it exists
            const avatarImg = participantTile.querySelector('img');
            if (avatarImg) {
              participantTile.removeChild(avatarImg);
            }

            // Attach the video track to the participant tile
            const element = publication.track.attach() as HTMLVideoElement;
            element.setAttribute('class', 'pip-video');
            participantTile.appendChild(element);
            element.setAttribute(
              'style',
              `
                border-radius: 0.5rem; 
                width: 100%; 
                height: 100%; 
                object-fit: cover; 
                object-position: center; 
                background-color: #000; 
              `
            );

            // Create metadata container if it doesn't already exist
            let el3 = participantTile.querySelector('.lk-participant-metadata');
            if (!el3) {
              el3 = document.createElement('div');
              el3.setAttribute('class', 'lk-participant-metadata');
              el3.setAttribute(
                'style',
                `
                  position: absolute;
                  right: 0.25rem;
                  bottom: 0.25rem;
                  left: 0.25rem;
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                  gap: 0.5rem;
                  line-height: 1;
                `
              );
              const el4 = document.createElement('div');
              el4.setAttribute('class', 'lk-participant-metadata-item');
              el4.setAttribute(
                'style',
                `
                  display: flex;
                  align-items: center;
                  padding: 0.25rem;
                  background-color: rgba(0, 0, 0, 0.5);
                  border-radius: calc(var(--lk-border-radius) / 2);
                `
              );

              const el5 = document.createElement('span');
              el5.setAttribute('class', 'lk-participant-name');
              el5.setAttribute(
                'style',
                `
                  font-size: 0.875rem;
                  color: white;
                `
              );
              el5.innerText = participant.identity;

              el4.appendChild(el5);
              el3.appendChild(el4);
              participantTile.appendChild(el3);

              // await element.requestPictureInPicture();
            }

            console.log('local track published', publication.track);
          } else {
            console.error('Participant tile not found');
            this.openSnackBar(`Video could not open. Try again later`);
          }
        }

        this.screenShareTrackSubscribed.next(publication.track);
        if (publication.source === Track.Source.ScreenShare) {
          this.localScreenShareCount++;
          this.speakerModeLayout = false;
          console.error('Local Screen Share count', this.localScreenShareCount);
          setTimeout(() => {
            const el2 = document.createElement('div');
            el2.setAttribute('class', 'lk-participant-tile');

            el2.setAttribute('id', `screenshare-${participant.sid}`);
            el2.setAttribute(
              'style',
              ` --lk-speaking-indicator-width: 2.5px;
            position: relative;
            display: flex;
            flex-direction: column;
            height:100%;
            gap: 0.375rem;
            overflow: hidden;
            border-radius: 0.5rem;`
            );
            const screenShareTrack = publication.track?.attach();
            screenShareTrack.setAttribute('class', 'pip-screenShare');
            if (screenShareTrack) {
              const container = document.querySelector('.lk-focus-layout');
              console.log('screenshare container', container);
              // el2.appendChild(container);

              screenShareTrack.setAttribute(
                'style',
                'width: 100%; height: 100%; object-fit: cover; object-position: center; background-color: #000; object-fit: cover;  object-fit: contain;background-color: #1e1e1e;'
              );
              const el3 = document.createElement('div');
              el3.setAttribute('class', 'lk-participant-metadata');
              el3.setAttribute(
                'style',
                `position: absolute;
              right: 0.25rem;
              bottom: 0.25rem;
              left: 0.25rem;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              gap: 0.5rem;
              line-height: 1;`
              );
              const el4 = document.createElement('div');
              el4.setAttribute('class', 'lk-participant-metadata-item');
              el4.setAttribute(
                'style',
                `display: flex;
              align-items: center;
              padding: 0.25rem;
              background-color: rgba(0, 0, 0, 0.5);
              border-radius: 0.25rem;`
              );
              const el5 = document.createElement('span');
              el5.setAttribute('class', 'lk-participant-name');
              el5.setAttribute(
                'style',
                ` font-size: 0.875rem;
              color: white;
              `
              );
              el2.appendChild(screenShareTrack);
              el2.appendChild(el3);
              el3.appendChild(el4);
              el4.appendChild(el5);
              el5.innerText = participant.identity;
              const button = document.createElement('button');
              button.setAttribute('class', 'lk-participant-button');
              button.innerHTML = `<i class="fas fa-expand-alt"></i>`;
              button.onclick = () => {
                this.toggleExpand(el2, participant.identity);
                console.log(`Button clicked for ${participant.identity}!`);
              };

              el3.appendChild(button);
              container?.appendChild(el2);
            } else {
              console.error('Remote screen share container not found');
            }
          }, 100);
        }
      }
    );

    this.room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (publication.track && publication.kind === 'video') {
          this.handleTrackSubscribed(
            publication.track,
            publication,
            participant
          );
        }
      });
    });
    /**
     * Handles the `ActiveDeviceChanged` event triggered when a media device is switched.
     *
     * @event RoomEvent.ActiveDeviceChanged
     * @param {MediaDeviceKind} kind - The type of device that changed (e.g., 'audioinput', 'videoinput').
     * @param {string} deviceId - The ID of the newly active device.
     */
    this.room.on(
      RoomEvent.ActiveDeviceChanged,
      (kind: MediaDeviceKind, deviceId: string) => {
        console.log('Media Device change check', kind, deviceId);
      }
    );

    /**
     * Handles the `ActiveSpeakersChanged` event to update active speaker information.
     *
     * @event RoomEvent.ActiveSpeakersChanged
     * @param {Participant[]} speakers - An array of participants who are currently speaking.
     */
    this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      console.log('Active speakers:', speakers);
      this.activeSpeakers = speakers;
      this.updateActiveSpeakerBorders();
      speakers.forEach((speaker) => {
        console.log(
          ` ${speaker.identity} is speaking with audio level ${speaker.audioLevel}`
        );
      });
    });

    /**
     * Listens for speaking changes for the local participant.
     *
     * @event ParticipantEvent.IsSpeakingChanged
     * @param {boolean} speaking - Indicates whether the participant is currently speaking.
     */
    this.room.localParticipant.on(
      ParticipantEvent.IsSpeakingChanged,
      (speaking: boolean) => {
        console.log(
          `${this.room.localParticipant.identity} is ${
            speaking ? 'now' : 'no longer'
          } speaking. audio level: ${this.room.localParticipant.audioLevel}`
        );
      }
    );

    /**
     * Handles the `MediaDevicesChanged` event to update the list of available devices.
     *
     * @event RoomEvent.MediaDevicesChanged
     */
    this.room.on(RoomEvent.MediaDevicesChanged, async () => {
      console.log('LiveKit device change detected.');
      await this.updateDeviceLists();
    });
  }

  /**
   * Updates the border styles for active speaker tiles based on their audio level.
   */
  updateActiveSpeakerBorders() {
    const participants = Array.from([
      this.room.localParticipant,
      ...this.room.remoteParticipants.values(),
    ]);

    participants.forEach((participant) => {
      const participantTile = document.getElementById(`${participant.sid}`);
      if (participantTile) {
        const isActiveSpeaker = this.activeSpeakers.some(
          (speaker) => speaker.sid === participant.sid
        );
        const audioLevel = participant.audioLevel;
        if (isActiveSpeaker && audioLevel > 0) {
          participantTile.style.transition = 'border 0.3s ease-in-out';
          participantTile.style.border = '4px solid #28a745';
        } else {
          participantTile.style.transition = '';
          participantTile.style.border = '';
        }
      }
      this.createSpeakerAvatar(participant);
    });
  }

  /**
   * Displays the first remote participant as the initial speaker.
   */
  showInitialSpeaker() {
    const remoteParticipants = Array.from(
      this.room.remoteParticipants.values()
    );

    if (remoteParticipants.length > 0) {
      const initialSpeaker = remoteParticipants[0];
      console.log('Setting initial speaker:', initialSpeaker.sid);
      this.activeSpeakers.push(initialSpeaker);
      setTimeout(() => {
        this.createSpeakerAvatar(initialSpeaker);
      }, 0);
    } else {
      console.warn('No remote participants found.');
    }
  }

  /**
   * Retrieves the list of available audio output (speaker) devices.
   *
   * @returns {Promise<void>} - A promise that resolves once the devices are fetched.
   */
  async getAvailableSpeakers() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.speakerDevices = devices.filter(
      (device) => device.kind === 'audiooutput'
    );
  }

  /**
   * Switches the active audio output (speaker) device for the local participant.
   *
   * @param {string} deviceId - The ID of the new speaker device.
   * @returns {Promise<void>} - A promise that resolves when the speaker is switched.
   */
  async switchSpeaker(deviceId: string) {
    this.room.localParticipant.audioTrackPublications.forEach(
      (track) => track.audioTrack
    );
    this.currentSpeakerDeviceId = deviceId;
  }
  /**
   * Retrieves the local participant from the room.
   *
   * @returns {Participant|null} The local participant if available, otherwise null.
   */
  getLocalParticipant() {
    return this.room?.localParticipant;
  }

  /**
   * Updates the list of participant names and emits events for updated participants.
   *
   * This method retrieves the list of remote participants from the room, updates the
   * `participantNames` property, and emits the `participantNamesUpdated` event. It also
   * logs the local participant and the updated list of participant names to the console.
   * Additionally, it assigns the local participant to `loacalParticipant` and emits the
   * `localParticipantData` event.
   */
  updateParticipantNames() {
    this.participantNames = Array.from(this.room.remoteParticipants.values());
    this.participantNamesUpdated.next(this.participantNames);
    console.log('logging ', this.room.localParticipant);
    console.log('logging 3', this.participantNames);
    this.loacalParticipant = this.room.localParticipant;
    this.localParticipantData.next(this.loacalParticipant);

    console.log('participants remote', this.participantNames);
  }

  /**
   * Handles the disconnection of a remote participant.
   *
   * This method logs the disconnected participant, shows a snackbar notification,
   * removes the participant's video tile from the grid layout, and updates the
   * list of participant names.
   *
   * @param {RemoteParticipant} participant - The participant who disconnected.
   */
  handleParticipantDisconnected(participant: RemoteParticipant) {
    console.log('Participant disconnected:', participant);
    this.openSnackBar(
      `Participant "${participant.identity}" has disconnected.`
    );
    const container = document.querySelector('.lk-grid-layout');
    if (container) {
      const participantTiles = container.querySelectorAll(
        '.lk-participant-tile'
      );
      participantTiles.forEach((tile) => {
        const nameElement = tile.querySelector('.lk-participant-name');
        if (nameElement && nameElement.textContent === participant.identity) {
          tile.remove();
        }
      });
    }
    this.updateParticipantNames();
  }

  /**
   * Attaches a video track to a specified HTML element if the track is a camera source.
   *
   * This method checks if the provided track is a video track and if its source is a camera.
   * If so, it retrieves the container element by its ID and attaches the track to this container.
   * If the container is not found, it logs an error message.
   *
   * @param {any} track - The track to be attached. Expected to have properties `kind` and `source`.
   * @param {string} elementId - The ID of the HTML element to which the track should be attached.
   * @returns {HTMLElement | null} The attached track element if successful, otherwise null.
   */
  attachTrackToElement(track: any, elementId: string): HTMLElement | null {
    if (track.kind === 'video' && track.source === Track.Source.Camera) {
      const container = document.getElementById(elementId);
      if (container) {
        return track.attach();
      } else {
        console.error('Remote video container not found');
      }
    }
    return null;
  }

  /**
   * Handles the event when a track is unmuted.
   *
   * This method logs the publication and track kind, and if the track is a video camera source,
   * it removes the associated image element from the participant's container.
   *
   * @param {TrackPublication} publication - The publication of the unmuted track.
   * @param {Participant} participant - The participant who owns the unmuted track.
   */

  handleTrackUnmuted(publication: TrackPublication, participant: Participant) {
    console.log('Track :', publication);
    console.log('testing', publication.kind);
    if (
      publication.kind === 'video' &&
      publication.track?.source === Track.Source.Camera
    ) {
      console.log('video is on');
      const containerById = document.getElementById(`${participant.sid}`);
      const imgElement = containerById?.getElementsByTagName('img');
      imgElement![0]?.remove();
    }
  }

  /**
   * Handles the event when a track is muted or unmuted.
   *
   * This method logs the mute/unmute event for a track and participant. If the track is a video camera source and is muted,
   * it adds an avatar image to the participant's container. If the track is unmuted, it logs the event.
   *
   * @param {TrackPublication} publication - The publication of the track that was muted or unmuted.
   * @param {Participant} participant - The participant who owns the track.
   */
  handleTrackMuted(publication: TrackPublication, participant: Participant) {
    console.log('Track mute/unmute event:', publication, participant);
    if (
      publication.kind === 'video' &&
      publication.track?.source === Track.Source.Camera
    ) {
      // Check if the track is muted
      if (publication.isMuted) {
        // Handle logic for when video is muted
        console.log('Video is off');
        // const container = document.querySelector('.lk-participant-tile');
        const containerById = document.getElementById(`${participant.sid}`);
        const imgElement = document.createElement('img');
        imgElement.setAttribute('src', '../assets/avatar.png');
        imgElement.setAttribute(
          'style',
          'position:absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; border-radius: 50%; object-fit: cover; object-position: center;'
        );
        containerById?.appendChild(imgElement);
      } else {
        // Handle logic for when video is unmuted
        console.log('Video is on');
      }
    }
  }

  handleTrackSubscribed(
    track: RemoteTrack,

    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    console.log('testing', publication);
    if (track.kind === 'video' && track.source === Track.Source.Camera) {
      // ===================================
      const existingElement = document.getElementById(`${participant.sid}`);
      console.log('testing avatar below', existingElement);

      if (existingElement) {
        // Remove the avatar image if it exists
        const avatarImg = existingElement.querySelector('img');
        if (avatarImg) {
          existingElement.removeChild(avatarImg);
        }

        // Attach the video track
        const element = track.attach();
        element.setAttribute('class', 'pip-video');
        element.setAttribute(
          'style',
          'border-radius: 0.5rem; width: 100%; height: 100%; object-fit: cover; object-position: center; background-color: #000;'
        );
        existingElement.appendChild(element);

        // Create metadata container if it doesn't already exist
        let el3 = existingElement.querySelector('.lk-participant-metadata');
        if (!el3) {
          el3 = document.createElement('div');
          el3.setAttribute('class', 'lk-participant-metadata');
          el3.setAttribute(
            'style',
            `position: absolute;
     right: 0.25rem;
     bottom: 0.25rem;
     left: 0.25rem;
     display: flex;
     flex-direction: row;
     align-items: center;
     justify-content: space-between;
     gap: 0.5rem;
     line-height: 1;`
          );

          const el4 = document.createElement('div');
          el4.setAttribute('class', 'lk-participant-metadata-item');
          el4.setAttribute(
            'style',
            `display: flex;
     align-items: center;
     padding: 0.25rem;
     background-color: rgba(0, 0, 0, 0.5);
     border-radius: calc(var(--lk-border-radius) / 2);`
          );

          const el5 = document.createElement('span');
          el5.setAttribute('class', 'lk-participant-name');
          el5.setAttribute(
            'style',
            `font-size: 0.875rem;
     color: white;`
          );
          el5.innerText = participant.identity;

          el4.appendChild(el5);
          el3.appendChild(el4);
          existingElement.appendChild(el3);
        }

        publication.setVideoQuality(VideoQuality.LOW);
        this.remoteParticipantName = participant.identity; // Associate video element with participant

        if (element) {
          this.openSnackBar(
            `Participant "${participant.identity}" has joined.`
          );
        }

        this.handleTrackMuted(publication, participant);
      } else {
        // Element does not exist, create it using createAvatar
        this.createAvatar(participant);
        // Retry attaching the track after a slight delay
        setTimeout(() => {
          const retryElement = document.getElementById(`${participant.sid}`);
          if (retryElement) {
            const avatarImg = retryElement.querySelector('img');
            if (avatarImg) {
              retryElement.removeChild(avatarImg);
            }
            const element = track.attach();
            element.setAttribute(
              'style',
              'border-radius: 0.5rem; width: 100%; height: 100%; object-fit: cover; object-position: center; background-color: #000;'
            );
            retryElement.appendChild(element);

            this.handleTrackMuted(publication, participant);
          }
        }, 100);
      }
    }
    if (track.kind === 'audio') {
      const container = document.getElementById('remoteAudioContainer');
      if (container) {
        const element = track.attach();
        container.appendChild(element);
      } else {
        console.error('Remote audio container not found');
      }
    }
    this.screenShareTrackSubscribed.next(track);
    if (track.source === Track.Source.ScreenShare && track.kind === 'video') {
      this.remoteScreenShare = true;
      this.remoteScreenShareCount++;
      this.speakerModeLayout = false;
      console.error('Remote Screen Share count', this.remoteScreenShareCount);
      setTimeout(() => {
        const el2 = document.createElement('div');
        el2.setAttribute('class', 'lk-participant-tile');
        el2.setAttribute('id', `screenshare-${participant.sid}`);
        el2.setAttribute(
          'style',
          ` --lk-speaking-indicator-width: 2.5px;
       position: relative;
       display: flex;
       flex-direction: column;
       height:100%;
       gap: 0.375rem;
       overflow: hidden;
       border-radius: 0.5rem;`
        );
        const screenShareTrack = publication.track?.attach();
        screenShareTrack.setAttribute('class', 'pip-screenShare');
        if (screenShareTrack) {
          const container = document.querySelector('.lk-focus-layout');
          console.log('screenshare container', container);
          // el2.appendChild(container);

          screenShareTrack.setAttribute(
            'style',
            'width: 100%; height: 100%; object-fit: cover; object-position: center; background-color: #000; object-fit: cover;  object-fit: contain;background-color: #1e1e1e;'
          );
          const el3 = document.createElement('div');
          el3.setAttribute('class', 'lk-participant-metadata');
          el3.setAttribute(
            'style',
            `position: absolute;
         right: 0.25rem;
         bottom: 0.25rem;
         left: 0.25rem;
         display: flex;
         flex-direction: row;
         align-items: center;
         justify-content: space-between;
         gap: 0.5rem;
         line-height: 1;`
          );
          const el4 = document.createElement('div');
          el4.setAttribute('class', 'lk-participant-metadata-item');
          el4.setAttribute(
            'style',
            `display: flex;
         align-items: center;
         padding: 0.25rem;
         background-color: rgba(0, 0, 0, 0.5);
         border-radius: 0.25rem;`
          );
          const el5 = document.createElement('span');
          el5.setAttribute('class', 'lk-participant-name');
          el5.setAttribute(
            'style',
            ` font-size: 0.875rem;
         color: white;
         `
          );
          el2.appendChild(screenShareTrack);
          el2.appendChild(el3);
          el3.appendChild(el4);
          el4.appendChild(el5);
          el5.innerText = participant.identity;
          const button = document.createElement('button');
          button.setAttribute('class', 'lk-participant-button');
          button.innerHTML = `<i class="fas fa-expand-alt"></i>`;
          button.onclick = () => {
            this.toggleExpand(el2, participant.identity);
            console.log(`Button clicked for ${participant.identity}!`);
          };

          el3.appendChild(button);
          container?.appendChild(el2);
        } else {
          console.error('Remote screen share container not found');
        }
      }, 100);
    }
  }

  /**
   * Enables the camera and microphone for the local participant in the room.
   *
   * This method throws an error if the room is not enabled. Otherwise, it enables the camera and microphone
   * for the local participant in the room.
   *
   * @returns {Promise<void>} A promise that resolves when the camera and microphone are enabled.
   * @throws {Error} Throws an error if the room is not enabled.
   */
  async enableCameraAndMicrophone(): Promise<void> {
    if (!this.room) {
      throw new Error('Room not Enabled.');
    }
    await this.room.localParticipant.enableCameraAndMicrophone();
  }
  /**
   * Toggles the microphone status (enabled/disabled) for the local participant in the room.
   *
   * This method throws an error if the room is not enabled. It returns an observable that emits the new
   * microphone status (true for enabled, false for disabled) after toggling.
   *
   * @returns {Observable<boolean>} An observable that emits the new microphone status.
   * @throws {Error} Throws an error if the room is not enabled.
   */

  // =====audio visualization
  toggleMicrophone(): Observable<boolean> {
    if (!this.room) {
      console.error('Room not initialized or enabled.');
      throw new Error('Room not enabled.');
    }

    const localParticipant = this.room.localParticipant;
    const isMuted = localParticipant.isMicrophoneEnabled;

    console.log('Current microphone status before toggling:', isMuted); // Debug

    return from(
      localParticipant
        .setMicrophoneEnabled(!isMuted)
        .then(async () => {
          const newMicStatus = !isMuted;
          console.log('Microphone status after toggling:', newMicStatus); // Debug
          this.microphoneStatusChanged.next(newMicStatus);

          this.isMicOn = newMicStatus; // Update the local mic status
          return newMicStatus;
        })
        .catch((error) => {
          console.error('Error setting microphone enabled:', error); // Debug
          throw error;
        })
    );
  }

  /**
   * Toggles the video status (enabled/disabled) for the local participant in the room.
   *
   * This method throws an error if the room is not enabled. It returns an observable that emits the new
   * video status (true for enabled, false for disabled) after toggling.
   *
   * @returns {Observable<boolean>} An observable that emits the new video status.
   * @throws {Error} Throws an error if the room is not enabled.
   */
  toggleVideo(): Observable<boolean> {
    if (!this.room) {
      throw new Error('Room not enabled.');
    }
    const localParticipant = this.room.localParticipant;
    const isVideoEnabled = localParticipant.isCameraEnabled;
    return from(
      localParticipant.setCameraEnabled(!isVideoEnabled).then(() => {
        const newVideoStatus = !isVideoEnabled;
        this.videoStatusChanged.next(newVideoStatus);
        return newVideoStatus;
      })
    );
  }
  /**
   * Toggles screen sharing for the local participant in the room.
   *
   * If screen sharing is currently enabled, this method disables it, removes the local screen share container,
   * and updates the screen sharing status. If screen sharing is not enabled, it checks if any remote participants
   * are sharing their screens. If so, it displays a modal to notify the user. If no remote participants are sharing
   * their screens, it enables screen sharing for the local participant.
   *
   * @returns {Promise<boolean>} A promise that resolves to the new screen sharing status (true if enabled, false if disabled).
   * @throws {Error} Throws an error if there is an issue toggling the screen share.
   */

  async toggleScreenShare(): Promise<boolean> {
    if (this.isScreenSharingEnabled) {
      const screenShareTileWrapper = document.querySelector(
        '.lk-focus-layout-wrapper'
      );
      if (
        this.localScreenShareCount === 1 &&
        this.remoteScreenShareCount === 0
      ) {
        screenShareTileWrapper.remove();
        this.remoteScreenShare = false;
      } else {
        console.error('Local screen share container not found');
      }
      await this.room.localParticipant.setScreenShareEnabled(false);
      this.isScreenSharingEnabled = false;
    } else {
      await this.room.localParticipant.setScreenShareEnabled(true);
      this.isScreenSharingEnabled = true;
    }
    console.error('screenshare count', this.totalScreenShareCount);
    return this.isScreenSharingEnabled; // Return the updated screen sharing status
  }

  // Getter to calculate the total screen share count
  get totalScreenShareCount(): number {
    return this.localScreenShareCount + this.remoteScreenShareCount;
  }

  /**
   * Opens a snackbar with a given message.
   *
   * Displays a snackbar notification with the specified message. The snackbar will be visible for 3000 milliseconds
   * before automatically closing. Includes a 'Close' button that allows the user to manually dismiss the snackbar.
   *
   * @param {string} message - The message to be displayed in the snackbar.
   */
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // duration in milliseconds
    });
  }

  /**
   * Creates and appends a participant avatar element to the grid layout.
   *
   * This method creates a new participant tile with an avatar and metadata. The tile is styled and added to the
   * `.lk-grid-layout` container. The participant's identity is displayed in a metadata section. If the container
   * is not available, the avatar creation will be skipped.
   *
   * @param {Participant} participant - The participant for whom the avatar is being created. This object must
   * include at least an `identity` property, which represents the participant's name.
   *
   * @returns {void}
   */
  createAvatar(participant: Participant) {
    const el2 = document.createElement('div');
    el2.setAttribute('class', 'lk-participant-tile');
    el2.setAttribute('id', `${participant.sid}`);
    el2.setAttribute(
      'style',
      `
       position: relative;
       display: flex;
       flex-direction: column;
       gap: 0.375rem;
       border-radius: 0.5rem;
       width: 100%;
       min-height: 25%;
       background-color: #000;
     `
    );
    setTimeout(() => {
      const container = document.querySelector('.lk-grid-layout');
      if (container) {
        // Create metadata container
        const el3 = document.createElement('div');
        el3.setAttribute('class', 'lk-participant-metadata');
        el3.setAttribute(
          'style',
          `
           position: absolute;
           right: 0.25rem;
           bottom: 0.25rem;
           left: 0.25rem;
           display: flex;
           flex-direction: row;
           align-items: center;
           justify-content: space-between;
           gap: 0.5rem;
           line-height: 1;
         `
        );
        // Create metadata item
        const el4 = document.createElement('div');
        el4.setAttribute('class', 'lk-participant-metadata-item');
        el4.setAttribute(
          'style',
          `
           display: flex;
           align-items: center;
           padding: 0.25rem;
           background-color: rgba(0, 0, 0, 0.5);
           border-radius: calc(var(--lk-border-radius) / 2);
         `
        );
        // Create participant name element
        const el5 = document.createElement('span');
        el5.setAttribute('class', 'lk-participant-name');
        el5.setAttribute(
          'style',
          `
            font-size: 0.875rem;
            color: white;
          `
        );
        el5.innerText = participant.identity;
        // Append elements
        el4.appendChild(el5);
        el3.appendChild(el4);
        el2.appendChild(el3);
        // Create avatar image
        const imgElement = document.createElement('img');
        imgElement.setAttribute('src', '../assets/avatar.png');
        imgElement.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          object-position: center;
        `;
        const audioElement = document.createElement('span');
        audioElement.setAttribute('class', 'lk-participant-name');
        audioElement.setAttribute(
          'style',
          `
            font-size: 0.875rem;
            color: white;
          `
        );
        audioElement.innerText = participant.identity;
        el2.appendChild(imgElement);
        // Append participant tile to container
        container.appendChild(el2);
      }
    }, 100);
  }

  toggleExpand(element: any, participantId: any) {
    const originalTileElStyle = `--lk-speaking-indicator-width: 2.5px;
        position: relative;
        display: flex;
        flex-direction: column;
        height:100%;
        gap: 0.375rem;
        overflow: hidden;
        border-radius: 0.5rem;`;
    const allElements = document.querySelectorAll('.lk-focus-layout');
    const tileElements = document.querySelectorAll('[id^="screenshare-"]');
    // Check if the element is currently expanded
    const isExpanded = element.getAttribute('data-expanded') === 'true';

    if (isExpanded) {
      element.setAttribute('style', originalTileElStyle);
      element.setAttribute('data-expanded', 'false');
    } else {
      element.setAttribute('data-original-style', originalTileElStyle);

      // If the element is not expanded, expand it by setting the expanded styles
      element.setAttribute(
        'style',
        `
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 50vw;
        height: 90vh;
        z-index: 10;
      `
      );
      element.setAttribute('data-expanded', 'true');
    }

    // Make all other elements small and save their original styles

    allElements.forEach((el) => {
      if (el !== element) {
        const originalFocusLayoutStyle =
          el.getAttribute('data-original-style') ||
          el.getAttribute('style') ||
          '';
        el.setAttribute('data-original-style', originalFocusLayoutStyle);

        if (!isExpanded) {
          el.setAttribute(
            'style',
            `
            --lk-speaking-indicator-width: 1px;
            position: relative;
            display: flex;
            flex-direction: column !important;
            height: 50%;
            width: 100%;
            gap: 0.1rem;
            overflow: auto;
            border-radius: 0.25rem;
          `
          );
          el.setAttribute('data-expanded', 'false');
        } else {
          el.setAttribute('style', originalFocusLayoutStyle);
          el.setAttribute('data-expanded', 'false');
        }
      }
    });
    tileElements.forEach((el) => {
      if (el !== element) {
        el.setAttribute('data-original-style', originalTileElStyle);

        if (!isExpanded) {
          el.setAttribute(
            'style',
            `
            --lk-speaking-indicator-width: 1px;
              position: relative;
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
            border-radius: 0.5rem;
            height: 50%;
            width: 28%;
            overflow: auto;
            border-radius: 0.25rem;
          `
          );
          el.setAttribute('data-expanded', 'false');
        } else {
          console.log('original', originalTileElStyle);
          el.setAttribute('style', originalTileElStyle);
          el.setAttribute('data-expanded', 'false');
        }
      }
    });
  }
  private showReconnectingSnackbar() {
    this.snackBar.open('Reconnecting...', 'Close', {
      duration: 3000,
    });
  }

  // mic visualizer end
  /**
   * Sends a message to a specific breakout room.
   *
   * @param {string} roomId - The ID of the breakout room.
   * @param {string} content - The message content to send.
   * @returns {Observable<void>} - An observable that completes when the message is sent.
   */
  sendMessageToBreakoutRoom(roomId: string, content: string) {
    const room = this.breakoutRoomsData.find((r) => r.roomName === roomId);
    return this.meetingService.sendBroadcastMessage(room.roomName, content);
  }

  sendCloseAlertToBreakoutRooms() {
    if (this.breakoutRoomsData && this.breakoutRoomsData.length > 0) {
      this.breakoutRoomsData.forEach((room) => {
        const alertContent = JSON.stringify({
          type: 'closeRoomAlert',
          countdown: 60, // Countdown duration in seconds
        });

        this.meetingService
          .sendCloseBreakoutRoomAlert(room.roomName, alertContent)
          .subscribe({
            next: () => {
              console.log(
                `Close alert sent successfully to breakout room: ${room.roomName}`
              );
            },
            error: (err) => {
              console.error(
                `Failed to send close alert to breakout room: ${room.roomName}`,
                err
              );
            },
          });
      });
    } else {
      console.warn('No breakout rooms available to send close alert.');
    }
  }

  /**
   * Sends a message from a breakout room to the main room.
   *
   * @param {string} breakoutRoomName - The name of the breakout room.
   * @param {string} content - The message content to send.
   * @returns {Observable<void>} - An observable that completes when the message is sent.
   */
  sendMessageToMainRoom(breakoutRoomName: string, content: string) {
    const roomName = this.getRoomName();
    return this.meetingService.sendMessageToMainRoom(
      // 'test-room',
      roomName,
      breakoutRoomName,
      content
    );
  }

  /**
   * Fetches media devices of a specific type (camera, microphone, or speaker).
   *
   * @param {MediaDeviceKind} kind - The type of media device to fetch.
   * @returns {Promise<MediaDeviceInfo[]>} - A promise that resolves to a list of devices.
   */
  async getDevices(kind: MediaDeviceKind): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await Room.getLocalDevices(kind, true);
      console.log(`Available ${kind}s:`, devices);
      return devices;
    } catch (error) {
      console.error(`Failed to get ${kind}s`, error);
      return [];
    }
  }

  /**
   * Fetches all media device types (cameras, microphones, and speakers).
   *
   * @returns {Promise<{cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[], speakers: MediaDeviceInfo[]}>}
   * An object containing lists of all available devices.
   */
  async getAllDevices() {
    try {
      const cameras = await this.getDevices('videoinput');
      const microphones = await this.getDevices('audioinput');
      const speakers = await this.getDevices('audiooutput');

      return {
        cameras,
        microphones,
        speakers,
      };
    } catch (error) {
      console.error('Error fetching devices:', error);
      return {
        cameras: [],
        microphones: [],
        speakers: [],
      };
    }
  }

  /**
   * Updates the lists of available media devices and emits the updated lists.
   */
  async updateDeviceLists() {
    try {
      this.videoDevices = await this.getDevices('videoinput');
      this.micDevices = await this.getDevices('audioinput');
      this.speakerDevices = await this.getDevices('audiooutput');

      this.deviceListsSubject.next({
        videoDevices: this.videoDevices,
        micDevices: this.micDevices,
        speakerDevices: this.speakerDevices,
      });
    } catch (error) {
      console.error('Error updating device lists:', error);
    }
  }

  /**
   * Switches the active media device for a given type (camera, microphone, or speaker).
   *
   * @param {MediaDeviceKind} kind - The type of media device to switch.
   * @param {string} deviceId - The ID of the device to switch to.
   * @returns {Promise<void>} - A promise that resolves when the device is switched.
   */
  async switchDevice(kind: MediaDeviceKind, deviceId: string): Promise<void> {
    try {
      const success = await this.room.switchActiveDevice(kind, deviceId);
      if (success) {
        console.log(`Switched ${kind} to device: ${deviceId}`);
      } else {
        console.warn(`Failed to switch ${kind} to device: ${deviceId}`);
      }
    } catch (error) {
      console.error(`Error switching ${kind} to device: ${deviceId}`, error);
    }
  }

  /**
   * Switches the view layout from speaker mode to grid mode by moving the active speaker tile.
   */
  switchSpeakerViewLayout() {
    const gridLayout = document.querySelector('.lk-grid-layout');
    const speakerLayout = document.querySelector('.lk-speaker-layout');
    if (speakerLayout?.firstElementChild) {
      gridLayout?.appendChild(speakerLayout.firstElementChild);
    }
  }

  /**
   * Moves a participant's tile to the speaker layout or back to the grid layout.
   *
   * @param {Participant} participant - The participant whose tile to manage.
   */
  createSpeakerAvatar(participant: Participant) {
    const gridLayout = document.querySelector('.lk-grid-layout');
    const speakerLayout = document.querySelector('.lk-speaker-layout');

    if (!gridLayout || !speakerLayout) {
      console.error('Grid or Speaker layout not found.');
      return;
    }

    const participantTile = document.getElementById(`${participant.sid}`);
    if (!participantTile) {
      console.error(`Participant tile with SID ${participant.sid} not found.`);
      return;
    }

    const isActiveSpeaker = this.activeSpeakers.some(
      (speaker) => speaker.sid === participant.sid
    );

    if (isActiveSpeaker) {
      const currentSpeakerTile = speakerLayout.firstElementChild;
      if (currentSpeakerTile && currentSpeakerTile !== participantTile) {
        gridLayout.appendChild(currentSpeakerTile);
      }

      if (!speakerLayout.contains(participantTile)) {
        if (gridLayout.contains(participantTile)) {
          gridLayout.removeChild(participantTile);
        }
        speakerLayout.appendChild(participantTile);
      }

      participantTile.style.height = '100%';
    } else {
      if (gridLayout.contains(participantTile)) {
        participantTile.style.height = '40%';
      }
    }

    participantTile.style.transition = 'border 0.3s ease-in-out';
    participantTile.style.border = isActiveSpeaker ? '4px solid #28a745' : '';
  }
}
