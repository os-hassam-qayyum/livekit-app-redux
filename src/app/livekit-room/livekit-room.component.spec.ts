import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivekitRoomComponent } from './livekit-room.component';

describe('LivekitRoomComponent', () => {
  let component: LivekitRoomComponent;
  let fixture: ComponentFixture<LivekitRoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LivekitRoomComponent]
    });
    fixture = TestBed.createComponent(LivekitRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
