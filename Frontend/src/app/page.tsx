'use client';

import { JSX } from 'react';
import NotificationPanel from '../components/NotificationPanel';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-950">
      <NotificationPanel userId="user-1" />
    </main>
  );
}