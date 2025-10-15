import data_controller from "@db/data.controller";
// data_controller.add_registre({
//   huminity: 10,
//   temp: 20,
//   sensor_1: true,
//   sensor_2: true,
//   sensor_3: true,
// });
// data_controller.clear_tables();
await data_controller.new_registre({
  humidity: 30,
  temp: 55,
  sensor_1: true,
  sensor_2: true,
  sensor_3: false,
});
// const data = await data_controller.get_last_registre();
// console.log(data);
// import { Elysia } from "elysia";

// const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

// console.log(
//   `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
// );
