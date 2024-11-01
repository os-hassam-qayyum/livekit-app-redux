import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as LiveKitRoomActions from './livekit-room.actions';

import {
  catchError,
  map,
  mergeAll,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { of, from, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingService } from 'src/app/meeting.service';
import { LivekitService } from 'src/app/livekit.service';
import {
  selectBreakoutRoomsData,
  selectNextRoomIndex,
} from './livekit-room.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class LiveKitRoomEffects {
  constructor(
    private actions$: Actions,
    private livekitService: LivekitService,
    private meetingService: MeetingService,
    private snackBar: MatSnackBar,
    private store: Store
  ) {}

  createMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.MeetingActions.createMeeting),
      mergeMap((action) => {
        const participantObservables = action.participantNames.map(
          (participantName) =>
            this.meetingService
              .createMeeting(participantName, action.roomName)
              .pipe(map((response) => response.token))
        );

        // Use forkJoin directly on participantObservables
        return forkJoin(participantObservables).pipe(
          map((tokens) => {
            return LiveKitRoomActions.LiveKitActions.startMeeting({
              wsURL: 'wss://hassam-app-fu1y3ybu.livekit.cloud',
              token: tokens[0], // Use the first token
            });
          }),
          catchError((error) =>
            of(
              LiveKitRoomActions.MeetingActions.createMeetingFailure({ error })
            )
          )
        );
      })
    )
  );

  startMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.startMeeting),
      mergeMap((action) =>
        from(
          this.livekitService.connectToRoom(action.wsURL, action.token)
        ).pipe(
          tap(() => console.log('Starting meeting with token:', action.token)),
          map(() => LiveKitRoomActions.LiveKitActions.startMeetingSuccess()),
          catchError((error) =>
            of(
              LiveKitRoomActions.LiveKitActions.startMeetingFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  toggleScreenShare$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.toggleScreenShare),
      mergeMap(() =>
        from(this.livekitService.toggleScreenShare()).pipe(
          tap((isScreenSharing) =>
            console.log('Effect: Result from service', isScreenSharing)
          ),
          map((isScreenSharing: boolean) =>
            LiveKitRoomActions.LiveKitActions.toggleScreenShareSuccess({
              isScreenSharing,
            })
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.LiveKitActions.toggleScreenShareFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  toggleVideo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.toggleVideo),
      switchMap(() =>
        this.livekitService.toggleVideo().pipe(
          map((isVideoOn: boolean) =>
            LiveKitRoomActions.LiveKitActions.toggleVideoSuccess({ isVideoOn })
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.LiveKitActions.toggleVideoFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  toggleMicrophone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.toggleMic),
      mergeMap(() =>
        from(this.livekitService.toggleMicrophone()).pipe(
          tap((isMicOn) => console.log('microphone in effects', isMicOn)),
          map((isMicOn: any) =>
            LiveKitRoomActions.LiveKitActions.toggleMicSuccess({ isMicOn })
          ),
          catchError((error) =>
            from([
              LiveKitRoomActions.LiveKitActions.toggleMicFailure({ error }),
            ])
          )
        )
      )
    )
  );
  enableCameraAndMicrophone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophone),
      mergeMap(() =>
        from(this.livekitService.enableCameraAndMicrophone()).pipe(
          map(() =>
            LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneSuccess()
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneFailure(
                {
                  error: error.message,
                }
              )
            )
          )
        )
      )
    )
  );

  leaveMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.MeetingActions.leaveMeeting),
      switchMap(() =>
        this.livekitService.disconnectRoom().pipe(
          map(() => {
            this.snackBar.open('You Left the meeting', '', { duration: 2000 });
            return LiveKitRoomActions.MeetingActions.leaveMeetingSuccess();
          }),
          catchError((error) =>
            of(
              LiveKitRoomActions.MeetingActions.leaveMeetingFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );
  sendChatMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LiveKitRoomActions.ChatActions.sendChatMessage),
        switchMap(({ msg, recipient }) => {
          // Call the LiveKit service to send the message
          this.livekitService.sendChatMessage({ msg, recipient });
          return []; // No further actions to dispatch
        })
      ),
    { dispatch: false } // No action is dispatched after this effect
  );
  //send message to breakout room
  sendMessageToBreakoutRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom),
      mergeMap((action) =>
        this.livekitService
          .sendMessageToBreakoutRoom(action.breakoutRoom, action.messageContent)
          .pipe(
            map(() =>
              LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomSuccess()
            ),
            catchError((error) =>
              of(
                LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomFailure(
                  { error }
                )
              )
            )
          )
      )
    )
  );
  sendHelpRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.ChatActions.sendHelpRequest),
      mergeMap((action) =>
        this.livekitService
          .sendMessageToMainRoom(action.roomName, 'I need help')
          .pipe(
            map(() => LiveKitRoomActions.ChatActions.sendHelpRequestSuccess()),
            catchError((error) =>
              of(
                LiveKitRoomActions.ChatActions.sendHelpRequestFailure({ error })
              )
            )
          )
      )
    )
  );

  initiateCreateNewRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.BreakoutActions.initiateCreateNewRoom),
      mergeMap(() =>
        this.store.select(selectNextRoomIndex).pipe(
          take(1), // Take the first emitted value
          map((nextRoomIndex) => {
            const newRoomName = `Breakout_Room_${nextRoomIndex}`;
            console.log(newRoomName, 'new room name is');
            return LiveKitRoomActions.BreakoutActions.createNewRoomSuccess({
              roomName: newRoomName,
            });
          })
        )
      ),
      // Dispatch the action to create a new room
      mergeMap((action) => [action])
    )
  );
  // manual
  initiateManualRoomSelection$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection),
        switchMap(({ roomType }) => {
          if (roomType === 'manual') {
            console.log('Manual room selection initiated');

            return this.store.select(selectBreakoutRoomsData).pipe(
              take(1),
              map((breakoutRoomsData) => {
                console.log('rooms data is', breakoutRoomsData);
                // Emit updated breakout rooms data, even if it's empty
                this.livekitService.breakoutRoomsDataUpdated.emit(
                  breakoutRoomsData
                );

                if (breakoutRoomsData.length > 0) {
                  breakoutRoomsData.forEach((room) => {
                    const roomParticipants = room.participantIds;
                    const roomName = room.roomName;

                    if (roomParticipants && roomParticipants.length > 0) {
                      console.log(`Sending invitations to room: ${roomName}`);
                      this.livekitService.breakoutRoomAlert(
                        roomParticipants,
                        roomName
                      );
                    } else {
                      console.log(
                        `No participants selected for room: ${room.roomName}`
                      );
                    }
                  });
                } else {
                  console.log('No breakout rooms configured.');
                }
              })
            );
          }
          return [];
        })
      ),
    { dispatch: false } // No action is dispatched after this effect
  );
  createAutomaticRooms$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation
        ),
        switchMap(({ participants, numberOfRooms }) => {
          const rooms = this.splitParticipantsIntoRooms(
            participants,
            numberOfRooms
          );

          // Prepare breakout room data
          const breakoutRoomsData = rooms.map((roomParticipants, index) => ({
            participantIds: roomParticipants,
            roomName: `Breakout_Room_${index + 1}`,
            type: 'automatic',
          }));

          // Send invitations and emit updates
          breakoutRoomsData.forEach((room) => {
            this.livekitService.breakoutRoomAlert(
              room.participantIds,
              room.roomName
            );
          });

          // Emit the updated breakout rooms data
          this.livekitService.breakoutRoomsDataUpdated.emit(breakoutRoomsData);

          return of(); // Return empty observable since we're not dispatching further actions
        })
      ),
    { dispatch: false } // No action is dispatched after this effect
  );

  // Utility function to split participants into rooms
  splitParticipantsIntoRooms(participants: string[], numberOfRooms: number) {
    const rooms: string[][] = Array.from({ length: numberOfRooms }, () => []);
    participants.forEach((participant, index) => {
      const roomIndex = index % numberOfRooms;
      rooms[roomIndex].push(participant);
    });
    return rooms;
  }
}
