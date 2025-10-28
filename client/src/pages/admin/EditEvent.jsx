import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Upload, Save } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const qrFileInputRef = useRef(null);
  const multiQRFileInputRefs = useRef([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [uploadingMultiQR, setUploadingMultiQR] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [eventType, setEventType] = useState('individual');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: 'Technical',
    department: 'CSE',
    date: '',
    time: '',
    venue: '',
    maxParticipants: '',
    registrationFee: 0,
    teamSize: { min: 1, max: 1 },
    prizes: { first: '', second: '', third: '' },
    image: '',
    rules: [''],
    eligibility: [''],
    coordinators: [{ name: '', phone: '', email: '' }],
    paymentQRCode: '',
    paymentUPI: '',
    paymentAccountName: '',
    paymentInstructions: '',
    qrCodes: [],
    currentQRIndex: 0
  });

  const categories = ['Technical', 'Non-Technical', 'Cultural'];
  const departments = ['CSE', 'AIML', 'ECE', 'Mechanical', 'Civil', 'MBA', 'Applied Science', 'Common'];

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await API.get(`/events/${id}`);
      const event = data.event;
      
      // Format date for input field
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      const teamSizeData = event.teamSize || { min: 1, max: 1 };
      const isTeamEvent = teamSizeData.min > 1 || teamSizeData.max > 1;
      setEventType(isTeamEvent ? 'team' : 'individual');
      
      setFormData({
        name: event.name || '',
        description: event.description || '',
        shortDescription: event.shortDescription || '',
        category: event.category || 'Technical',
        department: event.department || 'CSE',
        date: formattedDate,
        time: event.time || '',
        venue: event.venue || '',
        maxParticipants: event.maxParticipants || '',
        registrationFee: event.registrationFee || 0,
        teamSize: teamSizeData,
        prizes: event.prizes || { first: '', second: '', third: '' },
        image: event.image || '',
        rules: event.rules?.length > 0 ? event.rules : [''],
        eligibility: event.eligibility?.length > 0 ? event.eligibility : [''],
        coordinators: event.coordinators?.length > 0 ? event.coordinators : [{ name: '', phone: '', email: '' }],
        paymentQRCode: event.paymentQRCode || '',
        paymentUPI: event.paymentUPI || '',
        paymentAccountName: event.paymentAccountName || '',
        paymentInstructions: event.paymentInstructions || '',
        qrCodes: event.qrCodes || [],
        currentQRIndex: event.currentQRIndex || 0
      });
      
      if (event.image) {
        setImagePreview(getImageUrl(event.image));
      }
      
      if (event.paymentQRCode) {
        setQrPreview(getImageUrl(event.paymentQRCode));
      }
    } catch (error) {
      toast.error('Failed to load event');
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleCoordinatorChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      coordinators: prev.coordinators.map((coord, i) => 
        i === index ? { ...coord, [field]: value } : coord
      )
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addCoordinator = () => {
    setFormData(prev => ({
      ...prev,
      coordinators: [...prev.coordinators, { name: '', phone: '', email: '' }]
    }));
  };

  const removeCoordinator = (index) => {
    setFormData(prev => ({
      ...prev,
      coordinators: prev.coordinators.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      console.log('Uploading event image...');
      const { data } = await API.post('/events/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Upload response:', data);
      console.log('Image URL:', data.imageUrl);
      setFormData(prev => ({ ...prev, image: data.imageUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to upload image');
      setImagePreview(formData.image);
    } finally {
      setUploading(false);
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingQR(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      console.log('Uploading payment QR code...');
      const { data } = await API.post('/events/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('QR Upload response:', data);
      setFormData(prev => ({ ...prev, paymentQRCode: data.imageUrl }));
      toast.success('QR code uploaded successfully!');
    } catch (error) {
      console.error('QR Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload QR code');
      setQrPreview(formData.paymentQRCode);
    } finally {
      setUploadingQR(false);
    }
  };

  // Multiple QR Code handlers
  const addQRCode = () => {
    setFormData(prev => ({
      ...prev,
      qrCodes: [...prev.qrCodes, {
        qrCodeUrl: '',
        upiId: '',
        accountName: '',
        maxUsage: 40,
        usageCount: 0,
        isActive: true
      }]
    }));
  };

  const removeQRCode = (index) => {
    setFormData(prev => ({
      ...prev,
      qrCodes: prev.qrCodes.filter((_, i) => i !== index)
    }));
  };

  const handleQRCodeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      qrCodes: prev.qrCodes.map((qr, i) => 
        i === index ? { ...qr, [field]: value } : qr
      )
    }));
  };

  const handleMultiQRUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setUploadingMultiQR(prev => ({ ...prev, [index]: true }));
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const { data } = await API.post('/events/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleQRCodeChange(index, 'qrCodeUrl', data.imageUrl);
      toast.success(`QR code ${index + 1} uploaded successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload QR code');
    } finally {
      setUploadingMultiQR(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const cleanedData = {
        ...formData,
        rules: formData.rules.filter(r => r.trim()),
        eligibility: formData.eligibility.filter(e => e.trim()),
        coordinators: formData.coordinators.filter(c => c.name && c.phone && c.email),
        maxParticipants: parseInt(formData.maxParticipants),
        registrationFee: parseFloat(formData.registrationFee),
        teamSize: {
          min: parseInt(formData.teamSize.min),
          max: parseInt(formData.teamSize.max)
        }
      };

      console.log('Saving event with data:', cleanedData);
      console.log('Image URL being saved:', cleanedData.image);
      
      const response = await API.put(`/events/${id}`, cleanedData);
      console.log('Save response:', response.data);
      
      toast.success('Event updated successfully!');
      navigate('/admin/events');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/admin/events" className="inline-flex items-center text-white hover:text-gray-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h1 className="text-3xl font-bold mb-6 text-white">
            Edit Event
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Event Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Short Description *</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Brief one-line description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Full Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                    style={{ color: '#ffffff' }}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="input-field"
                    style={{ color: '#ffffff' }}
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept} style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Event Image</label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: '' }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-400 transition-colors disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-3"></div>
                            <p className="text-white">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-white font-medium">Click to upload image</p>
                            <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Venue *</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Max Participants *</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    className="input-field"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Registration Fee (₹)</label>
                  <input
                    type="number"
                    name="registrationFee"
                    value={formData.registrationFee}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Team Configuration */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Team Configuration</h2>
              
              {/* Event Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-3 text-white">Event Type *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEventType('individual');
                      setFormData(prev => ({ ...prev, teamSize: { min: 1, max: 1 } }));
                    }}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      eventType === 'individual'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Individual Event
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEventType('team');
                      setFormData(prev => ({ ...prev, teamSize: { min: 2, max: 4 } }));
                    }}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      eventType === 'team'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Team Event
                  </button>
                </div>
              </div>

              {/* Team Size Inputs - Only show for team events */}
              {eventType === 'team' && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-300">Configure team size requirements</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Minimum Team Members *</label>
                      <input
                        type="number"
                        value={formData.teamSize.min}
                        onChange={(e) => handleNestedChange('teamSize', 'min', e.target.value)}
                        className="input-field"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Maximum Team Members *</label>
                      <input
                        type="number"
                        value={formData.teamSize.max}
                        onChange={(e) => handleNestedChange('teamSize', 'max', e.target.value)}
                        className="input-field"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prizes */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Prizes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">1st Prize</label>
                  <input
                    type="text"
                    value={formData.prizes.first}
                    onChange={(e) => handleNestedChange('prizes', 'first', e.target.value)}
                    className="input-field"
                    placeholder="₹10,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">2nd Prize</label>
                  <input
                    type="text"
                    value={formData.prizes.second}
                    onChange={(e) => handleNestedChange('prizes', 'second', e.target.value)}
                    className="input-field"
                    placeholder="₹5,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">3rd Prize</label>
                  <input
                    type="text"
                    value={formData.prizes.third}
                    onChange={(e) => handleNestedChange('prizes', 'third', e.target.value)}
                    className="input-field"
                    placeholder="₹2,000"
                  />
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Rules & Regulations</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('rules')}
                  className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Rule</span>
                </button>
              </div>
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleArrayChange('rules', index, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`Rule ${index + 1}`}
                  />
                  {formData.rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('rules', index)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Eligibility */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Eligibility Criteria</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('eligibility')}
                  className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Criteria</span>
                </button>
              </div>
              {formData.eligibility.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('eligibility', index, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`Criteria ${index + 1}`}
                  />
                  {formData.eligibility.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('eligibility', index)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Payment QR Code Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Payment Details (Optional)</h2>
              <p className="text-sm text-gray-300">Configure event-specific payment QR code and details. If not provided, default payment details will be used.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Payment QR Code (Legacy)</label>
                  <div className="space-y-3">
                    {qrPreview ? (
                      <div className="relative">
                        <img 
                          src={qrPreview} 
                          alt="QR Preview" 
                          className="w-full h-64 object-contain bg-white rounded-lg p-4"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setQrPreview(null);
                            setFormData(prev => ({ ...prev, paymentQRCode: '' }));
                            if (qrFileInputRef.current) qrFileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => qrFileInputRef.current?.click()}
                        disabled={uploadingQR}
                        className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-400 transition-colors disabled:opacity-50"
                      >
                        {uploadingQR ? (
                          <>
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-3"></div>
                            <p className="text-white">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-white font-medium">Click to upload QR code</p>
                            <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={qrFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQRUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">UPI ID</label>
                    <input
                      type="text"
                      name="paymentUPI"
                      value={formData.paymentUPI}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="example@upi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Account Name</label>
                    <input
                      type="text"
                      name="paymentAccountName"
                      value={formData.paymentAccountName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Account holder name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Payment Instructions</label>
                    <textarea
                      name="paymentInstructions"
                      value={formData.paymentInstructions}
                      onChange={handleChange}
                      className="input-field min-h-[100px]"
                      placeholder="Special instructions for this event's payment"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Multiple QR Codes Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white">Multiple QR Codes (Auto-Switching)</h2>
                  <p className="text-sm text-gray-300 mt-1">Add multiple QR codes that automatically switch after reaching the usage limit (default: 40 payments per QR)</p>
                </div>
                <button
                  type="button"
                  onClick={addQRCode}
                  className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add QR Code</span>
                </button>
              </div>

              {formData.qrCodes.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-400">No QR codes added yet. Click "Add QR Code" to get started.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.qrCodes.map((qr, index) => (
                    <div key={index} className="glass-effect p-6 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          QR Code {index + 1}
                          {index === formData.currentQRIndex && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">Active</span>
                          )}
                          {qr.usageCount >= qr.maxUsage && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">Full</span>
                          )}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeQRCode(index)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <X className="w-5 h-5 text-red-500" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* QR Code Image */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">QR Code Image *</label>
                          {qr.qrCodeUrl ? (
                            <div className="relative">
                              <img 
                                src={getImageUrl(qr.qrCodeUrl)} 
                                alt={`QR Code ${index + 1}`} 
                                className="w-full h-48 object-contain bg-white rounded-lg p-4"
                              />
                              <button
                                type="button"
                                onClick={() => handleQRCodeChange(index, 'qrCodeUrl', '')}
                                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => multiQRFileInputRefs.current[index]?.click()}
                              disabled={uploadingMultiQR[index]}
                              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-400 transition-colors disabled:opacity-50"
                            >
                              {uploadingMultiQR[index] ? (
                                <>
                                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-3"></div>
                                  <p className="text-white">Uploading...</p>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                  <p className="text-white font-medium">Click to upload</p>
                                  <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                </>
                              )}
                            </button>
                          )}
                          <input
                            ref={el => multiQRFileInputRefs.current[index] = el}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMultiQRUpload(e, index)}
                            className="hidden"
                          />
                        </div>

                        {/* QR Code Details */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white">UPI ID</label>
                            <input
                              type="text"
                              value={qr.upiId || ''}
                              onChange={(e) => handleQRCodeChange(index, 'upiId', e.target.value)}
                              className="input-field"
                              placeholder="example@upi"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white">Account Name</label>
                            <input
                              type="text"
                              value={qr.accountName || ''}
                              onChange={(e) => handleQRCodeChange(index, 'accountName', e.target.value)}
                              className="input-field"
                              placeholder="Account holder name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 text-white">Max Usage (Payments)</label>
                            <input
                              type="number"
                              value={qr.maxUsage || 40}
                              onChange={(e) => handleQRCodeChange(index, 'maxUsage', parseInt(e.target.value) || 40)}
                              className="input-field"
                              min="1"
                              placeholder="40"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Current usage: {qr.usageCount || 0} / {qr.maxUsage || 40}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`qr-active-${index}`}
                              checked={qr.isActive !== false}
                              onChange={(e) => handleQRCodeChange(index, 'isActive', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={`qr-active-${index}`} className="text-sm text-white">
                              Active
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinators */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Event Coordinators</h2>
                <button
                  type="button"
                  onClick={addCoordinator}
                  className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Coordinator</span>
                </button>
              </div>
              {formData.coordinators.map((coord, index) => (
                <div key={index} className="glass-effect p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-white">Coordinator {index + 1}</h3>
                    {formData.coordinators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCoordinator(index)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={coord.name}
                      onChange={(e) => handleCoordinatorChange(index, 'name', e.target.value)}
                      className="input-field"
                      placeholder="Name"
                    />
                    <input
                      type="tel"
                      value={coord.phone}
                      onChange={(e) => handleCoordinatorChange(index, 'phone', e.target.value)}
                      className="input-field"
                      placeholder="Phone"
                    />
                    <input
                      type="email"
                      value={coord.email}
                      onChange={(e) => handleCoordinatorChange(index, 'email', e.target.value)}
                      className="input-field"
                      placeholder="Email"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/events')}
                className="flex-1 btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditEvent;
