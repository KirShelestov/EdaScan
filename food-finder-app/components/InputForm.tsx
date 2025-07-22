import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import DishSelector from './DishSelector';
import { allDishes } from '../data/mockData';
import { useRouter } from 'expo-router';

const InputForm = () => {
  const [amount, setAmount] = useState('');
  const [selectedDishes, setSelectedDishes] = useState<number[]>([]);
  const router = useRouter();

  const handleSubmit = () => {
    // Переход на экран результатов с параметрами
    router.push({
      pathname: '/results',
      params: {
        amount,
        dishes: selectedDishes.join(','),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Введите сумму (₽):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Например, 1000"
      />
      <Text style={styles.label}>Выберите предпочитаемые блюда:</Text>
      <DishSelector
        dishes={allDishes}
        selected={selectedDishes}
        onChange={setSelectedDishes}
      />
      <Button title="Подобрать рацион" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
});

export default InputForm; 