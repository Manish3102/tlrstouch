import { getAdminCustomers } from "@/lib/queries";

export default async function AdminCustomersPage() {
  const { items } = await getAdminCustomers();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Customers</h1>
      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {items.map(
              (user: {
                _id: string;
                name: string;
                email: string;
                createdAt?: string;
              }) => (
                <tr key={user._id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Customers appear here after account creation / checkout identity capture.
        </p>
      ) : null}
    </div>
  );
}
