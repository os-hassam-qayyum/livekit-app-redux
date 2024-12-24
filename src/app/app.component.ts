import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  Track,
} from 'livekit-client';
import {
  async,
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subscription,
  take,
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { selectLiveKitRoomViewState } from './+state/livekit/livekit-room.selectors';
import * as LiveKitRoomActions from './+state/livekit/livekit-room.actions';
import { LivekitService } from './livekit.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BreakoutRoomService } from './breakout-room.service';
import { BreakoutRoom } from './+state/livekit/livekit-room.reducer';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
