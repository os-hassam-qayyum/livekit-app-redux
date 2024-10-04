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
  }
  sendMessage(
    participantName: string,
    roomName: string,
    content: string
  ): Observable<any> {
    const body = { participantName, roomName, content };
    return this.http.post<any>(this.apiUrl, body);
  }

  broadcastMessage(roomName: string, content: string): Observable<any> {
    const body = { roomName, content, sender: 'test-room' }; // sender can be changed dynamically
    console.log('Sending broadcast message:', body);
    return this.http.post<any>(`${this.apiUrl}/broadcast`, body);
  }
}
