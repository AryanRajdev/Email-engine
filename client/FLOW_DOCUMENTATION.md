# Client Flow Documentation - Email Campaign System

## Application Structure

### Routes

- `/dashboard` - Campaign overview
- `/campaigns/new` - Campaign creation wizard
- `/campaigns/:id` - Campaign details with tracking

### Component Hierarchy

```
App → Layout → Pages → Components
```

## Core Pages

### 1. Dashboard

**Purpose**: Display all campaigns with management options

**Flow:**

```
Mount → Fetch Campaigns → Display Grid → Handle Actions
```

**Key Features:**

- Campaign cards with status badges
- Recipient count and email status (sent/failed)
- View details and delete campaign buttons
- Real-time status updates

### 2. CreateCampaign (3-Step Wizard)

**Step 1 - Campaign Info:**

- Name, description, contact list
- Schedule type (now/later)
- Date picker for scheduled campaigns

**Step 2 - Steps & Recipients:**

- Add email/wait steps dynamically
- Email template editor
- Recipient list management
- Step validation

**Step 3 - Review & Launch:**

- Campaign summary
- Launch campaign via API
- Success/error feedback

**Flow:**

```
Step 1 → Validate → Step 2 → Validate → Step 3 → Launch → Dashboard
```

### 3. CampaignDetail

**Purpose**: Individual campaign tracking and metrics

**Features:**

- Campaign statistics (open rate, click rate)
- Recipient status tracking with timestamps
- Visual status indicators
- Real-time metrics updates

## Key Components

### CampaignInfoForm

- Form inputs for campaign basic info
- Real-time validation
- Conditional fields based on schedule type

### StepBuilder

- Dynamic step creation (email/wait)
- Template editor for email steps
- Duration input for wait steps
- Step reordering and deletion

### ReviewLaunch

- Campaign summary display
- Launch button with loading state
- Error handling and success feedback

## Data Flow

### Campaign Creation

```
Form Input → Validation → API Call → Success/Error → Navigation
```

### Campaign Management

```
Dashboard Load → API Fetch → State Update → UI Render → User Actions
```

### Email Tracking

```
Campaign Detail → Fetch Campaign → Display Metrics → Real-time Updates
```

## API Integration

### Endpoints Used

- `GET /api/campaigns` - Fetch all campaigns
- `POST /api/campaigns/launch` - Create and launch campaign
- `GET /api/campaigns/:id` - Get campaign details
- `DELETE /api/campaigns/:id` - Delete campaign

### State Management

- React useState for local state
- useEffect for API calls
- useNavigate for routing

## Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
