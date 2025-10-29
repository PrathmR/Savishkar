import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AddEvent = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const qrFileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [eventType, setEventType] = useState('individual');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: 'Technical',
    department: 'ECE',
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
    paymentInstructions: ''
  });

  const categories = ['Technical', 'Non-Technical', 'Cultural'];
  const departments = ['ECE', 'CSE', 'Mech', 'Civil', 'AIML', 'Applied Science', 'MBA', 'Common'];

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const { data } = await API.post('/events/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: data.imageUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setQrPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload QR code
    setUploadingQR(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const { data } = await API.post('/events/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, paymentQRCode: data.imageUrl }));
      toast.success('QR code uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload QR code');
      setQrPreview(null);
    } finally {
      setUploadingQR(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty arrays
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

      await API.post('/events', cleanedData);
      toast.success('Event created successfully!');
      navigate('/admin/events');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/admin/events" className="inline-flex items-center mb-6 transition-colors font-bold" style={{ color: '#5C4033' }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h1 className="text-3xl font-bold mb-6" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
            Create New Event
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Event Name *</label>
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
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Short Description *</label>
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
                <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Full Description *</label>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                    style={{ color: '#2C1810' }}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} style={{ backgroundColor: '#FEF3E2', color: '#2C1810' }}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="input-field"
                    style={{ color: '#2C1810' }}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept} style={{ backgroundColor: '#FEF3E2', color: '#2C1810' }}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Event Image</label>
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
                          className="absolute top-2 right-2 p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: '#a83232', color: '#FEF3E2' }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors disabled:opacity-50"
                        style={{ borderColor: 'rgba(250, 129, 47, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-3" style={{ borderColor: '#FA812F' }}></div>
                            <p style={{ color: '#5C4033' }}>Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mb-3" style={{ color: '#FA812F' }} />
                            <p className="font-medium" style={{ color: '#5C4033' }}>Click to upload image</p>
                            <p className="text-sm mt-1" style={{ color: 'rgba(92, 64, 51, 0.7)' }}>PNG, JPG, GIF up to 10MB</p>
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
              <h2 className="text-xl font-semibold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Date *</label>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Time *</label>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Venue *</label>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Max Participants *</label>
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Registration Fee (₹)</label>
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
              <h2 className="text-xl font-semibold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Team Configuration</h2>
              
              {/* Event Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#5C4033' }}>Event Type *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEventType('individual');
                      setFormData(prev => ({ ...prev, teamSize: { min: 1, max: 1 } }));
                    }}
                    className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all"
                    style={eventType === 'individual' 
                      ? { background: 'linear-gradient(to right, #5C4033, #8b4513)', color: '#FEF3E2', boxShadow: '0 4px 12px rgba(92, 64, 51, 0.4)' }
                      : { backgroundColor: 'rgba(250, 129, 47, 0.1)', color: '#5C4033' }
                    }
                  >
                    Individual Event
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEventType('team');
                      setFormData(prev => ({ ...prev, teamSize: { min: 2, max: 4 } }));
                    }}
                    className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all"
                    style={eventType === 'team'
                      ? { background: 'linear-gradient(to right, #5C4033, #8b4513)', color: '#FEF3E2', boxShadow: '0 4px 12px rgba(92, 64, 51, 0.4)' }
                      : { backgroundColor: 'rgba(250, 129, 47, 0.1)', color: '#5C4033' }
                    }
                  >
                    Team Event
                  </button>
                </div>
              </div>

              {/* Team Size Inputs - Only show for team events */}
              {eventType === 'team' && (
                <div className="space-y-4 p-4 rounded-lg border" style={{ backgroundColor: 'rgba(250, 177, 47, 0.1)', borderColor: 'rgba(250, 129, 47, 0.3)' }}>
                  <p className="text-sm" style={{ color: '#5C4033' }}>Configure team size requirements</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Minimum Team Members *</label>
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
                      <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Maximum Team Members *</label>
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
              <h2 className="text-xl font-semibold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Prizes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>1st Prize</label>
                  <input
                    type="text"
                    value={formData.prizes.first}
                    onChange={(e) => handleNestedChange('prizes', 'first', e.target.value)}
                    className="input-field"
                    placeholder="₹10,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>2nd Prize</label>
                  <input
                    type="text"
                    value={formData.prizes.second}
                    onChange={(e) => handleNestedChange('prizes', 'second', e.target.value)}
                    className="input-field"
                    placeholder="₹5,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>3rd Prize</label>
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
                <h2 className="text-xl font-semibold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Rules & Regulations</h2>
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
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: '#a83232' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Eligibility */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Eligibility Criteria</h2>
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
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: '#a83232' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Payment QR Code Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Payment Details (Optional)</h2>
              <p className="text-sm" style={{ color: '#5C4033' }}>Configure event-specific payment QR code and details. If not provided, default payment details will be used.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Payment QR Code</label>
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
                          className="absolute top-2 right-2 p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: '#a83232', color: '#FEF3E2' }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => qrFileInputRef.current?.click()}
                        disabled={uploadingQR}
                        className="w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors disabled:opacity-50"
                        style={{ borderColor: 'rgba(250, 129, 47, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        {uploadingQR ? (
                          <>
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-3" style={{ borderColor: '#FA812F' }}></div>
                            <p style={{ color: '#5C4033' }}>Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mb-3" style={{ color: '#FA812F' }} />
                            <p className="font-medium" style={{ color: '#5C4033' }}>Click to upload QR code</p>
                            <p className="text-sm mt-1" style={{ color: 'rgba(92, 64, 51, 0.7)' }}>PNG, JPG up to 10MB</p>
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
                    <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>UPI ID</label>
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
                    <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Account Name</label>
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
                    <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Payment Instructions</label>
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

            {/* Coordinators */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Event Coordinators</h2>
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
                    <h3 className="font-semibold" style={{ color: '#5C4033' }}>Coordinator {index + 1}</h3>
                    {formData.coordinators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCoordinator(index)}
                        className="p-1 rounded transition-colors"
                        style={{ color: '#a83232' }}
                      >
                        <X className="w-5 h-5" />
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
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2" style={{ borderColor: '#FEF3E2' }}></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Event</span>
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

export default AddEvent;
