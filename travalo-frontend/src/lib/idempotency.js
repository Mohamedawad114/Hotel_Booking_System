// بيتستخدم لأي عملية بتحتاج Idempotency-Key header (زي cancel booking)
// عشان لو الـ request اتكرر (بسبب retry أو ضغط الزرار مرتين) الباك اند
// يتعامل معاها كعملية واحدة بس
export function generateIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback بسيط لو crypto.randomUUID مش متاح
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
