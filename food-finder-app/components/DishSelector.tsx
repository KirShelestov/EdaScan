import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Dish {
  id: number;
  name: string;
}

interface DishSelectorProps {
  dishes: Dish[];
  selected: number[];
  onChange: (selected: number[]) => void;
}

const DishSelector: React.FC<DishSelectorProps> = ({ dishes, selected, onChange }) => {
  const toggleDish = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter(dishId => dishId !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <View style={styles.container}>
      {dishes.map(dish => (
        <TouchableOpacity
          key={dish.id}
          style={[styles.chip, selected.includes(dish.id) && styles.chipSelected]}
          onPress={() => toggleDish(dish.id)}
        >
          <Text style={selected.includes(dish.id) ? styles.chipTextSelected : styles.chipText}>
            {dish.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: '#4caf50',
  },
  chipText: {
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DishSelector; 