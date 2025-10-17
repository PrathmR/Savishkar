# Notification Modal Usage Guide

## Overview
A custom notification modal component that displays centered on the screen with a modern design matching the provided reference image.

## Features
- ✅ Centered modal that appears in the middle of the screen
- ✅ Single "OK" button to dismiss
- ✅ Backdrop overlay with blur effect
- ✅ Smooth scale-in animation
- ✅ Custom icon support
- ✅ Responsive design
- ✅ Prevents body scroll when open

## How to Use

### 1. Basic Usage in Any Component

```jsx
import { useNotification } from '../context/NotificationContext';
import { Download } from 'lucide-react';

function MyComponent() {
  const { showNotification } = useNotification();

  const handleClick = () => {
    showNotification({
      title: 'Good news Mac users!',
      message: 'This software is now available for download.',
      icon: Download, // Optional: any Lucide icon
    });
  };

  return (
    <button onClick={handleClick}>
      Show Notification
    </button>
  );
}
```

### 2. Different Notification Types

```jsx
import { CheckCircle, AlertCircle, Info, Download } from 'lucide-react';

// Success notification
showNotification({
  title: 'Success!',
  message: 'Your operation completed successfully.',
  icon: CheckCircle,
});

// Error notification
showNotification({
  title: 'Error Occurred',
  message: 'Something went wrong. Please try again.',
  icon: AlertCircle,
});

// Info notification
showNotification({
  title: 'Information',
  message: 'Here is some important information for you.',
  icon: Info,
});

// Download notification (like the reference image)
showNotification({
  title: 'Good news Mac users!',
  message: 'This software is now available for download.',
  icon: Download,
});
```

### 3. Without Icon

```jsx
showNotification({
  title: 'Simple Notification',
  message: 'This notification has no icon.',
  // icon is optional - will use Download icon by default
});
```

## Component Structure

### NotificationModal Component
- **Location**: `client/src/components/NotificationModal.jsx`
- **Props**:
  - `isOpen` (boolean): Controls visibility
  - `onClose` (function): Callback when modal closes
  - `title` (string): Notification title
  - `message` (string): Notification message
  - `icon` (Component): Lucide icon component (optional)

### NotificationContext
- **Location**: `client/src/context/NotificationContext.jsx`
- **Methods**:
  - `showNotification({ title, message, icon })`: Display a notification
  - `hideNotification()`: Hide the current notification (usually not needed as OK button handles this)

## Styling

The notification uses:
- **Background**: Gradient from `#5B7BA6` to `#4A5F7F` (matching reference image)
- **Icon Container**: `#3B4F6B` background
- **OK Button**: `#3B4F6B` background with hover effect
- **Animation**: Scale-in effect with fade
- **Position**: Fixed center of viewport
- **Backdrop**: Black with 60% opacity and blur

## Example Integration

See `client/src/components/NotificationExample.jsx` for a complete working example with multiple notification types.

## Notes

- The notification is already integrated into `App.jsx` via `NotificationProvider`
- Only one notification can be shown at a time
- The modal prevents body scrolling when open
- Clicking the backdrop or OK button closes the notification
- The close (X) button in the top-right also dismisses the notification
