"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createCheckoutOrder,
  verifyRazorpayPayment,
} from "@/actions/orders";
import { validateCouponCode } from "@/actions/coupons";
import { useCartStore } from "@/store/cart";
import { cn, formatINR } from "@/lib/utils";
import type { PaymentMethod } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

const checkoutFormSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4).max(12),
  country: z.string().min(2),
  paymentMethod: z.enum(["razorpay", "cod"]),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: RazorpayHandlerResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({
  codEnabled = true,
  onlineEnabled = true,
  className,
}: {
  codEnabled?: boolean;
  onlineEnabled?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal());

  const [couponInput, setCouponInput] = useState(couponCode ?? "");
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(
    couponCode
  );
  const [quote, setQuote] = useState<{
    discount: number;
    shipping: number;
    total: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const [couponPending, startCouponTransition] = useTransition();

  const lineItems = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
    [items]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      country: "IN",
      paymentMethod: codEnabled ? "cod" : "razorpay",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const displayTotal = quote?.total ?? subtotal;
  const displayShipping = quote?.shipping;
  const displayDiscount = quote?.discount ?? 0;

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) {
      setAppliedCoupon(undefined);
      setCoupon(undefined);
      setQuote(null);
      return;
    }
    startCouponTransition(async () => {
      try {
        const result = await validateCouponCode(code, lineItems);
        setAppliedCoupon(result.code);
        setCoupon(result.code);
        setQuote({
          discount: result.discount,
          shipping: result.shipping,
          total: result.total,
        });
        toast.success("Coupon applied");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Invalid coupon");
      }
    });
  };

  const onSubmit = (values: CheckoutFormValues) => {
    if (!items.length) {
      toast.error("Your bag is empty.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          items: lineItems,
          shippingAddress: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            line1: values.line1,
            line2: values.line2,
            city: values.city,
            state: values.state,
            postalCode: values.postalCode,
            country: values.country,
          },
          couponCode: appliedCoupon,
          paymentMethod: values.paymentMethod as PaymentMethod,
        };

        const order = await createCheckoutOrder(payload);

        if (order.paymentMethod === "cod") {
          clearCart();
          router.push(`/order/${order.orderNumber}`);
          return;
        }

        if (!order.razorpayOrderId || !order.razorpayKeyId) {
          throw new Error("Payment could not be initialized.");
        }

        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          throw new Error("Could not load payment gateway.");
        }

        const rzp = new window.Razorpay({
          key: order.razorpayKeyId,
          amount: Math.round(order.total * 100),
          currency: "INR",
          name: "Tailorstouch",
          description: `Order ${order.orderNumber}`,
          order_id: order.razorpayOrderId,
          prefill: {
            name: values.fullName,
            email: values.email,
            contact: values.phone,
          },
          theme: { color: "#171717" },
          handler: async (response: RazorpayHandlerResponse) => {
            try {
              await verifyRazorpayPayment({
                orderId: order.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              router.push(`/order/${order.orderNumber}`);
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "Payment verification failed"
              );
            }
          },
        });

        rzp.on("payment.failed", () => {
          toast.error("Payment failed. Try again or use COD.");
        });

        rzp.open();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Checkout failed");
      }
    });
  };

  if (!items.length) {
    return (
      <p className="py-12 text-center font-sans text-sm text-neutral-600">
        Add items to your bag before checkout.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12",
        className
      )}
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-display text-xl tracking-tight text-neutral-900">
            Shipping
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName ? (
                <p className="text-xs text-red-600">{errors.fullName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone ? (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input id="line1" {...register("line1")} />
              {errors.line1 ? (
                <p className="text-xs text-red-600">{errors.line1.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="line2">Apartment, suite (optional)</Label>
              <Input id="line2" {...register("line2")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
              {errors.city ? (
                <p className="text-xs text-red-600">{errors.city.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} />
              {errors.state ? (
                <p className="text-xs text-red-600">{errors.state.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">PIN code</Label>
              <Input id="postalCode" {...register("postalCode")} />
              {errors.postalCode ? (
                <p className="text-xs text-red-600">
                  {errors.postalCode.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl tracking-tight text-neutral-900">
            Coupon
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              disabled={couponPending}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={couponPending}
              onClick={applyCoupon}
            >
              {couponPending ? "Applying…" : "Apply"}
            </Button>
          </div>
          {appliedCoupon ? (
            <p className="font-sans text-xs text-neutral-600">
              Applied: <span className="font-medium">{appliedCoupon}</span>
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl tracking-tight text-neutral-900">
            Payment
          </h2>
          <div className="space-y-2">
            {onlineEnabled ? (
              <label className="flex cursor-pointer items-center gap-3 border border-neutral-300 px-4 py-3 has-[:checked]:border-neutral-900">
                <input
                  type="radio"
                  value="razorpay"
                  {...register("paymentMethod")}
                  className="accent-neutral-900"
                />
                <span className="font-sans text-sm">Pay online (Razorpay)</span>
              </label>
            ) : null}
            {codEnabled ? (
              <label className="flex cursor-pointer items-center gap-3 border border-neutral-300 px-4 py-3 has-[:checked]:border-neutral-900">
                <input
                  type="radio"
                  value="cod"
                  {...register("paymentMethod")}
                  className="accent-neutral-900"
                />
                <span className="font-sans text-sm">Cash on delivery</span>
              </label>
            ) : null}
          </div>
          {errors.paymentMethod ? (
            <p className="text-xs text-red-600">{errors.paymentMethod.message}</p>
          ) : null}
        </section>
      </div>

      <aside className="h-fit border border-neutral-200 bg-[#F7F7F5] p-6">
        <h2 className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
          Order
        </h2>
        <ul className="mt-4 space-y-3 border-b border-neutral-200 pb-4">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex justify-between gap-2 font-sans text-sm"
            >
              <span className="text-neutral-700">
                {item.name} × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 font-sans text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Subtotal</dt>
            <dd>{formatINR(subtotal)}</dd>
          </div>
          {displayDiscount > 0 ? (
            <div className="flex justify-between text-neutral-700">
              <dt>Discount</dt>
              <dd>-{formatINR(displayDiscount)}</dd>
            </div>
          ) : null}
          {displayShipping != null ? (
            <div className="flex justify-between text-neutral-600">
              <dt>Shipping</dt>
              <dd>{formatINR(displayShipping)}</dd>
            </div>
          ) : (
            <div className="flex justify-between text-neutral-500">
              <dt>Shipping</dt>
              <dd>At payment</dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 font-display text-lg">
          <span>Total</span>
          <span>{formatINR(displayTotal)}</span>
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
          {pending
            ? "Processing…"
            : paymentMethod === "cod"
              ? "Place order"
              : "Pay now"}
        </Button>
      </aside>
    </form>
  );
}
