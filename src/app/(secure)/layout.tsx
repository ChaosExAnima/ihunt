export default function SecureLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <main className="container mx-auto">{children}</main>;
}
