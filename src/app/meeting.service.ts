import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private apiUrl = 'http://localhost:80/api/meeting';

  constructor(private http: HttpClient) {}

  createMeeting(participantName: string, roomName: string): Observable<any> {
    const body = { participantName, roomName };
    return this.http.post<any>(this.apiUrl, body);
    // return this.http.post<any>(`${this.apiUrl}/${roomName}`, body); // Pass roomName in URL
  }

  sendBroadcastMessage(roomName: string, content: string): Observable<any> {
    const body = { roomName, sender: 'test-room', content };
    return this.http.post<any>(`${this.apiUrl}/broadcast`, body);
  }
  sendMessageToMainRoom(
    roomName: string,
    breakoutRoomName: string,
    content: string
  ): Observable<any> {
    const body = { roomName, sender: breakoutRoomName, content };
    return this.http.post<any>(`${this.apiUrl}/broadcast`, body);
  }
  sendCloseBreakoutRoomAlert(
    roomName: string,
    content: string
  ): Observable<any> {
    const body = { roomName, sender: 'test-room', content };
    return this.http.post<any>(`${this.apiUrl}/broadcast`, body);
  }
}
