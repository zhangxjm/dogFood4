import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import UserList from './pages/UserList';
import DepartmentList from './pages/DepartmentList';
import CategoryList from './pages/CategoryList';
import OperationLogList from './pages/OperationLogList';

function App() {
  const { user } = useUserStore();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {user ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assets" element={<AssetList />} />
          <Route path="users" element={<UserList />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="logs" element={<OperationLogList />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App;
