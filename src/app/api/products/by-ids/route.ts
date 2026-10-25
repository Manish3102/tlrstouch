import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 24);

  const products = await getProductsByIds(ids);
  return NextResponse.json({ products });
}
