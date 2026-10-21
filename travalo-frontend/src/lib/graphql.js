import { api } from './axios';

// TODO: مش متأكد لو الـ GraphQL endpoint تحت /api/graphql ولا /graphql
// في الـ root. لو مختلف عدّل VITE_GRAPHQL_URL في .env
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';

// بنستخدم نفس axios instance بتاع الـ REST calls عشان نستفيد من نفس
// الـ interceptors (attach token + auto refresh على الـ 401) من غير
// ما نحتاج مكتبة GraphQL منفصلة. axios بيتجاهل baseURL لو الـ url absolute.
export async function graphqlRequest(query, variables = {}, headers = {}) {
  const { data } = await api.post(
    GRAPHQL_URL,
    { query, variables },
    { headers }
  );

  if (data.errors?.length) {
    // ⚠️ ملاحظة: أخطاء الـ auth في GraphQL بترجع HTTP 200 مع "errors" array
    // (مش status 401)، يعني الـ auto-refresh interceptor في axios.js
    // مش هيتفعّل هنا تلقائيًا. لو ظهرت مشكلة صلاحية توكن، هتحتاج تتعامل
    // معاها هنا صراحة (مثلاً تشيك على error code UNAUTHENTICATED).
    const message = data.errors.map((e) => e.message).join(', ');
    throw new Error(message);
  }

  return data.data;
}
