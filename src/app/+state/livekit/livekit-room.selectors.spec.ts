// selectors.spec.ts
import {
  selectIsMeetingStarted,
  selectIsVideoOn,
  selectLiveKitRoomState,
  selectParticipantSideWindowVisible,
  selectChatSideWindowVisible,
  selectIsScreenSharing,
  selectIconColor,
  selectIsMicOn,
  selectAllMessages,
  selectUnreadMessagesCount,
} from './livekit-room.selectors';
import { LiveKitRoomState } from './livekit-room.reducer';

import * as fromSelectors from './livekit-room.selectors';
describe('LiveKitRoom Selectors', () => {
  const mockState: LiveKitRoomState = {
    isMeetingStarted: true,
    isVideoOn: true,
    participantSideWindowVisible: false,
    chatSideWindowVisible: true,
    isScreenSharing: false,
    iconColor: 'blue',
    isMicOn: true,
    allMessages: ['Hello', 'World'],
    unreadMessagesCount: 2,
  };

  it('should select the liveKitRoom feature state', () => {
    const result = selectLiveKitRoomState.projector(mockState);
    expect(result).toEqual(mockState);
  });

  it('should select whether the meeting is started', () => {
    const result = selectIsMeetingStarted.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select whether the video is on', () => {
    const result = selectIsVideoOn.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select whether the participant side window is visible', () => {
    const result = selectParticipantSideWindowVisible.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select whether the chat side window is visible', () => {
    const result = selectChatSideWindowVisible.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select whether the screen is sharing', () => {
    const result = selectIsScreenSharing.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select the icon color', () => {
    const result = selectIconColor.projector(mockState);
    expect(result).toBe('blue');
  });

  it('should select whether the mic is on', () => {
    const result = selectIsMicOn.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select all messages', () => {
    const result = selectAllMessages.projector(mockState);
    expect(result).toEqual(['Hello', 'World']);
  });

  it('should select unread messages count', () => {
    const result = selectUnreadMessagesCount.projector(mockState);
    expect(result).toBe(2);
  });
});
