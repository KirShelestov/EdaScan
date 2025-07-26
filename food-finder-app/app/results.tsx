import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

function getVariantText(count: number): string {
  if (count === 0) return 'вариантов';
  if (count === 1) return 'вариант';
  if (count >= 2 && count <= 4) return 'варианта';
  if (count >= 5 && count <= 20) return 'вариантов';
  const lastDigit = count % 10;
  if (lastDigit === 1) return 'вариант';
  if (lastDigit >= 2 && lastDigit <= 4) return 'варианта';
  return 'вариантов';
}

function getRestaurantImage(restaurantName: string): any {
  if (restaurantName.includes('Хан-буз')) {
    return require('../assets/images/khanbuz.png');
  }
  if (restaurantName.includes('Солнечный день')) {
    return require('../assets/images/sunnyday.png');
  }
  if (restaurantName.includes('Солянка')) {
    return require('../assets/images/solyanka.png');
  }
  return require('../assets/images/icon.png'); 
}

const DATA_URL = "https://kirshelestov.github.io/EdaScan/food-finder-backend/data/restaurants.json"; 


const ResultsScreen = () => {
  const { data, loading, error } = useRemoteData(DATA_URL);

  if (loading) return <Text>Загрузка...</Text>;
  if (error) return <Text>Ошибка: {error}</Text>;
  if (!data || !data.restaurants || !data.allDishes) return <Text>Нет данных</Text>;
  const { restaurants, allDishes }: { restaurants: any[]; allDishes: any[] } = data;

  const { amount, categories } = useLocalSearchParams();
  const selectedIds = typeof categories === 'string' && categories.length > 0 ? categories.split(',').map(Number) : [];
  const selectedNames = allDishes.filter((d: any) => selectedIds.includes(d.id)).map((d: any) => (d.name || '').toLowerCase().trim());
  const maxAmount = Number(amount) || 0;
  const router = useRouter();

  try {
    const restaurantVariants = restaurants.map((rest: any) => {
      let filteredDishes = rest.dishes;
      if (selectedNames.length > 0 && selectedNames.length !== allDishes.length) {
        filteredDishes = rest.dishes.filter(
          (d: any) => selectedNames.includes((d.category || '').toLowerCase().trim())
        );
      }
      const combinations = knapsackTopVariants(filteredDishes, maxAmount, 50);
      return {
        ...rest,
        variants: combinations,
      };
    }).filter((r: any) => r.variants.length > 0);

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>Указанная сумма: </Text>
          <Text style={styles.amount}>{amount}р</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.label}>Указанные категории: </Text>
          <Text style={styles.categories} numberOfLines={1} ellipsizeMode="tail">
            {selectedNames.slice(0, 7).join(', ')}{selectedNames.length > 7 ? ', ...' : ''}
          </Text>
        </View>
        <FlatList
          data={restaurantVariants}
          keyExtractor={item => item.id.toString()}
          style={{ marginTop: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({
                pathname: '/restaurantVariants',
                params: {
                  id: item.id,
                  amount,
                  categories,
                },
              })}
              activeOpacity={0.85}
            >
              <View style={styles.cardContent}>
                <Image
                  source={getRestaurantImage(item.name)}
                  style={styles.restaurantImage}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.restaurantName}>{item.name}</Text>
                  <Text style={styles.variantCount}>{item.variants.length} {getVariantText(item.variants.length)}</Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons name="arrow-forward" size={28} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.card}>
              <Text style={styles.emptyText}>К сожалению, не нашлось подходящих вариантов</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  } catch (e) {
    return <Text>Ошибка в фильтрации: {String(e)}</Text>;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dde8ee',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    color: '#222',
  },
  amount: {
    fontSize: 20,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  categories: {
    fontSize: 16,
    color: '#FFA500',
    flex: 1,
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 80,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  restaurantName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  variantCount: {
    color: '#fff',
    fontSize: 16,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    flex: 1,
    width: '100%',
  },
  restaurantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});

export default ResultsScreen; 