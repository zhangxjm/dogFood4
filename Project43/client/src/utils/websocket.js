import { io } from 'socket.io-client';

class OrderSocket {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io('/orders', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket 连接成功');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket 断开连接');
    });

    this.socket.on('order:created', (order) => {
      this.emit('orderCreated', order);
    });

    this.socket.on('order:status-changed', (order) => {
      this.emit('orderStatusChanged', order);
    });

    this.socket.on('order:printed', (order) => {
      this.emit('orderPrinted', order);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event listener error for ${event}:`, error);
      }
    });
  }
}

export const orderSocket = new OrderSocket();
