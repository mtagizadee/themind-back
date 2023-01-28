export const generateExpirationDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const generateRoom = (lobbyId: string) => {
  return `lobby-${lobbyId}`;
};
