import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import CauseList from './pages/CauseList';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 text-sm font-medium">Today's Hearings</h3>
        <p className="text-3xl font-bold mt-2">5</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 text-sm font-medium">Pending Tasks</h3>
        <p className="text-3xl font-bold mt-2">12</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 text-sm font-medium">Active Cases</h3>
        <p className="text-3xl font-bold mt-2">48</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:id" element={<ClientDetails />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetails />} />
                <Route path="/cause-list" element={<CauseList />} />
                <Route path="/tasks" element={<Tasks />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
