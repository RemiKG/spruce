import { useEffect, type ReactNode } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStore } from './lib/store';
import { Snap } from './screens/Snap';
import { Read } from './screens/Read';
import { Direction } from './screens/Direction';
import { MoneyShot } from './screens/MoneyShot';
import { Steer } from './screens/Steer';
import { Engine } from './screens/Engine';
import { Checkout } from './screens/Checkout';
import { Settings } from './screens/Settings';
import { States } from './screens/States';

function Guard({ children, need }: { children: ReactNode; need: 'room' | 'design' }) {
  const { room, design } = useStore();
  if (need === 'design' && !design) return <Navigate to="/" replace />;
  if (need === 'room' && !room) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Shared() {
  const { token } = useParams();
  const { loadShare, design } = useStore();
  const nav = useNavigate();
  useEffect(() => { if (token) loadShare(token); }, [token]);
  useEffect(() => { if (design) nav('/money', { replace: true }); }, [design]);
  return <div className="toast"><span className="spin" /> opening shared design…</div>;
}

function Toast() {
  const { busy, error } = useStore();
  if (error) return <div className="toast err">⚠ {error}</div>;
  if (busy) return <div className="toast"><span className="spin" /> the little designer is working…</div>;
  return null;
}

export function App() {
  const { loadConfig } = useStore();
  useEffect(() => { loadConfig(); }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Snap />} />
        <Route path="/read" element={<Guard need="room"><Read /></Guard>} />
        <Route path="/direction" element={<Guard need="design"><Direction /></Guard>} />
        <Route path="/money" element={<Guard need="design"><MoneyShot /></Guard>} />
        <Route path="/steer" element={<Guard need="design"><Steer /></Guard>} />
        <Route path="/engine" element={<Guard need="design"><Engine /></Guard>} />
        <Route path="/checkout" element={<Guard need="design"><Checkout /></Guard>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/limits" element={<States />} />
        <Route path="/d/:token" element={<Shared />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}
