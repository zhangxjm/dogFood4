import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Readers from './pages/Readers';
import Borrows from './pages/Borrows';
import Reservations from './pages/Reservations';
import Stats from './pages/Stats';
import Admin from './pages/Admin';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/readers" element={<Readers />} />
        <Route path="/borrows" element={<Borrows />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}

export default App;
