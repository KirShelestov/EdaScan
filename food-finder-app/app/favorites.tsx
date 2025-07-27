import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorite } from '../components/FavoriteContext';
import { useRemoteData } from '../data/useRemoteData';

const DATA_URL = "https://kirshelestov.github.io/EdaScan/food-finder-backend/data/restaurants.json"; 

const FavoritesScreen = () => {
  const { data, loading: dataLoading, error } = useRemoteData(DATA_URL);
  const { favorites, removeFavorite, loading: favoritesLoading } = useFavorite();
  const router = useRouter();

  if (dataLoading || favoritesLoading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.logoBtn} onPress={() => router.replace('/main')}>
          <View style={styles.logoCircle}>
            <Ionicons name="search" size={28} color="#FFA500" />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Избранные варианты</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка избранного...</Text>
        </View>
      </View>
    );
  }

  if (error) return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoBtn} onPress={() => router.replace('/main')}>
        <View style={styles.logoCircle}>
          <Ionicons name="search" size={28} color="#FFA500" />
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>Избранные варианты</Text>
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка загрузки данных: {error}</Text>
      </View>
    </View>
  );

  if (!data) return null;
  const { restaurants } = data;

  const groupedFavorites = favorites.reduce((acc: any, fav) => {
    const restaurant = restaurants.find((r: any) => r.id === fav.restaurantId);
    if (!restaurant) return acc;
    
    const dishes = restaurant.dishes.filter((d: any) => fav.dishIds.includes(d.id));
    const total = dishes.reduce((sum: number, dish: any) => sum + dish.price, 0);
    
    if (!acc[restaurant.id]) {
      acc[restaurant.id] = {
        restaurant,
        variants: []
      };
    }
    
    acc[restaurant.id].variants.push({
      dishes,
      total,
      favoriteKey: fav
    });
    
    return acc;
  }, {});

  const groupedData: Array<{
    restaurant: any;
    variants: Array<{
      dishes: any[];
      total: number;
      favoriteKey: any;
    }>;
  }> = Object.values(groupedFavorites);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoBtn} onPress={() => router.replace('/main')}>
        <View style={styles.logoCircle}>
          <Ionicons name="search" size={28} color="#FFA500" />
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>Избранные варианты</Text>
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.restaurant.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
            {item.variants.map((variant: any, index: number) => (
              <View key={index} style={styles.variantContainer}>
                <View style={styles.variantHeader}>
                  <Text style={styles.variantTitle}>{variant.total}₽</Text>
                  <TouchableOpacity 
                    onPress={() => removeFavorite(variant.favoriteKey)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close" size={24} color="#222" />
                  </TouchableOpacity>
                </View>
                {variant.dishes.map((dish: any) => (
                  <Text key={dish.id} style={styles.dishText}>• {dish.name} - {dish.price}₽</Text>
                ))}
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Нет избранных вариантов</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dde8ee',
    padding: 16,
  },
  logoBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },
  variantContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  variantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  removeButton: {
    padding: 4,
  },
  dishText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
    marginBottom: 2,
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default FavoritesScreen; 