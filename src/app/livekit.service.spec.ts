import { TestBed } from '@angular/core/testing';

import { LivekitService } from './livekit.service';

describe('LivekitService', () => {
  let service: LivekitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LivekitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
