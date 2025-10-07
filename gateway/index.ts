import { Elysia } from "elysia";
import { cron, Patterns } from "@elysiajs/cron";
const app = new Elysia();
app.get("/", () => {
    const now = new Date().getMinutes(); 
    console.log(now); 
    return now; 
})
app.use(
  cron({
    name: "helth check",
    pattern: Patterns.everyMinutes(5),
     run() {
        fetch("http://localhost:4000")     
    },
  })
);
app.listen(4000);
