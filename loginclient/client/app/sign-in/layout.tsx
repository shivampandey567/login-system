// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SIGN-IN",
    description: "Plese sign-in to continue",
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