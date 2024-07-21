"use client";

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import './globals.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Provider store={store}>
      <html lang="en">
        <body>
          <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 p-4 text-center">
              <h1 className="text-3xl font-bold">Crypto Price Tracker</h1>
            </header>
            <main className="p-4">{children}</main>
            <footer className="bg-gray-800 p-4 text-center mt-8">
              <p>&copy; {new Date().getFullYear()} Crypto Price Tracker</p>
            </footer>
          </div>
        </body>
      </html>
    </Provider>
  );
};

export default Layout;
