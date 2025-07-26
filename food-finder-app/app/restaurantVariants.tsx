import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFavorite } from '../components/FavoriteContext';
import VariantCard from '../components/VariantCard';
import { useRemoteData } from '../data/useRemoteData';

function knapsackTopVariants(items: {id: number, name: string, price: number}[], maxAmount: number, limit = 50) {
  const n = items.length;
  const dp: Map<number, {dishes: number[], total: number}[]> = new Map();
  dp.set(0, [{dishes: [], total: 0}]);

  for (let i = 0; i < n; i++) {
    const price = items[i].price;
    const newDp = new Map(dp);
    
    for (const [sum, variants] of dp.entries()) {
      const newSum = sum + price;
      if (newSum > maxAmount) continue;
      
      for (const variant of variants) {
        if (variant.dishes.includes(i)) continue;
        
        const newDishes = [...variant.dishes, i];
        const newTotal = variant.total + price;
        const arr = newDp.get(newSum) || [];
        arr.push({dishes: newDishes, total: newTotal});
        newDp.set(newSum, arr);
      }
    }
    
    for (const [sum, arr] of newDp.entries()) {
      newDp.set(sum, arr.sort((a, b) => b.total - a.total).slice(0, Math.min(limit, 20)));
    }
    
    dp.clear();
    for (const [k, v] of newDp.entries()) dp.set(k, v);
  }

  const allVariants: {dishes: number[], total: number}[] = [];
  for (const arr of dp.values()) allVariants.push(...arr);
  
  const unique = new Map();
  for (const v of allVariants) {
    const key = v.dishes.slice().sort((a, b) => a - b).join(',');
    if (!unique.has(key)) unique.set(key, v);
  }
  
  return Array.from(unique.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map(v => v.dishes.map((idx: number) => items[idx]));
}

const DATA_URL = "https://kirshelestov.github.io/EdaScan/food-finder-backend/data/restaurants.json"; 

const RestaurantVariantsScreen = () => {
  const { data, loading, error } = useRemoteData(DATA_URL);
  const { addFavorite, removeFavorite, isFavorite } = useFavorite();
  const { id, amount, categories } = useLocalSearchParams();

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
  
  const sortedDishes = [...filteredDishes].sort((a, b) => b.price - a.price);
  const combinations: {id: number, name: string, price: number}[][] = knapsackTopVariants(sortedDishes, maxAmount, 50);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant.name}</Text>
      <FlatList
        data={combinations}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => {
          const favObj = { restaurantId: restaurant.id, dishIds: item.map((d: {id: number}) => d.id) };
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