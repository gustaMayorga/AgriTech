import db from '../config/database';
import satelliteService from './satelliteService';

interface RiskAssessment {
  score: number; // 0-100 (higher is better)
  rating: string; // A, B, C, D, E
  interestRate: number; // percentage
  factors: {
    satelliteScore: number;
    cropTypeScore: number;
    farmSizeScore: number;
    historyScore: number;
    trendScore: number;
  };
  recommendation: string;
}

/**
 * Risk Scoring Service - Calculates creditworthiness based on multiple factors
 */
class RiskScoringService {
  /**
   * Main risk scoring algorithm
   */
  async calculateRiskScore(farmId: number, loanAmount: number): Promise<RiskAssessment> {
    const farm = db.prepare('SELECT * FROM farms WHERE id = ?').get(farmId) as any;

    if (!farm) {
      throw new Error('Farm not found');
    }

    // Factor 1: Satellite Data Score (40% weight)
    const satelliteScore = await this.calculateSatelliteScore(farmId);

    // Factor 2: Crop Type Score (20% weight)
    const cropTypeScore = this.calculateCropTypeScore(farm.crop_type);

    // Factor 3: Farm Size Score (15% weight)
    const farmSizeScore = this.calculateFarmSizeScore(farm.total_hectares);

    // Factor 4: Credit History Score (15% weight)
    const historyScore = await this.calculateHistoryScore(farm.user_id);

    // Factor 5: NDVI Trend Score (10% weight)
    const trendScore = await this.calculateTrendScore(farmId);

    // Calculate weighted total score
    const totalScore = (
      satelliteScore * 0.4 +
      cropTypeScore * 0.2 +
      farmSizeScore * 0.15 +
      historyScore * 0.15 +
      trendScore * 0.1
    );

    // Determine rating and interest rate
    const rating = this.getRating(totalScore);
    const interestRate = this.getInterestRate(rating, loanAmount);
    const recommendation = this.getRecommendation(totalScore, rating);

    return {
      score: parseFloat(totalScore.toFixed(2)),
      rating,
      interestRate,
      factors: {
        satelliteScore: parseFloat(satelliteScore.toFixed(2)),
        cropTypeScore: parseFloat(cropTypeScore.toFixed(2)),
        farmSizeScore: parseFloat(farmSizeScore.toFixed(2)),
        historyScore: parseFloat(historyScore.toFixed(2)),
        trendScore: parseFloat(trendScore.toFixed(2))
      },
      recommendation
    };
  }

  /**
   * Calculates score based on satellite data (NDVI)
   */
  private async calculateSatelliteScore(farmId: number): Promise<number> {
    const avgNDVI = await satelliteService.getAverageNDVI(farmId, 6);

    // Convert NDVI (0-1) to score (0-100)
    // NDVI > 0.7 = 90-100
    // NDVI 0.5-0.7 = 70-90
    // NDVI 0.3-0.5 = 50-70
    // NDVI < 0.3 = 0-50

    if (avgNDVI >= 0.7) return 90 + (avgNDVI - 0.7) * 33.33;
    if (avgNDVI >= 0.5) return 70 + (avgNDVI - 0.5) * 100;
    if (avgNDVI >= 0.3) return 50 + (avgNDVI - 0.3) * 100;
    return avgNDVI * 166.67;
  }

  /**
   * Calculates score based on crop type (profitability and stability)
   */
  private calculateCropTypeScore(cropType: string): number {
    const scores: Record<string, number> = {
      soja: 90,      // High demand, stable market
      maiz: 85,      // Good demand, stable
      trigo: 80,     // Stable but lower margins
      girasol: 75,   // Moderate risk
      arroz: 85,     // Good demand
      default: 70    // Unknown crops
    };

    return scores[cropType.toLowerCase()] || scores.default;
  }

  /**
   * Calculates score based on farm size
   */
  private calculateFarmSizeScore(hectares: number): number {
    // Larger farms = more stable production
    if (hectares >= 500) return 95;
    if (hectares >= 200) return 85;
    if (hectares >= 100) return 75;
    if (hectares >= 50) return 65;
    return 50 + (hectares / 50) * 15;
  }

  /**
   * Calculates score based on credit history
   */
  private async calculateHistoryScore(userId: number): Promise<number> {
    const loans = db.prepare(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM loan_requests
      WHERE farmer_id = ?
    `).get(userId) as any;

    if (!loans.total) return 70; // Neutral score for new farmers

    const completionRate = loans.completed / loans.total;
    return 50 + (completionRate * 50); // 50-100 based on completion rate
  }

  /**
   * Calculates score based on NDVI trend
   */
  private async calculateTrendScore(farmId: number): Promise<number> {
    const trend = await satelliteService.getNDVITrend(farmId);

    if (trend.trend === 'increasing') return 90 + Math.min(trend.percentage, 10);
    if (trend.trend === 'stable') return 70;
    return 50 - Math.min(Math.abs(trend.percentage), 20);
  }

  /**
   * Converts score to rating
   */
  private getRating(score: number): string {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    if (score >= 40) return 'D';
    return 'E';
  }

  /**
   * Calculates interest rate based on rating and loan amount
   */
  private getInterestRate(rating: string, loanAmount: number): number {
    const baseRates: Record<string, number> = {
      A: 12,
      B: 15,
      C: 20,
      D: 25,
      E: 30
    };

    let rate = baseRates[rating] || 30;

    // Adjust for loan size (larger loans get slightly better rates)
    if (loanAmount > 100000) rate -= 1;
    if (loanAmount > 500000) rate -= 1;

    return parseFloat(rate.toFixed(2));
  }

  /**
   * Generates recommendation text
   */
  private getRecommendation(score: number, rating: string): string {
    if (rating === 'A') {
      return 'Excelente candidato. Bajo riesgo, aprobación recomendada.';
    }
    if (rating === 'B') {
      return 'Buen candidato. Riesgo moderado-bajo, aprobación recomendada.';
    }
    if (rating === 'C') {
      return 'Candidato aceptable. Riesgo moderado, evaluación adicional sugerida.';
    }
    if (rating === 'D') {
      return 'Candidato de alto riesgo. Requiere garantías adicionales.';
    }
    return 'Alto riesgo. No recomendado para aprobación.';
  }
}

export default new RiskScoringService();
