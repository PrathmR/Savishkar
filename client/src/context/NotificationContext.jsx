import { createContext, useContext, useState } from 'react';
import NotificationModal from '../components/NotificationModal';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    icon: null,
    type: 'success', // success, error, info, warning
  });

  const showNotification = ({ title, message, icon, type = 'success' }) => {
    setNotification({
      isOpen: true,
      title,
      message,
      icon,
      type,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        icon={notification.icon}
        type={notification.type}
      />
    </NotificationContext.Provider>
  );
};
