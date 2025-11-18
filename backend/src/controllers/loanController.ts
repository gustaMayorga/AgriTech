import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import db from '../config/database';
import riskScoringService from '../services/riskScoringService';

export const createLoanRequest = async (req: AuthRequest, res: Response) => {
  try {
    const farmerId = req.user!.id;
    const { farm_id, amount, purpose, duration_months } = req.body;

    if (!farm_id || !amount || !purpose || !duration_months) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify farm belongs to farmer
    const farm = db.prepare('SELECT * FROM farms WHERE id = ? AND user_id = ?').get(farm_id, farmerId);

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Calculate risk score
    const riskAssessment = await riskScoringService.calculateRiskScore(farm_id, amount);

    // Create loan request
    const result = db.prepare(`
      INSERT INTO loan_requests (farmer_id, farm_id, amount, purpose, duration_months, risk_score, interest_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(farmerId, farm_id, amount, purpose, duration_months, riskAssessment.score, riskAssessment.interestRate);

    const loanId = result.lastInsertRowid;

    const loan = db.prepare('SELECT * FROM loan_requests WHERE id = ?').get(loanId);

    res.status(201).json({
      message: 'Loan request created successfully',
      loan,
      riskAssessment
    });
  } catch (error) {
    console.error('Create loan request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let loans;

    if (role === 'farmer') {
      loans = db.prepare(`
        SELECT lr.*, f.name as farm_name, f.crop_type
        FROM loan_requests lr
        JOIN farms f ON lr.farm_id = f.id
        WHERE lr.farmer_id = ?
        ORDER BY lr.created_at DESC
      `).all(userId);
    } else if (role === 'lender') {
      loans = db.prepare(`
        SELECT lr.*, f.name as farm_name, f.crop_type, u.name as farmer_name
        FROM loan_requests lr
        JOIN farms f ON lr.farm_id = f.id
        JOIN users u ON lr.farmer_id = u.id
        WHERE lr.lender_id = ? OR lr.lender_id IS NULL
        ORDER BY lr.created_at DESC
      `).all(userId);
    }

    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingLoans = async (req: AuthRequest, res: Response) => {
  try {
    const loans = db.prepare(`
      SELECT lr.*, f.name as farm_name, f.crop_type, f.total_hectares, u.name as farmer_name, u.email as farmer_email
      FROM loan_requests lr
      JOIN farms f ON lr.farm_id = f.id
      JOIN users u ON lr.farmer_id = u.id
      WHERE lr.status = 'pending'
      ORDER BY lr.created_at DESC
    `).all();

    res.json(loans);
  } catch (error) {
    console.error('Get pending loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveLoan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lenderId = req.user!.id;

    const loan = db.prepare('SELECT * FROM loan_requests WHERE id = ?').get(id) as any;

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Loan is not pending' });
    }

    db.prepare(`
      UPDATE loan_requests
      SET status = 'approved', lender_id = ?, approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(lenderId, id);

    const updatedLoan = db.prepare('SELECT * FROM loan_requests WHERE id = ?').get(id);

    res.json({
      message: 'Loan approved successfully',
      loan: updatedLoan
    });
  } catch (error) {
    console.error('Approve loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectLoan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lenderId = req.user!.id;

    const loan = db.prepare('SELECT * FROM loan_requests WHERE id = ?').get(id) as any;

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Loan is not pending' });
    }

    db.prepare(`
      UPDATE loan_requests
      SET status = 'rejected', lender_id = ?
      WHERE id = ?
    `).run(lenderId, id);

    const updatedLoan = db.prepare('SELECT * FROM loan_requests WHERE id = ?').get(id);

    res.json({
      message: 'Loan rejected',
      loan: updatedLoan
    });
  } catch (error) {
    console.error('Reject loan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLoanDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    const loan = db.prepare(`
      SELECT lr.*, f.*, u.name as farmer_name, u.email as farmer_email
      FROM loan_requests lr
      JOIN farms f ON lr.farm_id = f.id
      JOIN users u ON lr.farmer_id = u.id
      WHERE lr.id = ?
    `).get(id) as any;

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Authorization check
    if (role === 'farmer' && loan.farmer_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (role === 'lender' && loan.lender_id !== userId && loan.status !== 'pending') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get risk assessment
    const riskAssessment = await riskScoringService.calculateRiskScore(loan.farm_id, loan.amount);

    res.json({
      loan,
      riskAssessment
    });
  } catch (error) {
    console.error('Get loan details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
