'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cardzen-security-settings';
const AUTH_SESSION_KEY = 'cardzen-authenticated';

interface SecuritySettings {
    isEnabled: boolean;
    password?: string;
    biometricEnabled?: boolean;
    pinEnabled?: boolean;
}

export function useSecurity() {
  const [settings, setSettings] = useState<SecuritySettings>({ isEnabled: false, password: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // First try to get settings from the API
        const response = await fetch('/api/security-settings');
        
        if (response.ok) {
          const data = await response.json();
          
          // Merge with local security settings (password is only stored locally)
          const storedItem = localStorage.getItem(STORAGE_KEY);
          if (storedItem) {
            const localSettings = JSON.parse(storedItem);
            setSettings({
              ...data,
              password: localSettings.password,
              isEnabled: localSettings.isEnabled
            });
          } else {
            setSettings({ ...data, isEnabled: false });
          }
        } else {
          // Fallback to localStorage if API fails
          const storedItem = localStorage.getItem(STORAGE_KEY);
          if (storedItem) {
            setSettings(JSON.parse(storedItem));
          }
        }
        
        const sessionAuth = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
        setIsAuthenticated(sessionAuth);
      } catch (error) {
        console.error('Failed to load security settings', error);
        
        // Fallback to localStorage if API fails
        try {
          const storedItem = localStorage.getItem(STORAGE_KEY);
          if (storedItem) {
            setSettings(JSON.parse(storedItem));
          }
          
          const sessionAuth = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
          setIsAuthenticated(sessionAuth);
        } catch (localError) {
          console.error('Failed to load security settings from localStorage', localError);
        }
      } finally {
        setIsLoaded(true);
      }
    };

    fetchSettings();
  }, []);
  
  const saveSettings = useCallback(async (updatedSettings: SecuritySettings) => {
    try {
      // Optimistically update UI
      setSettings(updatedSettings);
      
      // Always save password and isEnabled locally
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      
      // Save biometric and PIN settings to the API if they exist
      if (updatedSettings.biometricEnabled !== undefined || updatedSettings.pinEnabled !== undefined) {
        const apiSettings = {
          biometricEnabled: updatedSettings.biometricEnabled,
          pinEnabled: updatedSettings.pinEnabled
        };
        
        const response = await fetch('/api/security-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiSettings),
        });
        
        if (!response.ok) {
          console.warn('Failed to save security settings to API');
        }
      }
    } catch (error) {
      console.error('Failed to save security settings', error);
    }
  }, []);

  const setPassword = (password: string) => {
    if (!password) return false;
    const isFirstPassword = !settings.password;
    const newSettings = { ...settings, password, isEnabled: isFirstPassword ? true : settings.isEnabled };
    saveSettings(newSettings);
    return true;
  };
  
  const removePassword = () => {
      saveSettings({ isEnabled: false, password: '' });
      // Log out user if they remove the password
      logout();
  }
  
  const toggleSecurity = (enabled: boolean) => {
      if (settings.password) { // Can only toggle if a password exists
          saveSettings({ ...settings, isEnabled: enabled });
          if(!enabled) {
            // If disabling security, ensure user is "authenticated" for the current session
            login(settings.password);
          }
      }
  }

  const login = (password: string): boolean => {
    if (settings.isEnabled && password === settings.password) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    // If security is disabled, login is implicitly successful
    if (!settings.isEnabled) {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        setIsAuthenticated(true);
        return true;
    }
    return false;
  };
  
  const logout = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setIsAuthenticated(false);
  };
  

  return { 
    isLoaded, 
    isSecurityEnabled: settings.isEnabled, 
    hasPassword: !!settings.password,
    isAuthenticated,
    setPassword,
    removePassword,
    toggleSecurity,
    login,
    logout
  };
}
