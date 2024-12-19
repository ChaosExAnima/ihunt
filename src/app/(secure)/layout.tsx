import Navbar from '@/components/navbar';
import Page from '@/components/page';

export default function SecureLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// TODO: Check auth information here
	return (
		<>
			<Navbar />
			<Page>{children}</Page>
		</>
	);
}
