// import { TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { AppComponent } from './app.component';

// describe('AppComponent', () => {
//   beforeEach(() => TestBed.configureTestingModule({
//     imports: [RouterTestingModule],
//     declarations: [AppComponent]
//   }));

//   it('should create the app', () => {
//     const fixture = TestBed.createComponent(AppComponent);
//     const app = fixture.componentInstance;
//     expect(app).toBeTruthy();
//   });

//   it(`should have as title 'livekit-app-redux'`, () => {
//     const fixture = TestBed.createComponent(AppComponent);
//     const app = fixture.componentInstance;
//     expect(app.title).toEqual('livekit-app-redux');
//   });

//   it('should render title', () => {
//     const fixture = TestBed.createComponent(AppComponent);
//     fixture.detectChanges();
//     const compiled = fixture.nativeElement as HTMLElement;
//     expect(compiled.querySelector('.content span')?.textContent).toContain('livekit-app-redux app is running!');
//   });
// });

import {
  ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LivekitService } from './livekit.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { ElementRef } from '@angular/core';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { Store, StoreModule } from '@ngrx/store';
import * as LiveKitRoomActions from './+state/livekit/livekit-room.actions';
import { AppComponent } from './app.component';

class MockLiveKitService {
  toggleVideo() {
    return Promise.resolve();
  }
}
describe('AppComponent;', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockLiveKitService: LivekitService;
  let mockMatDialog: MatDialog;
  let mockMatSnackBar: MatSnackBar;
  let mockLivekitService: any;
  let msgDataReceived: Subject<any>;
  let messageEmitter: Subject<any>;
  let store: any;
  let dispatchSpy: jasmine.Spy;

  beforeEach(async () => {
    // mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
    // mockMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    msgDataReceived = new Subject<any>();
    messageEmitter = new Subject<any>();
    // toggleVideo: jasmine
    //   .createSpy('toggleVideo')
    //   .and.returnValue(Promise.resolve());
    mockLivekitService = {
      localParticipantData: msgDataReceived.asObservable(),
      messageEmitter: messageEmitter.asObservable(),
      msgDataReceived: msgDataReceived.asObservable(),
      sendChatMessage: jasmine.createSpy('sendChatMessage'),
      toggleVideo: jasmine
        .createSpy('toggleVideo')
        .and.returnValue(Promise.resolve()),
      connectToRoom: jasmine
        .createSpy('connectToRoom')
        .and.returnValue(Promise.resolve()),
      enableCameraAndMicrophone: jasmine
        .createSpy('enableCameraAndMicrophone')
        .and.returnValue(Promise.resolve()),
    };
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
        StoreModule.forRoot({}),
      ],
      declarations: [AppComponent],
      providers: [
        { provide: LivekitService },
        // { provide: LiveKitService, useClass: MockLiveKitService },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('MatDialog', ['open']),
        },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('MatSnackBar', ['open']),
        },
      ],
    });

    mockLiveKitService = TestBed.inject(LivekitService);
    mockMatDialog = TestBed.inject(MatDialog);
    mockMatSnackBar = TestBed.inject(MatSnackBar);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
  });
  // afterEach(() => {
  //   fixture.destroy();
  // });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });
  // describe('start meeting', () => {
  it('should dispatch startMeeting action with correct payload', async () => {
    const dynamicToken = 'some-token';
    component.startForm.value.token = dynamicToken;

    await component.startMeeting();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      LiveKitRoomActions.startMeeting({
        wsURL: 'wss://warda-ldb690y8.livekit.cloud',
        token: dynamicToken,
      })
    );
  });
  // });
  describe('Extract Initials', () => {
    it('should extract initials from a single word name', () => {
      const name = 'John';
      const expectedInitials = 'J';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should extract initials from a multi-word name', () => {
      const name = 'John Doe';
      const expectedInitials = 'JD';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should extract initials from a name with multiple spaces', () => {
      const name = 'John  Doe';
      const expectedInitials = 'JD';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should return an empty string for an empty name', () => {
      const name = '';
      const expectedInitials = '';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });
  });

  describe('Sort Messages', () => {
    it('should sort messages by receivingTime or sendingTime in ascending order', () => {
      const messages = [
        { receivingTime: '2022-01-01T10:00:00.000Z' },
        { sendingTime: '2022-01-01T09:00:00.000Z' },
        { receivingTime: '2022-01-01T11:00:00.000Z' },
        { sendingTime: '2022-01-01T08:00:00.000Z' },
      ];

      component.allMessages = messages;
      component.sortMessages();

      const expectedOrder = [
        { sendingTime: '2022-01-01T08:00:00.000Z' },
        { sendingTime: '2022-01-01T09:00:00.000Z' },
        { receivingTime: '2022-01-01T10:00:00.000Z' },
        { receivingTime: '2022-01-01T11:00:00.000Z' },
      ];

      expect(component.allMessages).toEqual(expectedOrder);
    });

    it('should sort messages by receivingTime if both receivingTime and sendingTime are present', () => {
      const messages = [
        {
          receivingTime: '2022-01-01T10:00:00.000Z',
          sendingTime: '2022-01-01T09:00:00.000Z',
        },
        {
          receivingTime: '2022-01-01T11:00:00.000Z',
          sendingTime: '2022-01-01T10:00:00.000Z',
        },
      ];

      component.allMessages = messages;
      component.sortMessages();

      const expectedOrder = [
        {
          receivingTime: '2022-01-01T10:00:00.000Z',
          sendingTime: '2022-01-01T09:00:00.000Z',
        },
        {
          receivingTime: '2022-01-01T11:00:00.000Z',
          sendingTime: '2022-01-01T10:00:00.000Z',
        },
      ];

      expect(component.allMessages).toEqual(expectedOrder);
    });

    it('should not throw an error if allMessages is empty', () => {
      component.allMessages = [];
      expect(() => component.sortMessages()).not.toThrow();
    });
  });

  describe('leave button', () => {
    it('should dispatch leaveMeeting action when leaveBtn is called', async () => {
      await component.leaveBtn();
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.leaveMeeting()
      );
    });

    it('should return a promise that resolves to void', async () => {
      const result = await component.leaveBtn();
      expect(result).toBeUndefined();
    });
  });

  describe('toggleScreen share', () => {
    it('should dispatch toggleScreenShare action when toggleScreenShare is called', async () => {
      await component.toggleScreenShare();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.toggleScreenShare()
      );
    });
  });
  describe('toggle Microphone', () => {
    it('should dispatch toggleMic action when toggleMic is called', async () => {
      await component.toggleMic();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(LiveKitRoomActions.toggleMic());
    });
  });
  describe('Open Participant Side Window', () => {
    it('should dispatch toggleParticipantSideWindow action when openParticipantSideWindow is called', () => {
      component.openParticipantSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.toggleParticipantSideWindow()
      );
    });
  });
  describe('Open Chat Side Window', () => {
    it('should dispatch toggleChatSideWindow action when openChatSideWindow is called', () => {
      component.openChatSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.toggleChatSideWindow()
      );
    });
    describe('Close Chat Side Window', () => {
      it('should dispatch closeChatSideWindow action when closeChatSideWindow is called', () => {
        component.closeChatSideWindow();

        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith(
          LiveKitRoomActions.closeChatSideWindow()
        );
      });
    });
    describe('Close Participant Side Window', () => {
      it('should dispatch closeParticipantSideWindow action when closeParticipantSideWindow is called', () => {
        component.closeParticipantSideWindow();

        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith(
          LiveKitRoomActions.closeParticipantSideWindow()
        );
      });
    });

    it('should reset unreadMessagesCount and scroll to bottom when chat side window is visible', () => {
      const scrollToBottomSpy = spyOn(component, 'scrollToBottom');
      const chatSideWindowVisible$ = of(true);

      component.openChatSideWindow();

      expect(component.unreadMessagesCount).toBe(0);
      expect(scrollToBottomSpy).toHaveBeenCalledTimes(1);
    });
  });
  it('should handle snack bar opening', () => {
    component.openSnackBar('Test Message');
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test Message', 'Close', {
      duration: 3000,
    });
  });

  describe('scrollToBottom', () => {
    it('should scroll to the bottom of the message container', fakeAsync(() => {
      component.messageContainer = {
        nativeElement: {
          scrollTop: 0,
          scrollHeight: 1000,
        },
      };

      component.scrollToBottom();
      tick(120);

      expect(component.messageContainer.nativeElement.scrollTop).toBe(1000);
    }));

    it('should handle errors gracefully', () => {
      component.messageContainer = null;

      expect(() => component.scrollToBottom()).not.toThrow();
    });
  });

  describe('shouldShowAvatar', () => {
    // it('should return true for the first message', () => {
    //   component.allMessages = [{ senderName: 'Alice' }];

    //   expect(component.shouldShowAvatar(0)).toBeTrue();
    // });

    it('should return true for different sender from the previous message', () => {
      component.allMessages = [{ senderName: 'Alice' }, { senderName: 'Bob' }];

      expect(component.shouldShowAvatar(1)).toBeTrue();
    });

    it('should return false for the same sender as the previous message', () => {
      component.allMessages = [
        { senderName: 'Alice' },
        { senderName: 'Alice' },
      ];

      expect(component.shouldShowAvatar(1)).toBeFalse();
    });
  });
});
