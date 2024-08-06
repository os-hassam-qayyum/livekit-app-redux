// reducer.spec.ts
import { liveKitRoomReducer, initialState, LiveKitRoomState } from './livekit-room.reducer';
import * as LiveKitRoomActions from './livekit-room.actions';

describe('LiveKitRoom Reducer', () => {
  it('should return the initial state', () => {
    const action = { type: 'Unknown' } as any;
    const state = liveKitRoomReducer(initialState, action);

    expect(state).toBe(initialState);
  });

  it('should handle startMeetingSuccess', () => {
    const action = LiveKitRoomActions.startMeetingSuccess();
    const state = liveKitRoomReducer(initialState, action);

    expect(state.isMeetingStarted).toBe(true);
  });

  it('should handle startMeetingFailure', () => {
    const error = 'Test Error';
    const action = LiveKitRoomActions.startMeetingFailure({ error });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.isMeetingStarted).toBe(false);
    expect(state.error).toBe(error);
  });

  it('should handle toggleScreenShareSuccess', () => {
    const isScreenSharing = true;
    const action = LiveKitRoomActions.toggleScreenShareSuccess({
      isScreenSharing,
    });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.isScreenSharing).toBe(isScreenSharing);
    expect(state.iconColor).toBe('green');
  });

  it('should handle toggleScreenShareFailure', () => {
    const error = 'Screen share error';
    const action = LiveKitRoomActions.toggleScreenShareFailure({ error });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.error).toBe(error);
  });

  it('should handle toggleVideoSuccess', () => {
    const isVideoOn = true;
    const action = LiveKitRoomActions.toggleVideoSuccess({ isVideoOn });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.isVideoOn).toBe(isVideoOn);
  });

  it('should handle toggleVideoFailure', () => {
    const error = 'Video error';
    const action = LiveKitRoomActions.toggleVideoFailure({ error });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.error).toBe(error);
  });

  it('should handle toggleMicSuccess', () => {
    const isMicOn = true;
    const action = LiveKitRoomActions.toggleMicSuccess({ isMicOn });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.isMicOn).toBe(isMicOn);
  });

  it('should handle toggleMicFailure', () => {
    const error = 'Mic error';
    const action = LiveKitRoomActions.toggleMicFailure({ error });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.error).toBe(error);
  });

  it('should handle closeChatSideWindow', () => {
    const action = LiveKitRoomActions.closeChatSideWindow();
    const state = liveKitRoomReducer(
      { ...initialState, chatSideWindowVisible: true },
      action
    );

    expect(state.chatSideWindowVisible).toBe(false);
  });

  it('should handle closeParticipantSideWindow', () => {
    const action = LiveKitRoomActions.closeParticipantSideWindow();
    const state = liveKitRoomReducer(
      { ...initialState, participantSideWindowVisible: true },
      action
    );

    expect(state.participantSideWindowVisible).toBe(false);
  });

  it('should handle toggleParticipantSideWindow', () => {
    const action = LiveKitRoomActions.toggleParticipantSideWindow();
    const state = liveKitRoomReducer(initialState, action);

    expect(state.participantSideWindowVisible).toBe(true);
    expect(state.chatSideWindowVisible).toBe(false);
  });

  it('should handle toggleChatSideWindow', () => {
    const action = LiveKitRoomActions.toggleChatSideWindow();
    const state = liveKitRoomReducer(initialState, action);

    expect(state.chatSideWindowVisible).toBe(true);
    expect(state.unreadMessagesCount).toBe(0);
    expect(state.participantSideWindowVisible).toBe(false);
  });

  it('should handle updateUnreadMessagesCount', () => {
    const count = 5;
    const action = LiveKitRoomActions.updateUnreadMessagesCount({ count });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.unreadMessagesCount).toBe(count);
  });

  it('should handle updateMessages', () => {
    const allMessages = [
      { message: 'test message', timestamp: new Date(), type: 'received' },
    ];
    const action = LiveKitRoomActions.updateMessages({ allMessages });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.allMessages).toEqual(allMessages);
  });

  it('should handle receiveMessage', () => {
    const message = { message: 'received message', timestamp: new Date() };
    const participant = { identity: 'sender' };
    const action = LiveKitRoomActions.receiveMessage({ message, participant });
    const state = liveKitRoomReducer(initialState, action);

    expect(state.allMessages.length).toBe(1);
    expect(state.unreadMessagesCount).toBe(1);
  });

  // it('should handle sendMessage', () => {
  //   const message = 'sent message';
  //   const action = LiveKitRoomActions.sendMessage({ message });
  //   const state = liveKitRoomReducer(initialState, action);

  //   expect(state.allMessages.length).toBe(1);
  //   expect(state.allMessages[0].type).toBe('sent');
  // });
});
