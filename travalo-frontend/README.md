# Travalo Frontend

React + Vite + Tailwind + React Query + Zustand.

## تشغيل المشروع

```bash
npm install
cp .env.example .env   # وعدّل VITE_API_BASE_URL لو مختلف
npm run dev
```

## الهيكل

```
src/
  components/ui/         # مكونات عامة قابلة لإعادة الاستخدام
  features/
    auth/                # signup, login, 2fa, confirm-email
    profile/             # get/update profile, password, 2fa setup, photo
    destinations/        # قائمة الوجهات + DestinationPicker
  hooks/
  lib/                    # axios instance مع interceptors
  pages/                  # صفحات عامة (Dashboard, NotFound)
  routes/                 # ProtectedRoute + AppRoutes
  store/                  # zustand auth store
```

## Auth module ✅ (مؤكد من AuthService)

- `POST /auth/login` → `{ message, data: { accessToken } }` أو
  `{ message, data: { id } }` لو 2FA مفعّل.
- `POST /auth/login/2fa` → نفس شكل login بالظبط.
- `GET /auth/refresh-token` → `{ message, data: { accessToken } }` —
  refresh token جاي من httpOnly cookie اسمه `refreshToken`.
- `POST /auth/confirm-email` — الفيلد اسمه **`OTP`** كابيتال.
- `POST /auth/signup` → `{ message, data: { user } }`.
- الـ login مبيرجعش user object، فبعد الدخول بنجيب `GET /profile`.

TODO: `GET /auth/resend-OTP` مفترض الإيميل query param. رقم الموبايل
regex في `authSchemas.js` مظبوط على أرقام مصر.

## Profile module ✅ (مؤكد من Controller/Service)

- `GET /profile` → `{ data: { profile: {...} }, message }`.
- `PUT /profile/update-profile` — `{ name?, email?, city?, street?, phone? }`.
  لو غيّرت الإيميل، `isConfirmed` بترجع false ويتبعت OTP تأكيد تاني.
- `PATCH /profile/update-password` — `{ oldPassword, newPassword, confirmNewPassword }`.
- `reset-passwordReq`, `resend-OTP-reset`, `reset-password` — **public**
  (مفيش `@Auth`)، شغالين وانت مسجّل خروج. الإيميل query param، والـ
  reset-password body نفسه `{ OTP, newPassword, confirmPassword }` من غير
  email جواه.
- `GET /profile/setup-2fa` → `{ data: { qr } }` (نص، بيفتح كـ QR في src مباشرة).
- `PATCH /profile/enable-2fa` → body `{ code }`، response
  `{ message, data: { backupCodes } }` (أكواد استرجاع بتتعرض مرة واحدة بس).
- `POST /profile/photo` (مش `/upload`) — field name `file`. Response:
  `{ message, data: { public_id } }` من غير رابط الصورة، فبنعمل refetch
  لـ `/profile` بعد الرفع. الفيلد الحقيقي لرابط الصورة هو **`photoUrl`**.
- `logout`/`logoutAll` بيرجعوا من غير body.

TODO: طول كود enable-2fa مش مؤكد (المثال 5 أرقام)، مخليه flexible (4-8).

## Destinations + Hotel modules (تمت إضافتهم)

**Destinations** مش صفحة مستقلة — دي بيانات متزامنة من الـ provider
وبتظهر كـ autocomplete وقت البحث بس، عن طريق `DestinationPicker.jsx`.

**Hotel search بقى GraphQL** (`searchHotels` resolver) مش REST — عملت
`src/lib/graphql.js` كـ wrapper خفيف بيستخدم نفس axios instance (نفس
الـ interceptors: attach token + auto-refresh)، من غير ما نحتاج مكتبة
GraphQL منفصلة.

- `searchHotels(hotelName?, destinationCode?, city?, stars?, countryCode?, rating?, ranking?, cursor?, limit?)`
  → `{ data: Hotel[], meta: { nextCursor } }`. بنستخدم `useInfiniteQuery`
  للـ cursor pagination.
- `GET /hotel/:id` → تفاصيل الفندق + phones.
- `GET /hotel/:id/facilities` → مرافق الفندق.
- كل الـ Hotel type fields مؤكدة 100% من `getAllHotels.type.ts`.

### TODO مهمة

1. ~~مكان الـ GraphQL endpoint~~ — **مؤكد**: `http://localhost:3000/graphql` (root، مش تحت `/api`).
2. **الـ enum `order`**: افترضت قيمه `asc`/`desc` (اسم شائع)، أكّد من
   الباك اند.
3. **شكل الـ facility object**: مستخدم `f.name || f.facilityCode` في
   `HotelDetailsPage.jsx`، عدّل لو الاسم مختلف.
4. **أخطاء الـ auth في GraphQL** بترجع HTTP 200 مع `errors` array، فمش
   بتستفيد من الـ auto-refresh interceptor بتاع axios تلقائيًا — لو
   حصلت مشكلة access token منتهي أثناء البحث، هتحتاج تعامل خاص (مذكور
   في `lib/graphql.js`).

## Rooms module (تمت إضافته)

مدموج جوه `HotelDetailsPage.jsx` مباشرة (مش صفحة منفصلة) عن طريق
`RoomsList.jsx` — منطقي إن اليوزر يشوف الغرف وهو واقف في صفحة الفندق.

- `GET /rooms/:hotelId` — query params مطابقة لـ `SearchRoomsDto`
  بالظبط: `{ adults?, children?, description?, roomsType?, cursor?, limit? }`.
  `useHotelRooms` بيستخدم `useInfiniteQuery` لنفس نمط الـ cursor pagination.
- `GET /rooms/:roomId/facilities` — بتتحمّل **lazy** بس لما اليوزر يفتح
  "عرض المرافق" لغرفة معينة، مش لكل الغرف مرة واحدة (توفير طلبات).
- فيه `GuestSelector.jsx` لعدد البالغين/الأطفال بيعيد الفلترة تلقائيًا.

### TODO

1. **شكل الـ Room model بالظبط**: معرفش الفيلدات الحقيقية غير `code`
   و`createdAt` (من الـ service). في `RoomCard.jsx` مستخدم
   `room.description || room.roomsType || room.type` كـ fallback chain،
   عدّلها لما تتأكد.
2. **زرار "احجز"**: معطّل حاليًا (placeholder) لحد ما نبني الـ booking
   module — الأسعار والتوافر الفعلي جايين من endpoint تاني
   (`/booking/{hotelId}/searchAvailability`).

## Reviews + Favorites modules (تمت إضافتهم)

**Reviews** — offset pagination عادي (`page`/`limit`)، مختلف عن الـ
cursor بتاع hotel/rooms:
- `GET /reviews/all/:id?page=&limit=` — مفيش `total`/`meta` راجع من
  الباك اند، فبنستنتج `hasNextPage` بمقارنة طول النتيجة بالـ `limit`.
  كل review فيه `user: { id, name }` متداخل، بيتعرض في `ReviewsList.jsx`.
- `POST /reviews/:id` (مش `/add-review`) — `{ rating: 1-5, comment?: 4-100 حرف }`.
  مدموجة في `HotelDetailsPage.jsx` عن طريق `ReviewsList.jsx`
  (بتحتوي فورم الإضافة + القائمة).

**Favorites** — `POST /favorites/:hotelId` و `DELETE /favorites/:hotelId`
(مش `/add-favorite`/`/remove-favorite`). heart toggle button مستخدم في
`HotelCard` و `HotelDetailsPage`، وصفحة `/favorites` مستقلة لعرض الكل.

### TODO

- **شكل response بتاع `GET /favorites`**: مش مؤكد لو كل عنصر فيه الفندق
  كامل جواه (`fav.hotel`) ولا `hotelId` بس. `FavoritesPage.jsx` بتتعامل
  مع الحالتين (لو مفيش hotel object، بتعرض كارت مبسط بلينك).

## Booking module ✅ (Flow كامل)

مبني بـ CQRS. `createBooking` نفسه **GraphQL mutation** (مش REST) —
باقي كل حاجة REST عادي.

### الـ endpoints

- `POST /booking/:hotelId/searchAvailability` — DTO مؤكد. Response:
  `{ message, data: result }` — `result = response.data.hotels.hotels`
  من Hotelbeds (array فيه فندق واحد، جواه `rooms[]`، كل room فيه `rates[]`
  وكل rate فيه `rateKey` + `net`/`sellingRate`).
- `POST /booking/:hotelId/selectRooms` — `{ rooms: [{ rateKey, adults, children }] }`.
- **`createBooking` (GraphQL Mutation)** — `mutation createBooking(hotelId: Int!, input: BookingInput!)`.
  الـ `input` بيتكون من `{ rooms: [{ guests: [{firstName,lastName,age?}] }], holder: {firstName,lastName,email,phone}, paymentType }`.
  لازم `Idempotency-Key` header (بنبعته عن طريق `graphqlRequest` اللي
  بقى بياخد `headers` كـ argument ثالث).
- `GET /booking?page=&limit=` و `GET /booking/:id` و
  `DELETE /booking/:bookingId/cancel` — زي ما هو موثق قبل كده.

### الـ Flow في الفرونت (`/hotel/:id/book`)

`AvailabilityForm` (تواريخ + ضيوف) → `AvailabilityResults` (اختيار
غرفة/سعر واحد أو أكتر) → `selectRooms` → `GuestDetailsForm` (بيانات
كل ضيف لكل غرفة + holder + `paymentType`) → `createBooking` → لو
`paymentType === 'AT_WEB'` بيروح `/bookings/:id/pay`، غير كده
`/bookings/:id`.

### ✅ شكل الـ availability response مؤكد الآن (من response حقيقي)

```
data: [{
  code, name, categoryName, destinationCode, latitude, longitude,
  currency, minRate, maxRate,
  rooms: [{
    code, name,
    rates: [{
      rateKey, net (string!), boardName, paymentType,
      adults, children, rooms,
      cancellationPolicies: [{ amount, from }],
      offers: [{ code, name, amount }]
    }]
  }]
}]
```

السعر فيلده `net` (مش `sellingRate`) وبيرجع كـ **string**، فبنعمله
`parseFloat`. `adults`/`children` موجودين مباشرة في كل rate. `currency`
على مستوى الفندق مش الـ rate. كله اتصلح في `AvailabilityResults.jsx`
و `BookHotelPage.jsx`. كمان بنعرض أقرب سياسة إلغاء كملخص سريع.

### TODO متبقية

1. **قيم `BookingStatus` enum**: مفترضة (`CONFIRMED`, `PENDING`,
   `CANCELLED`, `COMPLETED`) في `BookingStatusBadge.jsx` و
   `BookingDetailsPage.jsx` (`needsPayment` بيتشيك على `'PENDING'`).

## Payment module ✅ (PaymentIntent UI جاهز)

REST كامل + Stripe Elements (`@stripe/stripe-js` و
`@stripe/react-stripe-js` اتضافوا لـ `package.json`).

- `GET /payment/gateways` — `{ data: PaymentGateway[] }`.
- `GET /payment?page=&limit=` — my payments، `{ message, data, meta: { total, pages } }`.
- `GET /payment/:paymentId` — تفاصيل دفعة.
- `POST /payment/:bookingId/pay` — `{ gateway }` → Response:
  `{ message, data: { clientSecret, id, bookingId }, meta: { gateway } }`.
- `PaymentPage.jsx` (`/bookings/:id/pay`) بينادي `pay` بـ `gateway: 'stripe'`
  تلقائيًا (مفترض إنه الوحيد المتاح)، وبيلف `<PaymentIntentForm>` بـ
  `<Elements clientSecret={...}>`. الفورم بتستخدم `PaymentElement` +
  `stripe.confirmPayment` مع `return_url` بترجع لصفحة تفاصيل الحجز.
  التأكيد النهائي بيحصل عن طريق الـ Stripe webhook في الباك اند
  (مش الفرونت — الفرونت بس بيبدأ العملية ويعرض الـ UI).

### TODO مهمة

1. **`VITE_STRIPE_PUBLISHABLE_KEY`** لازم تتحط في `.env` (مش مذكورة
   في أي حاجة بعتهالي، لازم تجيبها من Stripe dashboard بتاعك).
2. **لو فيه أكتر من `PaymentGateway` واحد متاح**، لازم نستبدل
   الـ hardcoded `'stripe'` في `PaymentPage.jsx` بشاشة اختيار
   `usePaymentGateways()`.
3. **مفيش refund UI للـ admin** — الـ endpoint `POST /payment/:bookingId/refund`
   مش مبني (مش أولوية للفرونت بتاع اليوزر العادي).

## Notifications module ✅ (REST + WebSocket لايف)

- `GET /notifications?cursor=&limit=` — cursor pagination، بس **`meta`
  نفسه هو الـ cursor** (نص مباشر) مش `{ nextCursor }` زي باقي
  الموديولز — `useNotifications.js` بيتعامل مع الفرق ده صح.
  الباك اند بيعلّم الإشعارات كـ "مقروءة" تلقائيًا أول ما بتتجاب (مفيش
  mutation منفصلة لـ mark-as-read).
- **WebSocket لايف**: الـ Gateway في الباك اند namespace اسمه `public`،
  وبياخد الـ token من `handshake.auth.authorization`. عملت
  `lib/socket.js` + `useNotificationSocket()` hook بينادى مرة واحدة في
  `App.jsx` (زي `useBootstrapAuth`)، بيسمع لحدث `notification` ويعرض
  toast + يعمل `invalidateQueries(['notifications'])` عشان القائمة
  تتحدّث لايف. `socket.io-client` اتضاف لـ `package.json`.

### ✅ مؤكد الآن

- **`VITE_SOCKET_URL`** = `http://localhost:3000` — مؤكد، مفيش تعديل.
- **شكل الـ notification document** — مؤكد 100% من Mongoose schema:
  `{ _id, title (enum), content, userId, isRead, createdAt, updatedAt }`.
  `NotificationItem.jsx` فيه mapping لـ 3 قيم من `NotificationTitle`
  شفناها في الكود (`createdBooking`, `confirmedBooking`, `canceledBooking`)
  — أي قيمة تانية بتتعرض كـ fallback زي ما هي.

## الخطوة الجاية

المشروع بقى فيه كل الـ modules الأساسية من الـ auth لحد الـ payment
والإشعارات اللايف، وشكل بيانات الـ availability بقى مؤكد من response
حقيقي. الخطوات الطبيعية بعد كده: تجربة الـ flow كامل end-to-end مع
الباك اند شغال فعليًا (خصوصًا `createBooking` GraphQL mutation والـ
Stripe payment confirmation)، وبعدين تحسينات UX لو احتجنا.
