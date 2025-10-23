import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['general', 'documents', 'email', 'payment', 'other'],
    default: 'general'
  },
  isPublic: {
    type: Boolean,
    default: false // Whether this setting can be accessed by non-admins
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster lookups
settingsSchema.index({ key: 1 });
settingsSchema.index({ category: 1 });

// Static method to get a setting by key
settingsSchema.statics.get = async function(key, defaultValue = null) {
  try {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

// Static method to set a setting
settingsSchema.statics.set = async function(key, value, options = {}) {
  try {
    const setting = await this.findOneAndUpdate(
      { key },
      { 
        value,
        description: options.description || '',
        category: options.category || 'general',
        isPublic: options.isPublic || false,
        updatedBy: options.updatedBy || null
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );
    return setting;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
};

// Static method to get multiple settings by category
settingsSchema.statics.getByCategory = async function(category) {
  try {
    const settings = await this.find({ category });
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  } catch (error) {
    console.error(`Error getting settings for category ${category}:`, error);
    return {};
  }
};

// Static method to get all public settings
settingsSchema.statics.getPublic = async function() {
  try {
    const settings = await this.find({ isPublic: true });
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting public settings:', error);
    return {};
  }
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
