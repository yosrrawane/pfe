import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { AssistantService, ChatMessage } from '../../../services/assistant.service';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements AfterViewChecked {
  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;

  constructor(private assistantService: AssistantService) {
    this.messages.push({
      text: 'Bonjour ! Je suis votre co-pilote IA médical. Comment puis-je vous aider aujourd\'hui ?',
      isBot: true,
      timestamp: new Date()
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMsg = this.newMessage;
    this.messages.push({
      text: userMsg,
      isBot: false,
      timestamp: new Date()
    });
    this.newMessage = '';
    this.isTyping = true;

    // Optional: context could be fetched from a shared state service
    const contextObj = { 
      page: window.location.pathname,
      // Provide dummy context for simulation
      scoreConfianceGlobal: 85,
      rapport: "Simulation du rapport" 
    };

    this.assistantService.sendMessage(userMsg, contextObj).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.messages.push({
          text: res.reply || 'Désolé, je ne peux pas répondre pour le moment.',
          isBot: true,
          timestamp: new Date()
        });
      },
      error: (err) => {
        this.isTyping = false;
        this.messages.push({
          text: 'Erreur de connexion au serveur IA.',
          isBot: true,
          timestamp: new Date()
        });
      }
    });
  }
}
