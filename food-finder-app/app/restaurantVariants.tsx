import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFavorite } from '../components/FavoriteContext';
import VariantCard from '../components/VariantCard';
import { restaurants } from '../data/mockData';

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

const RestaurantVariantsScreen = () => {
  const { id, amount, dishes } = useLocalSearchParams();
  const restaurant = restaurants.find(r => r.id === Number(id));
  const selectedIds = typeof dishes === 'string' ? dishes.split(',').map(Number) : [];
  const maxAmount = Number(amount) || 0;
  const { addFavorite, removeFavorite, isFavorite } = useFavorite();

  if (!restaurant) {
    return <View style={styles.container}><Text>Ресторан не найден</Text></View>;
  }

  const filteredDishes = restaurant.dishes.filter(d => selectedIds.includes(d.id));
  const combinations = getCombinations(filteredDishes)
    .filter(comb => comb.reduce((sum, d) => sum + d.price, 0) <= maxAmount);

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