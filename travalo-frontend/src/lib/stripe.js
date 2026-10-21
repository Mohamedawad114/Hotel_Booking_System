import { loadStripe } from '@stripe/stripe-js';

// loadStripe بيكاش النتيجة تلقائيًا، فمفيش داعي نعمل singleton يدوي
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
