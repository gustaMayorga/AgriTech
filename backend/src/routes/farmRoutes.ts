import { Router } from 'express';
import { createFarm, getFarms, getFarm, getFarmSatelliteData } from '../controllers/farmController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('farmer'), createFarm);
router.get('/', authenticate, getFarms);
router.get('/:id', authenticate, getFarm);
router.get('/:id/satellite', authenticate, getFarmSatelliteData);

export default router;
