import { getAdminCoupons } from "@/lib/queries";
import { CouponsManager } from "@/components/admin/coupons-manager";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Coupons</h1>
      <CouponsManager initial={coupons} />
    </div>
  );
}
