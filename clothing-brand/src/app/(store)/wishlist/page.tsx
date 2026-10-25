import { WishlistView } from "@/components/store/wishlist-view";

export const metadata = {
  title: "Wishlist",
};

export default function WishlistPage() {
  return (
    <div className="page-shell py-10 sm:py-14">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Wishlist</h1>
      <div className="mt-8">
        <WishlistView />
      </div>
    </div>
  );
}
