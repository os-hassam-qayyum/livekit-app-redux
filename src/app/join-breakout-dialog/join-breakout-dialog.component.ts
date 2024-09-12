import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-join-breakout-dialog',
  templateUrl: './join-breakout-dialog.component.html',
  styleUrls: ['./join-breakout-dialog.component.scss'],
})
export class JoinBreakoutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<JoinBreakoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { roomName: string }
  ) {}

  onJoin(): void {
    this.dialogRef.close({ join: true });
  }

  onDecline(): void {
    this.dialogRef.close({ join: false });
  }
}
