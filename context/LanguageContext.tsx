'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'app.title': 'App Engine',
    'app.dashboard': 'Dashboard',
    'app.logout': 'Logout',
    'app.login': 'Login',
    'app.register': 'Register',
    
    // Actions
    'action.submit': 'Submit',
    'action.submitting': 'Submitting...',
    'action.save': 'Save',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.refresh': 'Refresh',
    'action.import': 'Import CSV',
    'action.upload': 'Upload',
    
    // Messages
    'message.loading': 'Loading...',
    'message.noRecords': 'No records found',
    'message.noPages': 'No pages configured',
    'message.error': 'An error occurred',
    'message.success': 'Success',
    'message.importSuccess': 'CSV imported successfully',
    'message.importFailed': 'CSV import failed',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.noNotifications': 'No notifications',
    'notifications.markAllRead': 'Mark all as read',
    
    // Form labels
    'label.name': 'Name',
    'label.email': 'Email',
    'label.password': 'Password',
    'label.confirmPassword': 'Confirm Password',
    'label.phone': 'Phone',
    'label.city': 'City',
    'label.status': 'Status',
    'label.active': 'Active',
    'label.inactive': 'Inactive',
    'label.pending': 'Pending',
    
    // Placeholders
    'placeholder.enterName': 'Enter name',
    'placeholder.enterEmail': 'Enter email',
    'placeholder.enterPassword': 'Enter password',
    'placeholder.selectOption': 'Select an option',
  },
  hi: {
    // Common
    'app.title': 'ऐप इंजन',
    'app.dashboard': 'डैशबोर्ड',
    'app.logout': 'लॉगआउट',
    'app.login': 'लॉगिन',
    'app.register': 'रजिस्टर',
    
    // Actions
    'action.submit': 'सबमिट करें',
    'action.submitting': 'सबमिट हो रहा है...',
    'action.save': 'सेव करें',
    'action.delete': 'हटाएं',
    'action.edit': 'संपादित करें',
    'action.cancel': 'रद्द करें',
    'action.confirm': 'पुष्टि करें',
    'action.refresh': 'रिफ्रेश',
    'action.import': 'CSV आयात करें',
    'action.upload': 'अपलोड करें',
    
    // Messages
    'message.loading': 'लोड हो रहा है...',
    'message.noRecords': 'कोई रिकॉर्ड नहीं मिला',
    'message.noPages': 'कोई पेज कॉन्फ़िगर नहीं किया गया',
    'message.error': 'एक त्रुटि हुई',
    'message.success': 'सफल',
    'message.importSuccess': 'CSV सफलतापूर्वक आयात हुआ',
    'message.importFailed': 'CSV आयात विफल',
    
    // Notifications
    'notifications.title': 'सूचनाएं',
    'notifications.noNotifications': 'कोई सूचना नहीं',
    'notifications.markAllRead': 'सभी को पढ़ा हुआ मार्क करें',
    
    // Form labels
    'label.name': 'नाम',
    'label.email': 'ईमेल',
    'label.password': 'पासवर्ड',
    'label.confirmPassword': 'पासवर्ड पुष्टि करें',
    'label.phone': 'फोन',
    'label.city': 'शहर',
    'label.status': 'स्थिति',
    'label.active': 'सक्रिय',
    'label.inactive': 'निष्क्रिय',
    'label.pending': 'लंबित',
    
    // Placeholders
    'placeholder.enterName': 'नाम दर्ज करें',
    'placeholder.enterEmail': 'ईमेल दर्ज करें',
    'placeholder.enterPassword': 'पासवर्ड दर्ज करें',
    'placeholder.selectOption': 'एक विकल्प चुनें',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLanguage(saved);
    }
  }, []);

  // Save language to localStorage when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    return translations[language][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}