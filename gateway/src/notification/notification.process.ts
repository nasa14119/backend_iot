import { parse } from "@formkit/tempo";
import mqtt from "mqtt";
import z from "zod";
import type { ZodError } from "zod";
import { NOTIFICATION_CODES } from "./const";
const ResponseThing = z
  .object({
    created_at: z.string(),
    field1: z.coerce.string(),
    field2: z.string(),
  })
  .transform((v) => {
    const stamp = parse(v.created_at);
    const id = v.field1;
    const type = v.field2 as NOTIFICATION_CODES;
    return { stamp, id, type };
  });
export type ResponseThing = z.infer<typeof ResponseThing>;
type Callback = (mss: ResponseThing) => void;
type Publish = (type: NOTIFICATION_CODES) => void;
async function init_mqtt(callBack: Callback): Promise<Publish> {
  const conexion = mqtt.connect("mqtt://mqtt3.thingspeak.com", {
    clientId: process.env.MQTT_USERNAME,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    port: 1883,
    protocol: "mqtt",
    keepalive: 60,
    reconnectPeriod: 2000,
    connectTimeout: 20_0000,
  });
  const { promise, resolve } = Promise.withResolvers<Publish>();
  console.log("Starting mqtt conection");
  conexion.on("error", () => {
    console.error("error in mqtt conection");
  });
  conexion.on("disconnect", () => {
    console.log("mqtt disconected...");
  });
  conexion.on("reconnect", () => {
    console.log("conection restore");
  });
  conexion.on("connect", () => {
    console.log("Conected to mqtt server");
    conexion.subscribe(`channels/${process.env.MQTT_ID}/subscribe`, (err) => {
      if (err) {
        console.error(err);
        throw new Error("Error in mqtt conextion");
      }
    });
    conexion.on("message", (_, payload) => {
      const mss = payload.toString();
      try {
        const data = ResponseThing.parse(JSON.parse(mss));
        data.id = Bun.randomUUIDv7();
        callBack(data);
      } catch (error) {
        const zod_error = error as ZodError;
        console.error(
          zod_error.issues.map((v) => ({ type: v.code, mss: v.message }))
        );
      }
    });
    resolve((noti) => {
      const payload = `field1=${Bun.randomUUIDv7()}&field2=${noti}`;
      conexion.publish(`channels/${process.env.MQTT_ID}/subscribe`, payload);
    });
  });
  return promise;
}
export default init_mqtt;
