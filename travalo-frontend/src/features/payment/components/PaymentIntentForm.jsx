import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';

export function PaymentIntentForm({ bookingId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // بعد الدفع، Stripe بيعمل redirect هنا (مهم لـ 3D Secure وطرق دفع تانية)
        return_url: `${window.location.origin}/bookings/${bookingId}?payment=success`,
      },
    });

    // لو وصلنا هنا (من غير redirect)، غالبًا حصل خطأ فوري (كارت مرفوض إلخ)
    if (error) {
      setErrorMessage(error.message || 'حصل خطأ في الدفع، حاول تاني');
      setIsProcessing(false);
    }
    // لو نجح، Stripe هيعمل redirect لـ return_url تلقائيًا؛ التأكيد
    // النهائي بيحصل عن طريق الـ webhook في الباك اند (payment_intent.succeeded)
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {errorMessage && <p className="text-sm text-coral">{errorMessage}</p>}
      <Button type="submit" isLoading={isProcessing} disabled={!stripe} className="w-full">
        ادفع دلوقتي
      </Button>
    </form>
  );
}
