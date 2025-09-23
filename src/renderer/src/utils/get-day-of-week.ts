export const getDayOfWeek = (date: Date = new Date()) => {
  // Get the day of the week in GMT
  const dayOfWeek: number = date.getUTCDay()
  // Adjust the day to start with Monday as 0 and Sunday as 6
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1
}
