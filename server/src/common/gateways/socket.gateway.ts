import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Broadcast event to all clients
  broadcast(event: string, data: any) {
    console.log(`Broadcasting event: ${event}`, data);
    this.server.emit(event, data);
  }

  // Send event to a specific user (room)
  sendToUser(userId: string | number, event: string, data: any) {
    console.log(`Sending event ${event} to user_${userId}`, data);
    this.server.to(`user_${userId}`).emit(event, data);
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, userId: string | number) {
    client.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  }
}
