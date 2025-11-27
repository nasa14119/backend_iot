export const SHODULE = ["8:00", "12:00", "17:00"];
export const ESP_TIMEOUT =
  (process.env.ESP_TIMEOUT_SECONDS
    ? Number(process.env.ESP_TIMEOUT_SECONDS)
    : 5) * 1000;
