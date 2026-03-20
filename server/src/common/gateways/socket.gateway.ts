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

  // Track product viewers: Map<productId, Set<socketId>>
  private productViewers = new Map<number, Set<string>>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Clean up viewer counts
    this.productViewers.forEach((viewers, productId) => {
      if (viewers.has(client.id)) {
        viewers.delete(client.id);
        this.broadcastViewersCount(productId);
      }
    });
  }

  // Broadcast viewers count for a specific product
  private broadcastViewersCount(productId: number) {
    const count = this.productViewers.get(productId)?.size || 0;
    this.server.emit('productViewersUpdated', { productId, viewerCount: count });
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

  @SubscribeMessage('viewProduct')
  handleViewProduct(client: Socket, productId: number) {
    if (!this.productViewers.has(productId)) {
      this.productViewers.set(productId, new Set());
    }
    this.productViewers.get(productId)?.add(client.id);
    console.log(`Client ${client.id} started viewing product ${productId}`);
    this.broadcastViewersCount(productId);
  }

  @SubscribeMessage('stopViewingProduct')
  handleStopViewingProduct(client: Socket, productId: number) {
    if (this.productViewers.has(productId)) {
      this.productViewers.get(productId)?.delete(client.id);
      console.log(`Client ${client.id} stopped viewing product ${productId}`);
      this.broadcastViewersCount(productId);
    }
  }
}
