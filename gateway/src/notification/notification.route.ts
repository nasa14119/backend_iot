import notificationController, {
  NotificationDB,
} from "@notifications/notification.controller";
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
  triggerEvent(noti: NotificationDB | null) {
    this.connections.forEach((ws) => {
      ws.send(JSON.stringify(noti));
    });
  }
  addObserver(ws: WS) {
    this.connections.push(ws);
  }
  pingObservers() {
    this.connections.forEach((ws) => {
      ws.ping("ping");
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
    notificationController
      .get_last_notification()
      .then((v) => ws.send(JSON.stringify(v)));
    notificationObserver.addObserver(ws);
  },
  close(ws) {
    notificationObserver.removeObserver(ws.id);
  },
});
route.get("/notifications", async ({ status }) => {
  const data = await notificationController.get_all_notifications();
  if (data === null) return status(204);
  return status(200, data);
});
route.delete("/notifications", async ({ status }) => {
  await notificationController.clear_db();
  return status(204);
});
export default route;
