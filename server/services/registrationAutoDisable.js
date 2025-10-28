import Settings from '../models/Settings.js';

class RegistrationAutoDisable {
  constructor() {
    this.scheduledTime = null;
    this.checkInterval = null;
    this.hasExecuted = false;
  }

  /**
   * Initialize the auto-disable scheduler
   */
  async start() {
    console.log('🕐 Starting Registration Auto-Disable Scheduler...');
    
    try {
      // Get scheduled time from settings (default: Nov 11, 2025 11:59 PM IST)
      const scheduledTimeStr = await Settings.get(
        'registration_auto_disable_time',
        '2025-11-11T23:59:00+05:30'
      );
      
      this.scheduledTime = new Date(scheduledTimeStr);
      
      console.log(`📅 Registration will auto-disable at: ${this.scheduledTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
      
      // Check if already past the scheduled time
      const now = new Date();
      if (now >= this.scheduledTime) {
        console.log('⚠️  Scheduled time has already passed. Disabling registration now...');
        await this.disableRegistration();
        return;
      }
      
      // Calculate time until execution
      const timeUntil = this.scheduledTime - now;
      const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
      const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
      
      console.log(`⏰ Time until auto-disable: ${hoursUntil}h ${minutesUntil}m`);
      
      // Check every minute if it's time to disable
      this.checkInterval = setInterval(() => {
        this.checkAndDisable();
      }, 60000); // Check every minute
      
      console.log('✅ Registration Auto-Disable Scheduler started successfully');
    } catch (error) {
      console.error('❌ Failed to start Registration Auto-Disable Scheduler:', error);
    }
  }

  /**
   * Check if it's time to disable and execute
   */
  async checkAndDisable() {
    try {
      if (this.hasExecuted) {
        return;
      }

      const now = new Date();
      
      if (now >= this.scheduledTime) {
        console.log('⏰ Scheduled time reached! Disabling user registration...');
        await this.disableRegistration();
        
        // Stop checking after execution
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
      }
    } catch (error) {
      console.error('Error checking auto-disable schedule:', error);
    }
  }

  /**
   * Disable user registration
   */
  async disableRegistration() {
    try {
      if (this.hasExecuted) {
        console.log('⚠️  Registration already disabled by scheduler');
        return;
      }

      await Settings.set('user_registration_disabled', 'true', {
        description: 'Automatically disabled by scheduler at scheduled time',
        category: 'general',
        isPublic: false,
        updatedBy: null
      });

      this.hasExecuted = true;
      
      console.log('✅ User registration DISABLED automatically by scheduler');
      console.log('📝 Admins can still register users manually');
    } catch (error) {
      console.error('❌ Failed to disable registration:', error);
    }
  }

  /**
   * Update the scheduled time
   */
  async updateScheduledTime(newTime) {
    try {
      const newDate = new Date(newTime);
      
      if (isNaN(newDate.getTime())) {
        throw new Error('Invalid date format');
      }

      await Settings.set(
        'registration_auto_disable_time',
        newDate.toISOString(),
        {
          description: 'Scheduled time for automatic registration disable',
          category: 'general',
          isPublic: false
        }
      );

      this.scheduledTime = newDate;
      this.hasExecuted = false;

      console.log(`✅ Scheduled time updated to: ${newDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
      
      return {
        success: true,
        scheduledTime: newDate
      };
    } catch (error) {
      console.error('Error updating scheduled time:', error);
      throw error;
    }
  }

  /**
   * Get current scheduled time
   */
  getScheduledTime() {
    return {
      scheduledTime: this.scheduledTime,
      hasExecuted: this.hasExecuted,
      timeRemaining: this.hasExecuted ? 0 : Math.max(0, this.scheduledTime - new Date())
    };
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('🛑 Stopping Registration Auto-Disable Scheduler...');
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    console.log('✅ Registration Auto-Disable Scheduler stopped');
  }
}

// Create singleton instance
const registrationAutoDisable = new RegistrationAutoDisable();

export default registrationAutoDisable;
