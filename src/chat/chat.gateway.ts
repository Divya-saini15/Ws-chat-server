import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

interface Message {
  user: string;
  message: string;
}

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer() server: Server;
  messages: Message[] = [];

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, data: Message): void {
    const { user, message } = data;
    const staticUser = 'Divya Server';
    const staticMessage = 'Hello, I am from Divya Server!';
    this.messages.push({ user: staticUser, message: staticMessage });
    this.messages.push({ user, message });
    console.log(message);
    // Emitting to all clients including the sender
    this.server.emit('receiveMessage', { user, message });
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const welcomeMessage = 'what are you doing';
    client.emit('receiveMessage', { user: 'Server', message: welcomeMessage });

    // Emit message history to the newly connected client
    client.emit('messageHistory', this.messages);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
