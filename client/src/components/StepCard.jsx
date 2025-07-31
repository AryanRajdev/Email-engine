const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const StepCard = ({ step, index, onChange, onRemove, errors = {} }) => {
  const handleField = (field, value) => {
    onChange(index, { ...step, [field]: value });
  };

  return (
    <div className="bg-gray-50 border rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">Step {index + 1}</div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:underline text-sm"
        >
          Remove
        </button>
      </div>
      <div className="mb-2">
        <label className="block font-medium mb-1">Type</label>
        <select
          name="type"
          value={step.type}
          onChange={(e) => handleField("type", e.target.value)}
          className="border rounded-md p-2 w-full"
        >
          <option value="send_email">Send Email</option>
          <option value="wait">Wait</option>
        </select>
      </div>
      {step.type === "send_email" && (
        <>
          <div className="mb-2">
            <label className="block font-medium mb-1">To Email Address(es)</label>
            <input
              type="text"
              name="to"
              value={step.to || ""}
              onChange={(e) => handleField("to", e.target.value)}
              className="border rounded-md p-2 w-full"
              placeholder="e.g. user@example.com, user2@example.com"
            />
            {errors.to && <div className="text-red-500 text-xs mt-1">{errors.to}</div>}
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={step.subject || ""}
              onChange={(e) => handleField("subject", e.target.value)}
              className="border rounded-md p-2 w-full"
            />
            {errors.subject && <div className="text-red-500 text-xs mt-1">{errors.subject}</div>}
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Body</label>
            <textarea
              name="body"
              value={step.body || ""}
              onChange={(e) => handleField("body", e.target.value)}
              className="border rounded-md p-2 w-full"
              rows={4}
            />
            {errors.body && <div className="text-red-500 text-xs mt-1">{errors.body}</div>}
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Template Name</label>
            <input
              type="text"
              name="template"
              value={step.template || ""}
              onChange={(e) => handleField("template", e.target.value)}
              className="border rounded-md p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Status</label>
            <select
              name="status"
              value={step.status || "Pending"}
              onChange={(e) => handleField("status", e.target.value)}
              className="border rounded-md p-2 w-full"
            >
              <option value="Sent">Sent</option>
              <option value="Waiting">Waiting</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Sent At</label>
            <input
              type="datetime-local"
              name="sentAt"
              value={step.sentAt || ""}
              onChange={(e) => handleField("sentAt", e.target.value)}
              className="border rounded-md p-2 w-full"
            />
          </div>
        </>
      )}
      {step.type === "wait" && (
        <>
          <div className="mb-2">
            <label className="block font-medium mb-1">Duration</label>
            <input
              type="text"
              name="duration"
              value={step.duration || ""}
              onChange={(e) => handleField("duration", e.target.value)}
              className="border rounded-md p-2 w-full"
              placeholder="e.g. 2 days"
            />
            {errors.duration && <div className="text-red-500 text-xs mt-1">{errors.duration}</div>}
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Status</label>
            <select
              name="status"
              value={step.status || "Pending"}
              onChange={(e) => handleField("status", e.target.value)}
              className="border rounded-md p-2 w-full"
            >
              <option value="Waiting">Waiting</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default StepCard; 