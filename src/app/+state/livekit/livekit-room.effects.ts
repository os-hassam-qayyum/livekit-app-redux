import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LivekitService } from '../../livekit.service';
import * as LiveKitRoomActions from './livekit-room.actions';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class LiveKitRoomEffects {
  constructor(
    private actions$: Actions,
    private livekitService: LivekitService,
    private snackBar: MatSnackBar
  ) {}

  startMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.startMeeting),
      mergeMap((action) =>
        from(
          this.livekitService.connectToRoom(action.wsURL, action.token)
        ).pipe(
          tap(() => console.log('Starting meet', action)),
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
          // tap((isScreenSharing) =>
          //   console.log('Effect: Result from service', isScreenSharing)
          // ),
          map((isScreenSharing: any) =>
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
            of(LiveKitRoomActions.leaveMeetingFailure({ error }))
          )
        )
      )
    )
  );
}
