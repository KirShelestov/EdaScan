import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { allDishes, restaurants } from '../data/mockData';
import RestaurantCard from '../components/RestaurantCard';

const ResultsScreen = () => {
  const { amount, dishes } = useLocalSearchParams();
  const selectedIds = typeof dishes === 'string' ? dishes.split(',').map(Number) : [];
  const selectedNames = allDishes.filter(d => selectedIds.includes(d.id)).map(d => d.name);
  const maxAmount = Number(amount) || 0;

  const results = restaurants.map(rest => {
    const filteredDishes = rest.dishes.filter(d => selectedIds.includes(d.id));
    const total = filteredDishes.reduce((sum, d) => sum + d.price, 0);
    return {
      ...rest,
      filteredDishes,
      total,
    };
  }).filter(r => r.filteredDishes.length > 0 && r.total <= maxAmount);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Результаты подбора</Text>
      <Text>Сумма: {amount} ₽</Text>
      <Text>Выбранные блюда: {selectedNames.join(', ') || 'не выбраны'}</Text>
      <Text style={styles.subtitle}>Рационы по ресторанам:</Text>
      {results.length === 0 ? (
        <Text style={{ marginTop: 16 }}>Нет подходящих рационов</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <RestaurantCard restaurant={item} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default ResultsScreen; 