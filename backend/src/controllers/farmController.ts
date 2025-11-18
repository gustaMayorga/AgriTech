import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import db from '../config/database';
import satelliteService from '../services/satelliteService';

export const createFarm = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, location, latitude, longitude, total_hectares, crop_type } = req.body;

    if (!name || !location || !latitude || !longitude || !total_hectares || !crop_type) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = db.prepare(`
      INSERT INTO farms (user_id, name, location, latitude, longitude, total_hectares, crop_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, location, latitude, longitude, total_hectares, crop_type);

    const farmId = result.lastInsertRowid as number;

    // Generate historical satellite data
    await satelliteService.generateHistoricalData(farmId, 12);

    const farm = db.prepare('SELECT * FROM farms WHERE id = ?').get(farmId);

    res.status(201).json({
      message: 'Farm created successfully',
      farm
    });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFarms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const farms = db.prepare('SELECT * FROM farms WHERE user_id = ?').all(userId);

    res.json(farms);
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFarm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const farm = db.prepare('SELECT * FROM farms WHERE id = ? AND user_id = ?').get(id, userId);

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json(farm);
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFarmSatelliteData = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify farm belongs to user
    const farm = db.prepare('SELECT * FROM farms WHERE id = ? AND user_id = ?').get(id, userId);

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const data = await satelliteService.getSatelliteData(parseInt(id));
    const avgNDVI = await satelliteService.getAverageNDVI(parseInt(id));
    const trend = await satelliteService.getNDVITrend(parseInt(id));

    res.json({
      farm,
      satelliteData: data,
      statistics: {
        averageNDVI: avgNDVI,
        trend
      }
    });
  } catch (error) {
    console.error('Get satellite data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
