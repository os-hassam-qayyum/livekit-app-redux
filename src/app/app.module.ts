import { AppComponent } from './app.component';
import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { EffectsModule } from '@ngrx/effects';
import { LiveKitRoomEffects } from './+state/livekit/livekit-room.effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { liveKitRoomReducer } from './+state/livekit/livekit-room.reducer';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LivekitRoomComponent } from './livekit-room/livekit-room.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MeetingNotesComponent } from './meeting-notes/meeting-notes.component';

@NgModule({
  declarations: [
    AppComponent,
    ErrorDialogComponent,
    LivekitRoomComponent,
    VideoPlayerComponent,
    MeetingNotesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatMenuModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    BrowserAnimationsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    StoreModule.forRoot({ liveKitRoom: liveKitRoomReducer }, {}),
    EffectsModule.forRoot([LiveKitRoomEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    BrowserAnimationsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    DragDropModule,
    NoopAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
