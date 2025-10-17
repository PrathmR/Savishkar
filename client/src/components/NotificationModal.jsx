import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

const NotificationModal = ({ isOpen, onClose, title, message, icon: Icon, type = 'success' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Define colors and default icons based on type - beige, brown, white, black only
  const typeConfig = {
    success: {
      bgColor: 'bg-gradient-to-r from-[#5C4033] to-[#8b4513]',
      hoverColor: 'hover:from-[#4a3326] hover:to-[#6d3710]',
      textColor: 'text-[#5C4033]',
      borderColor: 'border-[#8b4513]',
      defaultIcon: CheckCircle,
    },
    error: {
      bgColor: 'bg-gradient-to-r from-[#2C1810] to-[#000000]',
      hoverColor: 'hover:from-[#1a0f0a] hover:to-[#000000]',
      textColor: 'text-[#2C1810]',
      borderColor: 'border-[#2C1810]',
      defaultIcon: AlertCircle,
    },
    warning: {
      bgColor: 'bg-gradient-to-r from-[#8b4513] to-[#5C4033]',
      hoverColor: 'hover:from-[#6d3710] hover:to-[#4a3326]',
      textColor: 'text-[#8b4513]',
      borderColor: 'border-[#8b4513]',
      defaultIcon: AlertTriangle,
    },
    info: {
      bgColor: 'bg-gradient-to-r from-[#5C4033] to-[#2C1810]',
      hoverColor: 'hover:from-[#4a3326] hover:to-[#1a0f0a]',
      textColor: 'text-[#5C4033]',
      borderColor: 'border-[#5C4033]',
      defaultIcon: Info,
    },
  };

  const config = typeConfig[type] || typeConfig.success;
  const DisplayIcon = Icon || config.defaultIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(92, 64, 51, 0.7)' }}
        onClick={onClose}
      />
      
      {/* Modal - Centered notification */}
      <div 
        className={`relative rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border-4 ${config.borderColor}`}
        style={{ backgroundColor: '#FEF3E2' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: '#5C4033' }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          {/* Icon - Colored circular background */}
          <div className={`flex-shrink-0 w-14 h-14 ${config.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
            <DisplayIcon size={28} style={{ color: '#FEF3E2', strokeWidth: 2.5 }} />
          </div>

          {/* Text Content */}
          <div className="flex-1 pt-1">
            <h3 
              className={`text-xl font-bold ${config.textColor} mb-2`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {title || 'Notification'}
            </h3>
            <p className="text-base leading-relaxed" style={{ color: '#5C4033' }}>
              {message || 'Action completed successfully'}
            </p>
          </div>
        </div>

        {/* OK Button - Colored with rounded corners */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className={`px-10 py-2.5 ${config.bgColor} ${config.hoverColor} font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg`}
            style={{ fontFamily: 'Georgia, serif', color: '#FEF3E2' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
