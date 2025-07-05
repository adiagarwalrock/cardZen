'use client';

import { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile as saveProfileToDb } from '/workspace/CardZen/src/lib/database';

interface UserProfile {
  name: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>({ name: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const profileFromDb = getUserProfile();
      if (profileFromDb) {
        setProfile(profileFromDb);
      }
    } catch (error: any) {
      console.error('Failed to load user profile from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfile = (updatedProfile: UserProfile) => {
    try {
      setProfile(updatedProfile);
      saveProfileToDb(updatedProfile);
    } catch (error: any) {
      console.error('Failed to save user profile to database', error);
    }
  };
  
  const saveUserName = (name: string) => {
    saveProfile({ ...profile, name });
  };

  return { userName: profile.name, saveUserName, isLoaded };
}
