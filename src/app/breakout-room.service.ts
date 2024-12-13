import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BreakoutRoom } from './+state/livekit/livekit-room.reducer';

@Injectable({
  providedIn: 'root',
})
export class BreakoutRoomService {
  private readonly apiUrl = `http://localhost:80/api/meeting`;

  constructor(private http: HttpClient) {}

  getAllBreakoutRooms(roomName: string): Observable<BreakoutRoom[]> {
    const url = `${this.apiUrl}/${roomName}`;
    return this.http.get<BreakoutRoom[]>(`${url}/breakout-room`);
  }
}
