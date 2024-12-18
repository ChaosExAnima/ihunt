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
			{children}
		</>
	);
}
