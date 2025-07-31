import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  type: { type: String, enum: ['send_email', 'wait'], required: true },
  template: { type: String },     // required for send_email
  duration: { type: String },     // required for wait
  status: { type: String, enum: ['Pending', 'Sent', 'Waiting', 'Completed'], default: 'Pending' },
  sentAt: { type: Date }
});

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  contactList: String,
  scheduleType: { type: String, enum: ['now', 'later'], required: true },
  scheduledAt: Date,
  recipients: Number,
  openRate: Number,
  clickRate: Number,
  status: { type: String, enum: ['Running', 'Completed', 'Scheduled'], default: 'Scheduled' },
  sentDate: Date,
  steps: [stepSchema]
}, { timestamps: true });

export default mongoose.model('Campaign', campaignSchema);

