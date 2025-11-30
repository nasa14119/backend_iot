import { spawn, $ } from "bun";
import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
declare var self: Worker;
let is_closing = false;
const check_process_env = () => {
  const KEYS = [
    "THINGSPEAK",
    "HOSTNAME",
    "CREDENTIALS_FILE",
    "CLOUDFLARE_TOKEN",
    "CLOUDFLARE_ZONE",
  ];
  const elements = Object.keys(process.env);
  for (const KEY of KEYS) {
    if (elements.includes(KEY)) continue;
    console.error(`Missing var ${KEY}`);
    throw new Error("Error in .env");
  }
};
async function init_tunnel() {
  console.log("starting worker...");
  const FIELD = process.env.FIELD_THINGSPEAK ?? "field1";
  check_process_env();
  const credentials = process.env.CREDENTIALS_FILE ?? "./temp.json";
  const regex_tunnel =
    /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;
  const subdomain = `${randomUUID()}.${process.env.HOSTNAME}`;
  await $`rm -f ${credentials}`;
  const server = `http://localhost:${process.env.PORT ?? 4000}`;
  const creation =
    await $`cloudflared tunnel create --credentials-file ${credentials} ${
      process.env.TUNNEL_NAME ?? "tunnel-temp"
    }`.quiet();
  const output = creation.text().match(regex_tunnel);
  if (!output) throw new Error("error creating tunnel");
  const TUNNEL_ID = output[0];
  await $`cloudflared tunnel --overwrite-dns route dns ${TUNNEL_ID} ${subdomain}`.quiet();
  writeFileSync(
    "./config.yml",
    `
  tunnel: ${TUNNEL_ID}
  credentials-file: ${credentials}

  ingress:
    - hostname: ${subdomain}
      service: ${server}
    - service: http_status:404
  `
  );
  const tunnel = spawn(
    ["cloudflared", "tunnel", "--config", "./config.yml", "run", TUNNEL_ID],
    { stdio: ["ignore", "ignore", "ignore"] }
  );
  await fetch(`${process.env.THINGSPEAK}${FIELD}=${subdomain}`);
  const close = async () => {
    if (is_closing) return;
    is_closing = true;
    type DNSRecords = { id: string; name: string }[];
    tunnel.kill();
    console.log("\nDeleting tunnel");
    await $`cloudflared tunnel --credentials-file ${credentials} delete ${TUNNEL_ID}`.quiet();
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/dns_records?type=CNAME`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
      }
    ).catch((e) => {
      console.error("Something happend while getting dns records");
      console.error(e);
      throw new Error(e);
    });
    const DNSRecordsValue = (
      await res.json().catch((e) => {
        console.error("Something happend while getting parsing records");
        console.error(e);
        throw new Error(e);
      })
    ).result as DNSRecords;
    const querry = DNSRecordsValue.filter(({ name }) => name === subdomain);
    console.log(`\x1b[32m Deleting:`);
    console.log(querry[0]);
    if (!querry || querry.length <= 0) {
      console.error("DNS Record not found");
      process.exit(0);
    }
    const DNS_ID = querry[0].id;
    const deleting = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/dns_records/${DNS_ID}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
      }
    ).catch((e) => {
      console.error("Something happebnd while deleting value");
      throw new Error(e);
    });
    if (deleting.ok) {
      console.log("DNS Deleted");
    } else {
      console.error(`DNS Deleting error recived status: ${deleting.status}`);
    }
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
