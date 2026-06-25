import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  User,
  Heart,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Droplet,
  Weight,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { adminApi } from '../../services/api.js';

function GetAllDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    bloodGroup: 'all',
    eligibility: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Blood groups for filter
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Fetch Donors Function
  const fetchAllDonors = useCallback(
    async (showToast = false) => {
      try {
        if (showToast) setRefreshing(true);
        else setLoading(true);

        console.log("🔄 Fetching donors...");

        const res = await adminApi.getDonors();
        const data = res.data?.data || res.data;
        console.log("✅ Donors data:", data);
        setDonors(data.donors || []);

        if (showToast) {
          toast.success(`Loaded ${data.donors?.length || 0} donors`);
        }
      } catch (error) {
        console.error("🚨 Fetch donors error:", error);
        toast.error(error.message || "Failed to load donor data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchAllDonors();
  }, [fetchAllDonors]);

  // Filter and sort donors
  const filteredDonors = donors
    .filter(donor => {
      const donorName = donor.fullName || donor.user?.name || '';
      const donorEmail = donor.email || donor.user?.email || '';
      
      const matchesSearch = !filters.search || 
        donorName.toLowerCase().includes(filters.search.toLowerCase()) ||
        donorEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
        donor.phone?.includes(filters.search);
      
      const matchesBloodGroup = filters.bloodGroup === 'all' || donor.bloodGroup === filters.bloodGroup;
      
      const matchesEligibility = filters.eligibility === 'all' || 
        (filters.eligibility === 'eligible' && donor.isEligible) ||
        (filters.eligibility === 'ineligible' && !donor.isEligible);
      
      return matchesSearch && matchesBloodGroup && matchesEligibility;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      const aName = a.fullName || a.user?.name || '';
      const bName = b.fullName || b.user?.name || '';

      switch (filters.sortBy) {
        case 'name':
          aValue = aName.toLowerCase();
          bValue = bName.toLowerCase();
          break;
        case 'donations':
          aValue = a.donationHistory?.length || 0;
          bValue = b.donationHistory?.length || 0;
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        default:
          aValue = aName.toLowerCase();
          bValue = bName.toLowerCase();
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

  // Helper to use the schema field: isEligible
  const getEligibilityBadge = (isEligible) => {
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
        isEligible 
          ? 'bg-green-50 text-green-700 border-green-200' 
          : 'bg-red-50 text-red-700 border-red-200'
      }`}>
        {isEligible ? <CheckCircle size={12} /> : <XCircle size={12} />}
        {isEligible ? "Eligible" : "Ineligible"}
      </span>
    );
  };

  const getBloodGroupBadge = (bloodGroup) => {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
        <Droplet size={12} className="fill-current" />
        {bloodGroup}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <User className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Donor Database
          </h2>
          <p className="text-gray-500">Fetching all registered blood donors...</p>
        </div>
      </div>
    );
  }

  // Count for stats card
  const totalCount = donors.length;
  const eligibleCount = donors.filter(d => d.isEligible).length;
  const ineligibleCount = donors.filter(d => !d.isEligible).length;
  const totalDonations = donors.reduce((sum, d) => sum + (d.donationHistory?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Blood Donors</h1>
                <p className="text-gray-600 mt-1">
                  Manage and view all registered blood donors in the system
                </p>
              </div>
            </div>
            
            <button
              onClick={() => fetchAllDonors(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center border-r border-gray-100 last:border-0">
                <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
                <div className="text-sm text-gray-600">Total Donors</div>
              </div>
              <div className="text-center border-r border-gray-100 last:border-0">
                <div className="text-2xl font-bold text-green-600">{eligibleCount}</div>
                <div className="text-sm text-gray-600">Eligible</div>
              </div>
              <div className="text-center border-r border-gray-100 last:border-0">
                <div className="text-2xl font-bold text-red-600">{ineligibleCount}</div>
                <div className="text-sm text-gray-600">Ineligible</div>
              </div>
              <div className="text-center last:border-0">
                <div className="text-2xl font-bold text-blue-600">{totalDonations}</div>
                <div className="text-sm text-gray-600">Total Donations</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search donors by name, email, or phone..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <select
              value={filters.bloodGroup}
              onChange={(e) => setFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Blood Groups</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            
            <select
              value={filters.eligibility}
              onChange={(e) => setFilters(prev => ({ ...prev, eligibility: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Eligibility</option>
              <option value="eligible">Eligible Only</option>
              <option value="ineligible">Ineligible Only</option>
            </select>
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="name">Sort by Name</option>
              <option value="donations">Sort by Donations</option>
              <option value="age">Sort by Age</option>
            </select>
            
            <button
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {filters.sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredDonors.length}</span> of <span className="font-semibold">{donors.length}</span> donors
          </p>
          {filters.search && (
            <p className="text-sm text-red-600">
              Filtered by: "{filters.search}"
            </p>
          )}
        </div>

        {/* Donors Grid */}
        {filteredDonors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-red-100">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {donors.length === 0 ? 'No Donors Found' : 'No Matching Donors'}
            </h3>
            <p className="text-gray-600">
              {donors.length === 0 
                ? 'The blood donor database is currently empty.' 
                : 'No donors match your current search criteria.'}
            </p>
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="mt-4 text-red-600 hover:text-red-700 underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDonors.map((donor) => (
              <div
                key={donor._id}
                className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              >
                {/* Header with Name and Badges */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">
                      {donor.fullName || donor.user?.name || "Unknown Donor"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{donor.email || donor.user?.email || "No Email"}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getEligibilityBadge(donor.isEligible)}
                    {getBloodGroupBadge(donor.bloodGroup)}
                  </div>
                </div>

                {/* Donor Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700">{donor.phone || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700">{donor.age} years old</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Weight className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700">{donor.weight || 'N/A'} kg</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {donor.donationHistory?.length || 0} donation{(donor.donationHistory?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3 text-sm pt-2 border-t border-gray-100">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-gray-700 line-clamp-2">
                      {donor.address?.street && `${donor.address.street}, `}
                      {donor.address?.city}, {donor.address?.state}
                      {donor.address?.pincode && ` - ${donor.address.pincode}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GetAllDonors;