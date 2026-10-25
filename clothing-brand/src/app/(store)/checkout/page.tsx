import { CheckoutForm } from "@/components/store/checkout-form";
import { getStoreSettings } from "@/lib/queries";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  const codEnabled =
    process.env.COD_ENABLED !== "false" && settings.codEnabled !== false;
  const onlineEnabled = Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Checkout</h1>
      <p className="mt-3 text-sm text-muted">
        Secure checkout · prices calculated server-side
      </p>
      <div className="mt-8">
        {codEnabled || onlineEnabled ? (
          <CheckoutForm codEnabled={codEnabled} onlineEnabled={onlineEnabled} />
        ) : (
          <p className="text-sm text-neutral-600">
            Checkout is unavailable until COD or online payment is turned on.
          </p>
        )}
      </div>
    </div>
  );
}
