import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithRetry, getCachedData, setCachedData } from '../utils/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => getCachedData('settings', {
    storeName: 'QueS.M design',
    tagline: 'Artisanal Elegance • Handmade With Love',
    storeEmail: 'contactquesmdesign@gmail.com',
    storePhone: '+917978201960',
    whatsappNumber: '917978201960',
    storeAddress: 'QueS.M design Studio Khan Manzil, Odisha, India',
    googleMapsUrl: '',
    googleMapsEmbedUrl: '',
    announcementBarText: '✨ Free Express Shipping on orders above ₹799! Code: WELCOME10 for 10% off',
    announcementBarActive: true,
    currency: 'INR',
    currencySymbol: '₹',
    shippingCharge: 70,
    freeShippingThreshold: 799,
    giftWrapCharge: 49,
    socialLinks: {
      instagram: 'https://www.instagram.com/ques.m_dgn91?xtok=MW83eHF4ejYxcWlm',
      facebook: 'https://facebook.com/quesmdesign',
      youtube: 'https://youtube.com/@quesmdesign',
      whatsapp: 'https://wa.me/917978201960'
    },
    enableCod: true,
    enableRazorpay: true,
    razorpayKeyId: 'rzp_test_placeholder_key123'
  }));
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetchWithRetry('/api/settings/public', {}, 2, 1000);
      const data = res?.data;
      if (data?.success && data?.settings) {
        setSettings(data.settings);
        setCachedData('settings', data.settings);
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
    const num = (settings.whatsappNumber || '917978201960').replace(/\D/g, '');
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
