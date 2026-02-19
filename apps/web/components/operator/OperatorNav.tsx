'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { operatorRoutes } from '@/lib/operator/routes';

const navItems = [
  { label: 'Register', href: operatorRoutes.register },
  { label: 'Worklist', href: operatorRoutes.worklist },
  { label: 'Samples', href: operatorRoutes.samples },
  { label: 'Verify', href: operatorRoutes.verify },
  { label: 'Published Reports', href: operatorRoutes.publishedReports },
];

export function OperatorNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-48 flex-col border-r border-gray-200 bg-gray-50 p-3">
      <div className="mb-4 text-sm font-semibold text-gray-700">Operator</div>
      <ul className="space-y-1">
        {navItems.map(({ label, href }) => {
          const isActive =
            pathname === href || (href !== operatorRoutes.worklist && pathname.startsWith(href + '/'));
          return (
            <li key={href}>
              <Link
                href={href}
                className={`block rounded px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-blue-100 font-medium text-blue-800'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
