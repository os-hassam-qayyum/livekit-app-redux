import { createActionGroup, emptyProps, props } from '@ngrx/store';

// Grouping Meeting-related actions
export const MeetingActions = createActionGroup({
  source: '[Meeting]',
  events: {
    createMeeting: props<{ participantNames: string[]; roomName: string }>(),
    createMeetingSuccess: props<{ token: string }>(),
    createMeetingFailure: props<{ error: any }>(),
    leaveMeeting: emptyProps(),
    leaveMeetingSuccess: emptyProps(),
    leaveMeetingFailure: props<{ error: any }>(),
    setRoomName: props<{ roomName: string }>(),
  },
});

// Grouping LiveKit Room actions
export const LiveKitActions = createActionGroup({
  source: '[LiveKit Room]',
  events: {
    startMeeting: props<{ wsURL: string; token: string }>(),
    startMeetingSuccess: emptyProps(),
    startMeetingFailure: props<{ error: string }>(),
    enableCameraAndMicrophone: emptyProps(),
    enableCameraAndMicrophoneSuccess: emptyProps(),
    enableCameraAndMicrophoneFailure: props<{ error: string }>(),
    toggleRaiseHand: emptyProps(),
    toggleScreenShare: emptyProps(),
    toggleScreenShareSuccess: props<{ isScreenSharing: boolean }>(),
    toggleScreenShareFailure: props<{ error: string }>(),
    toggleVideo: emptyProps(),
    toggleVideoSuccess: props<{ isVideoOn: boolean }>(),
    toggleVideoFailure: props<{ error: string }>(),
    toggleMic: emptyProps(),
    toggleMicSuccess: props<{ isMicOn: boolean }>(),
    toggleMicFailure: props<{ error: string }>(),
    toggleParticipantSideWindow: emptyProps(),
    toggleChatSideWindow: emptyProps(),
    closeChatSideWindow: emptyProps(),
    closeParticipantSideWindow: emptyProps(),
    updateUnreadMessagesCount: props<{ count: number }>(),
    resetUnreadMessagesCount: emptyProps(),
    updateMessages: props<{ allMessages: any[] }>(),
    scrollToBottom: emptyProps(),
  },
});

// Grouping Chat actions
export const ChatActions = createActionGroup({
  source: '[Chat]',
  events: {
    receiveMessage: props<{ message: any; participant: any }>(),
    sendMessage: props<{ message: string; recipient: string }>(),
    SendChatMessage: props<{ msg: string; recipient: string }>(),
    // send message to breakout room
    sendMessageToBreakoutRoom: props<{
      breakoutRoom: string;
      messageContent: string;
    }>(),
    sendMessageToBreakoutRoomSuccess: emptyProps(),
    sendMessageToBreakoutRoomFailure: props<{ error: any }>(),
    //send message from breakout room to main room
    sendHelpRequest: props<{ roomName: string }>(),
    sendHelpRequestSuccess: emptyProps(),
    sendHelpRequestFailure: props<{ error: any }>(),
  },
});

// Grouping Breakout actions
export const BreakoutActions = createActionGroup({
  source: '[Breakout Room]',
  events: {
    toggleBreakoutSideWindow: emptyProps(),
    closeBreakoutSideWindow: emptyProps(),
    openBreakoutModal: emptyProps(),
    closeBreakoutModal: emptyProps(),
    // breakout modal distribution in automatic and manual
    calculateDistribution: props<{
      numberOfRooms: number;
      totalParticipants: number;
    }>(),
    calculateDistributionSuccess: props<{ distributionMessage: string }>(),
    openInvitationModal: emptyProps(),
    closeInvitationModal: emptyProps(),
    openHostToBrMsgModal: emptyProps(),
    closeHostToBrMsgModal: emptyProps(),

    openHelpMessageModal: emptyProps(),
    closeHelpMessageModal: emptyProps(),
    //creating new rooms
    CreateNewRoom: emptyProps(),
    sendBreakoutRoomsInvitation: emptyProps(),
    breakoutRoomsInvitationSuccess: props<{
      roomName: string;
    }>(),
    breakoutRoomsInvitationFailure: props<{ error: any }>(),
    ToggleParticipantsList: props<{ index: number }>(),
    AddParticipant: props<{ roomName: string; participantId: string }>(),
    RemoveParticipant: props<{ roomName: string; participantId: string }>(),
    loadBreakoutRooms: emptyProps(),
    loadBreakoutRoomsSuccess: props<{ breakoutRoomsData: any[] }>(),
    loadBreakoutRoomsFailure: props<{ error: string }>(),
    // manual and automatic rooms
    addParticipantToRoom: props<{ roomName: string; participantId: string }>(),
    InitiateAutomaticRoomCreation: props<{
      participants: string[];
      numberOfRooms: number;
    }>(),
  },
});
