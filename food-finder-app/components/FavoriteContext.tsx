import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteVariant {
  restaurantId: number;
  dishIds: number[];
}

interface FavoriteContextType {
  favorites: FavoriteVariant[];
  addFavorite: (variant: FavoriteVariant) => void;
  removeFavorite: (variant: FavoriteVariant) => void;
  isFavorite: (variant: FavoriteVariant) => boolean;
  loading: boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@food_finder_favorites';

export const useFavorite = () => {
  const ctx = useContext(FavoriteContext);
  if (!ctx) throw new Error('useFavorite must be used within FavoriteProvider');
  return ctx;
};

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteVariant[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Ошибка сохранения избранного:', error);
    }
  };

  const isSame = (a: FavoriteVariant, b: FavoriteVariant) =>
    a.restaurantId === b.restaurantId &&
    JSON.stringify([...a.dishIds].sort()) === JSON.stringify([...b.dishIds].sort());

  const addFavorite = (variant: FavoriteVariant) => {
    if (!favorites.some(fav => isSame(fav, variant))) {
      const newFavorites = [...favorites, variant];
      setFavorites(newFavorites);
      saveFavorites(newFavorites);
    }
  };

  const removeFavorite = (variant: FavoriteVariant) => {
    const newFavorites = favorites.filter(fav => !isSame(fav, variant));
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (variant: FavoriteVariant) => favorites.some(fav => isSame(fav, variant));

  return (
    <FavoriteContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, loading }}>
      {children}
    </FavoriteContext.Provider>
  );
}; 