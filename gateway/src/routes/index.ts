import dataController from "@db/data.controller";
import { Elysia } from "elysia";
import registres_routes from "./registres.routes";
import water_routes from "./water.routes";
import notification_routes from "@notifications/notification.route";
import registre_routes from "./registre.routes";
const app = new Elysia();
// General Porpuse
app.get("/", () => {
  return "Server up";
});
app.get("helth", () => {
  return { status: 200 };
});
// Routers
app.use(notification_routes);
app.use(water_routes);
app.use(registres_routes);
app.use(registre_routes);
// Global routes
app.delete("/db/clear", ({ body, status }) => {
  const { password } = body as { password: string };
  if (!password) return status(400);
  if (process.env.DELETE_DB_PASSWORD === password) {
    dataController.clear_tables();
    return status(204);
  }
  return status(401);
});
export default app;
