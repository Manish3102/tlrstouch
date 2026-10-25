import { describe, expect, it } from "vitest";
import { orderUpdateText } from "@/lib/notify";
import {
  mapShiprocketStatus,
  normalizeIndianMobile,
  splitCustomerName,
} from "@/lib/shiprocket";

describe("indian mobile", () => {
  it("keeps a 10-digit number", () => {
    expect(normalizeIndianMobile("9876543210")).toBe("9876543210");
  });

  it("strips country code and spaces", () => {
    expect(normalizeIndianMobile("+91 98765 43210")).toBe("9876543210");
  });
});

describe("customer name", () => {
  it("splits the last name", () => {
    expect(splitCustomerName("Asha Rao")).toEqual({ first: "Asha", last: "Rao" });
  });

  it("repeats a single name", () => {
    expect(splitCustomerName("Asha")).toEqual({ first: "Asha", last: "Asha" });
  });
});

describe("shiprocket status", () => {
  it("maps delivery states", () => {
    expect(mapShiprocketStatus("Delivered")).toBe("delivered");
    expect(mapShiprocketStatus("Out for Delivery")).toBe("shipped");
    expect(mapShiprocketStatus("RTO Delivered")).toBe("shipped");
    expect(mapShiprocketStatus("Cancelled")).toBe("cancelled");
  });
});

describe("customer message", () => {
  const order = {
    orderNumber: "DRF-1",
    paymentMethod: "cod",
    total: 1299,
    shippingAddress: {
      fullName: "Asha Rao",
      email: "asha@example.com",
      phone: "9876543210",
    },
  };

  it("tells a COD customer to pay on delivery", () => {
    expect(orderUpdateText(order, "placed")).toContain("cash on delivery");
    expect(orderUpdateText(order, "placed")).toContain("DRF-1");
  });

  it("includes the tracking link once the order ships", () => {
    expect(
      orderUpdateText(
        { ...order, trackingUrl: "https://shiprocket.co/tracking/AWB1", courierName: "Delhivery" },
        "shipped"
      )
    ).toContain("https://shiprocket.co/tracking/AWB1");
  });
});
