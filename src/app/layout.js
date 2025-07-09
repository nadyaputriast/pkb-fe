import "./globals.css";

export const metadata = {
  metadataBase: new URL('http://localhost:3000'), // Tambah ini
  title: "MoodFlix AI",
  description:
    "Discover your perfect movie match with intelligent AI recommendations. Find movies based on your mood, preferences, and viewing history.",
  keywords:
    "movie recommendations, AI movies, film discovery, movie finder, entertainment",
  authors: [{ name: "MoodFlix AI" }],
  openGraph: {
    title: "MoodFlix AI - AI-Powered Movie Recommendations",
    description:
      "Discover your perfect movie match with intelligent AI recommendations",
    type: "website",
    url: "https://moodflix-ai.com",
    siteName: "MoodFlix AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MoodFlix AI - Movie Recommendations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodFlix AI - AI-Powered Movie Recommendations",
    description:
      "Discover your perfect movie match with intelligent AI recommendations",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EAC7C7",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}