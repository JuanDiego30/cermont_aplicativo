import { redirect } from "next/navigation";
import { use } from "react";

interface Props {
	params: Promise<{ id: string }>;
}

export default function ExecutionSessionPage({ params }: Props) {
	const { id } = use(params);
	redirect(`/execution/${encodeURIComponent(id)}`);
}
