import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'orders',
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`客户端连接: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`客户端断开: ${client.id}`);
  }

  emitOrderCreated(order: any) {
    this.server.emit('order:created', order);
  }

  emitOrderStatusChanged(order: any) {
    this.server.emit('order:status-changed', order);
  }

  emitOrderPrinted(order: any) {
    this.server.emit('order:printed', order);
  }
}
