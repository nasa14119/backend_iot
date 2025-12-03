import { db } from "@db/connection";
import { NOTIFICATION_CODES, TYPES_NOTIFICATION } from "@notifications/const";
import { ResponseThing } from "@notifications/notification.process";
import { notificationObserver } from "@notifications/notification.route";
import { notificationTable } from "@notifications/shema";
import { Notification } from "@type";
import { desc, eq } from "drizzle-orm";
export type NotificationDB = typeof notificationTable.$inferInsert;
function get_notification_code(type: NOTIFICATION_CODES): Notification {
  let notification: Partial<Notification> = {};
  notification.message = TYPES_NOTIFICATION[type];
  if (type === "WATER_SUCCESS") {
    notification.prioridad = "none";
    notification.source = "PUMP";
  }
  if (type === "WATER_ERROR") {
    notification.prioridad = "error";
    notification.source = "PUMP";
  }
  if (type === "WATER_COOLDOWN_SHECHULE") {
    notification.prioridad = "warning";
    notification.source = "PUMP";
  }
  if (type === "SERVO_OPEN" || type === "SERVO_CLOSE") {
    notification.prioridad = "none";
    notification.source = "MOTOR";
  }
  return notification as Notification;
}
class NotificationsController {
  async get_last_notification() {
    const notifications = await db
      .select()
      .from(notificationTable)
      .orderBy(desc(notificationTable.stamp));
    if (!notifications || notifications.length <= 0) return null;
    return notifications[0];
  }
  async get_all_notifications() {
    const notifications = await db
      .select()
      .from(notificationTable)
      .orderBy(desc(notificationTable.stamp));
    if (!notifications || notifications.length <= 0) return null;
    return notifications;
  }
  async push_notification_server(type: NOTIFICATION_CODES) {
    const now = new Date();
    const new_val: NotificationDB = {
      id: Bun.randomUUIDv7(),
      stamp: now,
      data: get_notification_code(type),
    };
    await db
      .insert(notificationTable)
      .values(new_val)
      .onConflictDoUpdate({
        target: notificationTable.id,
        set: { data: new_val.data, stamp: now },
      });
  }
  async push_notification_from_code(registre: ResponseThing) {
    const new_notification = get_notification_code(registre.type);
    const result = await db
      .insert(notificationTable)
      .values({
        id: registre.id,
        stamp: registre.stamp,
        data: new_notification,
      })
      .onConflictDoUpdate({
        target: notificationTable.id,
        set: { data: new_notification, stamp: registre.stamp },
      })
      .returning();
    return result[0];
  }
  async push_notification(new_value: Omit<Required<NotificationDB>, "stamp">) {
    const now = new Date();
    const new_val = { stamp: now, ...new_value };
    await db
      .insert(notificationTable)
      .values(new_val)
      .onConflictDoUpdate({
        target: notificationTable.id,
        set: { data: new_val.data, stamp: now },
      });
  }
  async clear_db() {
    await db.delete(notificationTable);
    notificationObserver.triggerEvent(null);
  }
  async clear_notification(id: string) {
    await db.delete(notificationTable).where(eq(notificationTable.id, id));
  }
}
export default new NotificationsController();
