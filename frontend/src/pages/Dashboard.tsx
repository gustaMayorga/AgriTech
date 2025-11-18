import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { farmAPI, loanAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { TrendingUp, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalHectares: 0,
    activeLoans: 0,
    totalBorrowed: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user?.role === 'farmer') {
        const [farmsRes, loansRes] = await Promise.all([farmAPI.getAll(), loanAPI.getMyLoans()]);
        setFarms(farmsRes.data);
        setLoans(loansRes.data);

        setStats({
          totalFarms: farmsRes.data.length,
          totalHectares: farmsRes.data.reduce((acc: number, f: any) => acc + f.total_hectares, 0),
          activeLoans: loansRes.data.filter((l: any) => l.status === 'approved' || l.status === 'active').length,
          totalBorrowed: loansRes.data.reduce((acc: number, l: any) => acc + (l.status === 'approved' || l.status === 'active' ? l.amount : 0), 0),
        });
      } else if (user?.role === 'lender') {
        const loansRes = await loanAPI.getPending();
        setLoans(loansRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  if (user?.role === 'farmer') {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {user.name}</h1>
          <p className="text-gray-600 mt-2">Panel de control del productor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fincas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFarms}</p>
              </div>
              <MapPin className="h-12 w-12 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hectáreas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalHectares.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Préstamos Activos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeLoans}</p>
              </div>
              <AlertCircle className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Financiado</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBorrowed)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Mis Fincas</h2>
            </div>
            <div className="p-6">
              {farms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No tienes fincas registradas</p>
                  <Link
                    to="/farms/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Agregar Finca
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {farms.map((farm) => (
                    <Link
                      key={farm.id}
                      to={`/farms/${farm.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{farm.name}</h3>
                          <p className="text-sm text-gray-600">{farm.location}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {farm.total_hectares} ha - {farm.crop_type}
                          </p>
                        </div>
                        <span className="text-primary-600">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Solicitudes de Préstamo</h2>
            </div>
            <div className="p-6">
              {loans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No tienes solicitudes de préstamo</p>
                  <Link
                    to="/loans/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Solicitar Préstamo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.slice(0, 5).map((loan) => (
                    <div key={loan.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{formatCurrency(loan.amount)}</p>
                          <p className="text-sm text-gray-600">{loan.farm_name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                          loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lender Dashboard
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {user?.name}</h1>
        <p className="text-gray-600 mt-2">Panel de control del prestamista</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Solicitudes Pendientes</h2>
        </div>
        <div className="p-6">
          {loans.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay solicitudes pendientes</p>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <Link
                  key={loan.id}
                  to={`/loans/${loan.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{loan.farmer_name}</h3>
                      <p className="text-sm text-gray-600">{loan.farm_name} - {loan.crop_type}</p>
                      <p className="text-sm text-gray-500 mt-1">{loan.total_hectares} hectáreas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(loan.amount)}</p>
                      <p className="text-sm text-gray-600">Score: {loan.risk_score?.toFixed(0) || 'N/A'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
