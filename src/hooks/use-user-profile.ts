'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cardzen-user-profile';

interface UserProfile {
  name: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>({ name: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItem = localStorage.getItem(STORAGE_KEY);
      if (storedItem) {
        setProfile(JSON.parse(storedItem));
      }
    } catch (error) {
      console.error('Failed to load user profile from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfile = (updatedProfile: UserProfile) => {
    try {
      setProfile(updatedProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save user profile to localStorage', error);
    }
  };
  
  const saveUserName = (name: string) => {
    saveProfile({ ...profile, name });
  };

  return { userName: profile.name, saveUserName, isLoaded };
}
