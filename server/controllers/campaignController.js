import Campaign from '../models/Campaign.js';
import sgMail from '@sendgrid/mail';

// POST /api/campaigns
export const createCampaign = async (req, res) => {
  try {
    const { name, contactList, scheduleType, steps } = req.body;
    // Backend validation
    if (!name) return res.status(400).json({ error: 'Campaign name is required.' });
    if (!contactList) return res.status(400).json({ error: 'Contact list is required.' });
    if (!scheduleType || !['now', 'later'].includes(scheduleType)) {
      return res.status(400).json({ error: 'Schedule type must be "now" or "later".' });
    }
    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: 'At least one step is required.' });
    }
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.type || !['send_email', 'wait'].includes(step.type)) {
        return res.status(400).json({ error: `Step ${i + 1}: Type must be 'send_email' or 'wait'.` });
      }
      if (step.type === 'send_email' && !step.template) {
        return res.status(400).json({ error: `Step ${i + 1}: Template is required for send_email.` });
      }
      if (step.type === 'wait' && !step.duration) {
        return res.status(400).json({ error: `Step ${i + 1}: Duration is required for wait.` });
      }
    }
    // Create campaign with embedded steps
    const campaign = new Campaign(req.body);
    const savedCampaign = await campaign.save();
    res.status(201).json(savedCampaign);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// GET /api/campaigns
export const getAllCampaigns = async (req, res) => {
  try {
    // No need for populate since steps are embedded
    const campaigns = await Campaign.find({});
    res.status(200).json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/campaigns/:id
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/campaigns/:id
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.status(200).json({ message: 'Campaign ended (deleted) successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const launchCampaign = async (req, res) => {
  try {
    const campaignData = req.body;
    if (!campaignData || !Array.isArray(campaignData.steps) || campaignData.steps.length === 0) {
      return res.status(400).json({ error: 'Invalid campaign data or no steps provided.' });
    }
    let hasError = false;
    for (let i = 0; i < campaignData.steps.length; i++) {
      const step = campaignData.steps[i];
      if (step.type === 'send_email') {
        // Validate required fields
        if (!step.template || !campaignData.recipients || !Array.isArray(campaignData.recipients) || campaignData.recipients.length === 0) {
          step.status = 'Error';
          hasError = true;
          continue;
        }
        const msg = {
          to: campaignData.recipients, // array of emails
          from: process.env.SENDGRID_FROM_EMAIL, // must be verified sender
          subject: campaignData.name || 'Campaign Email',
          html: step.template,
        };
        try {
          await sgMail.sendMultiple(msg);
          step.status = 'Sent';
          step.sentAt = new Date();
        } catch (err) {
          step.status = 'Error';
          hasError = true;
        }
      }
    }
    // Save campaign with updated step statuses
    const campaign = new Campaign(campaignData);
    await campaign.save();
    if (hasError) {
      return res.status(400).json({ error: 'One or more emails failed to send.', campaign });
    }
    res.status(200).json({ message: 'Campaign launched and emails sent.', campaign });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
