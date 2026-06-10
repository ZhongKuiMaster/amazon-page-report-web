import type { Metadata } from "next";

import { AccountCenter } from "@/components/account-center";

export const metadata: Metadata = {
  title: "Account Center | Commerce Tool System",
  description: "Register, check credits, and redeem community credits for the three Amazon flagship tools.",
};

export default function AccountPage() {
  return <AccountCenter locale="en" />;
}
