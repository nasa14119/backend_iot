import { cron, Patterns as timer } from "@elysiajs/cron";
import Elysia from "elysia";
import { registres } from "./registre.rutine";
import { WATER_SCHODULE } from "src/cron_rutines/water.rutine";
// import { history_rutine } from "./history.rutine";
const rutines = new Elysia();
const EVERY_MINUTES = timer.everyMinutes(1);
const EVERY_NIGHT = timer.EVERY_DAY_AT_MIDNIGHT;
WATER_SCHODULE(rutines);
rutines.use(
  cron({
    name: "registres",
    pattern: EVERY_MINUTES,
    run: registres,
  })
);
// rutines.use(
//   cron({
//     name: "history",
//     pattern: EVERY_NIGHT,
//     run: history_rutine,
//   })
// );
export default rutines;
