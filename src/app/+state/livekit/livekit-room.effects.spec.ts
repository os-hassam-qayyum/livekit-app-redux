import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { LivekitService } from '../../livekit.service';
import * as LiveKitRoomActions from './livekit-room.actions';
import { Action } from '@ngrx/store';
import { LiveKitRoomEffects } from './livekit-room.effects';

describe('LiveKitRoomEffects', () => {
  let actions$: Observable<Action>;
  let effects: LiveKitRoomEffects;
  let livekitService: jasmine.SpyObj<LivekitService>;

  beforeEach(() => {
    const livekitServiceSpy = jasmine.createSpyObj('LiveKitService', [
      'connectToRoom',
      'toggleScreenShare',
      'toggleVideo',
      'toggleMicrophone',
      'enableCameraAndMicrophone',
    ]);

    TestBed.configureTestingModule({
      providers: [
        LiveKitRoomEffects,
        provideMockActions(() => actions$),
        { provide: LivekitService, useValue: livekitServiceSpy },
      ],
    });

    effects = TestBed.inject(LiveKitRoomEffects);
    livekitService = TestBed.inject(
      LivekitService
    ) as jasmine.SpyObj<LivekitService>;
  });

  describe('startMeeting$', () => {
    it('should dispatch startMeetingSuccess on successful connection', (done) => {
      const wsURL = 'wss://example.com';
      const token = 'example-token';
      const action = LiveKitRoomActions.startMeeting({ wsURL, token });
      const successAction = LiveKitRoomActions.startMeetingSuccess();

      actions$ = of(action);
      livekitService.connectToRoom.and.returnValue(Promise.resolve());

      effects.startMeeting$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch startMeetingFailure on failed connection', (done) => {
      const wsURL = 'wss://example.com';
      const token = 'example-token';
      const error = new Error('Connection failed');
      const action = LiveKitRoomActions.startMeeting({ wsURL, token });
      const failureAction = LiveKitRoomActions.startMeetingFailure({
        error: error.message,
      });

      actions$ = of(action);
      livekitService.connectToRoom.and.returnValue(Promise.reject(error));

      effects.startMeeting$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });
  describe('toggleScreenShare$', () => {
    it('should dispatch toggleScreenShareSuccess on successful toggle', (done) => {
      const isScreenSharing = true;
      const action = LiveKitRoomActions.toggleScreenShare();
      const successAction = LiveKitRoomActions.toggleScreenShareSuccess({
        isScreenSharing,
      });

      actions$ = of(action);
      livekitService.toggleScreenShare.and.returnValue(
        Promise.resolve(isScreenSharing)
      );

      effects.toggleScreenShare$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleScreenShareFailure on failed toggle', (done) => {
      const error = new Error('Toggle failed');
      const action = LiveKitRoomActions.toggleScreenShare();
      const failureAction = LiveKitRoomActions.toggleScreenShareFailure({
        error: error.message,
      });

      actions$ = of(action);
      livekitService.toggleScreenShare.and.returnValue(Promise.reject(error));

      effects.toggleScreenShare$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('toggleVideo$', () => {
    it('should dispatch toggleVideoSuccess on successful toggle', (done) => {
      const isVideoOn = true;
      const action = LiveKitRoomActions.toggleVideo();
      const successAction = LiveKitRoomActions.toggleVideoSuccess({
        isVideoOn,
      });

      actions$ = of(action);
      livekitService.toggleVideo.and.returnValue(of(isVideoOn));

      effects.toggleVideo$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleVideoFailure on failed toggle', (done) => {
      const error = new Error('Toggle failed');
      const action = LiveKitRoomActions.toggleVideo();
      const failureAction = LiveKitRoomActions.toggleVideoFailure({
        error: error.message,
      });

      actions$ = of(action);
      livekitService.toggleVideo.and.returnValue(throwError(error));

      effects.toggleVideo$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('toggleMicrophone$', () => {
    it('should dispatch toggleMicSuccess on successful toggle', (done) => {
      const isMicOn = true;
      const action = LiveKitRoomActions.toggleMic();
      const successAction = LiveKitRoomActions.toggleMicSuccess({ isMicOn });

      actions$ = of(action);
      livekitService.toggleMicrophone.and.returnValue(of(isMicOn));

      effects.toggleMicrophone$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleMicFailure on failed toggle', (done) => {
      const error = 'Toggle failed'; // Use a string for consistency
      const action = LiveKitRoomActions.toggleMic();
      const failureAction = LiveKitRoomActions.toggleMicFailure({
        error,
      });

      actions$ = of(action);
      livekitService.toggleMicrophone.and.returnValue(throwError(error));

      effects.toggleMicrophone$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  //   describe('enableCameraAndMicrophone$', () => {
  //     it('should dispatch enableCameraAndMicrophoneSuccess on successful enable', (done) => {
  //       const action = LiveKitRoomActions.enableCameraAndMicrophone();
  //       const successAction =
  //         LiveKitRoomActions.enableCameraAndMicrophoneSuccess();

  //       actions$ = of(action);
  //       livekitService.enableCameraAndMicrophone.and.returnValue(
  //         Promise.resolve()
  //       ); // Simulate success with resolved Promise

  //       effects.enableCameraAndMicrophone$.subscribe((result) => {
  //         expect(result).toEqual(successAction);
  //         done();
  //       });
  //     });

  //     it('should dispatch enableCameraAndMicrophoneFailure on failed enable', (done) => {
  //       const error = new Error('Enable failed');
  //       const action = LiveKitRoomActions.enableCameraAndMicrophone();
  //       const failureAction = LiveKitRoomActions.enableCameraAndMicrophoneFailure(
  //         {
  //           error: error.message,
  //         }
  //       );

  //       actions$ = of(action);
  //       livekitService.enableCameraAndMicrophone.and.returnValue(
  //         Promise.reject(error)
  //       ); // Simulate failure with rejected Promise

  //       effects.enableCameraAndMicrophone$.subscribe((result) => {
  //         expect(result).toEqual(failureAction);
  //         done();
  //       });
  //     });
  //   });
});
