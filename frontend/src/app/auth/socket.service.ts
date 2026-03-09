import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    // Подключаемся именно к неймспейсу /files
    this.socket = io('http://localhost:3000/files', {
      query: { userId: 'guest-system' }, // Имитируем нашего гостя
      transports: ['websocket'] // Форсируем вебсокеты для скорости
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket backend!');
    });

    this.socket.on('fileStatusUpdated', (data) => {
      console.log('🔔 Статус файла изменен:', data);
    });
  }
}
