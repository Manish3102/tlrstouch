import { auth } from "@/lib/auth";
import { AccountAuth } from "@/components/store/account-auth";
import { AccountPanel } from "@/components/store/account-panel";

export const metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const session = await auth();

  if (session?.user && session.user.role === "customer") {
    return (
      <AccountPanel name={session.user.name} email={session.user.email} />
    );
  }

  return <AccountAuth />;
}
