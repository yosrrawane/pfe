import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private apiUrl = 'http://localhost:8081/api/assistant/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: string, context?: any): Observable<any> {
    const payload = {
      message: message,
      context: context
    };
    return this.http.post<any>(this.apiUrl, payload);
  }
}
