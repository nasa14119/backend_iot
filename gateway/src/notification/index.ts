import notificationController from "@notifications/notification.controller";
import init_process from "./notification.process";
import { notificationObserver } from "@notifications/notification.route";
export async function init_notifications() {
  return await init_process((noti) => {
    notificationController.push_notification_from_code(noti).then((db) => {
      notificationObserver.triggerEvent(db);
    });
  });
}
