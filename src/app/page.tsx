import Link from 'next/link';

export default function Home() {
	return (
		<main className="container mx-auto">
			<h1 className="text-4xl font-bold">Log in</h1>
			<Link href="/hunts">
				<button className="rounded-xl bg-purple-500 p-2 mt-2 font-bold">
					Click here to log in
				</button>
			</Link>
		</main>
	);
}
