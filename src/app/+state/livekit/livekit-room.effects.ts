import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as LiveKitRoomActions from './livekit-room.actions';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of, from, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingService } from 'src/app/meeting.service';
import { LivekitService } from 'src/app/livekit.service';

@Injectable()
export class LiveKitRoomEffects {
  constructor(
    private actions$: Actions,
    private livekitService: LivekitService,
    private meetingService: MeetingService,
    private snackBar: MatSnackBar
  ) {}

  // createMeeting$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(LiveKitRoomActions.createMeeting),
  //     mergeMap((action) => {
  //       // Map through all the participants and return an observable for each meeting creation
  //       const participantObservables = action.participantNames.map(
  //         (participantName) =>
  //           this.meetingService
  //             .createMeeting(participantName, action.roomName)
  //             .pipe(
  //               map((response) => response.token) // Extract the token from each response
  //             )
  //       );

  //       // Combine all participant observables using forkJoin to wait until all have emitted their values
  //       return from(participantObservables).pipe(
  //         switchMap((observablesArray) => forkJoin(observablesArray)),
  //         map((tokens) => {
  //           // Once all tokens are available, we use the first token to start the meeting
  //           return LiveKitRoomActions.startMeeting({
  //             wsURL: 'wss://hassam-app-fu1y3ybu.livekit.cloud',
  //             token: tokens[0], // Use one token (all participants are in the same room)
  //           });
  //         }),
  //         catchError((error) =>
  //           of(LiveKitRoomActions.createMeetingFailure({ error }))
  //         )
  //       );
  //     })
  //   )
  // );

  createMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.createMeeting),
      mergeMap((action) =>
        this.meetingService
          .createMeeting(action.participantName, action.roomName) // Use the single participant name
          .pipe(
            map((response) => response.token), // Extract the token from the response
            switchMap((token) =>
              of(
                LiveKitRoomActions.startMeeting({
                  wsURL: 'wss://hassam-app-fu1y3ybu.livekit.cloud',
                  token: token, // Use the token for starting the meeting
                })
              )
            ),
            catchError((error) =>
              of(LiveKitRoomActions.createMeetingFailure({ error }))
            )
          )
      )
    )
  );

  startMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.startMeeting),
      mergeMap((action) =>
        from(
          this.livekitService.connectToRoom(action.wsURL, action.token)
        ).pipe(
          tap(() => console.log('Starting meeting with token:', action.token)),
          map(() => LiveKitRoomActions.startMeetingSuccess()),
          catchError((error) =>
            of(LiveKitRoomActions.startMeetingFailure({ error: error.message }))
          )
        )
      )
    )
  );

  toggleScreenShare$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.toggleScreenShare),
      mergeMap(() =>
        from(this.livekitService.toggleScreenShare()).pipe(
          tap((isScreenSharing) =>
            console.log('Effect: Result from service', isScreenSharing)
          ),
          map((isScreenSharing: boolean) =>
            LiveKitRoomActions.toggleScreenShareSuccess({ isScreenSharing })
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.toggleScreenShareFailure({
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
      ofType(LiveKitRoomActions.toggleVideo),
      switchMap(() =>
        this.livekitService.toggleVideo().pipe(
          map((isVideoOn: boolean) =>
            LiveKitRoomActions.toggleVideoSuccess({ isVideoOn })
          ),
          catchError((error) =>
            of(LiveKitRoomActions.toggleVideoFailure({ error: error.message }))
          )
        )
      )
    )
  );

  toggleMicrophone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.toggleMic),
      mergeMap(() =>
        from(this.livekitService.toggleMicrophone()).pipe(
          tap((isMicOn) => console.log('microphone in effects', isMicOn)),
          map((isMicOn: any) =>
            LiveKitRoomActions.toggleMicSuccess({ isMicOn })
          ),
          catchError((error) =>
            from([LiveKitRoomActions.toggleMicFailure({ error })])
          )
        )
      )
    )
  );
  enableCameraAndMicrophone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.enableCameraAndMicrophone),
      mergeMap(() =>
        from(this.livekitService.enableCameraAndMicrophone()).pipe(
          map(() => LiveKitRoomActions.enableCameraAndMicrophoneSuccess()),
          catchError((error) =>
            of(
              LiveKitRoomActions.enableCameraAndMicrophoneFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  leaveMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.leaveMeeting),
      switchMap(() =>
        this.livekitService.disconnectRoom().pipe(
          map(() => {
            this.snackBar.open('You Left the meeting', '', { duration: 2000 });
            return LiveKitRoomActions.leaveMeetingSuccess();
          }),
          catchError((error) =>
            of(LiveKitRoomActions.leaveMeetingFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
