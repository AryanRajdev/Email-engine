import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/campaigns/${id}`);
        if (!res.ok) throw new Error("Failed to fetch campaign");
        const data = await res.json();
        setCampaign(data);
      } catch (err) {
        setError("Failed to fetch campaign");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!campaign) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        to="/dashboard"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        ← Back to Dashboard
      </Link>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{campaign.name}</h1>
        <div className="text-gray-600 mb-2">
          {campaign.description || (
            <span className="italic">No description</span>
          )}
        </div>
        <div className="mb-2 text-sm">
          <span className="font-medium">Contact List:</span>{" "}
          {campaign.contactList}
        </div>
        <div className="mb-2 text-sm">
          <span className="font-medium">Recipients:</span> {campaign.recipients}
        </div>
        <div className="mb-2 text-sm">
          <span className="font-medium">Schedule Type:</span>{" "}
          {campaign.scheduleType === "now" ? "Send Now" : "Schedule Later"}
        </div>
        {campaign.scheduledAt && (
          <div className="mb-2 text-sm">
            <span className="font-medium">Scheduled At:</span>{" "}
            {format(new Date(campaign.scheduledAt), "PPP p")}
          </div>
        )}
        <div className="mb-2 text-sm">
          <span className="font-medium">Status:</span> {campaign.status}
        </div>
        {campaign.sentDate && (
          <div className="mb-2 text-sm">
            <span className="font-medium">Sent Date:</span>{" "}
            {format(new Date(campaign.sentDate), "PPP")}
          </div>
        )}
        <div className="mb-2 text-sm">
          <span className="font-medium">Open Rate:</span>{" "}
          {campaign.openRate ?? 0}%
        </div>
        <div className="mb-2 text-sm">
          <span className="font-medium">Click Rate:</span>{" "}
          {campaign.clickRate ?? 0}%
        </div>
        <div className="mb-2 text-xs text-gray-500">
          Created:{" "}
          {campaign.createdAt
            ? format(new Date(campaign.createdAt), "PPP")
            : "-"}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Steps</h2>
        {!campaign.steps || campaign.steps.length === 0 ? (
          <div className="text-gray-500">No steps for this campaign.</div>
        ) : (
          <ol className="list-decimal ml-6 space-y-4">
            {campaign.steps.map((step, idx) => (
              <li key={idx} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <div className="font-medium mb-1">
                  {step.type === "send_email" ? "Send Email" : "Wait"}
                </div>
                {step.type === "send_email" && (
                  <div className="mb-1 text-sm">
                    <span className="font-medium">Template:</span>{" "}
                    {step.template}
                  </div>
                )}
                {step.type === "wait" && (
                  <div className="mb-1 text-sm">
                    <span className="font-medium">Duration:</span>{" "}
                    {step.duration}
                  </div>
                )}
                <div className="mb-1 text-sm">
                  <span className="font-medium">Status:</span> {step.status}
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
