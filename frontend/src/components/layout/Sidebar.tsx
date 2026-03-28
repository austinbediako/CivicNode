"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  History,
  Upload,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const mainLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Proposals",
    href: "/proposals",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: "Treasury",
    href: "/treasury",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    label: "History",
    href: "/history",
    icon: <History className="w-5 h-5" />,
  },
];

const adminLinks: NavLink[] = [
  {
    label: "Upload & Synthesize",
    href: "/admin",
    icon: <Upload className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    label: "Members",
    href: "/admin/members",
    icon: <Users className="w-5 h-5" />,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "h-full bg-dark-950 border-r border-dark-800 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 py-4">
        {/* Main Navigation */}
        <nav className="space-y-1 px-2">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                isActive(link.href)
                  ? "bg-primary-700/20 text-primary-400"
                  : "text-dark-400 hover:text-dark-200 hover:bg-dark-800"
              )}
              title={collapsed ? link.label : undefined}
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-8">
            {!collapsed && (
              <div className="px-5 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-500">
                  Admin
                </span>
              </div>
            )}
            <nav className="space-y-1 px-2">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive(link.href)
                      ? "bg-primary-700/20 text-primary-400"
                      : "text-dark-400 hover:text-dark-200 hover:bg-dark-800"
                  )}
                  title={collapsed ? link.label : undefined}
                >
                  {link.icon}
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-dark-800 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-dark-500 hover:text-dark-300 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
