import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const AnnouncementBar = () => {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !settings?.announcementBarActive) return null;

  return (
    <div className="announcement-bar">
      <div className="container bar-content">
        <Sparkles size={14} className="gold-text" style={{ flexShrink: 0 }} />
        <span style={{ lineHeight: '1.35', padding: '0 8px' }}>{settings.announcementBarText}</span>
        <button
          className="close-btn"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
