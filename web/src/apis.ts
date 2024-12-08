export const getFonts = async () => {
  const response = await window.queryLocalFonts();
  const fontSet = new Set<string>(response.map(i => i.family));
  return Array.from(fontSet);
}

export const getFavFonts = async () => {
  const response = await window.queryLocalFonts();
  return response.map(i => ({ fontName: i.family, isFavorite: false }));
}