export const TYPES_NOTIFICATION = {
  WATER_ERROR: "Error al momento de regar las plantas, revisar la bomba",
  WATER_COOLDOWN_SHECHULE:
    "Las plantas fueron regadas hace poco saltando la regada programada",
  WATER_SUCCESS: "Las plantas fueron regadas con exito",
  SERVO_OPEN: "Abriendo la puerta del vivero para ciruclación de aire",
  SERVO_CLOSE: "Se cerraron las puertas del vivero",
};
export type NOTIFICATION_CODES = keyof typeof TYPES_NOTIFICATION;
