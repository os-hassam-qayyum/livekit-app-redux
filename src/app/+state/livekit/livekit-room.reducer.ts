import { createReducer, on } from '@ngrx/store';
import * as LiveKitRoomActions from './livekit-room.actions';

export interface BreakoutRoom {
  roomName: string;
  participantIds: string[];
  showAvailableParticipants: boolean;
}
export interface LiveKitRoomState {
  isMeetingStarted: boolean;
  allMessages: any[];
  unreadMessagesCount: number;
  isVideoOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  iconColor: string;
  participantSideWindowVisible: boolean;
  breakoutSideWindowVisible: boolean;
  chatSideWindowVisible: boolean;
  error?: string;
  token: string | null;
  isBreakoutModalOpen: boolean;
  isInvitationModalOpen: boolean;
  isHostMsgModalOpen: boolean;
  roomType: string;
  selectedParticipants: string[];
  numberOfRooms: number | null;
  distributionMessage: string;
  breakoutRoomsData: BreakoutRoom[];
  nextRoomIndex: number;
  helpMessageModal: boolean;
  loading: boolean;
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
  breakoutSideWindowVisible: false,
  chatSideWindowVisible: false,
  token: null,
  isBreakoutModalOpen: false,
  isInvitationModalOpen: false,
  isHostMsgModalOpen: false,
  roomType: '',
  selectedParticipants: [],
  numberOfRooms: null,
  distributionMessage: '',
  breakoutRoomsData: [],
  nextRoomIndex: 1,
  helpMessageModal: false,
  loading: false,
};

export const liveKitRoomReducer = createReducer(
  initialState,
  on(
    LiveKitRoomActions.MeetingActions.createMeetingSuccess,
    (state, { token }) => ({
      ...state,
      token,
    })
  ),
  on(
    LiveKitRoomActions.MeetingActions.createMeetingFailure,
    (state, { error }) => ({
      ...state,
      token: null,
      error,
    })
  ),
  on(LiveKitRoomActions.LiveKitActions.startMeetingSuccess, (state) => ({
    ...state,
    isMeetingStarted: true,
    isVideoOn: false,
  })),
  on(
    LiveKitRoomActions.LiveKitActions.startMeetingFailure,
    (state, { error }) => ({
      ...state,
      isMeetingStarted: false,
      error,
    })
  ),
  on(
    LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneSuccess,
    (state) => ({
      ...state,
    })
  ),
  on(
    LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),
  on(
    LiveKitRoomActions.LiveKitActions.toggleScreenShareSuccess,
    (state, { isScreenSharing }) => {
      console.log('Reducer: Screen Sharing Success', isScreenSharing);
      return {
        ...state,
        isScreenSharing,
        iconColor: isScreenSharing ? 'green' : 'black',
      };
    }
  ),
  on(
    LiveKitRoomActions.LiveKitActions.toggleScreenShareFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),
  on(
    LiveKitRoomActions.LiveKitActions.toggleVideoSuccess,
    (state, { isVideoOn }) => ({
      ...state,

      isVideoOn,
    })
  ),
  on(
    LiveKitRoomActions.LiveKitActions.toggleVideoFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),
  on(
    LiveKitRoomActions.LiveKitActions.toggleMicSuccess,
    (state, { isMicOn }) => {
      console.log('Mic status in reducer (toggleMicSuccess):', isMicOn); // Debug
      return {
        ...state,
        isMicOn,
      };
    }
  ),
  on(
    LiveKitRoomActions.LiveKitActions.toggleMicFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),

  on(LiveKitRoomActions.LiveKitActions.closeChatSideWindow, (state) => ({
    ...state,
    chatSideWindowVisible: false,
    unreadMessagesCount: 0,
  })),
  on(LiveKitRoomActions.LiveKitActions.closeParticipantSideWindow, (state) => ({
    ...state,
    participantSideWindowVisible: false,
  })),

  on(
    LiveKitRoomActions.LiveKitActions.toggleParticipantSideWindow,
    (state) => ({
      ...state,
      participantSideWindowVisible: !state.participantSideWindowVisible,
      chatSideWindowVisible:
        state.chatSideWindowVisible && !state.participantSideWindowVisible
          ? false
          : state.chatSideWindowVisible,
    })
  ),

  on(LiveKitRoomActions.LiveKitActions.toggleChatSideWindow, (state) => ({
    ...state,
    chatSideWindowVisible: !state.chatSideWindowVisible,
    unreadMessagesCount:
      !state.chatSideWindowVisible === false ? 0 : state.unreadMessagesCount,
    participantSideWindowVisible:
      state.participantSideWindowVisible && !state.chatSideWindowVisible
        ? false
        : state.participantSideWindowVisible,
  })),

  on(
    LiveKitRoomActions.LiveKitActions.updateUnreadMessagesCount,
    (state, { count }) => ({
      ...state,
      unreadMessagesCount: count,
    })
  ),
  on(LiveKitRoomActions.LiveKitActions.resetUnreadMessagesCount, (state) => ({
    ...state,
    unreadMessagesCount: 0,
  })),
  on(
    LiveKitRoomActions.LiveKitActions.updateMessages,
    (state, { allMessages }) => ({
      ...state,
      allMessages,
    })
  ),
  on(
    LiveKitRoomActions.ChatActions.receiveMessage,
    (state, { message, participant }) => {
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
    }
  ),
  on(
    LiveKitRoomActions.ChatActions.sendMessage,
    (state, { message, recipient }) => {
      const sendingTime = new Date();
      return {
        ...state,
        allMessages: [
          ...state.allMessages,
          { sendMessage: message, recipient, sendingTime, type: 'sent' },
        ],
      };
    }
  ),
  on(LiveKitRoomActions.MeetingActions.leaveMeetingSuccess, (state) => ({
    ...state,
    isMeetingStarted: false,
  })),
  on(
    LiveKitRoomActions.MeetingActions.leaveMeetingFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),
  on(LiveKitRoomActions.BreakoutActions.toggleBreakoutSideWindow, (state) => ({
    ...state,
    breakoutSideWindowVisible: !state.breakoutSideWindowVisible,
    chatSideWindowVisible:
      state.chatSideWindowVisible && !state.breakoutSideWindowVisible
        ? false
        : state.chatSideWindowVisible,
  })),
  on(LiveKitRoomActions.BreakoutActions.closeBreakoutSideWindow, (state) => ({
    ...state,
    breakoutSideWindowVisible: false,
  })),
  on(LiveKitRoomActions.BreakoutActions.openBreakoutModal, (state) => ({
    ...state,
    isBreakoutModalOpen: true,
  })),
  on(LiveKitRoomActions.BreakoutActions.closeBreakoutModal, (state) => ({
    ...state,
    isBreakoutModalOpen: false,
  })),
  // invitation modal sent to participant to join breakout room
  on(LiveKitRoomActions.BreakoutActions.openInvitationModal, (state) => ({
    ...state,
    isInvitationModalOpen: true,
  })),
  on(LiveKitRoomActions.BreakoutActions.closeInvitationModal, (state) => ({
    ...state,
    isInvitationModalOpen: false,
  })),
  // Message modal sent to breakout room from host
  on(LiveKitRoomActions.BreakoutActions.openHostToBrMsgModal, (state) => ({
    ...state,
    isHostMsgModalOpen: true,
  })),
  on(LiveKitRoomActions.BreakoutActions.closeHostToBrMsgModal, (state) => ({
    ...state,
    isHostMsgModalOpen: false,
  })),
  on(LiveKitRoomActions.BreakoutActions.openHelpMessageModal, (state) => ({
    ...state,
    helpMessageModal: true,
  })),
  on(LiveKitRoomActions.BreakoutActions.closeHelpMessageModal, (state) => ({
    ...state,
    helpMessageModal: false,
  })),
  // breakout modal distribution in automatic room selection
  on(
    LiveKitRoomActions.BreakoutActions.calculateDistribution,
    (state, { numberOfRooms, totalParticipants }) => {
      let message = '';

      if (numberOfRooms > 0 && totalParticipants > 0) {
        const participantsPerRoom = Math.floor(
          totalParticipants / numberOfRooms
        );
        const remainder = totalParticipants % numberOfRooms;

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
      } else {
        message = 'Please enter valid number of rooms and participants.';
      }

      return { ...state, distributionMessage: message };
    }
  ),
  on(
    LiveKitRoomActions.BreakoutActions.calculateDistributionSuccess,
    (state, { distributionMessage }) => ({
      ...state,
      distributionMessage,
    })
  ),
  //creating new rooms
  on(LiveKitRoomActions.BreakoutActions.createNewRoom, (state) => ({
    ...state,

    breakoutRoomsData: [
      ...state.breakoutRoomsData,
      {
        roomName: `Room ${state.breakoutRoomsData.length + 1}`,
        participantIds: [],
        showAvailableParticipants: false,
      },
    ],
  })),
  on(
    LiveKitRoomActions.BreakoutActions.toggleParticipantsList,
    (state, { index }) => {
      const rooms = state.breakoutRoomsData.map((room, idx) => {
        if (idx === index) {
          return {
            ...room,
            showAvailableParticipants: !room.showAvailableParticipants,
          };
        }
        return room;
      });
      return { ...state, breakoutRoomsData: rooms };
    }
  ),
  on(
    LiveKitRoomActions.BreakoutActions.addParticipant,
    (state, { roomName, participantId }) => {
      const rooms = state.breakoutRoomsData.map((room) => {
        if (room.roomName === roomName) {
          return {
            ...room,
            participantIds: [...room.participantIds, participantId],
          };
        }
        return room;
      });
      return { ...state, breakoutRoomsData: rooms };
    }
  ),
  on(
    LiveKitRoomActions.BreakoutActions.removeParticipant,
    (state, { roomName, participantId }) => {
      const rooms = state.breakoutRoomsData.map((room) => {
        if (room.roomName === roomName) {
          return {
            ...room,
            participantIds: room.participantIds.filter(
              (id) => id !== participantId
            ),
          };
        }
        return room;
      });
      return { ...state, breakoutRoomsData: rooms };
    }
  ),
  on(LiveKitRoomActions.BreakoutActions.loadBreakoutRooms, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    LiveKitRoomActions.BreakoutActions.loadBreakoutRoomsSuccess,
    (state, { breakoutRoomsData }) => ({
      ...state,
      breakoutRoomsData,
      loading: false,
    })
  ),
  on(
    LiveKitRoomActions.BreakoutActions.loadBreakoutRoomsFailure,
    (state, { error }) => ({
      ...state,
      error,
      loading: false,
    })
  )
);
