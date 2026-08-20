import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "This is user dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen">
            <main className="h-full w-full">
                {children}
            </main>
        </div>
    );
}