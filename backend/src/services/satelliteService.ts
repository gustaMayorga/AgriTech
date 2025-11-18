import db from '../config/database';

interface SatelliteDataPoint {
  date: string;
  ndvi_value: number;
  health_status: string;
  cloud_coverage: number;
}

/**
 * Satellite Service - Simulates satellite data analysis for MVP
 * In production, this would integrate with NASA MODIS, Sentinel Hub, or similar APIs
 */
class SatelliteService {
  /**
   * Generates simulated NDVI (Normalized Difference Vegetation Index) data
   * NDVI ranges from -1 to 1, where:
   * - Values near 0: bare soil, sand, rock
   * - 0.2-0.4: sparse vegetation
   * - 0.4-0.6: moderate vegetation
   * - 0.6-0.9: dense healthy vegetation
   */
  private generateNDVI(cropType: string, seasonality: number): number {
    // Base NDVI by crop type
    const baseNDVI: Record<string, number> = {
      soja: 0.75,
      maiz: 0.72,
      trigo: 0.68,
      girasol: 0.70,
      arroz: 0.73,
      default: 0.65
    };

    const base = baseNDVI[cropType.toLowerCase()] || baseNDVI.default;

    // Add seasonality variation (-0.15 to +0.15)
    const seasonal = Math.sin(seasonality) * 0.15;

    // Add random variation for realism (-0.05 to +0.05)
    const random = (Math.random() - 0.5) * 0.1;

    const ndvi = base + seasonal + random;

    // Clamp between 0 and 1 for vegetation
    return Math.max(0, Math.min(1, ndvi));
  }

  /**
   * Determines crop health status based on NDVI value
   */
  private getHealthStatus(ndvi: number): string {
    if (ndvi >= 0.7) return 'Excelente';
    if (ndvi >= 0.5) return 'Bueno';
    if (ndvi >= 0.3) return 'Regular';
    return 'Pobre';
  }

  /**
   * Generates historical satellite data for a farm
   */
  async generateHistoricalData(farmId: number, months: number = 12): Promise<void> {
    const farm = db.prepare('SELECT * FROM farms WHERE id = ?').get(farmId) as any;

    if (!farm) {
      throw new Error('Farm not found');
    }

    const data: SatelliteDataPoint[] = [];
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);

      // Seasonality based on month (0 to 2π cycle)
      const seasonality = ((date.getMonth() + 1) / 12) * Math.PI * 2;

      const ndvi = this.generateNDVI(farm.crop_type, seasonality);
      const health = this.getHealthStatus(ndvi);
      const cloudCoverage = Math.random() * 30; // 0-30% cloud coverage

      data.push({
        date: date.toISOString().split('T')[0],
        ndvi_value: parseFloat(ndvi.toFixed(3)),
        health_status: health,
        cloud_coverage: parseFloat(cloudCoverage.toFixed(2))
      });
    }

    // Insert data into database
    const insert = db.prepare(`
      INSERT INTO satellite_data (farm_id, date, ndvi_value, health_status, cloud_coverage)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const point of data) {
      insert.run(farmId, point.date, point.ndvi_value, point.health_status, point.cloud_coverage);
    }
  }

  /**
   * Gets satellite data for a farm
   */
  async getSatelliteData(farmId: number, limit: number = 12): Promise<SatelliteDataPoint[]> {
    const data = db.prepare(`
      SELECT date, ndvi_value, health_status, cloud_coverage
      FROM satellite_data
      WHERE farm_id = ?
      ORDER BY date DESC
      LIMIT ?
    `).all(farmId, limit) as SatelliteDataPoint[];

    return data;
  }

  /**
   * Gets average NDVI for risk assessment
   */
  async getAverageNDVI(farmId: number, months: number = 6): Promise<number> {
    const result = db.prepare(`
      SELECT AVG(ndvi_value) as avg_ndvi
      FROM satellite_data
      WHERE farm_id = ?
      AND date >= date('now', '-' || ? || ' months')
    `).get(farmId, months) as any;

    return result?.avg_ndvi || 0;
  }

  /**
   * Gets NDVI trend (increasing or decreasing)
   */
  async getNDVITrend(farmId: number): Promise<{ trend: string; percentage: number }> {
    const recent = db.prepare(`
      SELECT AVG(ndvi_value) as avg
      FROM satellite_data
      WHERE farm_id = ?
      AND date >= date('now', '-3 months')
    `).get(farmId) as any;

    const older = db.prepare(`
      SELECT AVG(ndvi_value) as avg
      FROM satellite_data
      WHERE farm_id = ?
      AND date BETWEEN date('now', '-6 months') AND date('now', '-3 months')
    `).get(farmId) as any;

    if (!recent?.avg || !older?.avg) {
      return { trend: 'stable', percentage: 0 };
    }

    const change = ((recent.avg - older.avg) / older.avg) * 100;

    let trend = 'stable';
    if (change > 5) trend = 'increasing';
    if (change < -5) trend = 'decreasing';

    return {
      trend,
      percentage: parseFloat(change.toFixed(2))
    };
  }
}

export default new SatelliteService();
