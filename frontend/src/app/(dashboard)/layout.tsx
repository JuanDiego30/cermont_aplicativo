import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/auth/session";
import DefaultLayout from "@/core/ui/layout/DefaultLayout";
import { DashboardProviders } from "./dashboard-providers";

export const dynamic = "force-dynamic";

export default async function DashboardRootLayout({ children }: { children: ReactNode }) {
	const session = await getSession();
	if (!session?.user) {
		redirect("/login");
	}

	return (
		<section aria-label="Authenticated workspace">
			<DashboardProviders>
				<DefaultLayout>{children}</DefaultLayout>
			</DashboardProviders>
		</section>
	);
}
