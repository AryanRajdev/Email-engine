import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignInfoForm from "../components/CampaignInfoForm";
import StepBuilder from "../components/StepBuilder";
import ReviewLaunch from "../components/ReviewLaunch";

const initialCampaign = {
  name: "",
  description: "",
  contactList: "",
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
    validate: (campaign, steps, recipients) => {
      const errs = {};
      const stepErrors = [];
      
      // Validate recipients - simple and clear
      if (!recipients || recipients.length === 0) {
        errs.recipients = "At least one recipient is required";
      } else {
        // Validate each recipient has a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidRecipients = recipients.filter(r => {
          const email = typeof r === 'object' ? r.email : r;
          return !email || !emailRegex.test(email);
        });
        
        if (invalidRecipients.length > 0) {
          errs.recipients = "All recipients must have valid email addresses";
        }
      }
      
      // Validate steps - simple and clear
      if (!steps || steps.length === 0) {
        errs.steps = "At least one step is required";
      } else {
        steps.forEach((step, i) => {
          const sErr = {};
          
          // Step type is required
          if (!step.type) {
            sErr.type = "Step type is required";
          }
          
          // Validate based on step type
          if (step.type === "send_email") {
            if (!step.template || step.template.trim() === "") {
              sErr.template = "Email template is required";
            }
          } else if (step.type === "wait") {
            if (!step.duration || step.duration.trim() === "") {
              sErr.duration = "Wait duration is required";
            }
          }
          
          stepErrors.push(sErr);
        });
      }
      
      // Add step errors to main errors object ONLY if there are actual errors
      const hasStepErrors = stepErrors.some(e => Object.keys(e).length > 0);
      if (hasStepErrors) {
        errs.stepErrors = stepErrors;
        errs.hasStepErrors = true;
      }
      
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
  const [recipients, setRecipients] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  // Per-step validation
  const validateStep = (stepIdx = currentStep) => {
    const config = stepsConfig[stepIdx];
    const errs = config.validate(campaign, steps, recipients);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaign((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    const isValid = validateStep(currentStep);
    
    if (!isValid) {
      return; // Don't advance if validation fails
    }
    
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
      // Convert recipients to the correct format for backend (array of objects)
      const recipientObjects = recipients.map(r => {
        if (typeof r === 'object' && r.email) {
          return r; // Already in correct format
        } else if (typeof r === 'string') {
          return { email: r }; // Convert string to object
        }
        return { email: r }; // Fallback
      });
      
      // Prepare payload with recipients array structure
      const payload = {
        ...campaign,
        recipients: recipientObjects, // Array of objects with email property
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
      
      // POST to backend - use launch endpoint for sending emails
      const res = await fetch("http://localhost:3001/api/campaigns/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setSubmitError(data.error || "Failed to launch campaign");
        setCurrentStep(2);
        return;
      }
      
      // Handle partial success (207 status)
      if (res.status === 207) {
        const successCount = data.successfulEmails || 0;
        const totalCount = data.totalEmails || 0;
        setSubmitError(`Campaign launched with partial success. ${successCount}/${totalCount} emails sent successfully.`);
        setCurrentStep(2);
        return;
      }
      
      // Success case
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
            <StepBuilder 
              steps={steps} 
              setSteps={setSteps} 
              recipients={recipients}
              setRecipients={setRecipients}
              errors={errors} 
            />
            
            {/* Validation Error Messages */}
            <div className="mt-4 space-y-2">
              {errors.recipients && (
                <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                  <strong>Recipients Error:</strong> {errors.recipients}
                </div>
              )}
              {errors.steps && (
                <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                  <strong>Steps Error:</strong> {errors.steps}
                </div>
              )}
              {errors.hasStepErrors && (
                <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                  <strong>Step Validation Error:</strong> Please fix the errors in your steps before continuing.
                </div>
              )}
            </div>
            
          </div>
        )}
        {currentStep === 2 && (
          <ReviewLaunch
            values={campaign}
            steps={steps}
            recipients={recipients}
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