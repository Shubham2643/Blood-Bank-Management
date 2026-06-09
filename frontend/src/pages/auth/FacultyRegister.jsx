import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {toast} from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api.js";

// ================ Constants & Configuration ================
const faculty_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "blood-lab", label: "Blood Lab" },
];

const faculty_CATEGORIES = [
  { value: "Government", label: "Government" },
  { value: "Private", label: "Private" },
  { value: "Trust", label: "Trust" },
  { value: "Charity", label: "Charity" },
  { value: "Other", label: "Other" },
];

const STATES = {
  Gujarat: ["Ahmedabad", "Amreli", "Surat", "Vadodara", "Rajkot"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  Karnataka: ["Bengaluru", "Mysore", "Mangalore", "Udupi"],
  Delhi: ["New Delhi", "Dwarka", "Rohini"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Vellore"],
};

const WORKING_DAYS = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" },
];

const STEP_VALIDATIONS = {
  1: ["name", "email"],
  2: ["password", "facultyType"],
  3: [
    "phone",
    "emergencyContact",
    "registrationNumber",
    "address.street",
    "address.city",
    "address.state",
    "address.pincode",
    "documents.registrationProof.url",
  ],
};

// ================ Validation Schema ================
const VALIDATION_RULES = {
  name: (value) => {
    if (!value?.trim()) return "faculty name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    if (value.length > 100) return "Name must be less than 100 characters";
    return "";
  },

  email: (value) => {
    if (!value?.trim()) return "Email is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  },

  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(value))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(value))
      return "Password must contain at least one number";
    return "";
  },

  phone: (value) => {
    if (!value) return "Phone number is required";
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(value))
      return "Please enter a valid 10-digit Indian mobile number";
    return "";
  },

  emergencyContact: (value) => {
    if (!value) return "Emergency contact is required";
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(value))
      return "Please enter a valid 10-digit Indian mobile number";
    return "";
  },

  registrationNumber: (value) => {
    if (!value?.trim()) return "Registration number is required";
    if (value.length < 5)
      return "Registration number must be at least 5 characters";
    return "";
  },

  "address.street": (value) => {
    if (!value?.trim()) return "Street address is required";
    if (value.length < 5) return "Street address must be at least 5 characters";
    return "";
  },

  "address.city": (value) => {
    if (!value?.trim()) return "City is required";
    return "";
  },

  "address.state": (value) => {
    if (!value?.trim()) return "State is required";
    return "";
  },

  "address.pincode": (value) => {
    if (!value) return "Pincode is required";
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(value))
      return "Please enter a valid 6-digit pincode";
    return "";
  },

  "documents.registrationProof.url": (value) => {
    if (!value?.trim()) return "Document URL is required";
    try {
      new URL(value);
      return "";
    } catch(error) {
      console.error(error);
      return "Please enter a valid URL";
    }
  },
};

// ================ Custom Hooks ================
const useFormValidation = (formData, touched, setErrors) => {
  const validateField = useCallback((fieldName, value) => {
    const validator = VALIDATION_RULES[fieldName];
    if (!validator) return "";
    return validator(value);
  }, []);

  const validateStep = useCallback(
    (step) => {
      const fieldsToValidate = STEP_VALIDATIONS[step] || [];
      const newErrors = {};

      fieldsToValidate.forEach((field) => {
        let value;
        if (field.includes(".")) {
          value = field.split(".").reduce((obj, key) => obj?.[key], formData);
        } else {
          value = formData[field];
        }

        const error = validateField(field, value);
        if (error) newErrors[field] = error;
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData, validateField, setErrors],
  );

  return { validateField, validateStep };
};

// ================ Custom Components ================
const Input = React.forwardRef(
  (
    { label, error, touched, required = false, className = "", id, ...props },
    ref,
  ) => {
    const inputId =
      id || `input-${props.name}-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error && touched}
          aria-describedby={error && touched ? errorId : undefined}
          className={`
          w-full px-4 py-2.5 border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
          transition-colors duration-200
          ${
            error && touched
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${className}
        `}
          {...props}
        />
        {error && touched && (
          <p id={errorId} className="text-red-500 text-sm mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

const Select = React.forwardRef(
  (
    {
      label,
      error,
      touched,
      required = false,
      children,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const selectId =
      id || `select-${props.name}-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${selectId}-error`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error && touched}
          aria-describedby={error && touched ? errorId : undefined}
          className={`
          w-full px-4 py-2.5 border rounded-lg bg-white
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
          transition-colors duration-200
          ${
            error && touched
              ? "border-red-500 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${className}
        `}
          {...props}
        >
          {children}
        </select>
        {error && touched && (
          <p id={errorId} className="text-red-500 text-sm mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

const PasswordInput = React.forwardRef(
  (
    { label, error, touched, required = false, className = "", id, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `password-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            aria-invalid={!!error && touched}
            aria-describedby={error && touched ? errorId : undefined}
            className={`
            w-full px-4 py-2.5 border rounded-lg pr-12
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
            transition-colors duration-200
            ${
              error && touched
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${className}
          `}
            {...props}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-gray-800"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        </div>
        {error && touched && (
          <p id={errorId} className="text-red-500 text-sm mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

const ProgressBar = ({ step, totalSteps }) => {
  const percentage = (step / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-white-700">
          Step {step} of {totalSteps}
        </span>
        <span className="text-white-600">
          {Math.round(percentage)}% Complete
        </span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-2.5"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="bg-red-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-white-600">
        <span className={step >= 1 ? "font-semibold" : ""}>
          Basic Info
        </span>
        <span className={step >= 2 ? "font-semibold" : ""}>
          Account
        </span>
        <span className={step >= 3 ? "font-semibold text-red-600" : ""}>
          Details
        </span>
      </div>
    </div>
  );
};

// ================ Main Component ================
const FacultyRegistrationForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    emergencyContact: "",
    address: { street: "", city: "", state: "", pincode: "" },
    registrationNumber: "",
    facultyType: "hospital",
    facultyCategory: "Government",
    documents: { registrationProof: { url: "", filename: "" } },
    operatingHours: {
      open: "09:00",
      close: "18:00",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    is24x7: false,
    emergencyServices: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const formRef = useRef(null);

  const { validateField, validateStep } = useFormValidation(
    formData,
    touched,
    setErrors,
  );

  // Reset submit status when form data changes
  useEffect(() => {
    setSubmitStatus({ type: "", message: "" });
  }, [formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      setFormData((prev) => {
        if (name.startsWith("address.")) {
          const field = name.split(".")[1];
          return {
            ...prev,
            address: { ...prev.address, [field]: value },
          };
        }

        if (name.startsWith("documents.")) {
          const field = name.split(".")[2];
          return {
            ...prev,
            documents: {
              registrationProof: {
                ...prev.documents.registrationProof,
                [field]: value,
              },
            },
          };
        }

        if (name.startsWith("operatingHours.")) {
          const field = name.split(".")[1];
          if (field === "workingDays") {
            const options = Array.from(e.target.selectedOptions).map(
              (o) => o.value,
            );
            return {
              ...prev,
              operatingHours: { ...prev.operatingHours, workingDays: options },
            };
          }
          return {
            ...prev,
            operatingHours: { ...prev.operatingHours, [field]: value },
          };
        }

        return {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };
      });

      // Mark field as touched
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate field on change
      const error = validateField(name, value);
      setErrors((prev) => {
        if (error) {
          return { ...prev, [name]: error };
        }
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    },
    [validateField],
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, value);
      setErrors((prev) => {
        if (error) {
          return { ...prev, [name]: error };
        }
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    },
    [validateField],
  );

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Find first error element
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
  }, [step, validateStep, errors]);

  const handleBack = useCallback(() => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      if (!validateStep(step)) {
        setSubmitStatus({
          type: "error",
          message: "Please fix the errors before submitting",
        });
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus({ type: "", message: "" });

      const submissionPayload = {
        ...formData,
        facultyType: formData.facultyType,
        role: formData.facultyType,
      };

      try {
        const response = await authApi.register(submissionPayload);
        const data = response.data;

        if (response.status >= 200 && response.status < 300) {
          toast.success(
            "Registration successful! Your account is pending approval.",
          );

          // Store for login page
          localStorage.setItem("registeredEmail", formData.email);

          // Navigate to login
          setTimeout(() => {
            navigate("/login", {
              state: {
                email: formData.email,
                message:
                  "Registration successful! Your account is pending admin approval.",
              },
            });
          }, 1500);
        } else {
          setSubmitStatus({
            type: "error",
            message: data.message || "Registration failed. Please try again.",
          });
          toast.error(data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Registration error:", error);
        setSubmitStatus({
          type: "error",
          message: "Network error. Please check your connection and try again.",
        });
        toast.error("Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, step, validateStep, navigate],
  );

  // Memoized city options
  const cityOptions = useMemo(() => {
    if (!formData.address.state) return [];
    return STATES[formData.address.state] || [];
  }, [formData.address.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-800 text-white p-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              Blood Faculty Registration
            </h1>
            <p className="text-center text-red-100 mb-6">
              Join our network of blood banks and laboratories
            </p>
            <ProgressBar step={step} totalSteps={3} />
          </div>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-8 space-y-8"
            noValidate
          >
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Basic Information
                </h2>

                <Input
                  label="Faculty Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.name}
                  touched={touched.name}
                  required
                  placeholder="Enter faculty name"
                  autoComplete="organization"
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                  required
                  placeholder="Enter email address"
                  autoComplete="email"
                />
              </div>
            )}

            {/* Step 2: Account Information */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Account Settings
                </h2>

                <PasswordInput
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  touched={touched.password}
                  required
                  placeholder="Enter password"
                  autoComplete="new-password"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Faculty Type"
                    name="facultyType"
                    value={formData.facultyType}
                    onChange={handleChange}
                    error={errors.facultyType}
                    touched={touched.facultyType}
                    required
                  >
                    {faculty_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Faculty Category"
                    name="facultyCategory"
                    value={formData.facultyCategory}
                    onChange={handleChange}
                  >
                    {faculty_CATEGORIES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: faculty Details */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  faculty Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.phone}
                    touched={touched.phone}
                    required
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    pattern="[6-9][0-9]{9}"
                    inputMode="numeric"
                  />

                  <Input
                    label="Emergency Contact"
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.emergencyContact}
                    touched={touched.emergencyContact}
                    required
                    placeholder="10-digit emergency contact"
                    maxLength="10"
                    pattern="[6-9][0-9]{9}"
                    inputMode="numeric"
                  />
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Address</h3>

                  <Input
                    label="Street Address"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors["address.street"]}
                    touched={touched["address.street"]}
                    required
                    placeholder="Enter street address"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="State"
                      name="address.state"
                      value={formData.address.state}
                      onChange={(e) => {
                        handleChange(e);
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: "" },
                        }));
                      }}
                      onBlur={handleBlur}
                      error={errors["address.state"]}
                      touched={touched["address.state"]}
                      required
                    >
                      <option value="">Select State</option>
                      {Object.keys(STATES).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="City"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors["address.city"]}
                      touched={touched["address.city"]}
                      required
                      disabled={!formData.address.state}
                    >
                      <option value="">Select City</option>
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </Select>

                    <Input
                      label="Pincode"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors["address.pincode"]}
                      touched={touched["address.pincode"]}
                      required
                      placeholder="6-digit pincode"
                      maxLength="6"
                      pattern="[1-9][0-9]{5}"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <Input
                  label="Registration Number"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.registrationNumber}
                  touched={touched.registrationNumber}
                  required
                  placeholder="Enter registration number"
                />

                <Input
                  label="Registration Proof URL"
                  type="url"
                  name="documents.registrationProof.url"
                  value={formData.documents.registrationProof.url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors["documents.registrationProof.url"]}
                  touched={touched["documents.registrationProof.url"]}
                  required
                  placeholder="https://example.com/document.pdf"
                />

                {/* Operating Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Opening Time"
                    type="time"
                    name="operatingHours.open"
                    value={formData.operatingHours.open}
                    onChange={handleChange}
                  />

                  <Input
                    label="Closing Time"
                    type="time"
                    name="operatingHours.close"
                    value={formData.operatingHours.close}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Working Days
                  </label>
                  <select
                    name="operatingHours.workingDays"
                    multiple
                    value={formData.operatingHours.workingDays}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-32"
                    size={5}
                    aria-label="Select working days"
                  >
                    {WORKING_DAYS.map(({ value, label }) => (
                      <option key={value} value={value} className="py-1">
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Hold Ctrl/Cmd (⌘) to select multiple days
                  </p>
                </div>

                {/* Service Options */}
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-gray-700 mb-2">
                    Service Options
                  </legend>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is24x7"
                        checked={formData.is24x7}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-gray-700">24x7 Service</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="emergencyServices"
                        checked={formData.emergencyServices}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-gray-700">Emergency Services</span>
                    </label>
                  </div>
                </fieldset>
              </div>
            )}

            {/* Status Message */}
            {submitStatus.message && (
              <div
                className={`p-4 rounded-lg ${
                  submitStatus.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
                role="alert"
              >
                {submitStatus.message}
              </div>
            )}

            {/* Navigation Buttons */}
            <div
              className={`flex ${step > 1 ? "justify-between" : "justify-end"} pt-6 border-t`}
            >
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Registering...
                    </>
                  ) : (
                    "Register faculty"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegistrationForm;
