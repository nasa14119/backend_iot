import { Elysia } from "elysia";
const app = new Elysia();
app.get("helth", () => {
  console.log("Petticion got");
  return { status: 200 };
});
export default app;
