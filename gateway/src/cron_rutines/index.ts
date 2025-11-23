import { cron, Patterns as timer } from "@elysiajs/cron";
import Elysia from "elysia";
import { registres } from "src/cron_rutines/registre.rutine";
import { history_rutine } from "src/cron_rutines/history.rutine";
const rutines = new Elysia();
const EVERY_MINUTES = timer.everyMinutes(1);
const EVERY_NIGHT = timer.EVERY_DAY_AT_MIDNIGHT;
// rutines.use(
//   cron({
//     name: "registres",
//     pattern: EVERY_MINUTES,
//     run: registres,
//   })
// );
// rutines.use(
//   cron({
//     name: "history",
//     pattern: EVERY_NIGHT,
//     run: history_rutine,
//   })
// );
export default rutines;
