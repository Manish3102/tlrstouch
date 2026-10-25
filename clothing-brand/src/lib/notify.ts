import { normalizeIndianMobile } from "@/lib/shiprocket";

export type NotifyEvent = "placed" | "shipped" | "delivered" | "cancelled";

export type NotifyOrder = {
  orderNumber: string;
  paymentMethod: string;
  total: number;
  courierName?: string;
  trackingUrl?: string;
  awbCode?: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
  };
};

function rupees(amount: number) {
  return `Rs ${Math.round(amount)}`;
}

export function orderUpdateText(order: NotifyOrder, event: NotifyEvent) {
  const first = order.shippingAddress.fullName.trim().split(/\s+/)[0] || "there";
  if (event === "placed") {
    const payment =
      order.paymentMethod === "cod"
        ? `Pay ${rupees(order.total)} cash on delivery.`
        : "Payment received.";
    return `Tailorstouch: Hi ${first}, order ${order.orderNumber} is confirmed. Total ${rupees(order.total)}. ${payment}`;
  }
  if (event === "shipped") {
    const via = order.courierName ? ` via ${order.courierName}` : "";
    const track = order.trackingUrl || (order.awbCode ? `AWB ${order.awbCode}` : "Tracking will be shared soon.");
    return `Tailorstouch: Order ${order.orderNumber} has shipped${via}. Track: ${track}`;
  }
  if (event === "delivered") {
    return `Tailorstouch: Order ${order.orderNumber} is delivered. Thank you for shopping with us.`;
  }
  return `Tailorstouch: Order ${order.orderNumber} was cancelled. Reply to this message if you still need the order.`;
}

async function sendFast2Sms(phone: string, message: string) {
  const key = process.env.FAST2SMS_API_KEY;
  if (!key) return false;
  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: process.env.FAST2SMS_ROUTE || "q",
      message,
      language: "english",
      flash: 0,
      numbers: phone,
    }),
  });
  if (!response.ok) {
    console.error("[notify] SMS failed", response.status);
    return false;
  }
  return true;
}

async function sendWhatsApp(phone: string, order: NotifyOrder, event: NotifyEvent) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  if (!token || !phoneNumberId || !template) return false;

  const update =
    event === "placed"
      ? order.paymentMethod === "cod"
        ? "confirmed. Pay cash on delivery"
        : "confirmed. Payment received"
      : event === "shipped"
        ? `shipped${order.trackingUrl ? `. Track ${order.trackingUrl}` : ""}`
        : event === "delivered"
          ? "delivered"
          : "cancelled";

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: `91${phone}`,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: order.shippingAddress.fullName },
                { type: "text", text: order.orderNumber },
                { type: "text", text: rupees(order.total) },
                { type: "text", text: update },
              ],
            },
          ],
        },
      }),
    }
  );
  if (!response.ok) {
    console.error("[notify] WhatsApp failed", response.status);
    return false;
  }
  return true;
}

async function sendEmail(order: NotifyOrder, message: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!key || !from) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [order.shippingAddress.email],
      subject: `Tailorstouch order ${order.orderNumber}`,
      text: message,
    }),
  });
  if (!response.ok) {
    console.error("[notify] email failed", response.status);
    return false;
  }
  return true;
}

export async function notifyCustomer(order: NotifyOrder, event: NotifyEvent) {
  const message = orderUpdateText(order, event);
  const phone = normalizeIndianMobile(order.shippingAddress.phone);
  const [sms, whatsapp, email] = await Promise.all([
    phone ? sendFast2Sms(phone, message) : Promise.resolve(false),
    phone ? sendWhatsApp(phone, order, event) : Promise.resolve(false),
    sendEmail(order, message),
  ]);
  const sent = sms || whatsapp || email;
  if (!sent) {
    console.warn(
      `[notify] No message sent for ${order.orderNumber}. Set FAST2SMS_API_KEY, WhatsApp, or RESEND_API_KEY.`
    );
  }
  return { sent, sms, whatsapp, email };
}
