import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Sprout } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Sprout className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">AgroCredit</span>
              </Link>
              {user && (
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'farmer' && (
                    <>
                      <Link
                        to="/farms"
                        className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Mis Fincas
                      </Link>
                      <Link
                        to="/loans"
                        className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Préstamos
                      </Link>
                    </>
                  )}
                  {user.role === 'lender' && (
                    <Link
                      to="/pending-loans"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Solicitudes
                    </Link>
                  )}
                </div>
              )}
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
