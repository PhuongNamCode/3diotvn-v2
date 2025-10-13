'use client';

import React, { useState, useEffect } from 'react';
import UserProfileDropdown from './UserProfileDropdown';

interface User {
  name: string;
  email: string;
  picture: string;
  id: string;
}

interface UserProfileWrapperProps {
  currentUser?: User | null;
}

export default function UserProfileWrapper({ currentUser }: UserProfileWrapperProps) {
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
          console.log('UserProfileWrapper: User found, showing dropdown');
        } else {
          setUser(null);
          setIsVisible(false);
          console.log('UserProfileWrapper: No user found, hiding dropdown');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
        setIsVisible(false);
      }
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out from other tabs)
    const handleStorageChange = () => {
      console.log('UserProfileWrapper: Storage change detected');
      checkAuth();
    };

    // Listen for custom events (for same-tab updates)
    const handleUserUpdate = () => {
      console.log('UserProfileWrapper: User update event received');
      checkAuth();
    };

    const handleUserLogout = () => {
      console.log('UserProfileWrapper: User logout event received');
      setUser(null);
      setIsVisible(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate);
    window.addEventListener('userLoggedOut', handleUserLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, []);

  // Listen for currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setIsVisible(true);
      console.log('UserProfileWrapper: User from props, showing dropdown');
    } else {
      // Only hide if localStorage also doesn't have user
      const saved = localStorage.getItem('user');
      if (!saved) {
        setUser(null);
        setIsVisible(false);
        console.log('UserProfileWrapper: No user in props or localStorage, hiding dropdown');
      }
    }
  }, [currentUser]);

  const handleLogout = () => {
    console.log('Logout initiated'); // Debug log
    
    try {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      localStorage.removeItem('userEmail');
      
      // Clear any other user-related data
      localStorage.removeItem('userToken');
      localStorage.removeItem('authToken');
      
      // Reset user state
      setUser(null);
      setIsVisible(false);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      // Try to call Google sign out if available
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.accounts) {
        try {
          (window as any).google.accounts.id.disableAutoSelect();
        } catch (e) {
          console.log('Google sign out not available:', e);
        }
      }
      
      // Redirect to home page
      window.location.href = '/';
      
      console.log('Logout completed');
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: just redirect to home
      window.location.href = '/';
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
