import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { farmAPI, loanAPI } from '../services/api';

export default function NewLoan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [farms, setFarms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    farm_id: searchParams.get('farm') || '',
    amount: '',
    purpose: '',
    duration_months: '12',
  });

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const response = await farmAPI.getAll();
      setFarms(response.data);
    } catch (error) {
      console.error('Error loading farms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loanAPI.create({
        ...formData,
        farm_id: parseInt(formData.farm_id),
        amount: parseFloat(formData.amount),
        duration_months: parseInt(formData.duration_months),
      });
      navigate(`/loans/${response.data.loan.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (farms.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Necesitas registrar una finca primero
          </h2>
          <p className="text-gray-600 mb-4">
            Para solicitar un préstamo, debes tener al menos una finca registrada.
          </p>
          <button
            onClick={() => navigate('/farms/new')}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Registrar Finca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Solicitar Préstamo</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Finca
            </label>
            <select
              required
              value={formData.farm_id}
              onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleccione una finca</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} - {farm.total_hectares} ha ({farm.crop_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Solicitado (ARS)
            </label>
            <input
              type="number"
              step="1000"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="500000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propósito del Préstamo
            </label>
            <textarea
              required
              rows={4}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Compra de insumos para la siembra de soja..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plazo (meses)
            </label>
            <select
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="18">18 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              ¿Cómo funciona?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Analizaremos los datos satelitales de tu finca</li>
              <li>• Calcularemos tu score de riesgo crediticio</li>
              <li>• Recibirás una tasa de interés personalizada</li>
              <li>• Un prestamista revisará tu solicitud</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
