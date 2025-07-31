import React from "react";
import { format } from "date-fns";

const ReviewLaunch = ({ values, steps, recipients, onSubmit, loading, error }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Campaign Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 text-xs">Name</div>
            <div className="font-medium">{values.name}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Contact List</div>
            <div className="font-medium">{values.contactList}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Schedule Type</div>
            <div className="font-medium">{values.scheduleType === 'now' ? 'Send Now' : 'Schedule Later'}</div>
          </div>
          {values.scheduleType === 'later' && (
            <div>
              <div className="text-gray-500 text-xs">Scheduled At</div>
              <div className="font-medium">{values.scheduledAt ? format(new Date(values.scheduledAt), 'PPP p') : '-'}</div>
            </div>
          )}
          <div>
            <div className="text-gray-500 text-xs">Status</div>
            <div className="font-medium">{values.status}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Sent Date</div>
            <div className="font-medium">{values.sentDate ? format(new Date(values.sentDate), 'PPP') : '-'}</div>
          </div>
        </div>
        {values.description && (
          <div className="mt-4">
            <div className="text-gray-500 text-xs">Description</div>
            <div className="font-medium">{values.description}</div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Recipients ({recipients.length})</h2>
        {recipients.length === 0 ? (
          <div className="text-gray-500">No recipients added.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recipients.map((recipient, index) => (
              <div
                key={index}
                className="bg-white px-3 py-1 rounded-full border text-sm"
              >
                {recipient.email}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Steps</h2>
        {steps.length === 0 ? (
          <div className="text-gray-500">No steps added.</div>
        ) : (
          <ol className="list-decimal ml-6 space-y-2">
            {steps.map((step, idx) => (
              <li key={idx} className="">
                <div className="font-medium">
                  {step.type === 'send_email' ? 'Send Email' : 'Wait'}
                  {step.template && `: ${step.template}`}
                  {step.duration && `: ${step.duration}`}
                </div>
                <div className="text-xs text-gray-500">
                  Status: {step.status}
                  {step.sentAt && ` | Sent At: ${format(new Date(step.sentAt), 'PPP p')}`}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
      {error && <div className="text-red-500 text-center">{error}</div>}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Launching...' : 'Launch Campaign'}
        </button>
      </div>
    </div>
  );
};

export default ReviewLaunch; 