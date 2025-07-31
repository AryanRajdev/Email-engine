import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, ListTodo, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endingId, setEndingId] = useState(null);
  const [endError, setEndError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/api/campaigns");
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
      } catch (err) {
        setError("Failed to fetch campaigns");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleEndCampaign = async (id) => {
    setEndingId(id);
    setEndError("");
    try {
      const res = await fetch(`http://localhost:3001/api/campaigns/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setEndError(data.error || "Failed to end campaign");
        setEndingId(null);
        return;
      }
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setEndError("Failed to end campaign");
    } finally {
      setEndingId(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Campaign Dashboard
      </h1>
      {endError && <div className="text-red-500 text-center mb-4">{endError}</div>}
      {/* Loading & error states */}
      {loading ? (
        <div className="text-gray-500 text-center text-lg">
          Loading campaigns...
        </div>
      ) : error ? (
        <div className="text-red-500 text-center text-lg">{error}</div>
      ) : campaigns.length === 0 ? (
        <div className="text-gray-500 text-center text-lg">
          No campaigns created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {c.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {c.description || (
                    <span className="italic">No description provided</span>
                  )}
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-4 flex-1 space-y-3 text-sm text-gray-700">
                {/* Schedule */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-blue-600">
                      {c.scheduleType === "now" ? "Send Now" : "Scheduled"}
                    </span>
                  </div>
                  {c.scheduledAt && (
                    <span className="text-xs text-gray-500">
                      {format(new Date(c.scheduledAt), "PPP")}
                    </span>
                  )}
                </div>

                {/* Steps */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-emerald-500" />
                    <span>{c.steps?.length || 0} steps</span>
                  </div>
                  {/* Dynamic status badge */}
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : c.status === "Running"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.status || "Draft"}
                  </span>
                </div>

                {/* Created date */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    Created: {c.createdAt ? format(new Date(c.createdAt), "PPP") : "-"}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
                  onClick={() => navigate(`/campaigns/${c._id}`)}
                >
                  View Details
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
                  onClick={() => handleEndCampaign(c._id)}
                  disabled={endingId === c._id}
                >
                  {endingId === c._id ? "Ending..." : "End Campaign"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
