import { cron, Patterns as timer } from "@elysiajs/cron";
import Elysia from "elysia";
import { registres } from "src/cron_rutines/registre.rutine";
const rutines = new Elysia();
const EVERY_MINUTES = timer.everyMinutes(1);
rutines.use(
  cron({
    name: "registres",
    pattern: EVERY_MINUTES,
    run: registres,
  })
);
export default rutines;
