import type { Metadata } from "next";

import { AccountCenter } from "@/components/account-center";

export const metadata: Metadata = {
  title: "用户中心 | 电商工具系统",
  description: "注册、查看次数、兑换加群奖励，并进入三个 Amazon 旗舰工具。",
};

export default function AccountZhPage() {
  return <AccountCenter locale="zh" />;
}
