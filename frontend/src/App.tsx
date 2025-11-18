import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import NewFarm from './pages/NewFarm';
import FarmDetails from './pages/FarmDetails';
import NewLoan from './pages/NewLoan';
import LoanDetails from './pages/LoanDetails';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Navigate to="/dashboard" />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/farms"
        element={
          <PrivateRoute>
            <Layout>
              <Farms />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/farms/new"
        element={
          <PrivateRoute>
            <Layout>
              <NewFarm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/farms/:id"
        element={
          <PrivateRoute>
            <Layout>
              <FarmDetails />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/loans/new"
        element={
          <PrivateRoute>
            <Layout>
              <NewLoan />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/loans/:id"
        element={
          <PrivateRoute>
            <Layout>
              <LoanDetails />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
