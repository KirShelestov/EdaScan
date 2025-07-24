import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorite } from '../components/FavoriteContext';
import { useRemoteData } from '../data/useRemoteData';

const DATA_URL = `${process.env.FOODFINDER_API_HOST}/restaurants.json`;

const FavoritesScreen = () => {
  const { data, loading, error } = useRemoteData(DATA_URL);
  const { favorites, removeFavorite } = useFavorite();
  const router = useRouter();

  if (loading) return <Text>Загрузка...</Text>;
  if (error) return <Text>Ошибка: {error}</Text>;
  if (!data) return null;
  const { restaurants } = data;

  const favoriteData = favorites.map(fav => {
    const restaurant = restaurants.find((r: any) => r.id === fav.restaurantId);
    const dishes = restaurant ? restaurant.dishes.filter((d: any) => fav.dishIds.includes(d.id)) : [];
    return { ...fav, restaurant, dishes };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoBtn} onPress={() => router.replace('/main')}>
        <View style={styles.logoCircle}>
          <Ionicons name="search" size={28} color="#FFA500" />
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>Список любимых позиций</Text>
      <FlatList
        data={favoriteData}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.restaurantName}>{item.restaurant?.name || 'Ресторан'}</Text>
              <TouchableOpacity onPress={() => removeFavorite({ restaurantId: item.restaurantId, dishIds: item.dishIds })}>
                <Ionicons name="close" size={36} color="#222" style={styles.closeIcon} />
              </TouchableOpacity>
            </View>
            {item.dishes.map((dish: any) => (
              <Text key={dish.id} style={styles.dishText}>• {dish.name} - {dish.price}₽</Text>
            ))}
          </View>
        )}
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
  card: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  closeIcon: {
    marginLeft: 8,
  },
  dishText: {
    fontSize: 18,
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