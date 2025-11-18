import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { farmAPI } from '../services/api';
import { MapPin, Plus } from 'lucide-react';

export default function Farms() {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const response = await farmAPI.getAll();
      setFarms(response.data);
    } catch (error) {
      console.error('Error loading farms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Fincas</h1>
        <Link
          to="/farms/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Finca</span>
        </Link>
      </div>

      {farms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes fincas registradas</h2>
          <p className="text-gray-600 mb-6">Comienza registrando tu primera finca para acceder a financiamiento</p>
          <Link
            to="/farms/new"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="h-5 w-5" />
            <span>Registrar Primera Finca</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <Link
              key={farm.id}
              to={`/farms/${farm.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{farm.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{farm.location}</p>
                </div>
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Superficie:</span>
                  <span className="font-medium">{farm.total_hectares} ha</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cultivo:</span>
                  <span className="font-medium capitalize">{farm.crop_type}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <span className="text-primary-600 text-sm font-medium">Ver detalles →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
