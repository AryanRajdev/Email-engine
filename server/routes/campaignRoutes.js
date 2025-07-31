import express from 'express';
import { createCampaign, getAllCampaigns, getCampaignById, deleteCampaign } from '../controllers/campaignController.js';
import { launchCampaign } from '../controllers/campaignController.js';

const router = express.Router();

// POST /api/campaigns
router.post('/campaigns', createCampaign);

// GET /api/campaigns
router.get('/campaigns', getAllCampaigns);

// GET /api/campaigns/:id
router.get('/campaigns/:id', getCampaignById);

// DELETE /api/campaigns/:id
router.delete('/campaigns/:id', deleteCampaign);

// POST /api/campaigns/launch
router.post('/campaigns/launch', launchCampaign);

export default router; 