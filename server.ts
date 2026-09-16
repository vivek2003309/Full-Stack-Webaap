import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './server/db.js';
import { STAGE_NAMES, StageNumber } from './src/types.js';

// Background webhook dispatcher
async function dispatchGoogleSheetsWebhook(webhookUrl: string, payload: any) {
  if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.trim().startsWith('http')) {
    return { success: false, error: 'No valid webhook URL configured' };
  }

  try {
    console.log(`[Webhook] Sending payload to ${webhookUrl}`, payload);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TICE-Overseas-Portal/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const success = response.ok;
    console.log(`[Webhook] Response status: ${response.status}`);
    
    // Update settings with last status
    dbManager.updateSettings({
      lastWebhookStatus: {
        timestamp: new Date().toISOString(),
        success,
        responseCode: response.status
      }
    });

    return { success, status: response.status };
  } catch (err: any) {
    console.error(`[Webhook] Delivery failed:`, err.message);
    dbManager.updateSettings({
      lastWebhookStatus: {
        timestamp: new Date().toISOString(),
        success: false,
        error: err.message
      }
    });
    return { success: false, error: err.message };
  }
}

/**
 * Strict Candidate Privacy Masking Functions
 * Enforces masking across public-facing views and search results.
 * Only authenticated users in Admin Dashboard receive raw, unmasked data.
 */

// Example: P1234567 -> P•••••67
// Example: R9876543 -> R•••••43
export function maskPassportNumber(passport: string): string {
  if (!passport) return '';
  const clean = passport.trim().toUpperCase();
  if (clean.length <= 3) {
    return clean[0] + '••••';
  }
  const first = clean[0];
  const lastTwo = clean.slice(-2);
  const maskedMiddle = '•'.repeat(clean.length - 3);
  return `${first}${maskedMiddle}${lastTwo}`;
}

// Example: Rajesh Kumar -> R***** K****
export function maskCandidateName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 1) return word;
      return word[0] + '*'.repeat(word.length - 1);
    })
    .join(' ');
}

// Example: +91 98765 43210 -> +91 •••••••210
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return '••••';
  const lastThree = trimmed.slice(-3);
  return '••••••••' + lastThree;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // PUBLIC REST API ENDPOINTS
  // ==========================================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Trehan International Consultants & Engineers (TICE) API',
      timestamp: new Date().toISOString(),
      meaRegistration: 'B-0613/DEL/COM/1000+/5/5374/1999'
    });
  });

  // GET /api/jobs: Fetch all active jobs with optional query params ?country= and ?trade=
  app.get('/api/jobs', (req: Request, res: Response) => {
    try {
      const { country, trade } = req.query;
      const jobs = dbManager.getJobs({
        country: typeof country === 'string' ? country : undefined,
        trade: typeof trade === 'string' ? trade : undefined,
        status: 'Active'
      });
      res.json(jobs);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve jobs', details: err.message });
    }
  });

  // GET /api/tracker/:passportNumber: Look up candidate record by uppercase passport number or application token
  app.get('/api/tracker/:passportNumber', (req: Request, res: Response) => {
    try {
      const passportNumber = req.params.passportNumber;
      if (!passportNumber) {
        return res.status(400).json({ error: 'Passport number or token is required' });
      }

      const result = dbManager.getApplicationByPassport(passportNumber);
      if (!result) {
        return res.status(404).json({
          error: 'Application not found',
          message: `No candidate record exists for passport/token: ${passportNumber.toUpperCase()}. Please check your number or contact the TICE helpdesk.`
        });
      }

      // STRICT PRIVACY: NEVER return raw passportNumber or unmasked candidate name in public JSON response
      res.json({
        candidate: {
          id: result.application.id,
          fullName: maskCandidateName(result.application.fullName),
          phone: maskPhoneNumber(result.application.phone),
          passportNumber: maskPassportNumber(result.application.passportNumber),
          trade: result.application.trade,
          targetCountry: result.application.targetCountry,
          interviewCity: result.application.interviewCity,
          currentStage: result.application.currentStage,
          currentStageName: STAGE_NAMES[result.application.currentStage as StageNumber],
          remarks: result.application.remarks,
          createdAt: result.application.createdAt,
          updatedAt: result.application.updatedAt
        },
        timeline: result.timeline
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Internal tracker error', details: err.message });
    }
  });

  // GET /api/drives: Return upcoming walk-in recruitment drive events
  app.get('/api/drives', (req: Request, res: Response) => {
    try {
      const drives = dbManager.getDrives();
      res.json(drives);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch interview drives', details: err.message });
    }
  });

  // POST /api/applications: Create a new application/walk-in drive registration
  app.post('/api/applications', async (req: Request, res: Response) => {
    try {
      const { fullName, phone, passportNumber, trade, targetCountry, interviewCity, remarks } = req.body;

      if (!fullName || !phone || !passportNumber || !trade || !targetCountry) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['fullName', 'phone', 'passportNumber', 'trade', 'targetCountry']
        });
      }

      const application = dbManager.createApplication({
        fullName,
        phone,
        passportNumber,
        trade,
        targetCountry,
        interviewCity: interviewCity || 'Delhi',
        remarks
      });

      // Background webhook trigger
      const settings = dbManager.getSettings();
      if (settings.googleSheetsWebhookUrl) {
        const webhookPayload = {
          token: application.id,
          fullName: application.fullName,
          phone: application.phone,
          passportNumber: application.passportNumber,
          trade: application.trade,
          targetCountry: application.targetCountry,
          currentStage: application.currentStage,
          stageName: STAGE_NAMES[application.currentStage as StageNumber],
          interviewCity: application.interviewCity,
          submittedAt: application.createdAt
        };

        // Asynchronous non-blocking dispatch
        dispatchGoogleSheetsWebhook(settings.googleSheetsWebhookUrl, webhookPayload).catch(err => {
          console.error('[Async Webhook Error]', err);
        });
      }

      res.status(201).json({
        success: true,
        message: 'Application registered successfully with TICE',
        application: {
          id: application.id,
          fullName: maskCandidateName(application.fullName),
          passportNumber: maskPassportNumber(application.passportNumber),
          currentStage: application.currentStage,
          currentStageName: STAGE_NAMES[application.currentStage as StageNumber],
          createdAt: application.createdAt
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to submit application', details: err.message });
    }
  });

  // ==========================================
  // LEAD CAPTURE: ENQUIRIES & WORKFORCE QUOTA
  // ==========================================
  // POST /api/enquiries: Public lead capture for General Contact and Employer Workforce Quota
  app.post('/api/enquiries', (req: Request, res: Response) => {
    try {
      const {
        type,
        fullName,
        contactPerson,
        companyName,
        phone,
        email,
        locationOrCountry,
        city,
        country,
        tradesOrSubject,
        enquiryType,
        requiredTrades,
        headcount,
        message
      } = req.body;

      const submissionType = type === "Workforce Quota Request" ? "Workforce Quota Request" : "Contact Enquiry";
      const resolvedName = (fullName || contactPerson || '').trim();
      const resolvedPhone = (phone || '').trim();
      const resolvedLocation = (locationOrCountry || country || city || '').trim();
      const resolvedTrades = (tradesOrSubject || enquiryType || (Array.isArray(requiredTrades) ? requiredTrades.join(', ') : requiredTrades) || '').trim();
      const resolvedCompany = companyName ? companyName.trim() : 'N/A';

      if (!resolvedName || !resolvedPhone) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Full Name and Phone Number are required.'
        });
      }

      if (submissionType === "Contact Enquiry" && !resolvedLocation) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'City/Location is required for contact enquiries.'
        });
      }

      if (submissionType === "Workforce Quota Request" && (!companyName || !companyName.trim())) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Company Name is required for workforce quota requests.'
        });
      }

      const enquiry = dbManager.createEnquiry({
        type: submissionType,
        fullName: resolvedName,
        companyName: resolvedCompany,
        phone: resolvedPhone,
        email: email ? email.trim() : undefined,
        locationOrCountry: resolvedLocation || 'India',
        tradesOrSubject: resolvedTrades || (submissionType === "Contact Enquiry" ? "General Query" : "Manpower Quota"),
        headcount: headcount ? Number(headcount) : undefined,
        message: message ? message.trim() : ''
      });

      // Dual Sync to Google Sheets (Webhook Dispatch)
      const settings = dbManager.getSettings();
      if (settings.googleSheetsWebhookUrl) {
        const webhookPayload = {
          submissionType: enquiry.type,
          fullName: enquiry.fullName,
          companyName: enquiry.companyName || "N/A",
          phone: enquiry.phone,
          email: enquiry.email || "N/A",
          countryOrLocation: enquiry.locationOrCountry || "N/A",
          tradesOrSubject: enquiry.tradesOrSubject || "N/A",
          headcount: enquiry.headcount !== undefined ? enquiry.headcount : "N/A",
          message: enquiry.message || "N/A",
          submittedAt: enquiry.createdAt
        };

        dispatchGoogleSheetsWebhook(settings.googleSheetsWebhookUrl, webhookPayload).catch(err => {
          console.error('[Async Enquiries Webhook Error]', err);
        });
      }

      const successMessage = submissionType === "Contact Enquiry"
        ? "Enquiry submitted successfully! Our Janakpuri desk will contact you shortly."
        : "Workforce quota request received successfully! Our overseas project director will contact you within 4 hours.";

      res.status(201).json({
        success: true,
        message: successMessage,
        enquiry
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to submit enquiry', details: err.message });
    }
  });

  // ==========================================
  // ADMIN AUTHENTICATION MIDDLEWARE
  // ==========================================
  const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    const adminKey = req.headers['x-admin-key'] as string;
    const settings = dbManager.getSettings();

    if (!adminKey || adminKey !== settings.adminPasscode) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing x-admin-key header passcode'
      });
    }
    next();
  };

  // POST /api/admin/verify-passcode: Quick passcode check for admin UI login
  app.post('/api/admin/verify-passcode', (req: Request, res: Response) => {
    const { passcode } = req.body;
    const settings = dbManager.getSettings();
    if (passcode === settings.adminPasscode) {
      return res.json({ success: true, authorized: true });
    }
    return res.status(401).json({ success: false, message: 'Invalid Admin Passcode' });
  });

  // ==========================================
  // ADMIN PROTECTED ENDPOINTS
  // ==========================================

  // GET /api/admin/candidates: Fetch all candidates with pagination & search
  app.get('/api/admin/candidates', verifyAdmin, (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const stage = req.query.stage ? parseInt(req.query.stage as string, 10) : undefined;

      const result = dbManager.getApplications({ page, limit, search, stage });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch candidate list', details: err.message });
    }
  });

  // POST /api/admin/candidates: Publish / register new candidate for passport & visa application tracker
  app.post('/api/admin/candidates', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { fullName, phone, passportNumber, trade, targetCountry, interviewCity, currentStage, remarks, customToken } = req.body;

      if (!fullName || !phone || !passportNumber || !trade || !targetCountry) {
        return res.status(400).json({
          error: 'Missing required candidate fields',
          required: ['fullName', 'phone', 'passportNumber', 'trade', 'targetCountry']
        });
      }

      const stageNumber = currentStage ? Number(currentStage) : 1;
      if (stageNumber < 1 || stageNumber > 7) {
        return res.status(400).json({
          error: 'Invalid currentStage',
          message: 'currentStage must be between 1 and 7'
        });
      }

      const newCandidate = dbManager.createApplication({
        fullName,
        phone,
        passportNumber,
        trade,
        targetCountry,
        interviewCity: interviewCity || 'Delhi',
        currentStage: stageNumber as StageNumber,
        remarks,
        id: customToken
      });

      // Optional async webhook dispatch if configured
      const settings = dbManager.getSettings();
      if (settings.googleSheetsWebhookUrl) {
        const webhookPayload = {
          token: newCandidate.id,
          fullName: newCandidate.fullName,
          phone: newCandidate.phone,
          passportNumber: newCandidate.passportNumber,
          trade: newCandidate.trade,
          targetCountry: newCandidate.targetCountry,
          currentStage: newCandidate.currentStage,
          stageName: STAGE_NAMES[newCandidate.currentStage as StageNumber],
          interviewCity: newCandidate.interviewCity,
          submittedAt: newCandidate.createdAt,
          source: 'Admin Portal Published'
        };
        dispatchGoogleSheetsWebhook(settings.googleSheetsWebhookUrl, webhookPayload).catch(err => {
          console.error('[Async Admin Webhook Error]', err);
        });
      }

      res.status(201).json({
        success: true,
        message: 'Candidate published successfully to tracker database',
        candidate: newCandidate
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to publish new candidate', details: err.message });
    }
  });

  // DELETE /api/admin/candidates/:id: Delete candidate from tracker
  app.delete('/api/admin/candidates/:id', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = dbManager.deleteApplication(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      res.json({ success: true, message: 'Candidate deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete candidate', details: err.message });
    }
  });

  // PATCH /api/admin/candidates/:id/status: Update currentStage and remarks
  app.patch('/api/admin/candidates/:id/status', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { currentStage, remarks } = req.body;

      if (!currentStage || currentStage < 1 || currentStage > 7) {
        return res.status(400).json({
          error: 'Invalid currentStage',
          message: 'currentStage must be an integer between 1 and 7'
        });
      }

      const updated = dbManager.updateApplicationStatus(id, currentStage as StageNumber, remarks);
      if (!updated) {
        return res.status(404).json({ error: 'Candidate application not found' });
      }

      // Dispatch webhook update if configured
      const settings = dbManager.getSettings();
      if (settings.googleSheetsWebhookUrl) {
        const webhookPayload = {
          eventType: 'STATUS_UPDATED',
          token: updated.id,
          fullName: updated.fullName,
          phone: updated.phone,
          passportNumber: updated.passportNumber,
          trade: updated.trade,
          targetCountry: updated.targetCountry,
          currentStage: updated.currentStage,
          stageName: STAGE_NAMES[updated.currentStage as StageNumber],
          interviewCity: updated.interviewCity,
          remarks: updated.remarks,
          updatedAt: updated.updatedAt
        };
        dispatchGoogleSheetsWebhook(settings.googleSheetsWebhookUrl, webhookPayload).catch(err => {
          console.error('[Async Status Webhook Error]', err);
        });
      }

      res.json({
        success: true,
        message: 'Status updated successfully',
        candidate: updated
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update candidate status', details: err.message });
    }
  });

  // GET /api/admin/jobs: Get all jobs (active and closed)
  app.get('/api/admin/jobs', verifyAdmin, (req: Request, res: Response) => {
    try {
      const jobs = dbManager.getAllJobsAdmin();
      res.json(jobs);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve all jobs', details: err.message });
    }
  });

  // POST /api/admin/jobs: Add a new overseas job vacancy
  app.post('/api/admin/jobs', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { title, country, flagEmoji, vacanciesCount, salaryText, perks, category, status, description, requirements, workLocation } = req.body;

      if (!title || !country || !vacanciesCount || !salaryText) {
        return res.status(400).json({
          error: 'Missing required job parameters',
          required: ['title', 'country', 'vacanciesCount', 'salaryText']
        });
      }

      const newJob = dbManager.createJob({
        title,
        country,
        flagEmoji: flagEmoji || '🌍',
        vacanciesCount: Number(vacanciesCount),
        salaryText,
        perks: Array.isArray(perks) ? perks : ['Free Food', 'Accommodation', 'Medical Insurance'],
        category: category || 'Technical',
        status: status || 'Active',
        description,
        requirements,
        workLocation
      });

      res.status(201).json({
        success: true,
        message: 'Overseas job vacancy published',
        job: newJob
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create job', details: err.message });
    }
  });

  // PUT /api/admin/jobs/:id: Edit job details or mark status as "Active"/"Closed"
  app.put('/api/admin/jobs/:id', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = dbManager.updateJob(id, req.body);

      if (!updated) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({
        success: true,
        message: 'Job details updated',
        job: updated
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update job', details: err.message });
    }
  });

  // DELETE /api/admin/jobs/:id: Remove job listing
  app.delete('/api/admin/jobs/:id', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = dbManager.deleteJob(id);

      if (!success) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({
        success: true,
        message: `Job ${id} deleted successfully`
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete job', details: err.message });
    }
  });

  // GET /api/admin/settings: Get current settings (including webhook URL)
  app.get('/api/admin/settings', verifyAdmin, (req: Request, res: Response) => {
    try {
      const settings = dbManager.getSettings();
      // Mask admin passcode partially for security in response
      res.json({
        ...settings,
        adminPasscodeMasked: '••••••••'
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
    }
  });

  // POST /api/admin/settings: Update settings (webhook URL, security passcode)
  app.post('/api/admin/settings', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { googleSheetsWebhookUrl, adminPasscode } = req.body;
      const updates: any = {};

      if (googleSheetsWebhookUrl !== undefined) {
        updates.googleSheetsWebhookUrl = googleSheetsWebhookUrl.trim();
      }

      if (adminPasscode && adminPasscode.trim().length >= 4) {
        updates.adminPasscode = adminPasscode.trim();
      }

      const updated = dbManager.updateSettings(updates);
      res.json({
        success: true,
        message: 'Settings updated successfully',
        settings: {
          id: updated.id,
          googleSheetsWebhookUrl: updated.googleSheetsWebhookUrl,
          lastWebhookStatus: updated.lastWebhookStatus
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update settings', details: err.message });
    }
  });

  // POST /api/admin/test-webhook: Dispatch a test dummy payload to verify Google Sheets integration
  app.post('/api/admin/test-webhook', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const settings = dbManager.getSettings();
      const targetUrl = req.body.url || settings.googleSheetsWebhookUrl;

      if (!targetUrl || !targetUrl.trim().startsWith('http')) {
        return res.status(400).json({
          success: false,
          error: 'No valid webhook URL found. Please provide an active Google Sheets Apps Script or Webhook URL.'
        });
      }

      const testPayload = {
        event: 'TEST_DISPATCH_TICE',
        token: 'TRH-TEST-9999',
        fullName: 'Test Candidate (Trehan Verification)',
        phone: '+91 99999 88888',
        passportNumber: 'T9999999',
        trade: '6G Pipe Welder',
        targetCountry: 'Oman',
        currentStage: 1,
        stageName: 'Application Review',
        interviewCity: 'Delhi',
        submittedAt: new Date().toISOString(),
        notes: 'Verification test ping dispatched from TICE Admin Portal.'
      };

      const result = await dispatchGoogleSheetsWebhook(targetUrl, testPayload);

      res.json({
        success: result.success,
        targetUrl,
        payloadSent: testPayload,
        result
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to dispatch test webhook', details: err.message });
    }
  });

  // ==========================================
  // ADMIN ENQUIRIES & WORKFORCE QUOTA MANAGEMENT
  // ==========================================
  // GET /api/admin/enquiries: Fetch leads with optional type & status filters
  app.get('/api/admin/enquiries', verifyAdmin, (req: Request, res: Response) => {
    try {
      const type = req.query.type as string;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const enquiries = dbManager.getEnquiries({ type, status, search });
      res.json({
        enquiries,
        total: enquiries.length
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch enquiries', details: err.message });
    }
  });

  // PATCH /api/admin/enquiries/:id/status: Update lead status (New -> Contacted -> Closed)
  app.patch('/api/admin/enquiries/:id/status', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['New', 'Contacted', 'Closed'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: 'Status must be one of: "New", "Contacted", "Closed"'
        });
      }

      const updated = dbManager.updateEnquiryStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Enquiry not found' });
      }

      res.json({
        success: true,
        message: `Enquiry ${id} status updated to ${status}`,
        enquiry: updated
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update enquiry status', details: err.message });
    }
  });

  // DELETE /api/admin/enquiries/:id: Remove enquiry record
  app.delete('/api/admin/enquiries/:id', verifyAdmin, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = dbManager.deleteEnquiry(id);

      if (!success) {
        return res.status(404).json({ error: 'Enquiry not found' });
      }

      res.json({
        success: true,
        message: `Enquiry ${id} deleted successfully`
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete enquiry', details: err.message });
    }
  });

  // Serve static assets from public folder
  app.use(express.static(path.join(process.cwd(), 'public')));

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TICE Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[TICE Server Fatal Error]', err);
  process.exit(1);
});
