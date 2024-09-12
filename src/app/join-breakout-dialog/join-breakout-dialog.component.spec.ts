import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinBreakoutDialogComponent } from './join-breakout-dialog.component';

describe('JoinBreakoutDialogComponent', () => {
  let component: JoinBreakoutDialogComponent;
  let fixture: ComponentFixture<JoinBreakoutDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JoinBreakoutDialogComponent]
    });
    fixture = TestBed.createComponent(JoinBreakoutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
