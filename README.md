# Email Campaign Builder

A multi-step email campaign builder application using SendGrid for email delivery.

## Features

- ✅ Multi-step campaign creation
- ✅ Email template builder
- ✅ Recipient management
- ✅ Campaign scheduling
- ✅ SendGrid integration
- ✅ Real-time email status tracking

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- SendGrid account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd email-campaign
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # In the server directory, create a .env file:
   cd ../server
   ```
   
   Create a `.env` file with:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   MONGO_URI=mongodb://localhost:27017/email-campaign
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start the server (from server directory)
   npm run dev
   
   # Start the client (from client directory)
   cd ../client
   npm run dev
   ```

## Usage

1. **Create a Campaign**
   - Fill in campaign information
   - Add recipients
   - Create email steps with templates
   - Review and launch

2. **Monitor Campaigns**
   - View campaign status
   - Track email delivery
   - Check recipient status

## API Endpoints

- `POST /api/campaigns` - Create a new campaign
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/launch` - Launch campaign and send emails

## Security

- ✅ Environment variables for sensitive data
- ✅ Input validation
- ✅ Error handling
- ✅ CORS configuration


### Common Issues

- **MongoDB Connection**: Ensure MongoDB is running
- **SendGrid API Key**: Verify the API key is correct and active
- **Sender Email**: Ensure the sender email is verified in SendGrid

## Development

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   └── App.jsx       # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── index.js         # Server entry point
└── README.md
```

### Technologies Used

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Email Service**: SendGrid
- **Database**: MongoDB with Mongoose

