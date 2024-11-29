import { createSelector, createFeatureSelector } from '@ngrx/store';
import { LiveKitRoomState } from './livekit-room.reducer';

// Feature selector
export const selectLiveKitRoomState =
  createFeatureSelector<LiveKitRoomState>('liveKitRoom');

// // Specific property selectors
// export const selectIsMeetingStarted = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => {
//     console.log('Meeting started is ', state.isMeetingStarted);
//     return state.isMeetingStarted;
//   }
// );

// export const selectIsVideoOn = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => state.isVideoOn
// );

// export const selectParticipantSideWindowVisible = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => state.participantSideWindowVisible
// );

// export const selectChatSideWindowVisible = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => state.chatSideWindowVisible
// );

// export const selectIsScreenSharing = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => state.isScreenSharing
// );

// export const selectIconColor = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => state.iconColor
// );

// export const selectIsMicOn = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => {
//     console.log('selector mic', state.isMicOn);
//     return state.isMicOn;
//   }
// );

// export const selectAllMessages = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => {
//     console.log('msg is ', state.allMessages);
//     return state.allMessages;
//   }
// );

// export const selectUnreadMessagesCount = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => {
//     console.log('selector unreads', state.unreadMessagesCount);
//     return state.unreadMessagesCount;
//   }
// );

// export const selectBreakoutSideWindowVisible = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => state.breakoutSideWindowVisible
// );

// export const isBreakoutModalOpen = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => {
//     return state.isBreakoutModalOpen;
//   }
// );
// export const isInvitationModalOpen = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => {
//     return state.isInvitationModalOpen;
//   }
// );

// export const isHostMsgModalOpen = createSelector(
//   selectLiveKitRoomState,
//   (state: LiveKitRoomState) => {
//     console.log('hello invitation', state.isHostMsgModalOpen);
//     return state.isHostMsgModalOpen;
//   }
// );
// export const selectDistributionMessage = createSelector(
//   selectLiveKitRoomState,
//   (state) => state.distributionMessage
// );
// export const selectBreakoutRoomsData = createSelector(
//   selectLiveKitRoomState,
//   (state) => {
//     console.log('br from selector', state.breakoutRoomsData);
//     return state.breakoutRoomsData;
//   }
// );
// export const selectNextRoomIndex = createSelector(
//   selectLiveKitRoomState,
//   (state) => state.nextRoomIndex
// );

// export const selectHelpMessageModal = createSelector(
//   selectLiveKitRoomState,
//   (state) => {
//     console.log('helpmessage ', state.helpMessageModal);
//     return state.helpMessageModal;
//   }
// );

export const selectLiveKitRoomViewState = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => ({
    isMeetingStarted: state.isMeetingStarted,
    isScreenSharing: state.isScreenSharing,
    iconColor: state.iconColor,
    isVideoOn: state.isVideoOn,
    participantSideWindowVisible: state.participantSideWindowVisible,
    breakoutSideWindowVisible: state.breakoutSideWindowVisible,
    chatSideWindowVisible: state.chatSideWindowVisible,
    allMessages: state.allMessages,
    unreadMessagesCount: state.unreadMessagesCount,
    isMicOn: state.isMicOn,
    isBreakoutModalOpen: state.isBreakoutModalOpen,
    isInvitationModalOpen: state.isInvitationModalOpen,
    isHostMsgModalOpen: state.isHostMsgModalOpen,
    distributionMessage: state.distributionMessage,
    breakoutRoomsData: state.breakoutRoomsData,
    nextRoomIndex: state.nextRoomIndex,
    helpMessageModal: state.helpMessageModal,
  })
);
