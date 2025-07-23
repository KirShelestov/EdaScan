import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Dish {
    id: number;
    name: string;
    price: number;
}

interface Restaurant {
    id: number;
    name: string;
    filteredDishes: Dish[];
    total: number;
}

interface Props {
    restaurant: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{restaurant.name}</Text>
            {restaurant.filteredDishes.map((dish) => (
                <Text key={dish.id} style={styles.dish}>
                    {dish.name} — {dish.price} ₽
                </Text>
            ))}
            <Text style={styles.total}>Сумма: {restaurant.total} ₽</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    dish: {
        fontSize: 16,
        marginBottom: 4,
    },
    total: {
        fontWeight: "bold",
        marginTop: 8,
        fontSize: 16,
    },
});

export default RestaurantCard;
