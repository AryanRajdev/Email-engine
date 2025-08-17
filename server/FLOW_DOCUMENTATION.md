# Server Flow Documentation - Email Campaign System

## Database Schema

### Campaign Model

```javascript
Campaign {
  name: String
  description: String
  contactList: String
  scheduleType: 'now' | 'later'
  scheduledAt: Date
  recipients: [RecipientSchema]
  openRate: Number
  clickRate: Number
  status: 'Running' | 'Completed' | 'Scheduled'
  steps: [StepSchema]
}

RecipientSchema {
  email: String
  status: 'Pending' | 'Sent' | 'Opened' | 'Clicked' | 'Error'
  sentAt: Date
  openedAt: Date
  clickedAt: Date
}

StepSchema {
  type: 'send_email' | 'wait'
  template: String (for send_email)
  duration: String (for wait)
  status: 'Pending' | 'Sent' | 'Waiting' | 'Completed'
}
```

## API Endpoints

### Campaign Management

- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Email Processing

- `POST /api/campaigns/launch` - Launch campaign and send emails

## Core Flow

### 1. Campaign Creation

```
Client → Validation → Save to MongoDB → Return Campaign
```

### 2. Campaign Launch (Email Sending)

```
Request → Process Steps → SendGrid API → Update Recipients → Save Results
```

**Process:**

1. Loop through campaign steps
2. For `send_email` steps:
   - Create email for each recipient
   - Send via SendGrid in parallel
   - Update recipient status (Sent/Error)
3. Save updated campaign to database

### 3. Email Tracking (SendGrid Webhooks)

```
SendGrid Event → Webhook → Update Recipient Status → Recalculate Rates
```

**Events:**

- Email opened → status: 'Opened', set `openedAt`
- Link clicked → status: 'Clicked', set `clickedAt`
- Email bounced → status: 'Error'

## Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Email Service**: SendGrid API
- **Architecture**: RESTful API with embedded documents
