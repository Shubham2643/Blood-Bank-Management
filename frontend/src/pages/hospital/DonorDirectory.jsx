import { useState, useEffect, useCallback, useRef } from "react";
import { hospitalApi } from "../../services/api.js";
import { toast } from "react-hot-toast";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Calendar,
  Filter,
  Heart,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  MessageCircle,
  Mail as MailIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  Users,
  CheckCircle,
} from "lucide-react";

// Ultra-premium Glassmorphic Custom Dropdown Menu
const CustomDropdown = ({ label, value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-red-500" />}
          {label}
        </label>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50/80 hover:bg-slate-100/90 border rounded-2xl px-4 py-3.5 text-xs font-black text-slate-850 transition-all duration-200 flex items-center justify-between shadow-2xs cursor-pointer ${
          isOpen
            ? "border-red-500 ring-2 ring-red-500/20 bg-white shadow-md"
            : "border-slate-200/80 hover:border-red-200"
        }`}
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-red-600" : ""
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-xl border border-slate-100/90 rounded-2xl shadow-2xl shadow-slate-900/10 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-xs font-extrabold flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-600 font-black"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <CheckCircle size={14} className="text-red-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DonorDirectory = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [filters, setFilters] = useState({
    bloodGroup: "all",
    city: "all",
    availability: "all",
    sortBy: "lastDonation"
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [cities, setCities] = useState([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6;

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    rareBlood: 0
  });

  // Donor Form and CRUD State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editDonorId, setEditDonorId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formSaving, setFormSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    age: "",
    gender: "",
    weight: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    lastDonationDate: ""
  });

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch dynamic cities from registered donors
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await hospitalApi.getDonors({ limit: 500 });
        const list = res.data.donors || res.data.data?.donors || [];
        const uniqueCities = [...new Set(list.map(d => d.address?.city).filter(Boolean))];
        setCities(uniqueCities.sort());
      } catch (err) {
        console.error("Failed to load cities for filter:", err);
      }
    };
    fetchCities();
  }, []);

  // Fetch donors callback
  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hospitalApi.getDonors({
        search: debouncedSearch,
        bloodGroup: filters.bloodGroup,
        city: filters.city,
        availability: filters.availability,
        sortBy: filters.sortBy,
        page,
        limit
      });

      const payload = res.data;
      setDonors(payload.donors || payload.data?.donors || []);
      setStats(payload.stats || { total: 0, available: 0, rareBlood: 0 });
      
      const pagination = payload.data?.pagination || payload.pagination;
      if (pagination) {
        setTotalPages(pagination.pages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      console.error("Fetch donors error:", err);
      toast.error("Failed to load donors");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    filters.bloodGroup,
    filters.city,
    filters.availability,
    filters.sortBy,
    page
  ]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // Contact donor
  const contactDonor = (donor) => {
    setSelectedDonor(donor);
    setShowContactModal(true);
    logContactAttempt(donor._id);
  };

  const logContactAttempt = async (donorId) => {
    try {
      await hospitalApi.contactDonor(donorId);
    } catch (err) {
      console.error("Log contact error:", err);
    }
  };

  // Open modal for registration
  const openRegisterModal = () => {
    setEditDonorId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      bloodGroup: "",
      age: "",
      gender: "",
      weight: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      lastDonationDate: ""
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // Open modal for editing
  const openEditModal = (donor) => {
    setEditDonorId(donor._id);
    setFormData({
      name: donor.fullName || donor.user?.name || "",
      email: donor.email || "",
      phone: donor.phone || donor.user?.phone || "",
      bloodGroup: donor.bloodGroup || "",
      age: donor.age || "",
      gender: (donor.gender || "").toLowerCase(),
      weight: donor.weight || "",
      street: donor.address?.street || "",
      city: donor.address?.city || "",
      state: donor.address?.state || "",
      pincode: donor.address?.pincode || "",
      lastDonationDate: (donor.lastDonationDate && !isNaN(new Date(donor.lastDonationDate).getTime())) 
        ? new Date(donor.lastDonationDate).toISOString().split('T')[0] 
        : ""
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // Handle deletion
  const handleDeleteClick = (donor) => {
    setDeleteTarget(donor);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await hospitalApi.deleteDonor(deleteTarget._id);
      toast.success("Donor deleted successfully");
      setDeleteTarget(null);
      fetchDonors();
    } catch (err) {
      console.error("Delete donor error:", err);
      toast.error(err.response?.data?.message || "Failed to delete donor");
    }
  };

  // Form Field Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
      errors.phone = "Must be a valid 10-digit Indian phone number starting with 6-9";
    }
    if (!formData.bloodGroup || formData.bloodGroup === "all") errors.bloodGroup = "Blood group is required";
    if (!formData.age) {
      errors.age = "Age is required";
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
        errors.age = "Age must be between 18 and 65 years";
      }
    }
    if (!formData.gender) errors.gender = "Gender is required";
    if (formData.weight) {
      const weightNum = Number(formData.weight);
      if (isNaN(weightNum) || weightNum < 45 || weightNum > 200) {
        errors.weight = "Weight must be between 45 and 200 kg";
      }
    }
    if (!formData.street?.trim()) errors.street = "Street address is required";
    if (!formData.city?.trim()) errors.city = "City is required";
    if (!formData.state?.trim()) errors.state = "State is required";
    if (!formData.pincode?.trim()) {
      errors.pincode = "PIN code is required";
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      errors.pincode = "Must be a valid 6-digit Indian PIN code";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        bloodGroup: formData.bloodGroup,
        age: Number(formData.age),
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1), // Normalize gender
        weight: formData.weight ? Number(formData.weight) : undefined,
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        lastDonationDate: formData.lastDonationDate || null
      };

      if (editDonorId) {
        await hospitalApi.updateDonor(editDonorId, payload);
        toast.success("Donor updated successfully! 🎉");
      } else {
        await hospitalApi.createDonor(payload);
        toast.success("Donor registered successfully! 🎉");
      }

      setShowFormModal(false);
      fetchDonors();
    } catch (err) {
      console.error("Save donor error:", err);
      toast.error(err.response?.data?.message || "Failed to save donor information");
    } finally {
      setFormSaving(false);
    }
  };

  const getAvailabilityStatus = (lastDonationDate) => {
    if (!lastDonationDate) return { status: "available", text: "Available", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    
    const lastDonation = new Date(lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (lastDonation < threeMonthsAgo) {
      return { status: "available", text: "Available", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    }
    
    const nextDonationDate = new Date(lastDonation);
    nextDonationDate.setMonth(nextDonationDate.getMonth() + 3);
    const daysUntilAvailable = Math.ceil((nextDonationDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilAvailable <= 7) {
      return { status: "soon", text: `Available in ${daysUntilAvailable} days`, color: "bg-amber-50 text-amber-700 border-amber-100" };
    }
    
    return { status: "unavailable", text: "Recently donated", color: "bg-rose-50 text-rose-700 border-rose-100" };
  };

  const getTimeSinceLastDonation = (lastDonationDate) => {
    if (!lastDonationDate) return "Never donated";
    
    const lastDonation = new Date(lastDonationDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastDonation);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  const isRareBloodGroup = (bloodGroup) => {
    return ['O-', 'AB-', 'B-', 'A-'].includes(bloodGroup);
  };

  // Blood group options
  const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Signature Crimson-Rose Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-7 sm:p-9 text-white shadow-2xl shadow-red-900/30 border border-red-500/30 mb-8">
          {/* Geometric Vector Rings Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="90" cy="10" r="30" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="10" cy="90" r="25" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center md:items-end">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-center text-center sm:text-left">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-white text-red-600 font-black flex items-center justify-center shadow-2xl ring-4 ring-white/20 flex-shrink-0">
                <Heart className="w-9 h-9 sm:w-10 sm:h-10 text-red-600 fill-red-600 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20 font-black text-[10px] uppercase tracking-widest backdrop-blur-md">
                    Hospital Donor Network
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-white">
                  Donor Directory
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-red-100/90 mt-1 max-w-xl">
                  Instant access to verified, registered blood donors with real-time location and availability tracking.
                </p>
              </div>
            </div>

            <button
              onClick={openRegisterModal}
              className="px-6 py-4 bg-white text-red-600 hover:bg-red-50 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer hover:scale-105 shadow-2xl flex-shrink-0 active:scale-95 border-2 border-white/40"
            >
              <Plus size={18} />
              <span>Register New Donor</span>
            </button>
          </div>
        </div>

        {/* Executive 3D Metric Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Registered Donors */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-red-500/20 via-rose-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Registered Donors</span>
                <span className="text-3xl sm:text-4xl font-black text-slate-850 tracking-tight mt-1.5 block">{stats.total}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 block">Total hospital network</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/25 ring-4 ring-red-50 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Card 2: Available Donors Now */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Available Now</span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight mt-1.5 block">{stats.available}</span>
                <span className="text-[10px] font-bold text-emerald-700 mt-1 block">Ready for emergency dispatch</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-50 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Card 3: Rare Blood Types */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-100/90 p-6 sm:p-7 shadow-xl shadow-slate-100/80 relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Rare Blood Types</span>
                <span className="text-3xl sm:text-4xl font-black text-purple-600 tracking-tight mt-1.5 block">{stats.rareBlood}</span>
                <span className="text-[10px] font-bold text-purple-700 mt-1 block">O-, AB-, B-, A- registered</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 ring-4 ring-purple-50 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter Group Floating Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-red-500" /> Filter Group:
          </span>
          {bloodGroups.map((bg) => {
            const isSelected = filters.bloodGroup === bg;
            return (
              <button
                key={bg}
                type="button"
                onClick={() => {
                  setFilters({ ...filters, bloodGroup: bg });
                  setPage(1);
                }}
                className={`px-4.5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer active:scale-95 border ${
                  isSelected
                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 border-red-500 scale-105"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs hover:border-red-200"
                }`}
              >
                {bg === "all" ? "All Donors" : bg}
              </button>
            );
          })}
        </div>

        {/* Search and Filters Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-100/90 border border-slate-100/90 p-6 sm:p-7 mb-8 relative z-20">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-rose-100/30 to-red-100/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input Bar with Icon Chip */}
            <div className="flex-1 w-full relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-red-50 text-red-600 border border-red-100/80 shadow-2xs pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search donors by name, email, phone, or city..."
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl pl-13 pr-10 py-3.5 text-sm font-extrabold text-slate-850 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-semibold shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:w-56 w-full px-5 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95 border ${
                showFilters
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/25 border-red-500"
                  : "bg-slate-50/80 hover:bg-slate-100 text-slate-750 border-slate-200/80 shadow-2xs hover:border-red-200"
              }`}
            >
              <Filter size={16} className={showFilters ? "text-white" : "text-slate-500"} />
              <span>Advanced Filters</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100 animate-in fade-in duration-200">
              {/* Blood Group Filter */}
              <CustomDropdown
                label="Blood Group"
                value={filters.bloodGroup}
                icon={Droplet}
                options={[
                  { value: "all", label: "All Blood Groups" },
                  ...bloodGroups.filter(bg => bg !== 'all').map(bg => ({ value: bg, label: bg }))
                ]}
                onChange={(val) => {
                  setFilters({ ...filters, bloodGroup: val });
                  setPage(1);
                }}
              />

              {/* Dynamic City Filter */}
              <CustomDropdown
                label="City Location"
                value={filters.city}
                icon={MapPin}
                options={[
                  { value: "all", label: "All Cities" },
                  ...cities.map(city => ({ value: city, label: city }))
                ]}
                onChange={(val) => {
                  setFilters({ ...filters, city: val });
                  setPage(1);
                }}
              />

              {/* Availability Filter */}
              <CustomDropdown
                label="Availability"
                value={filters.availability}
                icon={CheckCircle}
                options={[
                  { value: "all", label: "All Availability" },
                  { value: "available", label: "Available Now" },
                  { value: "soon", label: "Available Soon" }
                ]}
                onChange={(val) => {
                  setFilters({ ...filters, availability: val });
                  setPage(1);
                }}
              />

              {/* Sort By */}
              <CustomDropdown
                label="Sort Result By"
                value={filters.sortBy}
                icon={Filter}
                options={[
                  { value: "lastDonation", label: "Last Donation Date" },
                  { value: "name", label: "Donor Name" },
                  { value: "bloodGroup", label: "Blood Group" },
                  { value: "city", label: "City Location" }
                ]}
                onChange={(val) => {
                  setFilters({ ...filters, sortBy: val });
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>

        {/* Donors Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            <span className="ml-3 text-slate-500 font-extrabold text-xs uppercase tracking-wider">Loading matching donors...</span>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100/90 shadow-xl shadow-slate-100">
            <User size={48} className="mx-auto text-slate-300 mb-4 animate-bounce" />
            <h3 className="text-lg font-extrabold text-slate-850 uppercase tracking-wide mb-1">No Donors Found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto font-semibold leading-relaxed">
              {searchTerm || filters.bloodGroup !== 'all' || filters.city !== 'all' 
                ? 'Try adjusting your filters or search keywords.' 
                : 'No registered donors are available at this time.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {donors.map((donor) => {
                const availability = getAvailabilityStatus(donor.lastDonationDate);
                const isRare = isRareBloodGroup(donor.bloodGroup);
                const isUnavailable = availability.status === "unavailable";
                
                return (
                  <div
                    key={donor._id}
                    className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-100/80 border border-slate-100/90 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Top ambient color glow sheen */}
                    <div className="h-28 bg-gradient-to-r from-red-600/10 via-rose-500/5 to-slate-100/30 absolute top-0 left-0 right-0 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100/40 to-red-100/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                    <div className="p-6 sm:p-7 relative z-10">
                      {/* Donor Header: Blood Orb & Full Name */}
                      <div className="flex items-center gap-3.5 mb-5">
                        {/* 3D Blood Badge Orb */}
                        <div className="w-14 h-14 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-lg shadow-red-600/30 border border-red-400/40 ring-4 ring-white shrink-0 relative group-hover:scale-105 transition-transform">
                          {donor.bloodGroup}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-slate-850 text-base sm:text-lg tracking-tight truncate">{donor.fullName}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isRare ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs">
                                RARE GROUP
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Registered Donor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Donor Details Micro-Cards Grid */}
                      <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-100">
                        {/* Phone & City Row */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-black text-slate-850 min-w-0">
                            <Phone size={14} className="text-red-600 shrink-0" />
                            <span className="truncate">{donor.phone || "—"}</span>
                          </div>
                          <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-bold text-slate-750 min-w-0">
                            <MapPin size={14} className="text-red-600 shrink-0" />
                            <span className="truncate">{donor.address?.city || "Gujarat"}</span>
                          </div>
                        </div>

                        {/* Email Row */}
                        <div className="bg-slate-50/60 border border-slate-200/50 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <Mail size={14} className="text-red-500 shrink-0" />
                          <span className="truncate">{donor.email}</span>
                        </div>

                        {/* Activity Metrics Bar */}
                        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3 flex items-center justify-between gap-2 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                            <Calendar size={13} className="text-slate-400 shrink-0" />
                            <span>Last: <strong className="text-slate-850 font-black">{getTimeSinceLastDonation(donor.lastDonationDate)}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                            <Droplet size={13} className="text-red-500 fill-red-500 shrink-0" />
                            <span>Total: <strong className="text-red-600 font-black">{donor.donationHistory?.length || 0} times</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-6 pb-6 pt-0 sm:px-7 sm:pb-7 flex gap-2 items-center relative z-10">
                      {isUnavailable ? (
                        <button
                          disabled
                          className="flex-1 bg-slate-100/90 text-slate-400 border border-slate-200/80 py-3.5 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Clock size={15} className="text-slate-400" />
                          <span>In Cooling Period</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => contactDonor(donor)}
                          className="flex-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 border border-red-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <PhoneCall size={15} />
                          <span>Contact Donor</span>
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(donor)}
                        className="p-3.5 bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Edit Profile"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(donor)}
                        className="p-3.5 bg-slate-50 border border-slate-200/80 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-2xl transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Delete Donor"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-700">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-bold text-slate-700">
                    {Math.min(page * limit, totalItems)}
                  </span>{" "}
                  of <span className="font-bold text-slate-700">{totalItems}</span> donors
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedDonor && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-slate-100">
              <h3 className="text-xl font-black text-gray-800 mb-1">
                Contact Donor
              </h3>
              <p className="text-slate-500 text-sm mb-6">Choose how you would like to initiate contact with {selectedDonor.fullName}.</p>
              
              <div className="space-y-3">
                {/* Phone Call */}
                <a
                  href={`tel:${selectedDonor.phone}`}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <PhoneCall size={20} />
                  <div className="text-left">
                    <div className="font-bold text-sm">Voice Call</div>
                    <div className="text-xs opacity-90">{selectedDonor.phone || "—"}</div>
                  </div>
                </a>

                {/* SMS */}
                <a
                  href={`sms:${selectedDonor.phone}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <MessageCircle size={20} />
                  <div className="text-left">
                    <div className="font-bold text-sm">Send SMS Message</div>
                    <div className="text-xs opacity-90">Quick chat notification</div>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${selectedDonor.email}`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <MailIcon size={20} />
                  <div className="text-left">
                    <div className="font-bold text-sm">Send Email Dispatch</div>
                    <div className="text-xs opacity-90 truncate max-w-[250px]">{selectedDonor.email}</div>
                  </div>
                </a>
              </div>

              {/* Donor Summary Info */}
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Donor Reference Card</h4>
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div><strong>Blood Group:</strong> {selectedDonor.bloodGroup}</div>
                  <div><strong>Availability Status:</strong> Available Now</div>
                  {selectedDonor.address?.city && (
                    <div><strong>Registered Location:</strong> {selectedDonor.address.city}, {selectedDonor.address.state}</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowContactModal(false)}
                className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Register / Edit Donor Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-100 relative">
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black text-gray-800 mb-1">
                {editDonorId ? "Edit Donor Profile" : "Register New Donor"}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {editDonorId 
                  ? "Update the donor's contact details, medical stats, and registered location." 
                  : "Register a new donor profile. A local account will be created automatically."}
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Personal Section */}
                <div>
                  <h4 className="font-bold text-xs text-red-500 uppercase tracking-wider mb-3 pb-1 border-b border-red-100">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Donor's full name"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.name ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="email@example.com"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.email ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="10-digit number"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.phone ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Group *</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleFormChange}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white ${
                          formErrors.bloodGroup ? "border-red-500" : "border-slate-200"
                        }`}
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.filter(bg => bg !== 'all').map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                      {formErrors.bloodGroup && <p className="text-red-500 text-xs mt-1">{formErrors.bloodGroup}</p>}
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age * (18-65)</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleFormChange}
                        placeholder="Age in years"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.age ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.age && <p className="text-red-500 text-xs mt-1">{formErrors.age}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white ${
                          formErrors.gender ? "border-red-500" : "border-slate-200"
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors.gender && <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>}
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (kg, min 45)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleFormChange}
                        placeholder="Weight in kg"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.weight ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.weight && <p className="text-red-500 text-xs mt-1">{formErrors.weight}</p>}
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h4 className="font-bold text-xs text-red-500 uppercase tracking-wider mb-3 pb-1 border-b border-red-100">
                    Location & Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Street */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Street Address *</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleFormChange}
                        placeholder="Building, street name, locality"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.street ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        placeholder="e.g. Mumbai"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.city ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleFormChange}
                        placeholder="e.g. Maharashtra"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.state ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PIN Code *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleFormChange}
                        placeholder="6-digit pincode"
                        className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all ${
                          formErrors.pincode ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
                    </div>
                  </div>
                </div>

                {/* Donation Details */}
                <div>
                  <h4 className="font-bold text-xs text-red-500 uppercase tracking-wider mb-3 pb-1 border-b border-red-100">
                    Donation details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Last Donation Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Donation Date</label>
                      <input
                        type="date"
                        name="lastDonationDate"
                        value={formData.lastDonationDate}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-all font-semibold text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSaving}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer text-sm"
                  >
                    {formSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editDonorId ? "Save Changes" : "Register Donor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-slate-100 relative text-center">
              <div className="mx-auto w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">
                Delete Donor Profile?
              </h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to delete the record for <strong className="text-slate-800">{deleteTarget.fullName || deleteTarget.email}</strong>? This action is permanent and cannot be undone.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-all font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-red-200 cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDirectory;