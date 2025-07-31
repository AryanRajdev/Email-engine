import React from "react";

const CampaignInfoForm = ({ values, onChange, errors }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Campaign Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={onChange}
          className="border rounded-md p-2 w-full"
          required
        />
        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={values.description}
          onChange={onChange}
          className="border rounded-md p-2 w-full"
          rows={2}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Contact List <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="contactList"
          value={values.contactList}
          onChange={onChange}
          className="border rounded-md p-2 w-full"
          required
        />
        {errors.contactList && <div className="text-red-500 text-sm mt-1">{errors.contactList}</div>}
      </div>
      <div>
        <label className="block font-medium mb-1">Recipients</label>
        <input
          type="number"
          name="recipients"
          value={values.recipients}
          onChange={onChange}
          className="border rounded-md p-2 w-full"
          min={0}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Schedule Type <span className="text-red-500">*</span></label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="scheduleType"
              value="now"
              checked={values.scheduleType === "now"}
              onChange={onChange}
              className="accent-blue-600"
            />
            Send Now
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="scheduleType"
              value="later"
              checked={values.scheduleType === "later"}
              onChange={onChange}
              className="accent-blue-600"
            />
            Schedule Later
          </label>
        </div>
        {errors.scheduleType && <div className="text-red-500 text-sm mt-1">{errors.scheduleType}</div>}
      </div>
      {values.scheduleType === "later" && (
        <div>
          <label className="block font-medium mb-1">Scheduled At</label>
          <input
            type="datetime-local"
            name="scheduledAt"
            value={values.scheduledAt}
            onChange={onChange}
            className="border rounded-md p-2 w-full"
          />
        </div>
      )}
      <div>
        <label className="block font-medium mb-1">Status</label>
        <select
          name="status"
          value={values.status}
          onChange={onChange}
          className="border rounded-md p-2 w-full"
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Running">Running</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Sent Date</label>
        <input
          type="date"
          name="sentDate"
          value={values.sentDate}
          onChange={onChange}
          className="border rounded-md p-2 w-full"
        />
      </div>
    </div>
  );
};

export default CampaignInfoForm; 