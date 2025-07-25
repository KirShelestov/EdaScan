import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFavorite } from '../components/FavoriteContext';
import VariantCard from '../components/VariantCard';
import { useRemoteData } from '../data/useRemoteData';
import { FOODFINDER_API_HOST } from '@env';

function getCombinations<T>(arr: T[]): T[][] {
  const result: T[][] = [[]];
  for (const value of arr) {
    const copy = [...result];
    for (const prefix of copy) {
      result.push(prefix.concat(value));
    }
  }
  return result.filter(comb => comb.length > 0);
}

const DATA_URL = `${FOODFINDER_API_HOST}/restaurants.json`; 

const RestaurantVariantsScreen = () => {
  const { data, loading, error } = useRemoteData(DATA_URL);
  const { addFavorite, removeFavorite, isFavorite } = useFavorite();
  const { id, amount, categories } = useLocalSearchParams();
  console.log('data:', data, 'loading:', loading, 'error:', error);

  if (loading) return <Text>Загрузка...</Text>;
  if (error) return <Text>Ошибка: {error}</Text>;
  if (!data) return null;
  const { restaurants, allDishes }: { restaurants: any[]; allDishes: any[] } = data;

  const restaurant = restaurants.find(r => r.id === Number(id));
  const selectedIds = typeof categories === 'string' && categories.length > 0 ? categories.split(',').map(Number) : [];
  const selectedNames = allDishes.filter((d: any) => selectedIds.includes(d.id)).map((d: any) => d.name);
  const maxAmount = Number(amount) || 0;

  if (!restaurant) {
    return <View style={styles.container}><Text>Ресторан не найден</Text></View>;
  }

  let filteredDishes = restaurant.dishes;
  if (selectedNames.length > 0) {
    filteredDishes = restaurant.dishes.filter((d: any) => selectedNames.includes(d.category));
  }
  // тупое ограничение, чтобы не вылетало
  if (filteredDishes.length > 2) filteredDishes = filteredDishes.slice(0, 12);
  const combinations = getCombinations(filteredDishes)
    .filter((comb: any[]) => comb.reduce((sum, d: any) => sum + (typeof d.price === 'number' ? d.price : 0), 0) <= maxAmount)
    .slice(0, 10);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant.name}</Text>
      <FlatList
        data={combinations}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => {
          const favObj = { restaurantId: restaurant.id, dishIds: item.map(d => d.id) };
          return (
            <VariantCard
              dishes={item}
              isFavorite={isFavorite(favObj)}
              onToggleFavorite={() =>
                isFavorite(favObj)
                  ? removeFavorite(favObj)
                  : addFavorite(favObj)
              }
              index={index}
            />
          );
        }}
        ListEmptyComponent={<Text>Нет подходящих вариантов</Text>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#dde8ee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
});

export default RestaurantVariantsScreen; 