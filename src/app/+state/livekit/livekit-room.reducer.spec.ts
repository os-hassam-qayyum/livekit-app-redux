import {
  liveKitRoomReducer,
  initialState,
  LiveKitRoomState,
} from './livekit-room.reducer';
import * as LiveKitRoomActions from './livekit-room.actions';
describe('LiveKit Room Reducer', () => {
  let initial: LiveKitRoomState;

  beforeEach(() => {
    initial = { ...initialState };
  });
  it('should return the initial state', () => {
    const result = liveKitRoomReducer(undefined, { type: '' });
    expect(result).toEqual(initialState);
  });

  describe('Meeting Actions Unit tests', () => {
    it('should set the room name on setRoomName action', () => {
      const action = LiveKitRoomActions.MeetingActions.setRoomName({
        roomName: 'Test Room',
      });
      const state = liveKitRoomReducer(initial, action);
      expect(state.roomName).toEqual('Test Room');
    });

    it('should handle createMeetingSuccess', () => {
      const token = 'test-token';
      const action = LiveKitRoomActions.MeetingActions.createMeetingSuccess({
        token,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.token).toBe(token);
    });
    it('should handle createMeetingFailure', () => {
      const error = 'Error creating meeting';
      const action = LiveKitRoomActions.MeetingActions.createMeetingFailure({
        error,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.token).toBeNull();
      expect(result.error).toBe(error);
    });
    it('should handle startMeetingSuccess', () => {
      const action = LiveKitRoomActions.LiveKitActions.startMeetingSuccess();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.isMeetingStarted).toBe(true);
      expect(result.isVideoOn).toBe(false);
    });
    it('should handle startMeetingFailure', () => {
      const error = 'Error starting meeting';
      const action = LiveKitRoomActions.LiveKitActions.startMeetingFailure({
        error,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.isMeetingStarted).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should handle leaveMeetingSuccess', () => {
      const action = LiveKitRoomActions.MeetingActions.leaveMeetingSuccess();
      const stateWithMeetingStarted = {
        ...initialState,
        isMeetingStarted: true,
      };
      const result = liveKitRoomReducer(stateWithMeetingStarted, action);
      expect(result.isMeetingStarted).toBe(false);
    });
    it('should handle leaveMeetingFailure', () => {
      const error = 'Error leaving meeting';
      const action = LiveKitRoomActions.MeetingActions.leaveMeetingFailure({
        error,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.error).toBe(error);
    });

    //   const action = LiveKitRoomActions.MeetingActions.leaveMeetingSuccess();
    //   const stateNotInMeeting = { ...initialState, isMeetingStarted: false };
    //   const result = liveKitRoomReducer(stateNotInMeeting, action);
    //   expect(result.isMeetingStarted).toBe(false); // Should remain false
    // });
  });

  describe('ScreenShare unit tests', () => {
    it('should handle toggleScreenShareSuccess', () => {
      const action = LiveKitRoomActions.LiveKitActions.toggleScreenShareSuccess(
        {
          isScreenSharing: true,
        }
      );
      const result = liveKitRoomReducer(initialState, action);
      expect(result.isScreenSharing).toBe(true);
      expect(result.iconColor).toBe('green');
    });

    it('should handle toggleScreenShareFailure', () => {
      const error = 'Error toggling screen share';
      const action = LiveKitRoomActions.LiveKitActions.toggleScreenShareFailure(
        {
          error,
        }
      );
      const result = liveKitRoomReducer(initialState, action);
      expect(result.error).toBe(error);
    });
  });
  describe('Video and mic testings', () => {
    it('should handle toggleVideoSuccess', () => {
      const action = LiveKitRoomActions.LiveKitActions.toggleVideoSuccess({
        isVideoOn: true,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.isVideoOn).toBe(true);
    });

    it('should handle toggleVideoFailure', () => {
      const errorMessage = 'Error toggling video';
      const action = LiveKitRoomActions.LiveKitActions.toggleVideoFailure({
        error: errorMessage,
      });

      const result = liveKitRoomReducer(initialState, action);

      expect(result.error).toBe(errorMessage);
    });
    it('should handle toggleMicSuccess', () => {
      const action = LiveKitRoomActions.LiveKitActions.toggleMicSuccess({
        isMicOn: true,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.isMicOn).toBe(true);
    });

    it('should handle toggleMicFailure', () => {
      const error = 'Error toggling mic';
      const action = LiveKitRoomActions.LiveKitActions.toggleMicFailure({
        error,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.error).toBe(error);
    });
  });

  describe('Side windows testings', () => {
    it('should handle toggleChatSideWindow when it is already closed', () => {
      const action = LiveKitRoomActions.LiveKitActions.toggleChatSideWindow();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.chatSideWindowVisible).toBe(true); // Should open the chat side window
    });
    it('should handle closeChatSideWindow', () => {
      const action = LiveKitRoomActions.LiveKitActions.closeChatSideWindow();
      const stateWithChatOpen = {
        ...initialState,
        chatSideWindowVisible: true,
      };
      const result = liveKitRoomReducer(stateWithChatOpen, action);
      expect(result.chatSideWindowVisible).toBe(false);
    });

    it('should handle toggleParticipantSideWindow', () => {
      const action =
        LiveKitRoomActions.LiveKitActions.toggleParticipantSideWindow();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.participantSideWindowVisible).toBe(true);
    });

    it('should handle closeParticipantSideWindow when it is already closed', () => {
      const action =
        LiveKitRoomActions.LiveKitActions.closeParticipantSideWindow();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.participantSideWindowVisible).toBe(false); // Should remain closed
    });

    it('should handle toggleBreakoutSideWindow', () => {
      const action =
        LiveKitRoomActions.BreakoutActions.toggleBreakoutSideWindow();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.breakoutSideWindowVisible).toBe(true);
    });

    it('should handle closeBreakoutSideWindow', () => {
      const action =
        LiveKitRoomActions.BreakoutActions.closeBreakoutSideWindow();
      const stateWithBreakoutOpen = {
        ...initialState,
        breakoutSideWindowVisible: true,
      };
      const result = liveKitRoomReducer(stateWithBreakoutOpen, action);
      expect(result.breakoutSideWindowVisible).toBe(false); // Should close the breakout side window
    });
    it('should handle toggleParticipantsList when already showing participants', () => {
      const action = LiveKitRoomActions.BreakoutActions.toggleParticipantsList({
        index: 0,
      });
      const stateWithParticipantsVisible = {
        ...initialState,
        breakoutRoomsData: [
          {
            roomName: 'Room 1',
            participantIds: ['user1'],
            showAvailableParticipants: true,
          },
        ],
      };
      const result = liveKitRoomReducer(stateWithParticipantsVisible, action);
      expect(result.breakoutRoomsData[0].showAvailableParticipants).toBe(false); // Should toggle to false
    });
  });
  describe('Messages sent and Receive', () => {
    it('should handle updateUnreadMessagesCount', () => {
      const action =
        LiveKitRoomActions.LiveKitActions.updateUnreadMessagesCount({
          count: 5,
        });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.unreadMessagesCount).toBe(5);
    });
    it('should reset unread messages count on resetUnreadMessagesCount action', () => {
      const action =
        LiveKitRoomActions.LiveKitActions.resetUnreadMessagesCount();
      const state = liveKitRoomReducer(
        { ...initial, unreadMessagesCount: 10 },
        action
      );
      expect(state.unreadMessagesCount).toBe(0);
    });

    it('should update messages on updateMessages action', () => {
      const newMessages = [{ message: 'Hello' }];
      const action = LiveKitRoomActions.LiveKitActions.updateMessages({
        allMessages: newMessages,
      });
      const state = liveKitRoomReducer(initial, action);
      expect(state.allMessages).toEqual(newMessages);
    });

    it('should handle receiveMessage', () => {
      const action = LiveKitRoomActions.ChatActions.receiveMessage({
        message: { message: 'Hello', timestamp: new Date() },
        participant: { identity: 'User1' },
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.allMessages.length).toBe(1);
      expect(result.unreadMessagesCount).toBe(1);
    });

    it('should handle sendMessage', () => {
      const action = LiveKitRoomActions.ChatActions.sendMessage({
        message: 'Hello',
        recipient: 'User2',
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.allMessages.length).toBe(1);
      expect(result.allMessages[0].sendMessage).toBe('Hello');
      expect(result.allMessages[0].recipient).toBe('User2');
    });
  });

  describe('Add and Remove Participants', () => {
    it('should handle addParticipant', () => {
      const roomName = 'Room 1';
      const action = LiveKitRoomActions.BreakoutActions.addParticipantToRoom({
        roomName,
        participantId: 'user1',
      });
      const stateWithRoom = {
        ...initialState,
        breakoutRoomsData: [
          { roomName, participantIds: [], showAvailableParticipants: false },
        ],
      };
      const result = liveKitRoomReducer(stateWithRoom, action);
      expect(result.breakoutRoomsData[0].participantIds).toContain('user1');
    });

    it('should handle removeParticipant', () => {
      const roomName = 'Room 1';
      const action = LiveKitRoomActions.BreakoutActions.removeParticipant({
        roomName,
        participantId: 'user1',
      });
      const stateWithParticipant = {
        ...initialState,
        breakoutRoomsData: [
          {
            roomName,
            participantIds: ['user1'],
            showAvailableParticipants: false,
          },
        ],
      };
      const result = liveKitRoomReducer(stateWithParticipant, action);
      expect(result.breakoutRoomsData[0].participantIds).not.toContain('user1');
    });
    // =====
    it('should toggle showAvailableParticipants for the specified room', () => {
      const indexToToggle = 0; // Toggle for 'Room 1'
      const action = LiveKitRoomActions.BreakoutActions.toggleParticipantsList({
        index: indexToToggle,
      });

      const result = liveKitRoomReducer(initialState, action);

      // Check if the specified room's showAvailableParticipants is toggled
      expect(result.breakoutRoomsData[0].showAvailableParticipants).toBe(true); // Room 1 should now be true
      expect(result.breakoutRoomsData[1].showAvailableParticipants).toBe(true); // Room 2 should remain true
    });

    it('should leave other rooms unchanged', () => {
      const indexToToggle = 1; // Toggle for 'Room 2'
      const action = LiveKitRoomActions.BreakoutActions.toggleParticipantsList({
        index: indexToToggle,
      });

      const result = liveKitRoomReducer(initialState, action);

      // Check if the specified room's showAvailableParticipants is toggled
      expect(result.breakoutRoomsData[1].showAvailableParticipants).toBe(false); // Room 2 should now be false
      expect(result.breakoutRoomsData[0].showAvailableParticipants).toBe(false); // Room 1 should remain false
    });

    it('should not crash when toggling a non-existent room', () => {
      const indexToToggle = 2; // Invalid index (room does not exist)
      const action = LiveKitRoomActions.BreakoutActions.toggleParticipantsList({
        index: indexToToggle,
      });

      const result = liveKitRoomReducer(initialState, action);

      // Ensure state remains unchanged for an invalid index
      expect(result).toEqual(initialState);
    });

    it('should not crash when toggling a negative index', () => {
      const indexToToggle = -1; // Invalid index
      const action = LiveKitRoomActions.BreakoutActions.toggleParticipantsList({
        index: indexToToggle,
      });

      const result = liveKitRoomReducer(initialState, action);

      // Ensure state remains unchanged for a negative index
      expect(result).toEqual(initialState);
    });
  });
  // ================================

  describe('Calculate Distribution Message', () => {
    it('should handle calculateDistribution', () => {
      const action = LiveKitRoomActions.BreakoutActions.calculateDistribution({
        numberOfRooms: 2,
        totalParticipants: 5,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.distributionMessage).toContain('room(s) will have');
    });
    it('should handle calculateDistributionSuccess', () => {
      const distributionMessage = '2 rooms, each will have 3 participants.';
      const action =
        LiveKitRoomActions.BreakoutActions.calculateDistributionSuccess({
          distributionMessage,
        });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.distributionMessage).toBe(distributionMessage);
    });
    it('should handle calculateDistribution with invalid parameters', () => {
      const action = LiveKitRoomActions.BreakoutActions.calculateDistribution({
        numberOfRooms: 0,
        totalParticipants: 0,
      });
      const result = liveKitRoomReducer(initialState, action);
      expect(result.distributionMessage).toBe(
        'Please enter valid number of rooms and participants.'
      ); // Check for the error message
    });
    it('should handle calculateDistribution with valid but extreme values', () => {
      const action = LiveKitRoomActions.BreakoutActions.calculateDistribution({
        numberOfRooms: 1000,
        totalParticipants: 5000,
      });
      const result = liveKitRoomReducer(initialState, action);

      // Assuming the logic is that each room should have an equal distribution of participants
      const expectedMessage = '1000 room(s), each will have 5 participants.';
      expect(result.distributionMessage).toBe(expectedMessage); // Check for the exact message
    });
  });

  describe('Breakout Modals', () => {
    it('should handle openBreakoutModal', () => {
      const action = LiveKitRoomActions.BreakoutActions.openBreakoutModal();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.isBreakoutModalOpen).toBe(true); // Should open the breakout modal
    });

    it('should handle closeBreakoutModal', () => {
      const action = LiveKitRoomActions.BreakoutActions.closeBreakoutModal();
      const stateWithModalOpen = { ...initialState, isBreakoutModalOpen: true };
      const result = liveKitRoomReducer(stateWithModalOpen, action);
      expect(result.isBreakoutModalOpen).toBe(false); // Should close the breakout modal
    });

    it('should handle openInvitationModal', () => {
      const action = LiveKitRoomActions.BreakoutActions.openInvitationModal();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.isInvitationModalOpen).toBe(true); // Should open the invitation modal
    });

    it('should handle closeInvitationModal', () => {
      const action = LiveKitRoomActions.BreakoutActions.closeInvitationModal();
      const stateWithModalOpen = {
        ...initialState,
        isInvitationModalOpen: true,
      };
      const result = liveKitRoomReducer(stateWithModalOpen, action);
      expect(result.isInvitationModalOpen).toBe(false); // Should close the invitation modal
    });

    it('should handle openHostToBrMsgModal', () => {
      const action = LiveKitRoomActions.BreakoutActions.openHostToBrMsgModal();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.isHostMsgModalOpen).toBe(true); // Should open the host message modal
    });

    it('should handle closeHostToBrMsgModal', () => {
      const action = LiveKitRoomActions.BreakoutActions.closeHostToBrMsgModal();
      const stateWithModalOpen = { ...initialState, isHostMsgModalOpen: true };
      const result = liveKitRoomReducer(stateWithModalOpen, action);
      expect(result.isHostMsgModalOpen).toBe(false); // Should close the host message modal
    });

    it('should handle openHelpMessageModal', () => {
      const action = LiveKitRoomActions.BreakoutActions.openHelpMessageModal();
      const result = liveKitRoomReducer(initialState, action);
      expect(result.helpMessageModal).toBe(true); // Should open the help message modal
    });

    it('should handle closeHelpMessageModal', () => {
      const action = LiveKitRoomActions.BreakoutActions.closeHelpMessageModal();
      const stateWithModalOpen = { ...initialState, helpMessageModal: true };
      const result = liveKitRoomReducer(stateWithModalOpen, action);
      expect(result.helpMessageModal).toBe(false); // Should close the help message modal
    });
  });
  describe('LiveKit Breakout Room Reducer', () => {
    describe('createNewRoom action', () => {
      it('should add a new room to breakoutRoomsData', () => {
        const state = {
          ...initialState,
          breakoutRoomsData: [
            {
              roomName: 'Room 1',
              participantIds: [],
              showAvailableParticipants: false,
            },
          ],
        };

        const action = LiveKitRoomActions.BreakoutActions.createNewRoom();
        const result = liveKitRoomReducer(state, action);

        expect(result.breakoutRoomsData.length).toBe(2);
        expect(result.breakoutRoomsData[1]).toEqual({
          roomName: `${state.roomName} Room 2`,
          participantIds: [],
          showAvailableParticipants: false,
        });
      });
    });

    describe('loadBreakoutRooms action', () => {
      it('should set loading to true and reset error', () => {
        const state = {
          ...initialState,
          loading: false,
          error: 'Some error',
        };

        const action = LiveKitRoomActions.BreakoutActions.loadBreakoutRooms();
        const result = liveKitRoomReducer(state, action);

        expect(result.loading).toBeTrue();
        expect(result.error).toBeNull();
      });
    });

    describe('loadBreakoutRoomsSuccess action', () => {
      it('should set breakoutRoomsData and set loading to false', () => {
        const newBreakoutRoomsData = [
          {
            roomName: 'Room A',
            participantIds: [],
            showAvailableParticipants: false,
          },
        ];

        const state = {
          ...initialState,
          loading: true,
          breakoutRoomsData: [],
        };

        const action =
          LiveKitRoomActions.BreakoutActions.loadBreakoutRoomsSuccess({
            breakoutRoomsData: newBreakoutRoomsData,
          });
        const result = liveKitRoomReducer(state, action);

        expect(result.breakoutRoomsData).toEqual(newBreakoutRoomsData);
        expect(result.loading).toBeFalse();
      });
    });

    describe('loadBreakoutRoomsFailure action', () => {
      it('should set error and set loading to false', () => {
        const error = 'Failed to load breakout rooms';

        const state = {
          ...initialState,
          loading: true,
          error: null,
        };

        const action =
          LiveKitRoomActions.BreakoutActions.loadBreakoutRoomsFailure({
            error,
          });
        const result = liveKitRoomReducer(state, action);

        expect(result.error).toBe(error);
        expect(result.loading).toBeFalse();
      });
    });
  });
});
