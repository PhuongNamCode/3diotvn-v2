"use client";

import { useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  picture: string;
  id: string;
}

export function useUserEmail() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Try to get from localStorage first
        const saved = localStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved) as User;
          setUser(parsed);
          setUserEmail(parsed.email);
          setIsLoading(false);
          return;
        }

        // Try to get from userData
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            if (parsed.email) {
              setUserEmail(parsed.email);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        // Try to get from userEmail directly
        const directEmail = localStorage.getItem('userEmail');
        if (directEmail) {
          setUserEmail(directEmail);
          setIsLoading(false);
          return;
        }

        // Try to get from Google OAuth data attribute
        const googleUser = document.querySelector('[data-google-user]');
        if (googleUser) {
          const email = googleUser.getAttribute('data-email');
          if (email) {
            setUserEmail(email);
            setIsLoading(false);
            return;
          }
        }

        // No user found
        setUserEmail(null);
        setUser(null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUserEmail(null);
        setUser(null);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth();
    };

    // Listen for custom events
    const handleUserUpdate = () => {
      checkAuth();
    };

    const handleUserLogout = () => {
      setUserEmail(null);
      setUser(null);
      setIsLoading(false);
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

  return {
    userEmail,
    user,
    isLoading,
    isLoggedIn: !!userEmail
  };
}
