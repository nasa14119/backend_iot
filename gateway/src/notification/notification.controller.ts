import { db } from "@db/connection";
import { NOTIFICATION_CODES, TYPES_NOTIFICATION } from "@notifications/const";
import { ResponseThing } from "@notifications/notification.process";
import { notificationTable } from "@notifications/shema";
import { Notification } from "@type";
import { eq } from "drizzle-orm";
export type NotificationDB = typeof notificationTable.$inferInsert;
function get_notification_code(type: NOTIFICATION_CODES): Notification {
  let notification: Partial<Notification> = {};
  notification.message = TYPES_NOTIFICATION[type];
  if (type === "WATER_ERROR") {
    notification.prioridad = "error";
    notification.source = "Error en la bomba de agua";
  }
  if (type === "WATER_COOLDOWN_SHECHULE") {
    notification.prioridad = "warning";
    notification.source = "Advertencia en la bomba de agua";
  }
  if (type === "SERVO_OPEN" || type === "SERVO_CLOSE") {
    notification.prioridad = "none";
    notification.source = "Aviso de las ventanas";
  }
  return notification as Notification;
}
class NotificationsController {
  async push_notification_from_code(registre: ResponseThing) {
    const new_notification = get_notification_code(registre.type);
    const result = await db
      .insert(notificationTable)
      .values({
        id: registre.id,
        stamp: registre.stamp,
        data: new_notification,
      })
      .returning();
    return result[0];
  }
  async push_notification(new_value: Omit<Required<NotificationDB>, "stamp">) {
    const now = new Date();
    await db.insert(notificationTable).values({ stamp: now, ...new_value });
  }
  async clear_db() {
    await db.delete(notificationTable);
  }
  async clear_notification(id: string) {
    await db.delete(notificationTable).where(eq(notificationTable.id, id));
  }
}
export default new NotificationsController();
