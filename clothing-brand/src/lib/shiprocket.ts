const API = "https://apiv2.shiprocket.in/v1/external";

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

export type ShippableOrder = {
  orderNumber: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  createdAt?: Date;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: Array<{
    name: string;
    sku?: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export function isShiprocketConfigured() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

export function splitCustomerName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "Customer", last: "Customer" };
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function normalizeIndianMobile(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return "";
}

export function trackingUrlForAwb(awb: string) {
  return `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
}

export function mapShiprocketStatus(
  status: string
): "processing" | "shipped" | "delivered" | "cancelled" | null {
  const value = status.toLowerCase();
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("rto") || value.includes("return")) return "shipped";
  if (
    value.includes("out for") ||
    value.includes("undeliver") ||
    value.includes("transit") ||
    value.includes("picked") ||
    value.includes("pickup") ||
    value.includes("shipped") ||
    value.includes("manifest")
  ) {
    return "shipped";
  }
  if (value.includes("deliver")) return "delivered";
  if (
    value.includes("new") ||
    value.includes("process") ||
    value.includes("invoice") ||
    value.includes("ready")
  ) {
    return "processing";
  }
  return null;
}

function orderDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

async function shiprocketFetch(
  path: string,
  token: string,
  init: RequestInit = {}
) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
    [key: string]: unknown;
  };
  if (!response.ok) {
    const message = data.message || data.error || response.statusText;
    throw new Error(
      typeof message === "string" ? `Shiprocket: ${message}` : "Shiprocket request failed"
    );
  }
  return data;
}

export async function getShiprocketToken() {
  if (!isShiprocketConfigured()) {
    throw new Error("Shiprocket is not configured");
  }
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;

  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { token?: string; message?: string };
  if (!response.ok || !data.token) {
    throw new Error(data.message || "Shiprocket login failed");
  }
  tokenCache = {
    token: data.token,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };
  return data.token;
}

export async function createShiprocketOrder(order: ShippableOrder) {
  const token = await getShiprocketToken();
  const name = splitCustomerName(order.shippingAddress.fullName);
  const phone = normalizeIndianMobile(order.shippingAddress.phone);
  const pincode = order.shippingAddress.postalCode.replace(/\D/g, "");
  if (phone.length !== 10) throw new Error("Shiprocket needs a 10-digit phone number");
  if (pincode.length !== 6) throw new Error("Shiprocket needs a 6-digit PIN code");

  const weight = Math.max(
    0.5,
    order.items.reduce((sum, item) => sum + item.quantity, 0) *
      Number(process.env.SHIPROCKET_ITEM_WEIGHT_KG || 0.3)
  );

  const payload: Record<string, unknown> = {
    order_id: order.orderNumber,
    order_date: orderDate(order.createdAt),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: name.first,
    billing_last_name: name.last,
    billing_address: order.shippingAddress.line1.slice(0, 190),
    billing_address_2: order.shippingAddress.line2?.slice(0, 190) || "",
    billing_city: order.shippingAddress.city,
    billing_pincode: pincode,
    billing_state: order.shippingAddress.state,
    billing_country: "India",
    billing_email: order.shippingAddress.email,
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: `${item.name} (${item.size} / ${item.color})`.slice(0, 200),
      sku: (item.sku || `${item.name}-${item.size}-${item.color}`)
        .replace(/\s+/g, "")
        .slice(0, 50),
      units: item.quantity,
      selling_price: item.unitPrice,
      discount: 0,
      tax: 0,
      ...(process.env.SHIPROCKET_HSN ? { hsn: process.env.SHIPROCKET_HSN } : {}),
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    shipping_charges: order.shipping,
    total_discount: order.discount,
    sub_total: order.subtotal,
    length: Number(process.env.SHIPROCKET_LENGTH_CM || 25),
    breadth: Number(process.env.SHIPROCKET_BREADTH_CM || 20),
    height: Number(process.env.SHIPROCKET_HEIGHT_CM || 5),
    weight,
  };

  const data = await shiprocketFetch("/orders/create/adhoc", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const created = (data.payload ?? data) as {
    order_id?: number | string;
    shipment_id?: number | string;
  };
  if (!created.order_id || !created.shipment_id) {
    throw new Error("Shiprocket did not return an order id");
  }
  return {
    shiprocketOrderId: String(created.order_id),
    shiprocketShipmentId: String(created.shipment_id),
  };
}

export async function assignShiprocketAwb(input: {
  shiprocketShipmentId: string;
  paymentMethod: string;
  postalCode: string;
  weightKg: number;
}) {
  const token = await getShiprocketToken();
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickup) throw new Error("Set SHIPROCKET_PICKUP_PINCODE to assign a courier");

  const delivery = input.postalCode.replace(/\D/g, "");
  const service = await shiprocketFetch(
    `/courier/serviceability/?pickup_postcode=${pickup}&delivery_postcode=${delivery}&cod=${
      input.paymentMethod === "cod" ? 1 : 0
    }&weight=${input.weightKg}`,
    token
  );
  const couriers =
    (
      service.data as {
        available_courier_companies?: Array<{
          courier_company_id: number;
          courier_name: string;
          rate: number;
        }>;
      }
    )?.available_courier_companies ?? [];
  if (!couriers.length) throw new Error("No Shiprocket courier for this PIN code");

  const cheapest = [...couriers].sort((a, b) => a.rate - b.rate)[0];
  const assigned = await shiprocketFetch("/courier/assign/awb", token, {
    method: "POST",
    body: JSON.stringify({
      shipment_id: input.shiprocketShipmentId,
      courier_id: cheapest.courier_company_id,
    }),
  });

  const awb =
    (
      assigned.response as {
        data?: { awb_code?: string; courier_name?: string };
      }
    )?.data?.awb_code ||
    (assigned.awb_code as string | undefined);
  if (!awb) throw new Error("Shiprocket did not assign an AWB");

  await shiprocketFetch("/courier/generate/pickup", token, {
    method: "POST",
    body: JSON.stringify({ shipment_id: [Number(input.shiprocketShipmentId)] }),
  }).catch((error) => {
    console.error("[shiprocket] pickup request failed", error);
  });

  return {
    awbCode: String(awb),
    courierName:
      (
        assigned.response as {
          data?: { courier_name?: string };
        }
      )?.data?.courier_name || cheapest.courier_name,
    trackingUrl: trackingUrlForAwb(String(awb)),
  };
}

export async function cancelShiprocketOrder(shiprocketOrderId: string) {
  if (!isShiprocketConfigured() || !shiprocketOrderId) return;
  const token = await getShiprocketToken();
  await shiprocketFetch("/orders/cancel", token, {
    method: "POST",
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
  });
}
