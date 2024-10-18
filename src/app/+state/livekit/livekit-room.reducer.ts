import { createReducer, on } from '@ngrx/store';
import * as LiveKitRoomActions from './livekit-room.actions';
import { Participant, RemoteTrack, Track } from 'livekit-client';

export interface LiveKitRoomState {
  isMeetingStarted: boolean;
  allMessages: any[];
  unreadMessagesCount: number;
  isVideoOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  iconColor: string;
  participantSideWindowVisible: boolean;
  chatSideWindowVisible: boolean;
  breakoutSideWindowVisible: boolean;
  isBreakoutModalOpen: boolean;
  error?: string | null;
  token: string | null;
}

export const initialState: LiveKitRoomState = {
  isMeetingStarted: false,
  allMessages: [],
  unreadMessagesCount: 0,
  isVideoOn: false,
  isMicOn: false,
  isScreenSharing: false,
  iconColor: 'black',
  participantSideWindowVisible: false,
  chatSideWindowVisible: false,
  breakoutSideWindowVisible: false,
  isBreakoutModalOpen: false,
  token: null,
};

export const liveKitRoomReducer = createReducer(
  initialState,
  on(LiveKitRoomActions.startMeetingSuccess, (state) => ({
    ...state,
    isMeetingStarted: true,
    isVideoOn: false,
  })),
  on(LiveKitRoomActions.startMeetingFailure, (state, { error }) => ({
    ...state,
    isMeetingStarted: false,
    error,
  })),
  on(LiveKitRoomActions.enableCameraAndMicrophoneSuccess, (state) => ({
    ...state,
  })),
  on(
    LiveKitRoomActions.enableCameraAndMicrophoneFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),
  on(
    LiveKitRoomActions.toggleScreenShareSuccess,
    (state, { isScreenSharing }) => {
      console.log('Reducer: Screen Sharing Success', isScreenSharing);
      return {
        ...state,
        isScreenSharing,
        iconColor: isScreenSharing ? 'green' : 'black',
      };
    }
  ),
  on(LiveKitRoomActions.toggleScreenShareFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(LiveKitRoomActions.toggleVideoSuccess, (state, { isVideoOn }) => ({
    ...state,

    isVideoOn,
  })),
  on(LiveKitRoomActions.toggleVideoFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(LiveKitRoomActions.toggleMicSuccess, (state, { isMicOn }) => ({
    ...state,
    isMicOn,
  })),
  on(LiveKitRoomActions.toggleMicFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(LiveKitRoomActions.closeChatSideWindow, (state) => ({
    ...state,
    chatSideWindowVisible: false,
    unreadMessagesCount: 0,
  })),
  on(LiveKitRoomActions.closeParticipantSideWindow, (state) => ({
    ...state,
    participantSideWindowVisible: false,
  })),

  on(LiveKitRoomActions.toggleParticipantSideWindow, (state) => ({
    ...state,
    participantSideWindowVisible: !state.participantSideWindowVisible,
    chatSideWindowVisible:
      state.chatSideWindowVisible && !state.participantSideWindowVisible
        ? false
        : state.chatSideWindowVisible,
    breakoutSideWindowVisible:
      state.breakoutSideWindowVisible && !state.participantSideWindowVisible
        ? false
        : state.breakoutSideWindowVisible,
  })),
  on(LiveKitRoomActions.toggleChatSideWindow, (state) => ({
    ...state,
    chatSideWindowVisible: !state.chatSideWindowVisible,
    unreadMessagesCount: 0,
    participantSideWindowVisible:
      state.participantSideWindowVisible && !state.chatSideWindowVisible
        ? false
        : state.participantSideWindowVisible,
    breakoutSideWindowVisible:
      state.breakoutSideWindowVisible && !state.chatSideWindowVisible
        ? false
        : state.breakoutSideWindowVisible,
  })),

  on(LiveKitRoomActions.updateUnreadMessagesCount, (state, { count }) => ({
    ...state,
    unreadMessagesCount: count,
  })),
  on(LiveKitRoomActions.updateMessages, (state, { allMessages }) => ({
    ...state,
    allMessages,
  })),
  on(LiveKitRoomActions.receiveMessage, (state, { message, participant }) => {
    const receivedMsg = message?.message;
    const senderName = participant?.identity;
    const receivingTime = message?.timestamp;
    const newMessages = [
      ...state.allMessages,
      {
        senderName,
        receivedMsg,
        receivingTime,
        type: 'received',
      },
    ];
    return {
      ...state,
      allMessages: newMessages,
      unreadMessagesCount: state.chatSideWindowVisible
        ? state.unreadMessagesCount
        : state.unreadMessagesCount + 1,
    };
  }),
  on(LiveKitRoomActions.sendMessage, (state, { message }) => {
    const sendMessage = message;
    const sendingTime = new Date();
    return {
      ...state,
      allMessages: [
        ...state.allMessages,
        { sendMessage, sendingTime, type: 'sent' },
      ],
    };
  }),
  on(LiveKitRoomActions.leaveMeetingSuccess, (state) => ({
    ...state,
    isMeetingStarted: false,
  })),
  on(LiveKitRoomActions.leaveMeetingFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(LiveKitRoomActions.createMeetingSuccess, (state, { token }) => ({
    ...state,
    token,
  })),
  on(LiveKitRoomActions.createMeetingFailure, (state, { error }) => ({
    ...state,
    token: null,
    error,
  })),
  on(LiveKitRoomActions.toggleBreakoutSideWindow, (state) => ({
    ...state,
    breakoutSideWindowVisible: !state.breakoutSideWindowVisible,
    chatSideWindowVisible:
      state.chatSideWindowVisible && !state.breakoutSideWindowVisible
        ? false
        : state.chatSideWindowVisible,
    participantSideWindowVisible:
      state.participantSideWindowVisible && !state.breakoutSideWindowVisible
        ? false
        : state.participantSideWindowVisible,
  })),
  on(LiveKitRoomActions.closeBreakoutSideWindow, (state) => ({
    ...state,
    breakoutSideWindowVisible: false,
  })),
  on(LiveKitRoomActions.openBreakoutModal, (state) => ({
    ...state,
    isBreakoutModalOpen: true,
  })),
  on(LiveKitRoomActions.closeBreakoutModal, (state) => ({
    ...state,
    isBreakoutModalOpen: false,
  }))
);
