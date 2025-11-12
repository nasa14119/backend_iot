import { Registre, type RegistreType } from "@type";
import registres_db from "@db/data.controller";
const URL_PATH = `${process.env.GATEWAY}/get_status`;
const AFTER_SECONDS = 5000;
class GATEWAT_ERROR extends Error {
  status: number;
  constructor(status: number) {
    super();
    if (status === 404) {
      this.name = "RequestError";
      this.message = "Server didn't found the resourse you were looking";
    }
    this.status = status;
  }
}
export const registres = async () => {
  // Fetch from esp
  try {
    console.log("Getting registre");
    const res = await fetch(URL_PATH, {
      signal: AbortSignal.timeout(AFTER_SECONDS),
    });
    if (!res.ok) {
      throw new GATEWAT_ERROR(res.status);
    }
    const request: RegistreType = await res.json();
    const new_registre = Registre.parse(request);
    const result = await registres_db.new_registre(new_registre);
    console.log("Sucess:");
    console.log(result);
  } catch (e) {
    const error = e as Record<string, any>;
    console.error("Something go wrong in registres:");
    console.error(error.name);
    if (error.name === "TimeoutError") {
      console.error(
        `Timeout petticion to gateway after ${AFTER_SECONDS / 1000} seconds\n${
          error.message
        }`
      );
      return;
    }
    if (error.name === "RequestError") {
      console.error("Server not handle the request");
      console.error(`Getting status:${error.status}`);
      return;
    }
    console.error(error.message);
    // await fetch(`${process.env.SERVER_URL}/helth`);
  }
};
