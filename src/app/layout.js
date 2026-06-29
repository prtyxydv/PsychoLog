import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "PsychoLog — Intelligent Session Documentation for Therapists",
    template: "%s | PsychoLog",
  },
  description:
    "Privacy-first administrative middleware that reduces therapist documentation time by auto-generating AI session summaries from patient inter-session logs.",
  keywords: ["therapist tool", "mental health documentation", "SOAP notes", "session summary", "AI therapy assistant"],
  authors: [{ name: "Pratyaksh" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "PsychoLog — Intelligent Session Documentation for Therapists",
    description:
      "Privacy-first admin middleware that auto-generates AI session summaries. Reduce documentation time, reclaim focus.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcfb" },
    { media: "(prefers-color-scheme: dark)",  color: "#141210" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Blocking script: apply saved theme BEFORE first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('psycholog-theme');
              if (t === 'dark') document.documentElement.classList.add('dark');
              // default is light — no class needed
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
