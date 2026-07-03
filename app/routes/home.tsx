import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "whittle.tools" },
		{
			name: "description",
			content: "A collection of fast, privacy-friendly developer utilities.",
		},
	];
}

export default function Home() {
	return (
		<main className="container mx-auto p-8">
			<h1 className="text-2xl font-bold">whittle.tools</h1>
		</main>
	);
}
