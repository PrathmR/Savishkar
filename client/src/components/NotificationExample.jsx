import { useNotification } from '../context/NotificationContext';
import { Download, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Example component showing how to use the notification modal
const NotificationExample = () => {
  const { showNotification } = useNotification();

  const handleShowNotification = () => {
    showNotification({
      title: 'Good news Mac users!',
      message: 'This software is now available for download.',
      icon: Download,
    });
  };

  const handleSuccessNotification = () => {
    showNotification({
      title: 'Success!',
      message: 'Your operation completed successfully.',
      icon: CheckCircle,
    });
  };

  const handleErrorNotification = () => {
    showNotification({
      title: 'Error Occurred',
      message: 'Something went wrong. Please try again.',
      icon: AlertCircle,
    });
  };

  const handleInfoNotification = () => {
    showNotification({
      title: 'Information',
      message: 'Here is some important information for you.',
      icon: Info,
    });
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">Notification Examples</h2>
      
      <button
        onClick={handleShowNotification}
        className="btn-primary"
      >
        Show Download Notification
      </button>

      <button
        onClick={handleSuccessNotification}
        className="btn-primary ml-4"
      >
        Show Success Notification
      </button>

      <button
        onClick={handleErrorNotification}
        className="btn-primary ml-4"
      >
        Show Error Notification
      </button>

      <button
        onClick={handleInfoNotification}
        className="btn-primary ml-4"
      >
        Show Info Notification
      </button>
    </div>
  );
};

export default NotificationExample;
