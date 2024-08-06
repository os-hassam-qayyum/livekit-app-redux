// selectors.spec.ts
import { LiveKitRoomState } from './livekit-room.reducer';
import * as fromSelectors from './livekit-room.selectors';

describe('LiveKitRoom Selectors', () => {
  const initialState: LiveKitRoomState = {
    isMeetingStarted: false,
    allMessages: [],
    unreadMessagesCount: 0,
    isVideoOn: false,
    isMicOn: false,
    isScreenSharing: false,
    iconColor: 'black',
    participantSideWindowVisible: false,
    chatSideWindowVisible: false,
  };

  const modifiedState: LiveKitRoomState = {
    ...initialState,
    isMeetingStarted: true,
    isVideoOn: true,
    isMicOn: true,
    isScreenSharing: true,
    iconColor: 'green',
    participantSideWindowVisible: true,
    chatSideWindowVisible: true,
    allMessages: [{ message: 'test', timestamp: new Date(), type: 'received' }],
    unreadMessagesCount: 1,
  };

  it('should select isMeetingStarted', () => {
    const result =
      fromSelectors.selectIsMeetingStarted.projector(modifiedState);
    expect(result).toBe(true);
  });

  it('should select isVideoOn', () => {
    const result = fromSelectors.selectIsVideoOn.projector(modifiedState);
    expect(result).toBe(true);
  });

  it('should select participantSideWindowVisible', () => {
    const result =
      fromSelectors.selectParticipantSideWindowVisible.projector(modifiedState);
    expect(result).toBe(true);
  });

  it('should select chatSideWindowVisible', () => {
    const result =
      fromSelectors.selectChatSideWindowVisible.projector(modifiedState);
    expect(result).toBe(true);
  });

  it('should select isScreenSharing', () => {
    const result = fromSelectors.selectIsScreenSharing.projector(modifiedState);
    expect(result).toBe(true);
  });

  it('should select iconColor', () => {
    const result = fromSelectors.selectIconColor.projector(modifiedState);
    expect(result).toBe('green');
  });

  it('should select isMicOn', () => {
    const result = fromSelectors.selectIsMicOn.projector(modifiedState);
    expect(result).toBe(true);
  });

  // it('should select allMessages', () => {
  //   const result = fromSelectors.selectAllMessages.projector(modifiedState);
  //   expect(result).toEqual([
  //     { message: 'test', timestamp: new Date(), type: 'received' },
  //   ]);
  // });

  it('should select unreadMessagesCount', () => {
    const result =
      fromSelectors.selectUnreadMessagesCount.projector(modifiedState);
    expect(result).toBe(1);
  });
});
