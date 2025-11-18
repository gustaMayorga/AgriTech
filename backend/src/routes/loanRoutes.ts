import { Router } from 'express';
import {
  createLoanRequest,
  getMyLoans,
  getPendingLoans,
  approveLoan,
  rejectLoan,
  getLoanDetails
} from '../controllers/loanController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('farmer'), createLoanRequest);
router.get('/my-loans', authenticate, getMyLoans);
router.get('/pending', authenticate, authorize('lender'), getPendingLoans);
router.get('/:id', authenticate, getLoanDetails);
router.post('/:id/approve', authenticate, authorize('lender'), approveLoan);
router.post('/:id/reject', authenticate, authorize('lender'), rejectLoan);

export default router;
