import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignInfoForm from "../components/CampaignInfoForm";
import StepBuilder from "../components/StepBuilder";
import ReviewLaunch from "../components/ReviewLaunch";

const initialCampaign = {
  name: "",
  description: "",
  contactList: "",
  recipients: "",
  scheduleType: "now",
  scheduledAt: "",
  status: "Scheduled",
  sentDate: "",
};

const stepsConfig = [
  {
    label: "Info",
    validate: (campaign) => {
      const errs = {};
      if (!campaign.name) errs.name = "Campaign name is required";
      if (!campaign.contactList) errs.contactList = "Contact list is required";
      if (!campaign.scheduleType) errs.scheduleType = "Schedule type is required";
      return errs;
    },
  },
  {
    label: "Steps",
    validate: (campaign, steps) => {
      const errs = {};
      const stepErrors = [];
      if (!Array.isArray(steps) || steps.length === 0) errs.steps = "At least one step is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      steps.forEach((step, i) => {
        const sErr = {};
        if (!step.type) sErr.type = "Type is required";
        if (step.type === "send_email") {
          if (!step.to) sErr.to = "To email is required";
          else {
            // Support multiple comma-separated emails
            const emails = step.to.split(',').map(e => e.trim()).filter(Boolean);
            if (emails.length === 0 || !emails.every(e => emailRegex.test(e))) {
              sErr.to = "Enter valid email address(es)";
            }
          }
          if (!step.subject) sErr.subject = "Subject is required";
          if (!step.body) sErr.body = "Body is required";
        }
        if (step.type === "wait" && !step.duration) sErr.duration = "Duration is required";
        stepErrors.push(sErr);
      });
      errs.stepErrors = stepErrors;
      // If any step has errors, block next
      if (stepErrors.some(e => Object.keys(e).length > 0)) errs.hasStepErrors = true;
      return errs;
    },
  },
  {
    label: "Review",
    validate: () => ({}),
  },
];

const CreateCampaign = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaign, setCampaign] = useState(initialCampaign);
  const [steps, setSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  // Per-step validation
  const validateStep = (stepIdx = currentStep) => {
    const config = stepsConfig[stepIdx];
    const errs = config.validate(campaign, steps);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaign((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setErrors({});
    setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      setCurrentStep(0);
      return;
    }
    setLoading(true);
    setSubmitError("");
    try {
      // Prepare payload
      const payload = {
        ...campaign,
        recipients: Number(campaign.recipients) || 0,
        openRate: 0,
        clickRate: 0,
        scheduledAt: campaign.scheduleType === "later" && campaign.scheduledAt ? new Date(campaign.scheduledAt) : null,
        sentDate: campaign.sentDate ? new Date(campaign.sentDate) : null,
        steps: steps.map((step) => ({
          type: step.type,
          template: step.type === "send_email" ? step.template : undefined,
          duration: step.type === "wait" ? step.duration : undefined,
          status: step.status,
          sentAt: step.sentAt ? new Date(step.sentAt) : undefined,
        })),
      };
      // POST to backend
      const res = await fetch("http://localhost:3001/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Failed to launch campaign");
        setCurrentStep(2);
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setSubmitError(err.message || "Failed to launch campaign");
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Launch Campaign</h1>
          <div className="flex gap-2 text-sm">
            {stepsConfig.map((step, idx) => (
              <span
                key={step.label}
                className={`px-3 py-1 rounded-full ${currentStep === idx ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                {idx + 1}. {step.label}
              </span>
            ))}
          </div>
        </div>
        {currentStep === 0 && (
          <CampaignInfoForm values={campaign} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 1 && (
          <div>
            <StepBuilder steps={steps} setSteps={setSteps} errors={errors.stepErrors || {}} />
            {errors.steps && <div className="text-red-500 text-sm mt-2">{errors.steps}</div>}
            {/* Per-step errors */}
            {errors.hasStepErrors && <div className="text-red-500 text-xs mt-2">Please fix errors above before continuing.</div>}
          </div>
        )}
        {currentStep === 2 && (
          <ReviewLaunch
            values={campaign}
            steps={steps}
            onSubmit={handleSubmit}
            loading={loading}
            error={submitError}
          />
        )}
        <div className="flex justify-between mt-8">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition"
              disabled={loading}
            >
              Previous
            </button>
          ) : <div />}
          {currentStep < 2 && (
            <button
              type="button"
              onClick={handleNext}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign; 