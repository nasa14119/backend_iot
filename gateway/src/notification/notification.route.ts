import { NotificationDB } from "@notifications/notification.controller";
import Elysia from "elysia";

const IntervalSeconds = 30 * 1000;
type WS = Parameters<NonNullable<Parameters<Elysia["ws"]>[1]["open"]>>[0];
class Observer {
  connections: WS[];
  constructor() {
    setInterval(() => {
      this.pingObservers();
    }, IntervalSeconds);
    this.connections = [];
  }
  triggerEvent(noti: NotificationDB) {
    this.connections.forEach((ws) => {
      ws.send(JSON.stringify(noti));
    });
  }
  addObserver(ws: WS) {
    this.connections.push(ws);
    console.log(ws.id);
  }
  pingObservers() {
    this.connections.forEach((ws) => {
      ws.ping();
    });
  }
  removeObserver(id: string) {
    this.connections = this.connections.filter((c) => c.id !== id);
  }
}
export const notificationObserver = new Observer();
const route = new Elysia({
  websocket: {
    idleTimeout: 40,
  },
});
route.ws("/notifications", {
  open(ws) {
    notificationObserver.addObserver(ws);
  },
  close(ws) {
    notificationObserver.removeObserver(ws.id);
  },
});
export default route;
