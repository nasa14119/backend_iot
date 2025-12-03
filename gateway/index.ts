import { Elysia } from "elysia";
import routes from "./src/routes";
import cron_rutines from "./src/cron_rutines";
import cors from "@elysiajs/cors";
import { init_notifications } from "@notifications/index";
await init_notifications();
const app = new Elysia();
function start_tunnel() {
  const tunnel = new Worker("./src/tunnel_worker.ts", { ref: false });
  const close = () => {
    app.stop();
    tunnel.addEventListener("close", () => process.exit(0));
    tunnel.postMessage("close");
  };
  process.on("SIGINT", close); // Ctrl+C
  process.on("SIGTERM", close); // system stop
  process.on("SIGHUP", close);
}
app.use(cors());
app.use(routes);
// app.use(cron_rutines);
app.listen(process.env.PORT ?? 4000);
if (process.env.NODE_ENV === "production") {
  start_tunnel();
}
console.log(`server started at ${app.server?.hostname}:${app.server?.port}`);
