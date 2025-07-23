import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Dish {
    id: number;
    name: string;
    price: number;
}

interface Props {
    dishes: Dish[];
    isFavorite: boolean;
    onToggleFavorite: () => void;
    index?: number;
}

const VariantCard: React.FC<Props> = ({
    dishes,
    isFavorite,
    onToggleFavorite,
    index,
}) => {
    const total = dishes.reduce((sum, d) => sum + d.price, 0);
    const isGreen = index !== undefined && index % 2 === 1;
    return (
        <View
            style={[
                styles.card,
                isGreen ? styles.cardGreen : styles.cardOrange,
            ]}
        >
            <TouchableOpacity
                style={styles.heartBtn}
                onPress={onToggleFavorite}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="heart"
                    size={32}
                    color={isFavorite ? "red" : "#fff"}
                    style={{ textShadowColor: "#0002", textShadowRadius: 2 }}
                />
            </TouchableOpacity>
            <Text style={styles.variantTitle}>
                {index !== undefined ? `${index + 1} вариант` : "Вариант"}
            </Text>
            {dishes.map((dish) => (
                <Text key={dish.id} style={styles.dishText}>
                    • {dish.name} - {dish.price}₽
                </Text>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        minHeight: 120,
        justifyContent: "center",
        position: "relative",
    },
    cardOrange: {
        backgroundColor: "#FFA500",
    },
    cardGreen: {
        backgroundColor: "#4CAF50",
    },
    heartBtn: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
    },
    variantTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#222",
    },
    dishText: {
        fontSize: 18,
        color: "#222",
        marginLeft: 8,
        marginBottom: 2,
    },
});

export default VariantCard;
