import type { Metadata } from "next";

import { AdminUsersPanel } from "@/components/admin-users-panel";

export const metadata: Metadata = {
  title: "后台用户管理 | Commerce Tool System",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUsersPage() {
  return <AdminUsersPanel />;
}
