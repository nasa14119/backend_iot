export const convert_pH = (rawPh: number) => (rawPh * 14) / 2800;
export const convert_soil = (rawSoil: number) =>
  ((4095 - rawSoil) * 100) / 2195;
