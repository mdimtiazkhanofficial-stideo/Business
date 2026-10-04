import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export const MobileMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { setIsMenuOpen } = useStore();

  useEffect(() => {
    setIsMenuOpen(true);
    navigate('/', { replace: true });
  }, [setIsMenuOpen, navigate]);

  return null;
};
