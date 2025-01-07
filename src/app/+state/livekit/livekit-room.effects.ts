import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import * as LiveKitRoomActions from './livekit-room.actions';
import { v4 as uuidv4 } from 'uuid';
import {
  catchError,
  map,
  mergeAll,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { of, from, forkJoin, EMPTY } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingService } from 'src/app/meeting.service';
import { LivekitService } from 'src/app/livekit.service';
import {
  selectBreakoutRoomsData,
  selectLiveKitRoomViewState,
} from './livekit-room.selectors';
import { Store } from '@ngrx/store';
import { BreakoutRoomService } from 'src/app/breakout-room.service';

@Injectable()
export class LiveKitRoomEffects {
  constructor(
    private actions$: Actions,
    private livekitService: LivekitService,
    private meetingService: MeetingService,
    private snackBar: MatSnackBar,
    private store: Store,
    private breakoutRoomService: BreakoutRoomService
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
      tap(() =>
        this.store.dispatch(
          LiveKitRoomActions.LiveKitActions.setVideoLoading({ isLoading: true })
        )
      ),
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
      tap(() =>
        this.store.dispatch(
          LiveKitRoomActions.LiveKitActions.setMicLoading({ isLoading: true })
        )
      ),
      switchMap(() =>
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

  initiateManualRoomSelection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation),
      concatLatestFrom(() => this.store.select(selectBreakoutRoomsData)),
      mergeMap(([action, viewState]) => {
        try {
          console.log('Manual room selection initiated');
          console.log('Rooms data:', viewState);

          // Process each room and send invitations
          viewState.forEach((room) => {
            const { roomName, participantIds } = room;

            if (participantIds && participantIds.length > 0) {
              console.log(`Sending invitations to room: ${roomName}`);
              this.livekitService.breakoutRoomAlert(participantIds, roomName);
            } else {
              console.log(`No participants in room: ${roomName}`);
            }
          });

          // Dispatch success action
          return of(
            LiveKitRoomActions.BreakoutActions.breakoutRoomsInvitationSuccess({
              message: 'Invitations sent successfully',
            })
          );
        } catch (error) {
          console.error('Error during manual room selection:', error);

          // Dispatch failure action
          return of(
            LiveKitRoomActions.BreakoutActions.breakoutRoomsInvitationFailure({
              error: 'Failed to send invitations',
            })
          );
        }
      })
    )
  );

  // Utility function to split participants into rooms
  createAutomaticRooms$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation
        ),
        switchMap(({ participants, numberOfRooms }) => {
          // Step 1: Split participants into rooms
          const rooms = this.splitParticipantsIntoRooms(
            participants,
            numberOfRooms
          );
          const roomName = this.livekitService.getRoomName();

          // Step 2: Prepare breakout room data
          const breakoutRoomsData = rooms.map((roomParticipants, index) => ({
            participantIds: roomParticipants,
            roomName: `${roomName} Room ${index + 1}`,
            type: 'automatic',
          }));

          // Step 3: Send breakout room alerts and add participants
          const addParticipantActions = breakoutRoomsData.flatMap((room) =>
            room.participantIds.map((participantId) => {
              // Send invitation (side effect)
              this.livekitService.breakoutRoomAlert(
                [participantId],
                room.roomName
              );

              // Dispatch action to add participant to the room
              return LiveKitRoomActions.BreakoutActions.addParticipantToRoom({
                roomName: room.roomName,
                participantId,
              });
            })
          );

          // Step 4: Dispatch all `addParticipantToRoom` actions
          return of(...addParticipantActions);
        })
      ),
    { dispatch: true } // Allow dispatching actions
  );

  splitParticipantsIntoRooms(participants: string[], numberOfRooms: number) {
    const rooms: string[][] = Array.from({ length: numberOfRooms }, () => []);
    participants.forEach((participant, index) => {
      const roomIndex = index % numberOfRooms;
      rooms[roomIndex].push(participant);
    });
    return rooms;
  }
  loadBreakoutRooms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.BreakoutActions.loadBreakoutRooms), // Action to trigger breakout rooms loading
      switchMap(() => {
        // const roomName = 'test-room';
        const roomName = this.livekitService.getRoomName();
        return this.breakoutRoomService.getAllBreakoutRooms(roomName).pipe(
          map(
            (rooms) =>
              LiveKitRoomActions.BreakoutActions.loadBreakoutRoomsSuccess({
                breakoutRoomsData: rooms,
              }) // Action to update state
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.BreakoutActions.loadBreakoutRoomsFailure({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );
}
