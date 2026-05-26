import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/modules/auth/session";
import DefaultLayout from "@/modules/core/ui/layout/DefaultLayout";
import { DashboardProviders } from "./dashboard-providers";

export default async function DashboardRootLayout({ children }: { children: ReactNode }) {
	const session = await getSession();
	if (!session?.user) {
		redirect("/login");
	}

	return (
		<DashboardProviders>
			<DefaultLayout>{children}</DefaultLayout>
		</DashboardProviders>
	);
}
