export function qualifyAge(dateBirth: any) {
  const birthDate = new Date(dateBirth);
  if (isNaN(birthDate.getTime())) {
    return false;
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 18;
}
