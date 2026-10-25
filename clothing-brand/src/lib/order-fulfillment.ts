import { notifyCustomer, type NotifyEvent, type NotifyOrder } from "@/lib/notify";
import {
  assignShiprocketAwb,
  cancelShiprocketOrder,
  createShiprocketOrder,
  isShiprocketConfigured,
  type ShippableOrder,
} from "@/lib/shiprocket";

type FulfillmentOrder = ShippableOrder &
  NotifyOrder & {
    shiprocketOrderId?: string;
    shiprocketShipmentId?: string;
    notifiedEvents?: string[];
    save: () => Promise<unknown>;
    markModified: (path: string) => void;
  };

function weightKg(order: { items: Array<{ quantity: number }> }) {
  return Math.max(
    0.5,
    order.items.reduce((sum, item) => sum + item.quantity, 0) *
      Number(process.env.SHIPROCKET_ITEM_WEIGHT_KG || 0.3)
  );
}

export async function notifyOrderOnce(order: FulfillmentOrder, event: NotifyEvent) {
  if (order.notifiedEvents?.includes(event)) return;
  const result = await notifyCustomer(order, event);
  if (!result.sent) return;
  order.notifiedEvents = [...(order.notifiedEvents ?? []), event];
  order.markModified("notifiedEvents");
  await order.save();
}

export async function syncOrderFulfillment(
  order: FulfillmentOrder,
  event: NotifyEvent
) {
  if (isShiprocketConfigured()) {
    try {
      if (!order.shiprocketOrderId && (event === "placed" || event === "shipped")) {
        const created = await createShiprocketOrder(order);
        order.shiprocketOrderId = created.shiprocketOrderId;
        order.shiprocketShipmentId = created.shiprocketShipmentId;
        await order.save();
      }

      if (event === "shipped" && order.shiprocketShipmentId && !order.awbCode) {
        const awb = await assignShiprocketAwb({
          shiprocketShipmentId: order.shiprocketShipmentId,
          paymentMethod: order.paymentMethod,
          postalCode: order.shippingAddress.postalCode,
          weightKg: weightKg(order),
        });
        order.awbCode = awb.awbCode;
        order.courierName = awb.courierName;
        order.trackingUrl = awb.trackingUrl;
        await order.save();
      }
    } catch (error) {
      console.error(`[shiprocket] ${order.orderNumber}`, error);
    }

    if (event === "cancelled" && order.shiprocketOrderId) {
      try {
        await cancelShiprocketOrder(order.shiprocketOrderId);
      } catch (error) {
        console.error(`[shiprocket] cancel ${order.orderNumber}`, error);
      }
    }
  }

  await notifyOrderOnce(order, event);
}
