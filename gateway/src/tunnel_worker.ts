import { spawn, $ } from "bun";
import { randomUUID } from "crypto";
declare var self: Worker;
async function init_tunnel() {
  console.log("starting worker...");
  const credentials = process.env.CREDENTIALS_FILE ?? "./temp.json";
  const regex_tunnel =
    /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;
  const subdomain = `${randomUUID()}.${process.env.hostname}`;
  await $`rm -f ${credentials}`;
  const server = `http://localhost:${process.env.PORT ?? 4000}`;
  const creation =
    await $`cloudflared tunnel create --credentials-file ${credentials} tunnel-temp`.quiet();
  const output = creation.text().match(regex_tunnel);
  if (!output) throw new Error("error creating tunnel");
  const TUNNEL_ID = output[0];
  await $`cloudflared tunnel --overwrite-dns route dns ${TUNNEL_ID} ${subdomain}`.quiet();
  const tunnel = spawn(
    [
      "cloudflared",
      "tunnel",
      "--credentials-file",
      credentials,
      "run",
      "--url",
      server,
      subdomain,
    ],
    { stdio: ["ignore", "ignore", "ignore"] }
  );
  await fetch(`${process.env.THINGSPEAK}field1=${subdomain}`);
  const close = async () => {
    tunnel.kill();
    console.log("\nDeleting tunnel");
    await $`cloudflared tunnel --credentials-file ${credentials} delete ${TUNNEL_ID}`;
    console.log("Tunnel deleted");
    process.exit(0);
  };
  self.addEventListener("message", (ev) => {
    if (ev.data === "close") {
      close();
    }
  });
  console.log(`Tunnel in: https://${subdomain}`);
  await tunnel.exited;
}
await init_tunnel();
