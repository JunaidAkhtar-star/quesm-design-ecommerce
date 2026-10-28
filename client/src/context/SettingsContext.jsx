import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'QueS.M design',
    tagline: 'Artisanal Elegance • Handmade With Love',
    storeEmail: 'contactquesmdesign@gmail.com',
    storePhone: '+91 98765 43210',
    whatsappNumber: '919876543210',
    announcementBarText: '✨ Free Express Shipping on orders above ₹799! Code: WELCOME10 for 10% off',
    announcementBarActive: true,
    currency: 'INR',
    currencySymbol: '₹',
    shippingCharge: 70,
    freeShippingThreshold: 799,
    giftWrapCharge: 49,
    socialLinks: {
      instagram: 'https://instagram.com/quesmdesign',
      facebook: 'https://facebook.com/quesmdesign',
      youtube: 'https://youtube.com/@quesmdesign',
      whatsapp: 'https://wa.me/919876543210'
    },
    enableCod: true,
    enableRazorpay: true,
    razorpayKeyId: 'rzp_test_placeholder_key123'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/public');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.warn('Could not load remote settings, using boutique defaults');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Format currency helper
  const formatPrice = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `${settings.currencySymbol || '₹'}${Number(amount).toLocaleString('en-IN')}`;
  };

  // Generate prefilled WhatsApp URL
  const getWhatsAppLink = (customText) => {
    const defaultText = `Hello QueS.M design! I'm interested in your handmade collection.`;
    const text = encodeURIComponent(customText || defaultText);
    const num = (settings.whatsappNumber || '919876543210').replace(/\D/g, '');
    return `https://wa.me/${num}?text=${text}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        loading,
        formatPrice,
        getWhatsAppLink,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
