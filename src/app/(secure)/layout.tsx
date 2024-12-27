import Navbar from '@/components/navbar';

export default function SecureLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// TODO: Check auth information here
	return (
		<>
			<Navbar />
			<main className="grow px-4 flex flex-col gap-4">{children}</main>
		</>
	);
}
