import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  namespace: 'files',
})
export class FilesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Юзер должен джойниться в комнату своего ID,
    // чтобы не получать чужие уведомления
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`[Socket] User ${userId} joined room`);
    }
  }

  // Метод для вызова из воркера или сервиса
  sendFileStatusUpdate(userId: string, data: { fileId: string; status: string; url?: string }) {
    this.server.to(`user_${userId}`).emit('fileStatusUpdated', data);
  }
}
