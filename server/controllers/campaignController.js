import dotenv from "dotenv";
import Campaign from "../models/Campaign.js";
import sgMail from "@sendgrid/mail";

// Load environment variables
dotenv.config();

// POST /api/campaigns
export const createCampaign = async (req, res) => {
  try {
    const { name, contactList, scheduleType, steps } = req.body;
    // Backend validation
    if (!name)
      return res.status(400).json({ error: "Campaign name is required." });
    if (!contactList)
      return res.status(400).json({ error: "Contact list is required." });
    if (!scheduleType || !["now", "later"].includes(scheduleType)) {
      return res
        .status(400)
        .json({ error: 'Schedule type must be "now" or "later".' });
    }
    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: "At least one step is required." });
    }
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.type || !["send_email", "wait"].includes(step.type)) {
        return res.status(400).json({
          error: `Step ${i + 1}: Type must be 'send_email' or 'wait'.`,
        });
      }
      if (step.type === "send_email" && !step.template) {
        return res.status(400).json({
          error: `Step ${i + 1}: Template is required for send_email.`,
        });
      }
      if (step.type === "wait" && !step.duration) {
        return res
          .status(400)
          .json({ error: `Step ${i + 1}: Duration is required for wait.` });
      }
    }
    // Create campaign with embedded steps
    const campaign = new Campaign(req.body);
    const savedCampaign = await campaign.save();
    res.status(201).json(savedCampaign);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
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
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
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
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.status(200).json({ message: "Campaign ended (deleted) successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const launchCampaign = async (req, res) => {
  try {
    const campaignData = req.body;

    // Validate steps
    if (
      !campaignData ||
      !Array.isArray(campaignData.steps) ||
      campaignData.steps.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid campaign data or no steps provided." });
    }

    // Validate recipients
    if (
      !campaignData.recipients ||
      !Array.isArray(campaignData.recipients) ||
      campaignData.recipients.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Recipients array is required and must not be empty." });
    }

    const emailResults = {
      successful: [],
      failed: [],
    };

    // Process each step
    for (let i = 0; i < campaignData.steps.length; i++) {
      const step = campaignData.steps[i];

      if (step.type === "send_email" && step.template) {
        const emailPromises = campaignData.recipients.map(async (recipient) => {
          const recipientEmail =
            typeof recipient === "object" ? recipient.email : recipient;

          const msg = {
            to: recipientEmail,
            from: "aryanraj24032002@gmail.com",
            subject: campaignData.name || "Campaign Email",
            html: step.template,
          };

          return {
            recipient,
            recipientEmail,
            promise: sgMail.send(msg),
          };
        });

        // Send all emails in parallel
        const results = await Promise.allSettled(
          emailPromises.map((item) => item.promise)
        );

        results.forEach((result, index) => {
          const { recipient, recipientEmail } = emailPromises[index];
          const currentTime = new Date();

          if (result.status === "fulfilled") {
            if (typeof recipient === "object") {
              recipient.status = "Sent";
              recipient.sentAt = currentTime;
            } else {
              campaignData.recipients[index] = {
                email: recipient,
                status: "Sent",
                sentAt: currentTime,
              };
            }
            emailResults.successful.push(recipientEmail);
          } else {
            const errorMessage = result.reason?.message || "Unknown error";
            if (typeof recipient === "object") {
              recipient.status = "Error";
              recipient.error = errorMessage;
              recipient.sentAt = currentTime;
            } else {
              campaignData.recipients[index] = {
                email: recipient,
                status: "Error",
                error: errorMessage,
                sentAt: currentTime,
              };
            }
            emailResults.failed.push(recipientEmail);
          }
        });

        // Update step summary
        step.status = emailResults.failed.length > 0 ? "Error" : "Sent";
        step.sentAt = new Date();
        step.emailResults = {
          successful: emailResults.successful.length,
          failed: emailResults.failed.length,
          total: emailResults.successful.length + emailResults.failed.length,
        };
      }
    }

    // Save updated campaign
    const campaign = new Campaign(campaignData);
    await campaign.save();

    const total = emailResults.successful.length + emailResults.failed.length;
    const successRate =
      total > 0
        ? ((emailResults.successful.length / total) * 100).toFixed(1)
        : "0.0";

    return res.status(200).json({
      message:
        emailResults.failed.length > 0
          ? `Campaign launched with some failures.`
          : `Campaign launched successfully.`,
      emailResults: {
        successful: emailResults.successful.length,
        failed: emailResults.failed.length,
        total,
        successRate: `${successRate}%`,
      },
      campaign,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Campaign launch failed.", details: err.message });
  }
};
