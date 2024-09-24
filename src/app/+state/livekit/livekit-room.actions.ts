import { createAction, props } from '@ngrx/store';
import { RemoteTrack } from 'livekit-client';

export const startMeeting = createAction(
  '[LiveKit Room] Start Meeting',
  props<{ wsURL: string; token: string }>()
);

export const startMeetingSuccess = createAction(
  '[LiveKit Room] Start Meeting Success'
);

export const startMeetingFailure = createAction(
  '[LiveKit Room] Start Meeting Failure',
  props<{ error: string }>()
);

export const enableCameraAndMicrophone = createAction(
  '[LiveKit Room] Enable Camera and Microphone'
);

export const enableCameraAndMicrophoneSuccess = createAction(
  '[LiveKit Room] Enable Camera and Microphone Success'
);

export const enableCameraAndMicrophoneFailure = createAction(
  '[LiveKit Room] Enable Camera and Microphone Failure',
  props<{ error: string }>()
);

export const toggleRaiseHand = createAction('[LiveKit Room] Toggle Raise Hand');

export const leaveMeeting = createAction('[LiveKit Room] Leave Meeting');
export const leaveMeetingSuccess = createAction(
  '[Meeting] Leave Meeting Success'
);

export const leaveMeetingFailure = createAction(
  '[Meeting] Leave Meeting Failure',
  props<{ error: any }>()
);

export const toggleScreenShare = createAction(
  '[LiveKit Room] Toggle Screen Share'
);

export const toggleScreenShareSuccess = createAction(
  '[LiveKit] Toggle Screen Share Success',
  props<{ isScreenSharing: boolean }>()
);

export const toggleScreenShareFailure = createAction(
  '[LiveKit Room] Toggle Screen Share Failure',
  props<{ error: string }>()
);

export const toggleVideo = createAction('[LiveKit Room] Toggle Video');

export const toggleVideoSuccess = createAction(
  '[LiveKit Room] Toggle Video Success',
  props<{ isVideoOn: boolean }>()
);

export const toggleVideoFailure = createAction(
  '[LiveKit Room] Toggle Video Failure',
  props<{ error: string }>()
);

export const toggleMic = createAction('[LiveKit Room] Toggle Mic');

export const toggleMicSuccess = createAction(
  '[LiveKit Room] Toggle Mic Success',
  props<{ isMicOn: boolean }>()
);

export const toggleMicFailure = createAction(
  '[LiveKit Room] Toggle Mic Failure',
  props<{ error: string }>()
);

export const toggleParticipantSideWindow = createAction(
  '[LiveKit Room] Toggle Participant Side Window'
);

export const toggleChatSideWindow = createAction(
  '[LiveKit Room] Toggle Chat Side Window'
);

export const closeChatSideWindow = createAction(
  '[LiveKit Room] Close Side Window'
);
export const closeParticipantSideWindow = createAction(
  '[LiveKit Room] Close Side Window'
);

export const updateUnreadMessagesCount = createAction(
  '[LiveKit Room] Update Unread Messages Count',
  props<{ count: number }>()
);

export const updateMessages = createAction(
  '[LiveKit Room] Update Messages',
  props<{ allMessages: any[] }>()
);

export const receiveMessage = createAction(
  '[Chat] Receive Message',
  props<{ message: any; participant: any }>()
);
export const sendMessage = createAction(
  '[LiveKit Room] Send Message',
  props<{ message: string; recipient: string }>()
);

export const scrollToBottom = createAction('[LiveKit Room] Scroll To Bottom');

export const createMeeting = createAction(
  '[LiveKit] Create Meeting',
  props<{ participantNames: string[]; roomName: string }>() // Change to accept an array of participant names
);

export const createMeetingSuccess = createAction(
  '[Meeting] Create Meeting Success',
  props<{ token: string }>()
);

export const createMeetingFailure = createAction(
  '[Meeting] Create Meeting Failure',
  props<{ error: any }>()
);
