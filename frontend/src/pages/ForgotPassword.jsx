import { useState } from "react";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your actual API endpoint
      const response = await authApi.forgotPassword(email);
      const data = response.data;

      if (data.success) {
        setIsSubmitted(true);
        setSuccess("Password reset instructions have been sent to your email.");
        setEmail("");
      } else {
        setError(
          data.message || "Failed to send reset email. Please try again.",
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || "Network error. Please check your connection and try again.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            {success ||
              "We've sent password reset instructions to your email address."}
          </p>
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-700">
              <span className="font-semibold">Didn't receive the email?</span>{" "}
              Check your spam folder or try again.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Try Again
            </button>
            <Link
              to="/login"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main forgot password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header with decorative element */}
        <div className="bg-purple-600 p-6 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Forgot Password?
          </h1>
          <p className="text-purple-100">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={`w-full pl-10 pr-4 py-3 border ${
                  error
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                } rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(""); // Clear error when user types
                }}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
              (isLoading || !email) &&
              "opacity-50 cursor-not-allowed hover:bg-purple-600"
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Instructions"
            )}
          </button>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
