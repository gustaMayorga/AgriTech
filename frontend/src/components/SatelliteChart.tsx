import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SatelliteChartProps {
  data: any[];
}

export default function SatelliteChart({ data }: SatelliteChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }),
    NDVI: item.ndvi_value,
  })).reverse();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 1]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="NDVI" stroke="#16a34a" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
