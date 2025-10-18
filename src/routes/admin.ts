import express, { Response } from 'express';
import { FormModel } from '../models/Form';
import { SubmissionModel } from '../models/Submission';
import { AdminUserModel } from '../models/AdminUser';
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth';
import { apiLimiter, authLimiter } from '../middleware/rateLimiter';
import {
  validateFormCreation,
  validateFormUpdate,
  validateLogin,
  handleValidationErrors,
} from '../middleware/validation';

const router = express.Router();

// Authentication endpoints
router.post(
  '/auth/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;
      const user = await AdminUserModel.verifyPassword(email, password);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user.id, user.email);
      res.json({ token, email: user.email });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Form management endpoints
router.get('/forms', authenticateToken, apiLimiter, (req: AuthRequest, res: express.Response) => {
  try {
    const forms = FormModel.findAll();
    const formsWithStats = forms.map((form) => ({
      ...form,
      submission_count: SubmissionModel.countByFormId(form.id),
    }));
    res.json(formsWithStats);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

router.post(
  '/forms',
  authenticateToken,
  apiLimiter,
  validateFormCreation,
  handleValidationErrors,
  (req: AuthRequest, res: express.Response) => {
    try {
      const form = FormModel.create(req.body);
      res.status(201).json(form);
    } catch (error) {
      console.error('Error creating form:', error);
      res.status(500).json({ error: 'Failed to create form' });
    }
  }
);

router.get('/forms/:id', authenticateToken, apiLimiter, (req: AuthRequest, res: express.Response) => {
  try {
    const form = FormModel.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

router.put(
  '/forms/:id',
  authenticateToken,
  apiLimiter,
  validateFormUpdate,
  handleValidationErrors,
  (req: AuthRequest, res: express.Response) => {
    try {
      const updated = FormModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Form not found' });
      }
      const form = FormModel.findById(req.params.id);
      res.json(form);
    } catch (error) {
      console.error('Error updating form:', error);
      res.status(500).json({ error: 'Failed to update form' });
    }
  }
);

router.delete('/forms/:id', authenticateToken, apiLimiter, (req: AuthRequest, res: express.Response) => {
  try {
    const deleted = FormModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

router.post('/forms/:id/regenerate-key', authenticateToken, apiLimiter, (req: AuthRequest, res: express.Response) => {
  try {
    const form = FormModel.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    const newApiKey = FormModel.regenerateApiKey(req.params.id);
    res.json({ api_key: newApiKey });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
});

// Submission endpoints
router.get('/forms/:id/submissions', authenticateToken, apiLimiter, (req: AuthRequest, res: express.Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const submissions = SubmissionModel.findByFormId(req.params.id, limit, offset);
    const total = SubmissionModel.countByFormId(req.params.id);

    const submissionsWithParsedData = submissions.map((sub) => ({
      ...sub,
      data: JSON.parse(sub.data),
    }));

    res.json({
      submissions: submissionsWithParsedData,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

router.delete('/submissions/:id', authenticateToken, apiLimiter, (req: AuthRequest, res: express.Response) => {
  try {
    const deleted = SubmissionModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// Dashboard stats
router.get('/stats', authenticateToken, apiLimiter, (req: AuthRequest, res: express.Response) => {
  try {
    const forms = FormModel.findAll();
    const recentSubmissions = SubmissionModel.getRecentSubmissions(7);

    const stats = {
      total_forms: forms.length,
      active_forms: forms.filter((f) => f.active).length,
      total_submissions: forms.reduce(
        (sum, form) => sum + SubmissionModel.countByFormId(form.id),
        0
      ),
      recent_submissions: recentSubmissions.length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;