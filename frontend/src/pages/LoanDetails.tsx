import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loanAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatDate, getRatingColor, getStatusColor } from '../utils/formatters';
import { CheckCircle, XCircle } from 'lucide-react';

export default function LoanDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const response = await loanAPI.getById(Number(id));
      setData(response.data);
    } catch (error) {
      console.error('Error loading loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('¿Confirmar aprobación de este préstamo?')) return;

    setActionLoading(true);
    try {
      await loanAPI.approve(Number(id));
      loadData();
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Error al aprobar el préstamo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('¿Confirmar rechazo de este préstamo?')) return;

    setActionLoading(true);
    try {
      await loanAPI.reject(Number(id));
      loadData();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      alert('Error al rechazar el préstamo');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!data) {
    return <div className="text-center py-8">Préstamo no encontrado</div>;
  }

  const { loan, riskAssessment } = data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Solicitud de Préstamo</h1>
        <p className="text-gray-600 mt-2">ID: #{loan.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Detalles del Préstamo</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Monto Solicitado</dt>
                <dd className="text-2xl font-bold text-gray-900">{formatCurrency(loan.amount)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Estado</dt>
                <dd>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Plazo</dt>
                <dd className="text-lg font-medium">{loan.duration_months} meses</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Tasa de Interés</dt>
                <dd className="text-lg font-medium">{loan.interest_rate}% anual</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-gray-600">Propósito</dt>
                <dd className="text-gray-900 mt-1">{loan.purpose}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Fecha de Solicitud</dt>
                <dd className="text-gray-900">{formatDate(loan.created_at)}</dd>
              </div>
              {loan.approved_at && (
                <div>
                  <dt className="text-sm text-gray-600">Fecha de Aprobación</dt>
                  <dd className="text-gray-900">{formatDate(loan.approved_at)}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Información de la Finca</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Nombre</dt>
                <dd className="text-lg font-medium">{loan.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Ubicación</dt>
                <dd className="text-lg">{loan.location}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Superficie</dt>
                <dd className="text-lg">{loan.total_hectares} hectáreas</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Cultivo</dt>
                <dd className="text-lg capitalize">{loan.crop_type}</dd>
              </div>
            </dl>
          </div>

          {user?.role === 'farmer' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Información del Productor</h2>
              <p className="text-gray-600">
                Tu solicitud ha sido recibida y está siendo evaluada. Te notificaremos cuando
                un prestamista la revise.
              </p>
            </div>
          )}

          {user?.role === 'lender' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Información del Productor</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-600">Nombre</dt>
                  <dd className="text-lg font-medium">{loan.farmer_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Email</dt>
                  <dd className="text-lg">{loan.farmer_email}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Evaluación de Riesgo</h2>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {riskAssessment.score.toFixed(0)}
              </div>
              <div>
                <span className={`px-4 py-2 rounded-full text-lg font-bold ${getRatingColor(riskAssessment.rating)}`}>
                  Rating: {riskAssessment.rating}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mb-6">
              {riskAssessment.recommendation}
            </p>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-700">Factores de Evaluación:</h3>
              {Object.entries(riskAssessment.factors).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">
                      {key.replace('Score', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-medium">{value.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {user?.role === 'lender' && loan.status === 'pending' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Acciones</h2>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Aprobar Préstamo</span>
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Rechazar Préstamo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
