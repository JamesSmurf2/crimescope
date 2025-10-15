import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
    title: "Crimescope",
    description:
        "A modern application built with Next.js, featuring interactive maps powered by Leaflet.",
    icons: {
        icon: "/icons/icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta name="description" content={metadata.description} />
                <title>{metadata.title}</title>
                <link rel="icon" href={metadata.icons.icon} />
            </head>
            <body className="antialiased bg-gray-950 text-white">
                {children}
            </body>
        </html>
    );
}
