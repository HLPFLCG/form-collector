import express from 'express';
import { FormModel } from '../models/Form';
import { SubmissionModel } from '../models/Submission';
import emailService from '../services/emailService';
import { submissionLimiter } from '../middleware/rateLimiter';
import { validateSubmission, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Handle form submission
router.post(
  '/submit/:apiKey',
  submissionLimiter,
  validateSubmission,
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { apiKey } = req.params;
      const formData = req.body;

      // Find form by API key
      const form = FormModel.findByApiKey(apiKey);
      if (!form) {
        return res.status(404).json({ error: 'Form not found or inactive' });
      }

      // Extract metadata
      const forwardedFor = req.headers['x-forwarded-for'];
      const ip_address = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : forwardedFor?.[0]) || req.ip;
      const user_agent = req.headers['user-agent'];
      const referrer = (req.headers['referer'] || req.headers['referrer']) as string | undefined;

      // Create submission
      const submission = SubmissionModel.create({
        form_id: form.id,
        data: formData,
        ip_address,
        user_agent,
        referrer,
      });

      // Send email notification (async, don't wait)
      emailService
        .sendSubmissionNotification(form.email, form.name, formData, submission.id)
        .catch((error) => {
          console.error('Failed to send email notification:', error);
        });

      // Handle response based on request type
      const acceptsJson = req.headers['accept']?.includes('application/json');
      
      if (acceptsJson) {
        // API response
        return res.status(200).json({
          success: true,
          message: form.success_message,
          submission_id: submission.id,
        });
      } else {
        // Form submission response
        if (form.redirect_url) {
          return res.redirect(303, form.redirect_url);
        } else {
          return res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Submission Successful</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .container {
                  background: white;
                  padding: 40px;
                  border-radius: 12px;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                  text-align: center;
                  max-width: 500px;
                }
                .checkmark {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  display: block;
                  stroke-width: 2;
                  stroke: #4CAF50;
                  stroke-miterlimit: 10;
                  margin: 0 auto 20px;
                  box-shadow: inset 0px 0px 0px #4CAF50;
                  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                }
                .checkmark__circle {
                  stroke-dasharray: 166;
                  stroke-dashoffset: 166;
                  stroke-width: 2;
                  stroke-miterlimit: 10;
                  stroke: #4CAF50;
                  fill: none;
                  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                .checkmark__check {
                  transform-origin: 50% 50%;
                  stroke-dasharray: 48;
                  stroke-dashoffset: 48;
                  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                }
                @keyframes stroke {
                  100% { stroke-dashoffset: 0; }
                }
                @keyframes scale {
                  0%, 100% { transform: none; }
                  50% { transform: scale3d(1.1, 1.1, 1); }
                }
                @keyframes fill {
                  100% { box-shadow: inset 0px 0px 0px 30px #4CAF50; }
                }
                h1 {
                  color: #333;
                  margin: 0 0 10px 0;
                  font-size: 28px;
                }
                p {
                  color: #666;
                  margin: 0 0 20px 0;
                  font-size: 16px;
                }
                .back-link {
                  display: inline-block;
                  padding: 12px 24px;
                  background: #667eea;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  transition: background 0.3s;
                }
                .back-link:hover {
                  background: #5568d3;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                  <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
                <h1>Success!</h1>
                <p>${form.success_message}</p>
                ${referrer ? `<a href="${referrer}" class="back-link">Go Back</a>` : ''}
              </div>
            </body>
            </html>
          `);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      return res.status(500).json({ error: 'Failed to process submission' });
    }
  }
);

export default router;