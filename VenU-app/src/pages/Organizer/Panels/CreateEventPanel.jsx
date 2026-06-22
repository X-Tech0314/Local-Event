import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, MapPin, Calendar, Clock, Users, Lock, Unlock, Plus, Trash2, CheckCircle, ChevronRight, ChevronLeft, Map, Ticket, Music, Trophy, Star, Search, X, Gift, Heart, MoreHorizontal, Loader2 } from 'lucide-react';
import TicketPreview from '../../../components/TicketPreview';
import usePsgc from '../../../hooks/usePsgc';

export default function CreateEventPanel({ currentUser, setActivePanel, editEvent, setEditEvent, addNotification }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingVenue, setIsUploadingVenue] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [venueSource, setVenueSource] = useState('registered');
  const fileInputRef = useRef(null);

  const [enableTicketing, setEnableTicketing] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [errors, setErrors] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [venueResults, setVenueResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // PSGC cascading location hook
  const {
    regions, provinces, cities, barangays,
    loading: psgcLoading,
    noProvinceRegion,
    psgcSel,
    selectRegion, selectProvince, selectCity, selectBarangay,
    getRegionName, getProvinceName, getCityName, getBarangayName,
  } = usePsgc();
  const [brgySearch, setBrgySearch] = useState('');

  const [formData, setFormData] = useState({
    EventTitle: '',
    Description: '',
    Category: '',
    Privacy: 'Public',
    VerificationCode: '',
    StartDate: '',
    StartTime: '',
    EndDate: '',
    EndTime: '',
    TicketSaleStart: '',
    TicketSaleEnd: '',
    VenueType: 'Physical',
    SelectedRegion: '',
    SelectedProvince: '',
    SelectedCity: '',
    SelectedBarangay: '',
    StreetAddress: '',
    FloorLevel: '',
    WingSection: '',
    ProximityAnchor: '',
    RegisteredVenueId: '',
    RegisteredVenueName: '',
    CustomVenueName: '',
    CustomVenueType: 'Indoor Hall',
    Capacity: '',
    ContactPerson: '',
    ContactNumber: '',
    ContactEmail: '',
    MapUrl: '',
    Latitude: '',
    Longitude: '',
    SquareFootage: '',
    NumberOfFloors: '1',
    HasFireExit: false,
    HasFireExtinguishers: false,
    VenueImages: [],
    TicketTiers: [
      { Name: 'General Admission', Price: '', Capacity: '', ValidityScope: 'Full Event Access' }
    ]
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setVenueResults([]);
      return;
    }

    let active = true;

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/venues?search=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok && active) {
          const data = await response.json();
          const normalizedData = Array.isArray(data) ? data.map(venue => ({
            id: venue.id || venue.Id || venue.ID,
            name: venue.name || venue.Name || "Unnamed Venue",
            city: venue.city || venue.City || "",
            maxCapacity: venue.maxCapacity || venue.Capacity || venue.capacity || 100
          })) : [];

          setVenueResults(normalizedData);
        } else if (!response.ok) {
          console.error("Server authentication or querying failed:", response.status);
        }
      } catch (error) {
        console.error("Error linking to cloud repository:", error);
      } finally {
        if (active) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'StartDate' && updated.EndDate && updated.EndDate < value) {
        updated.EndDate = value;
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...formData.TicketTiers];
    updatedTiers[index][field] = value;
    setFormData(prev => ({ ...prev, TicketTiers: updatedTiers }));
  };

  const addTicketTier = () => {
    setFormData(prev => ({
      ...prev,
      TicketTiers: [...prev.TicketTiers, { Name: '', Price: '', Capacity: '', ValidityScope: 'Full Event Access' }]
    }));
  };

  const handleSmartAllocate = () => {
    const totalCapacity = parseInt(formData.Capacity) || 0;
    if (totalCapacity <= 0) return;

    setIsAllocating(true);

    setTimeout(() => {
      let sumAssigned = 0;
      let unassignedIndices = [];

      formData.TicketTiers.forEach((tier, index) => {
        const cap = parseInt(tier.Capacity);
        if (!isNaN(cap) && cap > 0) {
          sumAssigned += cap;
        } else {
          unassignedIndices.push(index);
        }
      });

      // All tiers already have values — nothing to allocate, exit silently
      if (unassignedIndices.length === 0) {
        setIsAllocating(false);
        return;
      }

      const remainingCapacity = totalCapacity - sumAssigned;

      // Over-allocated: manually entered values already exceed total capacity
      if (remainingCapacity < 0) {
        alert(`⚠️ Over-allocated! Your tiers already sum to ${sumAssigned} which exceeds the total capacity of ${totalCapacity}. Please reduce some tier values first.`);
        setIsAllocating(false);
        return;
      }

      // Distribute the remaining capacity evenly among unassigned tiers
      const baseAmount = Math.floor(remainingCapacity / unassignedIndices.length);
      const leftover = remainingCapacity % unassignedIndices.length;

      const updatedTiers = [...formData.TicketTiers];
      unassignedIndices.forEach((tierIndex, i) => {
        // Give the leftover slot(s) to the last unassigned tier
        updatedTiers[tierIndex] = {
          ...updatedTiers[tierIndex],
          Capacity: (i === unassignedIndices.length - 1 ? baseAmount + leftover : baseAmount).toString()
        };
      });

      setFormData(prev => ({ ...prev, TicketTiers: updatedTiers }));
      setIsAllocating(false);
    }, 500);
  };


  const removeTicketTier = (index) => {
    if (formData.TicketTiers.length > 1) {
      const updatedTiers = formData.TicketTiers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, TicketTiers: updatedTiers }));
    }
  };

  const geocodeAddress = async (addressString) => {
    try {
      // 5-second timeout — don't block the publish on slow geocoding
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (err) {
      // AbortError just means timeout — silently continue with 0,0
      if (err.name !== 'AbortError') console.error("Geocoding failed:", err);
    }
    return { lat: 0, lon: 0 };
  };

  const handleSubmitEvent = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      let lat = formData.Latitude ? parseFloat(formData.Latitude) : 0;
      let lon = formData.Longitude ? parseFloat(formData.Longitude) : 0;

      if (formData.VenueType === 'Physical' && (lat === 0 && lon === 0)) {
        let addressToGeocode = "";
        if (venueSource === 'custom') {
          addressToGeocode = `${formData.StreetAddress}, ${getBarangayName(formData.SelectedBarangay) || ''}, ${getCityName(formData.SelectedCity) || ''}, Philippines`;
        } else if (formData.RegisteredVenueName) {
          addressToGeocode = `${formData.RegisteredVenueName}, Philippines`;
        }

        if (addressToGeocode) {
          const coords = await geocodeAddress(addressToGeocode);
          lat = coords.lat;
          lon = coords.lon;
        }
      }

      const payload = {
        Title: formData.EventTitle,
        Description: formData.Description || formData.EventTitle,
        Category: formData.Category,
        BannerUrl: formData.EventBannerUrl,
        StartDateTime: `${formData.StartDate}T${formData.StartTime}:00Z`,
        EndDateTime: `${formData.EndDate}T${formData.EndTime}:00Z`,
        TicketSalesStart: `${formData.StartDate}T00:00:00Z`,
        TicketSalesEnd: `${formData.StartDate}T${formData.StartTime}:00Z`,
        RequiresTicket: enableTicketing,
        DailyStartTime: `${formData.StartTime}:00`,
        DailyEndTime: `${formData.EndTime}:00`,
        Status: "Pending",
        VenueSourcingMode: venueSource,
        RegisterVenueToDB: venueSource === 'custom',
        VenueId: venueSource === 'registered' ? formData.RegisteredVenueId || null : null,
        VenueName: venueSource === 'registered' ? formData.RegisteredVenueName : (formData.CustomVenueName || formData.StreetAddress),
        VenueType: venueSource === 'registered' ? formData.VenueType : formData.CustomVenueType,
        FloorLevel: formData.FloorLevel,
        WingSection: formData.WingSection,
        ProximityAnchor: formData.ProximityAnchor,
        StreetAddress: formData.StreetAddress,
        Barangay: formData.SelectedBarangay,
        City: formData.SelectedCity,
        Province: formData.SelectedProvince,
        Region: formData.SelectedRegion,
        ZipCode: "",
        Latitude: lat,
        Longitude: lon,
        ContactPerson: formData.ContactPerson,
        ContactNumber: formData.ContactNumber,
        ContactEmail: formData.ContactEmail,
        SquareFootage: formData.SquareFootage ? parseInt(formData.SquareFootage) : 0,
        NumberOfFloors: formData.NumberOfFloors ? parseInt(formData.NumberOfFloors) : 1,
        HasFireExit: formData.HasFireExit,
        HasFireExtinguishers: formData.HasFireExtinguishers,
        MapUrl: formData.MapUrl,
        VenueImages: formData.VenueImages || [],
        AccessType: formData.Privacy,
        VerificationCode: formData.Privacy === 'Private' ? formData.VerificationCode : '',
        MaxCapacity: formData.Capacity ? parseInt(formData.Capacity) : 0,
        TicketTiers: enableTicketing ? formData.TicketTiers.map(t => ({
          TierName: t.Name,
          Price: parseFloat(t.Price || 0),
          OnlineSlots: t.Capacity ? parseInt(t.Capacity) : 0,
          F2FSlots: 0,
          ValidityScope: t.ValidityScope
        })) : []
      };

      // 15-second timeout on the event POST — prevents infinite spinner on Render cold start
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create event: ${errorText}`);
      }

      setShowSuccessModal(true);
      if (addNotification) {
        addNotification('Event Submitted for Review', `"${formData.EventTitle}" has been submitted and is pending admin approval.`);
      }
      setTimeout(() => {
        setActivePanel('events');
      }, 3000);
    } catch (err) {
      if (err.name === 'AbortError') {
        alert("⏱️ The server took too long to respond. The Render backend may be waking up from sleep — please wait 30 seconds and try again.");
      } else {
        alert("Error submitting event: " + err.message);
      }
      setIsSubmitting(false);
    }
  };


  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.EventBannerUrl) newErrors.EventBannerUrl = "Event promotional image is required.";
      if (!formData.EventTitle.trim()) newErrors.EventTitle = "Event title is required.";
      if (formData.EventTitle.length > 100) newErrors.EventTitle = "Title cannot exceed 100 characters.";
      if (!formData.Description.trim()) newErrors.Description = "Description is required.";
      if (formData.Description.length > 1000) newErrors.Description = "Description cannot exceed 1000 characters.";
      if (!formData.Category) {
        newErrors.Category = "Please select a category.";
      } else if (formData.Category === 'Others' && !customCategory.trim()) {
        newErrors.CustomCategory = "Please specify your custom category.";
      }
    }

    if (step === 2) {
      const today = getTodayDateString();
      if (!formData.StartDate) newErrors.StartDate = "Start date is required.";
      if (formData.StartDate && formData.StartDate < today) newErrors.StartDate = "Start date cannot be in the past.";

      if (!formData.EndDate) newErrors.EndDate = "End date is required.";
      if (formData.EndDate && formData.EndDate < formData.StartDate) {
        newErrors.EndDate = "End date cannot be earlier than start date.";
      }

      if (!formData.StartTime) newErrors.StartTime = "Start time is required.";
      if (!formData.EndTime) newErrors.EndTime = "End time is required.";

      if (formData.StartTime && formData.EndTime && formData.StartDate && formData.EndDate) {
        const startMinutes = convertTimeToMinutes(formData.StartTime);
        const endMinutes = convertTimeToMinutes(formData.EndTime);

        // Calculate difference in days
        const d1 = new Date(formData.StartDate + 'T00:00:00');
        const d2 = new Date(formData.EndDate + 'T00:00:00');
        const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // 1-Day Event
          if (endMinutes <= startMinutes) {
            newErrors.EndTime = "End time must be after start time for same-day events.";
          } else if (endMinutes - startMinutes < 30) {
            newErrors.EndTime = "Daily event window must be at least 30 minutes.";
          }
        } else if (diffDays === 1) {
          // 2-Day Event (Overnight allowed)
          if (endMinutes === startMinutes) {
            newErrors.EndTime = "Start and end times cannot be exactly the same.";
          }
          // If endMinutes < startMinutes, it's an overnight event (e.g., 10 PM to 2 AM). We allow it.
        } else if (diffDays > 1) {
          // 3+ Day Event
          if (endMinutes < startMinutes) {
            newErrors.EndTime = "For events longer than 2 days, daily end time must not be before start time.";
          }
        }
      }

      if (enableTicketing) {
        if (!formData.TicketSaleStart) newErrors.TicketSaleStart = "Ticketing start date is required.";
        if (!formData.TicketSaleEnd) newErrors.TicketSaleEnd = "Ticketing end date is required.";
        if (formData.TicketSaleStart && formData.TicketSaleEnd && formData.TicketSaleEnd < formData.TicketSaleStart) {
          newErrors.TicketSaleEnd = "Ticketing end date cannot be before start date.";
        }
        if (formData.EndDate && formData.TicketSaleEnd && formData.TicketSaleEnd > formData.EndDate) {
          newErrors.TicketSaleEnd = "Ticketing end date cannot be after the event end date.";
        }
      }
    }

    if (step === 3) {
      if (formData.VenueType === 'Physical') {
        if (venueSource === 'registered' && !formData.RegisteredVenueId) {
          newErrors.RegisteredVenueId = "Please search and select a registered venue.";
        }
        if (venueSource === 'custom') {
          if (!formData.CustomVenueName.trim()) newErrors.CustomVenueName = "Venue name is required.";
          if (!formData.SelectedRegion) newErrors.SelectedRegion = "Region is required.";
          if (!formData.SelectedProvince && !noProvinceRegion) newErrors.SelectedProvince = "Province is required.";
          if (!formData.SelectedCity) newErrors.SelectedCity = "City is required.";
          if (!formData.SelectedBarangay) newErrors.SelectedBarangay = "Barangay is required.";
          if (!formData.StreetAddress.trim()) newErrors.StreetAddress = "Street address is required.";
          if (formData.VenueImages.length < 3) newErrors.VenueImages = "Please upload at least 3 images for your custom venue.";
          if (!formData.ContactPerson.trim()) newErrors.ContactPerson = "Contact person is required.";
          if (!formData.ContactNumber.trim()) {
            newErrors.ContactNumber = "Contact number is required.";
          } else {
            const phPhone = /^(09\d{9}|\+639\d{9})$/;
            if (!phPhone.test(formData.ContactNumber.trim().replace(/[-\s]/g, ''))) {
              newErrors.ContactNumber = "Enter a valid PH number (e.g. 09171234567 or +639171234567).";
            }
          }
          if (!formData.ContactEmail.trim()) newErrors.ContactEmail = "Contact email is required.";
          if (!formData.SquareFootage || parseInt(formData.SquareFootage) <= 0) newErrors.SquareFootage = "Valid square footage is required.";
          if (!formData.Latitude) newErrors.Latitude = "Latitude is required.";
          if (!formData.Longitude) newErrors.Longitude = "Longitude is required.";
        }
      }
      if (venueSource === 'custom') {
        const cap = parseInt(formData.Capacity);
        if (!cap || cap <= 0 || cap > 100000) {
          newErrors.Capacity = "Capacity must be between 1 and 100,000.";
        }
      }
    }

    if (step === 4 && enableTicketing) {
      if (formData.TicketTiers.length === 0) {
        newErrors.TicketTiers = "At least one ticket tier is required.";
      } else {
        const totalCapacity = parseInt(formData.Capacity) || 0;
        let sumTickets = 0;

        formData.TicketTiers.forEach((tier, index) => {
          if (!tier.Name.trim()) newErrors[`TierName_${index}`] = "Tier name required.";
          if (!tier.Capacity || parseInt(tier.Capacity) <= 0) newErrors[`TierCapacity_${index}`] = "Valid capacity required.";
          if (tier.Price === '' || isNaN(parseFloat(tier.Price)) || parseFloat(tier.Price) < 0) newErrors[`TierPrice_${index}`] = "Valid price required.";
          sumTickets += (parseInt(tier.Capacity) || 0);
        });

        if (totalCapacity > 0 && sumTickets > totalCapacity) {
          newErrors.TicketCapacitySum = `Total ticket allocation (${sumTickets}) exceeds structural capacity limit (${totalCapacity}).`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    // Accept any image type
    if (file.type.startsWith('image/')) {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setIsUploadingBanner(true);

      try {
        // Route through your backend API instead of Cloudinary directly
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Note: Do NOT set 'Content-Type' here, the browser sets it automatically for FormData
          },
          body: formData
        });

        const data = await res.json();

        if (res.ok && data.url) {
          setFormData(prev => ({ ...prev, EventBannerUrl: data.url }));
          // Clear any previous "required" errors
          if (errors.EventBannerUrl) setErrors(prev => ({ ...prev, EventBannerUrl: null }));
        } else {
          console.error("Backend upload failed:", data);
          alert(`Image upload failed: ${data.message || 'Unknown server error'}`);
        }
      } catch (err) {
        console.error("Network error during upload:", err);
        alert("Failed to connect to the server. Please check your internet connection.");
      } finally {
        setIsUploadingBanner(false);
      }
    } else {
      alert("Please upload a valid image file (JPG, PNG, WEBP, etc).");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    console.log("File input change detected");

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("File selected:", file.name, file.type);
      processFile(file);
    } else {
      console.log("No file found in input");
    }

    e.target.value = '';
  };

  const handleVenueImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploadingVenue(true);
    const cloudName = "ditxaqwu6";
    const uploadPreset = "img-c-event";

    const uploadedUrls = [];
    try {
      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", uploadPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: uploadData,
        });
        const data = await res.json();
        if (data.secure_url) uploadedUrls.push(data.secure_url);
      }

      setFormData(prev => ({
        ...prev,
        VenueImages: [...prev.VenueImages, ...uploadedUrls]
      }));
      if (errors.VenueImages) setErrors(prev => ({ ...prev, VenueImages: null }));
    } catch (err) {
      console.error("Cloudinary upload failed", err);
    } finally {
      setIsUploadingVenue(false);
    }
  };

  const removeVenueImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.VenueImages];
      newImages.splice(index, 1);
      return { ...prev, VenueImages: newImages };
    });
  };

  const getCapacitySuggestion = (capacity) => {
    if (!capacity) return null;
    const num = parseInt(capacity);
    if (isNaN(num)) return null;

    if (num <= 50) return "Recommended for small intimate gatherings";
    if (num <= 200) return "Suitable for medium-sized events like workshops or seminars";
    if (num <= 1000) return "Great for large corporate events or mid-sized concerts";
    if (num <= 10000) return "Ideal for major conventions, large exhibitions, or concerts";
    if (num <= 100000) return "Massive capacity suitable for stadium tours or huge festivals";
    return "Ultra-large capacity venue for million-scale global events";
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="w-1/2 p-8 overflow-y-auto border-r border-slate-200 dark:border-slate-800">
        <div className="max-w-xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Event Blueprint</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Step {currentStep} of 4</p>
          </div>

          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${step <= currentStep ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
              />
            ))}
          </div>

          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isUploadingBanner && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all dynamic-dashed flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden ${dragActive ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'} ${isUploadingBanner ? 'opacity-70 pointer-events-none' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={isUploadingBanner}
                />
                {isUploadingBanner ? (
                  <div className="flex flex-col items-center text-purple-600">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm font-semibold">Uploading Media...</p>
                  </div>
                ) : imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>Replace Media Frame</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl mb-3 text-purple-600">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload promotional media asset</p>
                    <p className="text-xs text-slate-400 mt-1">Drag and drop or click to browse (16:9 ratio recommended)</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Accepted formats: .jpg, .png</p>
                  </>
                )}
              </div>
              {errors.EventBannerUrl && <span className="text-xs text-red-500 mt-1 block">{errors.EventBannerUrl}</span>}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  name="EventTitle"
                  maxLength={100}
                  value={formData.EventTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Synergy Hackathon 2026"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-red-500">{errors.EventTitle}</span>
                  <span className="text-xs text-slate-400">{formData.EventTitle.length}/100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  name="Description"
                  maxLength={1000}
                  value={formData.Description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your event scope, objectives, and agenda details..."
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-red-500">{errors.Description}</span>
                  <span className="text-xs text-slate-400">{formData.Description.length}/1000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category Paradigm</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Technology', label: 'Tech & Innovation', icon: Star },
                    { id: 'Music', label: 'Music & Concerts', icon: Music },
                    { id: 'Sports', label: 'Sports & Athletics', icon: Trophy },
                    { id: 'Business', label: 'Business & Corp', icon: Users },
                    { id: 'Birthday', label: 'Birthdays', icon: Gift },
                    { id: 'Wedding', label: 'Weddings', icon: Heart },
                    { id: 'Others', label: 'Others', icon: MoreHorizontal },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, Category: cat.id }));
                          setErrors(prev => ({ ...prev, Category: null, CustomCategory: null }));
                        }}
                        className={`p-3 border rounded-xl flex items-center space-x-2 text-left transition-all ${formData.Category === cat.id
                          ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.Category && <span className="text-xs text-red-500 mt-1 block">{errors.Category}</span>}
              </div>

              {formData.Category === 'Others' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Specify Event Type</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      if (errors.CustomCategory) setErrors(prev => ({ ...prev, CustomCategory: null }));
                    }}
                    placeholder="e.g., Conference, Exhibition, Webinar"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  {errors.CustomCategory && <span className="text-xs text-red-500 mt-1 block">{errors.CustomCategory}</span>}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Privacy Tier</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, Privacy: 'Public' }))}
                    className={`p-4 border rounded-xl flex items-center space-x-3 transition-all ${formData.Privacy === 'Public' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    <Unlock className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Public Event</p>
                      <p className="text-xs text-slate-500">Discoverable by all</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, Privacy: 'Private' }))}
                    className={`p-4 border rounded-xl flex items-center space-x-3 transition-all ${formData.Privacy === 'Private' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    <Lock className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Private Link</p>
                      <p className="text-xs text-slate-500">Invite-only access</p>
                    </div>
                  </button>
                </div>
                {formData.Privacy === 'Private' && (
                  <div className="mt-4 animate-fade-in">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Private Access Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="VerificationCode"
                      value={formData.VerificationCode}
                      onChange={handleInputChange}
                      placeholder="e.g. VIP2026"
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Attendees will need this exact code to view and register for this event.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="StartDate"
                    min={getTodayDateString()}
                    value={formData.StartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm dark:[color-scheme:dark]"
                  />
                  {errors.StartDate && <span className="text-xs text-red-500 mt-1 block">{errors.StartDate}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="StartTime"
                    value={formData.StartTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm dark:[color-scheme:dark]"
                  />
                  {errors.StartTime && <span className="text-xs text-red-500 mt-1 block">{errors.StartTime}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    name="EndDate"
                    min={formData.StartDate || getTodayDateString()}
                    value={formData.EndDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm dark:[color-scheme:dark]"
                  />
                  {errors.EndDate && <span className="text-xs text-red-500 mt-1 block">{errors.EndDate}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    name="EndTime"
                    value={formData.EndTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm dark:[color-scheme:dark]"
                  />
                  {errors.EndTime && <span className="text-xs text-red-500 mt-1 block">{errors.EndTime}</span>}
                </div>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3 mt-2">
                <input
                  type="checkbox"
                  id="enableTicketing"
                  checked={enableTicketing}
                  onChange={(e) => setEnableTicketing(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="enableTicketing" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                  Do you want to manage and distribute tickets online for this event?
                </label>
              </div>

              {enableTicketing && (
                <div className="p-4 border border-purple-100 dark:border-purple-900/50 bg-purple-50/20 dark:bg-purple-950/10 rounded-xl space-y-4 animate-fade-in">
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-400 flex items-center space-x-2">
                    <Ticket className="w-4 h-4" />
                    <span>Online Ticketing Allocation Period</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sales Release Open</label>
                      <input
                        type="date"
                        name="TicketSaleStart"
                        min={getTodayDateString()}
                        value={formData.TicketSaleStart}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white dark:[color-scheme:dark]"
                      />
                      {errors.TicketSaleStart && <span className="text-xs text-red-500 mt-1 block">{errors.TicketSaleStart}</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sales Release Close</label>
                      <input
                        type="date"
                        name="TicketSaleEnd"
                        min={formData.TicketSaleStart || getTodayDateString()}
                        max={formData.EndDate}
                        value={formData.TicketSaleEnd}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white dark:[color-scheme:dark]"
                      />
                      {errors.TicketSaleEnd && <span className="text-xs text-red-500 mt-1 block">{errors.TicketSaleEnd}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Venue Framework Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, VenueType: 'Physical' }))}
                    className={`p-4 border rounded-xl flex items-center space-x-3 transition-all ${formData.VenueType === 'Physical' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    <Map className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Physical Venue</p>
                      <p className="text-xs text-slate-500">On-site structural location</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, VenueType: 'Digital' }))}
                    className={`p-4 border rounded-xl flex items-center space-x-3 transition-all ${formData.VenueType === 'Digital' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    <Unlock className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Digital Broadcast</p>
                      <p className="text-xs text-slate-500">Virtual streaming interface</p>
                    </div>
                  </button>
                </div>
              </div>

              {formData.VenueType === 'Physical' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location Sourcing Paradigm</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setVenueSource('registered')}
                        className={`p-4 border rounded-xl text-left transition-all ${venueSource === 'registered' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800 opacity-60'
                          }`}
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Search Registered Venue</p>
                        <p className="text-xs text-slate-500">Select an approved venue hub</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVenueSource('custom')}
                        className={`p-4 border rounded-xl text-left transition-all ${venueSource === 'custom' ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800 opacity-60'
                          }`}
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Enter Custom Venue</p>
                        <p className="text-xs text-slate-500">Manually deploy configuration</p>
                      </button>
                    </div>
                  </div>

                  {venueSource === 'registered' ? (
                    <div className="space-y-3 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 relative">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Search System Database</label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          placeholder="Type venue complex or facility title..."
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>

                      {searchQuery && venueResults.length > 0 && (
                        <div className="relative w-full mt-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 shadow-xl z-50">
                          {venueResults.map((venue) => {
                            return (
                              <button
                                key={venue.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    RegisteredVenueId: venue.id,
                                    RegisteredVenueName: venue.name,
                                    Capacity: venue.maxCapacity
                                  }));
                                  setSearchQuery('');
                                  setVenueResults([]);
                                  setErrors(prev => ({ ...prev, RegisteredVenueId: null }));
                                }}
                                className="w-full text-left px-4 py-3 text-xs hover:bg-purple-50 dark:hover:bg-purple-950/20 text-slate-700 dark:text-slate-300 transition-colors block"
                              >
                                <div className="font-semibold text-slate-900 dark:text-white">{venue.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{venue.city || 'Verified Venue'}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {isSearching && (
                        <p className="text-[10px] text-slate-400 italic mt-1">Querying database matrix...</p>
                      )}

                      {formData.RegisteredVenueName && (
                        <div className="p-2 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs rounded-md flex justify-between items-center mt-2">
                          <span>Linked Vector: <strong>{formData.RegisteredVenueName}</strong></span>
                          <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, RegisteredVenueId: '', RegisteredVenueName: '' }))} />
                        </div>
                      )}
                      {errors.RegisteredVenueId && <span className="text-xs text-red-500 block mt-1">{errors.RegisteredVenueId}</span>}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                      <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Venue Name</label>
                          <input type="text" name="CustomVenueName" value={formData.CustomVenueName} onChange={handleInputChange} placeholder="e.g. A. Mabini Campus" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                          {errors.CustomVenueName && <span className="text-[10px] text-red-500">{errors.CustomVenueName}</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Venue Type</label>
                          <select name="CustomVenueType" value={formData.CustomVenueType} onChange={handleInputChange} className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {['Indoor Hall', 'Outdoor Field', 'Covered Court', 'Gymnasium', 'Auditorium', 'Conference Room', 'Hotel Ballroom', 'Restaurant / Function Room', 'Open Air / Park', 'Beach / Resort', 'Rooftop', 'Standalone Building / Street Address', 'Other'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                            Region {psgcLoading.regions && <Loader2 size={10} className="animate-spin text-purple-500" />}
                          </label>
                          <select
                            value={psgcSel.regionCode}
                            onChange={e => { selectRegion(e.target.value); setFormData(prev => ({ ...prev, SelectedRegion: e.target.value, SelectedProvince: '', SelectedCity: '', SelectedBarangay: '' })); setBrgySearch(''); }}
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          >
                            <option value="">Select Region</option>
                            {regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                          </select>
                          {errors.SelectedRegion && <span className="text-[10px] text-red-500">{errors.SelectedRegion}</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                            Province {psgcLoading.provinces && <Loader2 size={10} className="animate-spin text-purple-500" />}
                          </label>
                          <select
                            value={psgcSel.provinceCode}
                            disabled={!psgcSel.regionCode || noProvinceRegion}
                            onChange={e => { selectProvince(e.target.value); setFormData(prev => ({ ...prev, SelectedProvince: e.target.value, SelectedCity: '', SelectedBarangay: '' })); setBrgySearch(''); }}
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                          >
                            {noProvinceRegion
                              ? <option value="__direct__">N/A — Province-less Region (e.g. NCR)</option>
                              : <>
                                <option value="">Select Province</option>
                                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                              </>
                            }
                          </select>
                          {errors.SelectedProvince && <span className="text-[10px] text-red-500">{errors.SelectedProvince}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                            City / Municipality {psgcLoading.cities && <Loader2 size={10} className="animate-spin text-purple-500" />}
                          </label>
                          <select
                            value={psgcSel.cityMunCode}
                            disabled={!psgcSel.provinceCode}
                            onChange={e => { selectCity(e.target.value); setFormData(prev => ({ ...prev, SelectedCity: e.target.value, SelectedBarangay: '' })); setBrgySearch(''); }}
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                          >
                            <option value="">Select City / Municipality</option>
                            {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                          </select>
                          {errors.SelectedCity && <span className="text-[10px] text-red-500">{errors.SelectedCity}</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                            Barangay {psgcLoading.barangays && <Loader2 size={10} className="animate-spin text-purple-500" />}
                          </label>
                          <div className="relative">
                            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              placeholder={barangays.length === 0 ? 'Select a city first' : `Search ${barangays.length} barangays...`}
                              value={brgySearch}
                              onChange={e => setBrgySearch(e.target.value)}
                              disabled={barangays.length === 0 || psgcLoading.barangays}
                              className="w-full pl-6 pr-2 py-2 border border-slate-200 dark:border-slate-800 rounded-t-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                            />
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-lg max-h-32 overflow-y-auto">
                            {barangays.filter(b => b.name.toLowerCase().includes(brgySearch.toLowerCase())).map(b => (
                              <button
                                key={b.code}
                                type="button"
                                onClick={() => { selectBarangay(b.code); setBrgySearch(b.name); setFormData(prev => ({ ...prev, SelectedBarangay: b.name })); }}
                                className={`w-full text-left px-2 py-1.5 text-[11px] hover:bg-purple-50 dark:hover:bg-purple-900/20 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${psgcSel.barangayCode === b.code ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold' : 'text-slate-700 dark:text-slate-300'
                                  }`}
                              >
                                {b.name}
                              </button>
                            ))}
                            {barangays.length > 0 && barangays.filter(b => b.name.toLowerCase().includes(brgySearch.toLowerCase())).length === 0 && (
                              <p className="text-[10px] text-slate-400 text-center py-2">No match</p>
                            )}
                          </div>
                          {errors.SelectedBarangay && <span className="text-[10px] text-red-500">{errors.SelectedBarangay}</span>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Street Address Details</label>
                        <input
                          type="text"
                          name="StreetAddress"
                          value={formData.StreetAddress}
                          onChange={handleInputChange}
                          placeholder="House/Building No., Street Name, Corporate Block"
                          className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        {errors.StreetAddress && <span className="text-[10px] text-red-500">{errors.StreetAddress}</span>}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Floor Level</label>
                          <input type="text" name="FloorLevel" value={formData.FloorLevel} onChange={handleInputChange} placeholder="e.g., 3rd Floor" className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Wing/Section</label>
                          <input type="text" name="WingSection" value={formData.WingSection} onChange={handleInputChange} placeholder="e.g., West Wing" className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Proximity Anchor</label>
                          <input type="text" name="ProximityAnchor" value={formData.ProximityAnchor} onChange={handleInputChange} placeholder="e.g., Near Gym" className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Person</label>
                          <input type="text" name="ContactPerson" value={formData.ContactPerson} onChange={handleInputChange} placeholder="Name" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                          {errors.ContactPerson && <span className="text-[10px] text-red-500">{errors.ContactPerson}</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Number <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono select-none">🇵🇭</span>
                            <input
                              type="tel"
                              name="ContactNumber"
                              value={formData.ContactNumber}
                              onChange={(e) => {
                                let raw = e.target.value.replace(/[^\d+]/g, '');
                                if (raw.startsWith('+')) {
                                  raw = '+' + raw.slice(1).replace(/\D/g, '').slice(0, 12);
                                } else {
                                  raw = raw.slice(0, 11);
                                }
                                setFormData(prev => ({ ...prev, ContactNumber: raw }));
                                if (errors.ContactNumber) setErrors(prev => ({ ...prev, ContactNumber: null }));
                              }}
                              placeholder="09171234567"
                              maxLength={13}
                              className={`w-full pl-7 pr-2 p-2 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${errors.ContactNumber
                                ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                                : 'border-slate-200 dark:border-slate-800'
                                }`}
                            />
                          </div>
                          {errors.ContactNumber
                            ? <span className="text-[10px] text-red-500">{errors.ContactNumber}</span>
                            : <span className="text-[10px] text-slate-400">Format: 09XXXXXXXXX or +639XXXXXXXXX</span>
                          }
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                          <input type="email" name="ContactEmail" value={formData.ContactEmail} onChange={handleInputChange} placeholder="Email" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                          {errors.ContactEmail && <span className="text-[10px] text-red-500">{errors.ContactEmail}</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Map URL</label>
                          <input type="url" name="MapUrl" value={formData.MapUrl} onChange={handleInputChange} placeholder="Google Maps link" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Latitude</label>
                          <input type="number" step="any" name="Latitude" value={formData.Latitude} onChange={handleInputChange} placeholder="e.g., 14.5995" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                          {errors.Latitude && <span className="text-[10px] text-red-500">{errors.Latitude}</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Longitude</label>
                          <input type="number" step="any" name="Longitude" value={formData.Longitude} onChange={handleInputChange} placeholder="e.g., 120.9842" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                          {errors.Longitude && <span className="text-[10px] text-red-500">{errors.Longitude}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Square Footage (sqm)</label>
                          <input type="number" name="FloorArea" value={formData.FloorArea} onChange={handleInputChange} placeholder="e.g., 5000" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Parking Slots</label>
                          <input type="number" name="ParkingSlots" value={formData.ParkingSlots} onChange={handleInputChange} placeholder="e.g., 50" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Theater Cap</label>
                          <input type="number" name="CapacityTheater" value={formData.CapacityTheater} onChange={handleInputChange} placeholder="0" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Banquet Cap</label>
                          <input type="number" name="CapacityBanquet" value={formData.CapacityBanquet} onChange={handleInputChange} placeholder="0" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Standing Cap</label>
                          <input type="number" name="CapacityStanding" value={formData.CapacityStanding} onChange={handleInputChange} placeholder="0" className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                      </div>

                      <div className="flex gap-4 mt-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex-wrap">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.HasAircon} onChange={(e) => setFormData(prev => ({ ...prev, HasAircon: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Air Conditioned</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.HasSoundSystem} onChange={(e) => setFormData(prev => ({ ...prev, HasSoundSystem: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sound System</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.HasHoldingRooms} onChange={(e) => setFormData(prev => ({ ...prev, HasHoldingRooms: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Holding Rooms</span>
                        </label>
                      </div>

                      <div className="flex gap-4 mt-2 mb-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.HasFireExit} onChange={(e) => setFormData(prev => ({ ...prev, HasFireExit: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Has Fire Exit</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.HasFireExtinguishers} onChange={(e) => setFormData(prev => ({ ...prev, HasFireExtinguishers: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Has Fire Extinguishers</span>
                        </label>
                      </div>

                      <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Venue Images (Min. 3 required)</label>
                        <div className="flex gap-3 flex-wrap mb-3">
                          {formData.VenueImages.map((src, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                              <img src={src} alt="venue" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeVenueImage(idx)} className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <label className={`w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all ${isUploadingVenue ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploadingVenue ? (
                              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-[10px] text-slate-500 font-medium">Upload</span>
                              </>
                            )}
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleVenueImageUpload} disabled={isUploadingVenue} />
                          </label>
                        </div>
                        {errors.VenueImages && <span className="text-[10px] text-red-500">{errors.VenueImages}</span>}
                      </div>
                    </div>
                  )}
                </>
              )}

              {formData.VenueType === 'Digital' && (
                <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <p className="text-xs text-slate-500">Virtual streaming credentials and stream keys can be linked post-deployment within your event control matrix panel.</p>
                </div>
              )}

              <div className="p-4 bg-purple-50/40 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/40 rounded-xl space-y-3">
                {venueSource === 'registered' ? (
                  <p className="text-xs font-medium text-purple-900 dark:text-purple-400">
                    ✅ <strong>Venue Occupancy Synchronized:</strong> Capacity limits and logistics are automatically inherited from the registered venue profile in the database.
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-medium text-purple-900 dark:text-purple-400">
                      ⚠️ <strong>Organizer Verification Statement:</strong> Are you certain that the parameters selected above correctly map to your physical layout setup and logistics deployment capacity limits?
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Structural Occupancy Capacity Limit</label>
                      <input
                        type="number"
                        name="Capacity"
                        value={formData.Capacity}
                        onChange={handleInputChange}
                        placeholder="e.g., 500"
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                      />
                      {errors.Capacity && <span className="text-xs text-red-500 mt-1 block">{errors.Capacity}</span>}

                      {formData.Capacity && getCapacitySuggestion(formData.Capacity) && (
                        <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-lg flex items-center space-x-2 animate-fade-in">
                          <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">💡 Suggestion:</span>
                          <span className="text-indigo-700 dark:text-indigo-300 text-[10px]">{getCapacitySuggestion(formData.Capacity)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configure Ticket Allocations</h2>
                  <p className="text-xs text-slate-500">Map custom tiers to your dynamic structural capacity.</p>
                </div>
                {enableTicketing && formData.Capacity && parseInt(formData.Capacity) > 0 && (
                  <button
                    type="button"
                    onClick={handleSmartAllocate}
                    disabled={isAllocating}
                    className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {isAllocating ? <Loader2 size={12} className="animate-spin" /> : '✨ Smart Auto-Allocate'}
                  </button>
                )}
              </div>
              {errors.TicketCapacitySum && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-xs text-red-600 dark:text-red-400 animate-fade-in">
                  ⚠️ {errors.TicketCapacitySum}
                </div>
              )}

              {enableTicketing ? (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {formData.TicketTiers.map((tier, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 space-y-3 relative group transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      {formData.TicketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketTier(index)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tier Designation Title</label>
                          <input
                            type="text"
                            value={tier.Name}
                            onChange={(e) => handleTierChange(index, 'Name', e.target.value)}
                            placeholder="VIP, General Admission, etc."
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs text-slate-900 dark:text-white"
                          />
                          {errors[`TierName_${index}`] && <span className="text-[10px] text-red-500">{errors[`TierName_${index}`]}</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Price Vector (PHP)</label>
                          <input
                            type="number"
                            value={tier.Price}
                            onChange={(e) => handleTierChange(index, 'Price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            placeholder="0 for Complimentary"
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs text-slate-900 dark:text-white"
                          />
                          {errors[`TierPrice_${index}`] && <span className="text-[10px] text-red-500">{errors[`TierPrice_${index}`]}</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tier Volume Size Limit</label>
                          <input
                            type="number"
                            value={tier.Capacity}
                            onChange={(e) => handleTierChange(index, 'Capacity', e.target.value)}
                            placeholder="Max allocations allowed"
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs text-slate-900 dark:text-white"
                          />
                          {errors[`TierCapacity_${index}`] && <span className="text-[10px] text-red-500">{errors[`TierCapacity_${index}`]}</span>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Validity Scope Matrix</label>
                          <select
                            value={tier.ValidityScope}
                            onChange={(e) => handleTierChange(index, 'ValidityScope', e.target.value)}
                            className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs text-slate-900 dark:text-white"
                          >
                            <option value="Full Event Access" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Full Event Access Cluster</option>
                            <option value="Day 1 Matrix Only" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Day 1 Matrix Only</option>
                            <option value="Day 2 Matrix Only" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Day 2 Matrix Only</option>
                            <option value="VIP Backstage Pass" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">VIP Backstage Pass Token</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTicketTier}
                    className="w-full py-2.5 border border-dashed border-purple-300 dark:border-purple-800 text-purple-600 rounded-xl text-xs font-medium hover:bg-purple-50/50 dark:hover:bg-purple-950/10 transition-all flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Strategic Tier Allocation</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-500 text-sm">
                  Online ticketing setup is disabled. This event will be processed as free admission/external registration access.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center space-x-1 disabled:opacity-50 transition-opacity text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={currentStep === 4 ? handleSubmitEvent : nextStep}
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center space-x-1 text-sm font-medium transition-colors shadow-lg shadow-purple-600/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span>{currentStep === 4 ? 'Publish Event' : 'Continue'}</span>
              )}
              {!isSubmitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="w-1/2 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(147,51,234,0.08),transparent_50%)]"></div>

        {formData.EventTitle ? (
          <div className="w-full max-w-md scale-95 origin-center transition-all duration-500">
            <TicketPreview
              eventData={{
                title: formData.EventTitle,
                image: formData.EventBannerUrl,
                category: formData.Category === 'Others' ? customCategory : formData.Category,
                startDate: formData.StartDate,
                startTime: formData.StartTime,
                endDate: formData.EndDate,
                endTime: formData.EndTime,
                venueName: venueSource === 'registered' ? formData.RegisteredVenueName || "No Venue Selected" : formData.StreetAddress || "Custom Layout Location",
                region: formData.SelectedRegion,
                province: formData.SelectedProvince,
                city: formData.SelectedCity,
                barangay: formData.SelectedBarangay,
                capacity: formData.Capacity,
                privacy: formData.Privacy,
                accessType: formData.Privacy,
                verificationCode: formData.Privacy === 'Private' ? formData.VerificationCode : '',
                ticketType: enableTicketing && formData.TicketTiers.length > 0 ? formData.TicketTiers[0].ValidityScope : null,
                ticketTiers: enableTicketing ? formData.TicketTiers.map(t => ({ ...t, TierName: t.Name || t.TierName || 'Standard' })) : [],
                venueType: formData.VenueType,
                floorLevel: formData.FloorLevel,
                wingSection: formData.WingSection,
                proximityAnchor: formData.ProximityAnchor,
                streetAddress: formData.StreetAddress,
                ticketId: "https://venu.com/preview"
              }}
            />
          </div>
        ) : (
          <>
            <div className="w-60 h-[420px] bg-white/50 dark:bg-slate-800/30 border border-purple-200 dark:border-purple-800/50 rounded-[36px] relative flex flex-col justify-between p-4 overflow-hidden mt-16 z-10 animate-fade-in shadow-xl shadow-purple-500/5">
              <div className="flex flex-col items-center justify-center pt-10">
                <span className="text-3xl font-semibold text-purple-900 dark:text-white">VENU</span>
                <div className="w-12 h-1 bg-purple-300 dark:bg-purple-700/50 rounded-full mt-2"></div>
                <div className="mt-8 space-y-3 w-full px-2">
                  <div className="h-4 w-full bg-purple-50 dark:bg-slate-700/50 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-purple-50 dark:bg-slate-700/50 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-purple-50 dark:bg-slate-700/50 rounded-md"></div>
                </div>
              </div>
              <div className="text-center pb-6">
                <p className="text-xs text-purple-400 font-medium">Drafting Interface</p>
              </div>
            </div>

            <div className="absolute right-[-10%] top-[-10%] w-[380px] h-[380px] bg-purple-300/10 dark:bg-purple-900/5 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute left-[-5%] bottom-[-5%] w-[280px] h-[280px] bg-blue-300/10 dark:bg-blue-900/5 rounded-full filter blur-3xl"></div>

            <div className="absolute bottom-6 right-6 flex items-center space-x-2 text-[10px] text-slate-400 font-mono tracking-wider uppercase z-20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span>System Ready for Blueprinting</span>
            </div>
          </>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl transform scale-100 animate-slide-up relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Event Published!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Congratulations and good luck to your event! Your blueprint has been successfully dispatched to the global network.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                if (setEditEvent) setEditEvent(null);
                if (setActivePanel) setActivePanel('events');
              }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}