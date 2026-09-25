import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./tailwind.css";
import "./index.css";
import React from "react";
import { Toaster } from "react-hot-toast";

const THEME_SCRIPT = `
(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    var urlTheme = params.get('theme');
    var savedTheme = localStorage.getItem('index0_theme');
    var theme = urlTheme || savedTheme;
    if (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      theme = 'light';
    }
    if (theme === 'light') {
      document.documentElement.classList.add('theme-cream', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('theme-cream', 'light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch(e) {}
})();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const applyTheme = (theme: 'dark' | 'light') => {
      if (theme === 'light') {
        document.documentElement.classList.add('theme-cream', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('theme-cream', 'light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'INDEX0_SET_THEME' && (event.data.theme === 'light' || event.data.theme === 'dark')) {
        applyTheme(event.data.theme);
        localStorage.setItem('index0_theme', event.data.theme);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export const meta: MetaFunction = () => [
  { title: "INDEX0 AI — Sovereign AI Agent Canvas" },
  { name: "description", content: "INDEX0 AI: Sovereign Enterprise Autonomous Agent Canvas" },
];

export default function App() {
  return <Outlet />;
}
