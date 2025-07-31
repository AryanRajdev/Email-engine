import React, { useState } from "react";
import StepCard from "./StepCard";

const StepBuilder = ({ steps, setSteps, errors = {}, recipients, setRecipients }) => {
  const [recipientInput, setRecipientInput] = useState("");

  const handleStepChange = (index, updatedStep) => {
    const newSteps = steps.map((step, i) => (i === index ? updatedStep : step));
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      { type: "send_email", template: "", status: "Pending", sentAt: "", duration: "" },
    ]);
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleAddRecipient = () => {
    const email = recipientInput.trim();
    if (email && !recipients.some(r => r.email === email)) {
      setRecipients([...recipients, { email }]);
      setRecipientInput("");
    }
  };

  const handleRemoveRecipient = (emailToRemove) => {
    setRecipients(recipients.filter(r => r.email !== emailToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <div>
      {/* Recipients Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-3">Campaign Recipients <span className="text-red-500">*</span></h3>
        <div className="mb-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter email address and press Enter or comma"
              className="flex-1 border rounded-md p-2"
            />
            <button
              type="button"
              onClick={handleAddRecipient}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Press Enter or comma to add multiple email addresses
          </p>
        </div>
        
        {/* Display added recipients */}
        {recipients.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Added Recipients ({recipients.length}):</h4>
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border"
                >
                  <span className="text-sm">{recipient.email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(recipient.email)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {errors.recipients && (
          <div className="text-red-500 text-sm mt-2">{errors.recipients}</div>
        )}
      </div>

      {/* Steps Section */}
      <div className="mb-4">
        <h3 className="font-semibold mb-3">Campaign Steps</h3>
        <button
          type="button"
          onClick={handleAddStep}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Step
        </button>
      </div>
      {steps.length === 0 && <div className="text-gray-500 mb-4">No steps added yet.</div>}
      {steps.map((step, idx) => (
        <StepCard
          key={idx}
          step={step}
          index={idx}
          onChange={handleStepChange}
          onRemove={handleRemoveStep}
          errors={errors.stepErrors?.[idx] || {}}
        />
      ))}
    </div>
  );
};

export default StepBuilder; 