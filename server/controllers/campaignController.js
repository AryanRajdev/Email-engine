import Campaign from '../models/Campaign.js';
import sgMail from '@sendgrid/mail'

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
    
    // Validate recipients array
    if (!campaignData.recipients || !Array.isArray(campaignData.recipients) || campaignData.recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required and must not be empty.' });
    }
    
    const emailResults = {
      successful: [],
      failed: [],
      total: 0
    };
    
    for (let i = 0; i < campaignData.steps.length; i++) {
      const step = campaignData.steps[i];
      if (step.type === 'send_email') {
        // Validate required fields
        if (!step.template) {
          step.status = 'Error';
          step.error = 'Template is required for send_email step';
          continue;
        }
        
        // Initialize recipients array if not exists
        if (!campaignData.recipients) {
          campaignData.recipients = [];
        }
        
        // Prepare email promises for parallel sending
        const emailPromises = campaignData.recipients.map(async (recipient) => {
          const recipientEmail = typeof recipient === 'object' ? recipient.email : recipient;
          
          const msg = {
            to: recipientEmail,
            from: "aryanraj24032002@gmail.com",
            subject: campaignData.name || 'Campaign Email',
            html: step.template,
          };
          
          return {
            recipient,
            recipientEmail,
            promise: sgMail.send(msg)
          };
        });
        
        // Send all emails in parallel using Promise.allSettled
        console.log(`📧 Sending ${emailPromises.length} emails in parallel for step ${i + 1}...`);
        const results = await Promise.allSettled(emailPromises.map(item => item.promise));
        
        // Process results and update recipient statuses
        results.forEach((result, index) => {
          const { recipient, recipientEmail } = emailPromises[index];
          const currentTime = new Date();
          
          if (result.status === 'fulfilled') {
            
            // Update recipient object with success status
            if (typeof recipient === 'object') {
              recipient.status = 'Sent';
              recipient.sentAt = currentTime;
            } else {
              // Convert string to object if needed
              const recipientIndex = campaignData.recipients.indexOf(recipient);
              campaignData.recipients[recipientIndex] = {
                email: recipient,
                status: 'Sent',
                sentAt: currentTime
              };
            }
            
            emailResults.successful.push({
              email: recipientEmail,
              status: 'Sent',
              sentAt: currentTime
            });
            
          } else {
            // Email failed to send
            const error = result.reason;
            console.error(`❌ Failed to send email to ${recipientEmail}:`, error);
            
            // Log detailed SendGrid error information
            if (error.response?.body) {
              console.error('SendGrid error details:', {
                message: error.message,
                response: error.response.body,
                statusCode: error.response.statusCode
              });
            }
            
            // Update recipient object with error status
            if (typeof recipient === 'object') {
              recipient.status = 'Error';
              recipient.error = error.message;
              recipient.sentAt = currentTime;
            } else {
              // Convert string to object if needed
              const recipientIndex = campaignData.recipients.indexOf(recipient);
              campaignData.recipients[recipientIndex] = {
                email: recipient,
                status: 'Error',
                error: error.message,
                sentAt: currentTime
              };
            }
            
            emailResults.failed.push({
              email: recipientEmail,
              status: 'Error',
              error: error.message,
              sentAt: currentTime
            });
          }
        });
        
        // Update step status based on results
        const hasErrors = emailResults.failed.length > 0;
        step.status = hasErrors ? 'Error' : 'Sent';
        step.sentAt = new Date();
        step.emailResults = {
          successful: emailResults.successful.length,
          failed: emailResults.failed.length,
          total: emailResults.successful.length + emailResults.failed.length
        };
        
        emailResults.total += step.emailResults.total;
      }
    }
    
    // Save campaign with updated step statuses and recipient statuses
    const campaign = new Campaign(campaignData);
    await campaign.save();
    
    // Prepare response with detailed breakdown
    const totalEmails = emailResults.successful.length + emailResults.failed.length;
    const successRate = totalEmails > 0 ? ((emailResults.successful.length / totalEmails) * 100).toFixed(1) : 0;
    
    if (emailResults.failed.length > 0) {
      return res.status(200).json({ 
        message: `Campaign launched with mixed results. ${emailResults.successful.length} emails sent successfully, ${emailResults.failed.length} failed.`,
        campaign,
        emailResults: {
          successful: emailResults.successful.length,
          failed: emailResults.failed.length,
          total: totalEmails,
          successRate: `${successRate}%`
        },
        failedEmails: emailResults.failed.map(f => ({ email: f.email, error: f.error }))
      });
    } else {
      return res.status(200).json({ 
        message: `Campaign launched successfully! All ${emailResults.successful.length} emails sent.`,
        campaign,
        emailResults: {
          successful: emailResults.successful.length,
          failed: 0,
          total: totalEmails,
          successRate: '100%'
        }
      });
    }
    
  } catch (err) {
    console.error('❌ Campaign launch failed:', err);
    res.status(500).json({ error: err.message });
  }
};
