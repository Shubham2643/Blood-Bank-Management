// src/pages/footer/EmergencyProtocol.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  AlertTriangle,
  Phone,
  Ambulance,
  Heart,
  Droplet,
  Clock,
  MapPin,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  BookOpen,
  FileText,
  Download,
  Printer,
  Share2,
  ChevronRight,
  AlertCircle,
  Info,
  Stethoscope,
  Syringe,
  Thermometer,
  Activity,
  Brain,
  HeartPulse,
  Hospital,
  Navigation,
  Volume2,
  VolumeX,
  Lightbulb,
  Target,
  Zap,
  Flame,
  Wind,
  Waves,
  Mountain,
} from "lucide-react";
import { toast } from "react-hot-toast";

const EmergencyProtocol = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeStep, setActiveStep] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Emergency steps
  const emergencySteps = [
    {
      id: 1,
      title: "Stay Calm & Assess",
      icon: Brain,
      color: "from-blue-500 to-blue-600",
      description: "Take a deep breath and assess the situation calmly",
      details: [
        "Check if the area is safe",
        "Identify the number of people needing blood",
        "Gather basic information about the emergency",
        "Note the blood types required if known",
      ],
      dos: [
        "Stay calm and composed",
        "Think clearly before acting",
        "Prioritize based on severity",
      ],
      donts: [
        "Don't panic",
        "Don't rush without information",
        "Don't put yourself in danger",
      ],
    },
    {
      id: 2,
      title: "Call Emergency Services",
      icon: Phone,
      color: "from-red-500 to-red-600",
      description: "Immediately contact emergency services",
      details: [
        "Dial emergency helpline: 1800-256-6369",
        "Call local blood bank: 102 (India)",
        "Contact nearest hospital emergency",
        "Provide clear location details",
      ],
      emergencyNumbers: [
        {
          service: "Blood Emergency",
          number: "1800-256-6369",
          availability: "24/7",
        },
        { service: "Ambulance", number: "102", availability: "24/7" },
        { service: "Police", number: "100", availability: "24/7" },
        { service: "Fire", number: "101", availability: "24/7" },
        { service: "Disaster Management", number: "108", availability: "24/7" },
      ],
    },
    {
      id: 3,
      title: "Activate Emergency Protocol",
      icon: AlertTriangle,
      color: "from-orange-500 to-orange-600",
      description: "Activate the emergency blood request system",
      details: [
        "Send emergency alert to nearby donors",
        "Notify blood banks in the area",
        "Activate emergency blood reserve",
        "Coordinate with hospital blood bank",
      ],
      actions: [
        "Trigger emergency SMS to registered donors",
        "Post urgent request on LifeDrop",
        "Contact nearby blood banks directly",
        "Mobilize emergency transport",
      ],
    },
    {
      id: 4,
      title: "Coordinate Donors",
      icon: Users,
      color: "from-green-500 to-green-600",
      description: "Coordinate with donors and manage the response",
      details: [
        "Direct donors to the location",
        "Verify donor eligibility quickly",
        "Manage donor queue efficiently",
        "Track donor responses",
      ],
      tips: [
        "Set up a donor check-in point",
        "Have volunteers guide donors",
        "Keep donors informed of wait times",
        "Thank donors for their response",
      ],
    },
    {
      id: 5,
      title: "Manage Blood Collection",
      icon: Droplet,
      color: "from-purple-500 to-purple-600",
      description: "Ensure safe and efficient blood collection",
      details: [
        "Set up temporary collection area",
        "Ensure sterile equipment",
        "Have medical staff ready",
        "Label and store blood properly",
      ],
      requirements: [
        "Sterile collection kits",
        "Coolers for storage",
        "Registration forms",
        "Medical personnel",
      ],
    },
    {
      id: 6,
      title: "Follow-up & Documentation",
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      description: "Complete documentation and follow-up",
      details: [
        "Document all donations",
        "Update inventory records",
        "Send thank you to donors",
        "Report to authorities if required",
      ],
      documents: [
        "Donor registration forms",
        "Blood collection records",
        "Inventory update reports",
        "Emergency response report",
      ],
    },
  ];

  // Emergency kits
  const emergencyKits = [
    {
      name: "Basic Emergency Kit",
      items: [
        "First aid supplies",
        "Emergency contact list",
        "Flashlight and batteries",
        "Portable phone charger",
        "Water bottles",
        "Emergency blankets",
      ],
    },
    {
      name: "Blood Collection Kit",
      items: [
        "Sterile blood bags",
        "Collection needles",
        "Alcohol swabs",
        "Bandages and gauze",
        "Blood type test kits",
        "Cooler boxes with ice packs",
      ],
    },
    {
      name: "Documentation Kit",
      items: [
        "Registration forms",
        "Consent forms",
        "Pens and markers",
        "Clipboards",
        "Labels and stickers",
        "Emergency protocol manual",
      ],
    },
  ];

  // Quick response checklist
  const quickResponseChecklist = [
    "Verify emergency location",
    "Confirm blood types needed",
    "Check available donors in area",
    "Alert nearest blood bank",
    "Arrange emergency transport",
    "Set up collection point",
    "Notify hospital emergency",
    "Activate communication system",
  ];

  // Toggle emergency mode
  const toggleEmergencyMode = () => {
    setEmergencyMode(!emergencyMode);
    if (!emergencyMode) {
      toast.success(
        "Emergency mode activated! Stay calm and follow the protocol.",
        {
          duration: 5000,
          icon: "🚨",
        },
      );
      // Play sound if enabled
      if (soundEnabled) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const playBeep = (time, freq, duration) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, time);
            gainNode.gain.setValueAtTime(0.2, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);
            osc.start(time);
            osc.stop(time + duration);
          };
          const now = audioCtx.currentTime;
          playBeep(now, 880, 0.15);
          playBeep(now + 0.25, 880, 0.15);
          playBeep(now + 0.5, 880, 0.3);
        } catch (audioError) {
          console.error("Audio beep failed:", audioError);
        }
      }
    } else {
      toast.success("Emergency mode deactivated");
    }
  };

  // Handle emergency call
  const handleEmergencyCall = (number) => {
    window.location.href = `tel:${number}`;
    toast.success(`Calling ${number}...`);
  };

  // Share emergency protocol
  const shareProtocol = () => {
    if (navigator.share) {
      navigator.share({
        title: "Emergency Blood Protocol",
        text: "Emergency protocol for blood emergencies - save this for reference",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Download kit items checklist
  const handleDownloadChecklist = (kit) => {
    const textContent = `LifeDrop Emergency Protocol - Checklist\nCategory: ${kit.name}\n\nItems:\n` +
      kit.items.map((item, i) => `[ ] ${i + 1}. ${item}`).join("\n") +
      "\n\nGenerated on: " + new Date().toLocaleString() + "\nSave lives through technology.";

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${kit.name.toLowerCase().replace(/\s+/g, "_")}_checklist.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${kit.name} Checklist download started!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Emergency Blood Protocol | LifeDrop</title>
        <meta
          name="description"
          content="Emergency protocol for blood emergencies. Step-by-step guide for handling urgent blood requirements and coordinating donors."
        />
      </Helmet>
      <Header />
      <main className="flex-grow">
        {/* Emergency Header */}
        <div
          className={`${emergencyMode ? "bg-red-700" : "bg-gradient-to-r from-red-600 via-red-700 to-red-800"} text-white transition-colors duration-500 pt-20`}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 ${emergencyMode ? "bg-red-800" : "bg-red-500"} rounded-2xl flex items-center justify-center animate-pulse`}
                >
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Emergency Blood Protocol
                  </h1>
                  <p className="text-red-100">
                    Follow these steps during a blood emergency
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  title={soundEnabled ? "Mute sound" : "Enable sound"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={shareProtocol}
                  className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  title="Share protocol"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleEmergencyMode}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    emergencyMode
                      ? "bg-white text-red-700 hover:bg-gray-100"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  {emergencyMode
                    ? "Deactivate Emergency Mode"
                    : "Activate Emergency Mode"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        {emergencyMode && (
          <div className="bg-red-600 text-white py-3 animate-pulse">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold text-center sm:text-left">
                    EMERGENCY MODE ACTIVE - Follow protocol immediately
                  </span>
                </div>
                <button
                  onClick={() => navigate("/blood-request")}
                  className="px-4 py-1.5 bg-white text-red-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Request Urgent Blood
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Emergency Contacts */}
        <div className="container mx-auto px-4 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              Emergency Contacts - Available 24/7
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {emergencySteps[1].emergencyNumbers.map((contact, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEmergencyCall(contact.number)}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors group"
                >
                  <div className="font-bold text-gray-800 group-hover:text-red-600">
                    {contact.number}
                  </div>
                  <div className="text-sm text-gray-500">{contact.service}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {contact.availability}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Quick Response Checklist */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-600" />
              Quick Response Checklist
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickResponseChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-700 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Steps */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Step-by-Step Emergency Protocol
          </h2>
          <div className="space-y-4">
            {emergencySteps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                    isActive ? "ring-2 ring-red-500" : ""
                  }`}
                >
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className="w-full p-6 flex items-center gap-4 text-left"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          Step {step.id}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${isActive ? "rotate-90" : ""}`}
                    />
                  </button>

                  {isActive && (
                    <div className="px-6 pb-6 pt-2 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Key Steps:
                          </h4>
                          <ul className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {step.dos && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Do's & Don'ts:
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-green-600 mb-2">
                                  ✓ Do's:
                                </p>
                                <ul className="space-y-1">
                                  {step.dos.map((item, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-gray-600 flex items-start gap-2"
                                    >
                                      <span className="text-green-600">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-red-600 mb-2">
                                  ✗ Don'ts:
                                </p>
                                <ul className="space-y-1">
                                  {step.donts.map((item, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-gray-600 flex items-start gap-2"
                                    >
                                      <span className="text-red-600">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {step.actions && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Immediate Actions:
                            </h4>
                            <ul className="space-y-2">
                              {step.actions.map((action, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-gray-600"
                                >
                                  <Zap className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.tips && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Pro Tips:
                            </h4>
                            <ul className="space-y-2">
                              {step.tips.map((tip, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-gray-600"
                                >
                                  <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.requirements && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Requirements:
                            </h4>
                            <ul className="space-y-2">
                              {step.requirements.map((req, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-gray-600"
                                >
                                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.documents && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Documents Needed:
                            </h4>
                            <ul className="space-y-2">
                              {step.documents.map((doc, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-gray-600"
                                >
                                  <FileText className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Emergency Kits */}
          <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">
            Emergency Preparedness Kits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {emergencyKits.map((kit, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {kit.name}
                </h3>
                <ul className="space-y-2">
                  {kit.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleDownloadChecklist(kit)}
                  className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Checklist
                </button>
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                Always prioritize your safety and the safety of others during
                emergencies
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                Keep emergency contact numbers readily available at all times
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                Practice emergency drills regularly with your team
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                Update emergency protocols based on lessons learned from actual
                emergencies
              </li>
            </ul>
          </div>

          {/* Emergency Action Button */}
          <div className="mt-8 text-center">
            <button
              onClick={toggleEmergencyMode}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center gap-3 ${
                emergencyMode
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-red-600 text-white hover:bg-red-700 animate-pulse"
              }`}
            >
              {emergencyMode ? (
                <>
                  <AlertCircle className="w-6 h-6" />
                  Deactivate Emergency Mode
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  ACTIVATE EMERGENCY MODE
                </>
              )}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmergencyProtocol;
