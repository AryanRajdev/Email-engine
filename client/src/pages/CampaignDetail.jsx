import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Users, Mail, Clock, CheckCircle, XCircle } from "lucide-react";

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://email-engine-backend.onrender.com/api/campaigns/${id}`);
        if (!res.ok) throw new Error("Failed to fetch campaign");
        const data = await res.json();
        setCampaign(data);
      } catch (err) {
        setError("Failed to fetch campaign",err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  // Helper function to get recipients summary
  const getRecipientsSummary = (recipients) => {
    if (!Array.isArray(recipients)) return { total: 0, sent: 0, error: 0, pending: 0 };
    
    const total = recipients.length;
    const sent = recipients.filter(r => r.status === 'Sent').length;
    const error = recipients.filter(r => r.status === 'Error').length;
    const pending = recipients.filter(r => r.status === 'Pending').length;
    
    return { total, sent, error, pending };
  };

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!campaign) return null;

  const recipientsSummary = getRecipientsSummary(campaign.recipients);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        to="/dashboard"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        ← Back to Dashboard
      </Link>
      
      {/* Campaign Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{campaign.name}</h1>
        <div className="text-gray-600 mb-4">
          {campaign.description || (
            <span className="italic">No description</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Contact List:</span>{" "}
            {campaign.contactList}
          </div>
          <div>
            <span className="font-medium">Schedule Type:</span>{" "}
            {campaign.scheduleType === "now" ? "Send Now" : "Schedule Later"}
          </div>
          {campaign.scheduledAt && (
            <div>
              <span className="font-medium">Scheduled At:</span>{" "}
              {format(new Date(campaign.scheduledAt), "PPP p")}
            </div>
          )}
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              campaign.status === "Completed" ? "bg-green-100 text-green-700" :
              campaign.status === "Running" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {campaign.status}
            </span>
          </div>
          {campaign.sentDate && (
            <div>
              <span className="font-medium">Sent Date:</span>{" "}
              {format(new Date(campaign.sentDate), "PPP")}
            </div>
          )}
          <div>
            <span className="font-medium">Open Rate:</span>{" "}
            {campaign.openRate ?? 0}%
          </div>
          <div>
            <span className="font-medium">Click Rate:</span>{" "}
            {campaign.clickRate ?? 0}%
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Created:{" "}
          {campaign.createdAt
            ? format(new Date(campaign.createdAt), "PPP")
            : "-"}
        </div>
      </div>

      {/* Recipients Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Recipients ({recipientsSummary.total})</h2>
        </div>
        
        {/* Recipients Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{recipientsSummary.total}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{recipientsSummary.sent}</div>
            <div className="text-sm text-green-700">Sent</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{recipientsSummary.error}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{recipientsSummary.pending}</div>
            <div className="text-sm text-gray-700">Pending</div>
          </div>
        </div>

        {/* Recipients List */}
        {!campaign.recipients || campaign.recipients.length === 0 ? (
          <div className="text-gray-500">No recipients for this campaign.</div>
        ) : (
          <div className="space-y-2">
            {campaign.recipients.map((recipient, index) => (
              <div
                key={recipient._id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{recipient.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    recipient.status === 'Sent' ? 'bg-green-100 text-green-700' :
                    recipient.status === 'Error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {recipient.status}
                  </span>
                  {recipient.sentAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {format(new Date(recipient.sentAt), "MMM d, h:mm a")}
                    </div>
                  )}
                  {recipient.status === 'Sent' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {recipient.status === 'Error' && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Steps Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Steps</h2>
        {!campaign.steps || campaign.steps.length === 0 ? (
          <div className="text-gray-500">No steps for this campaign.</div>
        ) : (
          <ol className="list-decimal ml-6 space-y-4">
            {campaign.steps.map((step, idx) => (
              <li key={idx} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <div className="font-medium mb-2">
                  {step.type === "send_email" ? "Send Email" : "Wait"}
                </div>
                {step.type === "send_email" && (
                  <div className="mb-2 text-sm">
                    <span className="font-medium">Template:</span>{" "}
                    <div className="mt-1 p-2 bg-white rounded border text-xs max-h-20 overflow-y-auto">
                      {step.template}
                    </div>
                  </div>
                )}
                {step.type === "wait" && (
                  <div className="mb-2 text-sm">
                    <span className="font-medium">Duration:</span>{" "}
                    {step.duration}
                  </div>
                )}
                <div className="mb-1 text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    step.status === 'Sent' ? 'bg-green-100 text-green-700' :
                    step.status === 'Error' ? 'bg-red-100 text-red-700' :
                    step.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {step.status}
                  </span>
                </div>
                {step.sentAt && (
                  <div className="mb-1 text-xs text-gray-500">
                    Sent At: {format(new Date(step.sentAt), "PPP p")}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;
