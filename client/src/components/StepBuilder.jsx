import React from "react";
import StepCard from "./StepCard";

const StepBuilder = ({ steps, setSteps, errors = {} }) => {
  const handleStepChange = (index, updatedStep) => {
    const newSteps = steps.map((step, i) => (i === index ? updatedStep : step));
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      { type: "send_email", template: "", status: "Pending", sentAt: "", duration: "", to: "", subject: "", body: "" },
    ]);
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-4">
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
          errors={errors[idx] || {}}
        />
      ))}
    </div>
  );
};

export default StepBuilder; 