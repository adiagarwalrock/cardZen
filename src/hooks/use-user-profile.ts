'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  theme?: string;
  id?: number;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', theme: 'system' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user-profile');
        const data = await response.json();
        if (data) {
          // Ensure we have a name property even if it doesn't exist in DB response
          setProfile({
            ...data,
            name: data.name || ''
          });
        }
      } catch (error) {
        console.error('Failed to load user profile', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchProfile();
  }, []);

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to save user profile', error);
    }
  };

  const saveUserName = (name: string) => {
    saveProfile({ ...profile, name });
  };

  return { userName: profile.name, saveUserName, isLoaded };
}
