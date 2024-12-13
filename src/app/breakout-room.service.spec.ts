import { TestBed } from '@angular/core/testing';

import { BreakoutRoomService } from './breakout-room.service';

describe('BreakoutRoomApiService', () => {
  let service: BreakoutRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BreakoutRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
