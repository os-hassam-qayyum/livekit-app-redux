import { LiveKitRoomState } from './livekit-room.reducer';
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
} from './livekit-room.selectors';

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
    };
  });

  it('should select the liveKitRoom feature state', () => {
    const result = selectLiveKitRoomState.projector(mockState);
    expect(result).toEqual(mockState);
  });
  //   describe('selectIsMeetingStarted', () => {
  //     it('should return the value of isMeetingStarted from the state', () => {
  //       // Mock LiveKitRoomState with isMeetingStarted set to true
  //       const mockState: LiveKitRoomState = {
  //         isMeetingStarted: true, // Test with true
  //         // Add other properties as necessary
  //       };

  //       // Call the selector with the mock state
  //       const result = selectIsMeetingStarted.projector(mockState);

  //       // Assertion: Expect the selector to return true
  //       expect(result).toBe(true);

  //       // Now test with isMeetingStarted set to false
  //       mockState.isMeetingStarted = false;
  //       const resultFalse = selectIsMeetingStarted.projector(mockState);

  //       // Assertion: Expect the selector to return false
  //       expect(resultFalse).toBe(false);
  //     });
  //   });

  it('should select isMeetingStarted', () => {
    const result = selectIsMeetingStarted.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select isVideoOn', () => {
    const result = selectIsVideoOn.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select participantSideWindowVisible', () => {
    const result = selectParticipantSideWindowVisible.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select chatSideWindowVisible', () => {
    const result = selectChatSideWindowVisible.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select isScreenSharing', () => {
    const result = selectIsScreenSharing.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select iconColor', () => {
    const result = selectIconColor.projector(mockState);
    expect(result).toBe('red');
  });

  it('should select isMicOn', () => {
    const result = selectIsMicOn.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select allMessages', () => {
    const result = selectAllMessages.projector(mockState);
    expect(result).toEqual(['Hello', 'World']);
  });

  it('should select unreadMessagesCount', () => {
    const result = selectUnreadMessagesCount.projector(mockState);
    expect(result).toBe(2);
  });

  it('should select breakoutSideWindowVisible', () => {
    const result = selectBreakoutSideWindowVisible.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select isBreakoutModalOpen', () => {
    const result = isBreakoutModalOpen.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select isInvitationModalOpen', () => {
    const result = isInvitationModalOpen.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select isHostMsgModalOpen', () => {
    const result = isHostMsgModalOpen.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select distributionMessage', () => {
    const result = selectDistributionMessage.projector(mockState);
    expect(result).toBe('Welcome to the meeting!');
  });

  it('should select breakoutRoomsData', () => {
    const result = selectBreakoutRoomsData.projector(mockState);
    expect(result).toEqual([
      {
        roomName: 'Room A',
        participantIds: ['user1'],
        showAvailableParticipants: true,
      },
    ]);
  });

  it('should select nextRoomIndex', () => {
    const result = selectNextRoomIndex.projector(mockState);
    expect(result).toBe(1);
  });

  it('should select helpMessageModal', () => {
    const result = selectHelpMessageModal.projector(mockState);
    expect(result).toBe(false);
  });
});
