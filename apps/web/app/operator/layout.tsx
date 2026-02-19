import { OperatorNav } from '@/components/operator/OperatorNav';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Operator</h1>
          <div className="text-sm text-gray-500">
            {/* TODO: Tenant label from session; user menu placeholder */}
            <span aria-hidden>Tenant · User</span>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <OperatorNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
