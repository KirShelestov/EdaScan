import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface FavoriteVariant {
  restaurantId: number;
  dishIds: number[];
}

interface FavoriteContextType {
  favorites: FavoriteVariant[];
  addFavorite: (variant: FavoriteVariant) => void;
  removeFavorite: (variant: FavoriteVariant) => void;
  isFavorite: (variant: FavoriteVariant) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const useFavorite = () => {
  const ctx = useContext(FavoriteContext);
  if (!ctx) throw new Error('useFavorite must be used within FavoriteProvider');
  return ctx;
};

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteVariant[]>([]);

  const isSame = (a: FavoriteVariant, b: FavoriteVariant) =>
    a.restaurantId === b.restaurantId &&
    JSON.stringify([...a.dishIds].sort()) === JSON.stringify([...b.dishIds].sort());

  const addFavorite = (variant: FavoriteVariant) => {
    if (!favorites.some(fav => isSame(fav, variant))) {
      setFavorites([...favorites, variant]);
    }
  };

  const removeFavorite = (variant: FavoriteVariant) => {
    setFavorites(favorites.filter(fav => !isSame(fav, variant)));
  };

  const isFavorite = (variant: FavoriteVariant) => favorites.some(fav => isSame(fav, variant));

  return (
    <FavoriteContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}; 