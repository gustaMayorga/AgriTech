import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { farmAPI } from '../services/api';
import SatelliteChart from '../components/SatelliteChart';
import { MapPin, Leaf, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getHealthColor } from '../utils/formatters';

export default function FarmDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const response = await farmAPI.getSatelliteData(Number(id));
      setData(response.data);
    } catch (error) {
      console.error('Error loading farm data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!data) {
    return <div className="text-center py-8">Finca no encontrada</div>;
  }

  const { farm, satelliteData, statistics } = data;
  const latestData = satelliteData[0];

  return (
    <div>
      <div className="mb-6">
        <Link to="/farms" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Volver a Mis Fincas
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{farm.name}</h1>
        <p className="text-gray-600 mt-2">{farm.location}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Superficie</p>
              <p className="text-2xl font-bold">{farm.total_hectares} ha</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Cultivo:</span> {farm.crop_type}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">NDVI Promedio</p>
              <p className="text-2xl font-bold">{statistics.averageNDVI.toFixed(3)}</p>
            </div>
          </div>
          <p className={`text-sm font-medium ${getHealthColor(latestData.health_status)}`}>
            Estado: {latestData.health_status}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            {statistics.trend.trend === 'increasing' ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : statistics.trend.trend === 'decreasing' ? (
              <TrendingDown className="h-8 w-8 text-red-600" />
            ) : (
              <Minus className="h-8 w-8 text-gray-600" />
            )}
            <div>
              <p className="text-sm text-gray-600">Tendencia</p>
              <p className="text-2xl font-bold capitalize">{statistics.trend.trend}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {statistics.trend.percentage > 0 ? '+' : ''}{statistics.trend.percentage.toFixed(1)}% (6 meses)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Análisis Satelital (NDVI)</h2>
        <p className="text-sm text-gray-600 mb-4">
          El índice NDVI mide la salud de la vegetación. Valores más altos indican mejor salud del cultivo.
        </p>
        <SatelliteChart data={satelliteData} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Datos Históricos</h2>
          <Link
            to={`/loans/new?farm=${farm.id}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Solicitar Préstamo
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NDVI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nubes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {satelliteData.slice(0, 10).map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.date).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.ndvi_value.toFixed(3)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getHealthColor(item.health_status)}`}>
                    {item.health_status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.cloud_coverage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
