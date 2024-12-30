import {
  selectLiveKitRoomState,
  selectIsMeetingStarted,
  selectIsVideoOn,
  selectParticipantSideWindowVisible,
  selectChatSideWindowVisible,
  selectIsScreenSharing,
  selectIconColor,
  selectIsMicOn,
  selectAllMessages,
  selectUnreadMessagesCount,
  selectBreakoutSideWindowVisible,
  isBreakoutModalOpen,
  isInvitationModalOpen,
  isHostMsgModalOpen,
  selectDistributionMessage,
  selectBreakoutRoomsData,
  selectNextRoomIndex,
  selectHelpMessageModal,
  selectBreakoutRoomsLoading,
  selectGetRoomName,
  selectLiveKitRoomViewState,
} from './livekit-room.selectors';
import { LiveKitRoomState } from './livekit-room.reducer';

describe('LiveKit Room Selectors', () => {
  let mockState: LiveKitRoomState;

  beforeEach(() => {
    mockState = {
      isMeetingStarted: true,
      allMessages: ['Hello', 'World'],
      unreadMessagesCount: 2,
      isVideoOn: true,
      isMicOn: false,
      isScreenSharing: false,
      iconColor: 'red',
      participantSideWindowVisible: true,
      breakoutSideWindowVisible: false,
      chatSideWindowVisible: true,
      error: undefined,
      token: null,
      isBreakoutModalOpen: false,
      isInvitationModalOpen: true,
      isHostMsgModalOpen: false,
      roomType: 'standard',
      selectedParticipants: [],
      numberOfRooms: null,
      distributionMessage: 'Welcome to the meeting!',
      breakoutRoomsData: [
        {
          roomName: 'Room A',
          participantIds: ['user1'],
          showAvailableParticipants: true,
        },
      ],
      nextRoomIndex: 1,
      helpMessageModal: false,
      loading: false,
      roomName: 'Test Room',
    };
  });

  it('should select breakoutRoomsLoading', () => {
    const result = selectBreakoutRoomsLoading.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select roomName', () => {
    const result = selectGetRoomName.projector(mockState);
    expect(result).toBe('Test Room');
  });

  it('should select the aggregated LiveKitRoomViewState', () => {
    const result = selectLiveKitRoomViewState.projector(
      mockState.isMeetingStarted,
      mockState.isVideoOn,
      mockState.participantSideWindowVisible,
      mockState.chatSideWindowVisible,
      mockState.isScreenSharing,
      mockState.iconColor,
      mockState.isMicOn,
      mockState.allMessages,
      mockState.unreadMessagesCount,
      mockState.breakoutSideWindowVisible,
      mockState.isBreakoutModalOpen,
      mockState.isInvitationModalOpen,
      mockState.isHostMsgModalOpen,
      mockState.distributionMessage,
      mockState.breakoutRoomsData,
      mockState.nextRoomIndex,
      mockState.helpMessageModal,
      mockState.loading,
      mockState.roomName
    );

    expect(result).toEqual({
      isMeetingStarted: true,
      isVideoOn: true,
      participantSideWindowVisible: true,
      chatSideWindowVisible: true,
      isScreenSharing: false,
      iconColor: 'red',
      isMicOn: false,
      allMessages: ['Hello', 'World'],
      unreadMessagesCount: 2,
      breakoutSideWindowVisible: false,
      isBreakoutModalOpen: false,
      isInvitationModalOpen: true,
      isHostMsgModalOpen: false,
      distributionMessage: 'Welcome to the meeting!',
      breakoutRoomsData: [
        {
          roomName: 'Room A',
          participantIds: ['user1'],
          showAvailableParticipants: true,
        },
      ],
      nextRoomIndex: 1,
      helpMessageModal: false,
      breakoutRoomsLoading: false,
      getRoomName: 'Test Room',
    });
  });
});
