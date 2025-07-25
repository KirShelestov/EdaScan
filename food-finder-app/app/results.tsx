import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const DATA_URL = `${FOODFINDER_API_HOST}`; 

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
      // тупое ограничение, чтобы не вылетало
      if (filteredDishes.length > 2) filteredDishes = filteredDishes.slice(0, 12);
      const combinations = getCombinations(filteredDishes)
        .filter((comb: any[]) => comb.reduce((sum, d: any) => sum + (typeof d.price === 'number' ? d.price : 0), 0) <= maxAmount)
        .slice(0, 10);
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
                  source={require('../assets/images/icon.png')}
                  style={styles.restaurantImage}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.restaurantName}>{item.name}</Text>
                  <Text style={styles.variantCount}>{item.variants.length} варианта</Text>
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
});

export default ResultsScreen; 