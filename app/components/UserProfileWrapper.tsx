'use client';

import React, { useState, useEffect } from 'react';
import UserProfileDropdown from './UserProfileDropdown';

interface User {
  name: string;
  email: string;
  picture: string;
  id: string;
}

export default function UserProfileWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      try {
        const saved = localStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved) as User;
          setUser(parsed);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleUserUpdate = () => {
      checkAuth();
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    // Call the existing signOut function from the main page
    if (typeof window !== 'undefined' && (window as any).signOut) {
      (window as any).signOut();
    }
  };

  if (!isVisible || !user) {
    return null;
  }

  return (
    <UserProfileDropdown 
      user={user} 
      onLogout={handleLogout}
    />
  );
}
