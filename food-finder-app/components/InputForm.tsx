import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRemoteData } from "../data/useRemoteData";
import { FOODFINDER_API_HOST } from '@env';

const DATA_URL = `${FOODFINDER_API_HOST}/restaurants.json`;

const ANY_DISH_ID = -1;

const InputForm = () => {
    const { data, loading, error } = useRemoteData(DATA_URL);
    const [amount, setAmount] = useState("");
    const [selectedDishes, setSelectedDishes] = useState<number[]>([
        ANY_DISH_ID,
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    if (loading) return <Text>Загрузка...</Text>;
    if (error) return <Text>Ошибка: {error}</Text>;
    if (!data) return null;
    const { allDishes } = data;

    const dishMap: Record<number, string> = {
        [ANY_DISH_ID]: "Любое",
        ...Object.fromEntries(allDishes.map((d: any) => [d.id, d.name])),
    };

    const grid = [
        [ANY_DISH_ID, 1, 2],
        [3, 4, null],
        [5, 6, "expand"],
    ];

    const handleSubmit = () => {
        const dishesToSend = selectedDishes.includes(ANY_DISH_ID)
            ? allDishes.map((d: any) => d.id)
            : selectedDishes;
        router.push({
            pathname: "/results",
            params: {
                amount,
                categories: dishesToSend.join(","),
            },
        });
    };

    const handleOpenModal = () => setModalVisible(true);
    const handleCloseModal = () => setModalVisible(false);

    const handleToggleDish = (id: number) => {
        if (id === ANY_DISH_ID) {
            setSelectedDishes([ANY_DISH_ID]);
        } else {
            let newSelected = selectedDishes.includes(id)
                ? selectedDishes.filter((d) => d !== id)
                : [...selectedDishes.filter((d) => d !== ANY_DISH_ID), id];
            if (newSelected.length === 0) newSelected = [ANY_DISH_ID];
            setSelectedDishes(newSelected);
        }
    };

    const usedIds = [1, 2, 3, 4, 5, 6];
    const restDishes = allDishes.filter((d: any) => !usedIds.includes(d.id));

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                Введите сумму, на которую хотите поесть
            </Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="Введите сумму"
                placeholderTextColor="#6c6"
            />
            <Text style={styles.label}>Выберите предпочитаемые блюда</Text>
            <View style={styles.gridContainer}>
                {grid.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.gridRow}>
                        {row.map((cell, colIdx) => {
                            if (cell === null) {
                                return (
                                    <View
                                        key={colIdx}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: "transparent",
                                                borderWidth: 0,
                                                elevation: 0,
                                            },
                                        ]}
                                    />
                                );
                            }
                            if (cell === "expand") {
                                return (
                                    <TouchableOpacity
                                        key="expand"
                                        style={styles.expandButton}
                                        onPress={handleOpenModal}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.expandButtonText}>
                                            Показать{"\n"}полный список блюд
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }
                            const dishId = cell as number;
                            return (
                                <TouchableOpacity
                                    key={dishId}
                                    style={[
                                        styles.chip,
                                        selectedDishes.includes(dishId)
                                            ? styles.chipSelected
                                            : styles.chipOutline,
                                    ]}
                                    onPress={() => handleToggleDish(dishId)}
                                >
                                    <Text
                                        style={
                                            selectedDishes.includes(dishId)
                                                ? styles.chipTextSelected
                                                : styles.chipText
                                        }
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        minimumFontScale={0.5}
                                    >
                                        {dishMap[dishId]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.8}
            >
                <Text style={styles.submitButtonText}>
                    Подобрать прием пищи
                </Text>
            </TouchableOpacity>
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Выберите блюда</Text>
                        <FlatList
                            data={restDishes}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.chip,
                                        selectedDishes.includes(item.id)
                                            ? styles.chipSelected
                                            : styles.chipOutline,
                                        styles.modalChip,
                                    ]}
                                    onPress={() => handleToggleDish(item.id)}
                                >
                                    <Text
                                        style={
                                            selectedDishes.includes(item.id)
                                                ? styles.chipTextSelected
                                                : styles.chipText
                                        }
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleCloseModal}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalButtonText}>Готово</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#dde8ee",
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        borderWidth: 2,
        borderColor: "#6c6",
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        fontSize: 20,
        color: "#3a3",
        backgroundColor: "#f8fff8",
    },
    gridContainer: {
        marginBottom: 24,
    },
    gridRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 8,
    },
    chip: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 2,
        borderColor: "#6c6",
        minWidth: 80,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        maxWidth: "30%",
    },
    chipSelected: {
        backgroundColor: "#6c6",
        borderColor: "#6c6",
    },
    chipText: {
        color: "#3a3",
        fontWeight: "bold",
        textAlign: "center",
    },
    chipTextSelected: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
    chipOutline: {
        borderColor: "#6c6",
        backgroundColor: "#f8fff8",
    },
    expandButton: {
        flex: 1,
        maxWidth: "30%",
        minHeight: 88,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#6c6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        marginTop: -48,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    expandButtonText: {
        color: "#3a3",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        width: "80%",
        maxHeight: "70%",
        alignItems: "center",
        justifyContent: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    submitButton: {
        backgroundColor: "#FFA500",
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: "center",
        marginTop: 32,
        marginBottom: 8,
        alignSelf: "stretch",
    },
    submitButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    modalChip: {
        margin: "auto",
        minWidth: 120,
        maxWidth: 240,
        width: "100%",
        alignSelf: "center",
        marginBottom: 8,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    modalChipAll: {
        width: "100%",
        alignSelf: "center",
        marginBottom: 8,
    },
    modalButtonText: {
        color: "#fff",
        backgroundColor: "#FFA500",
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 24,
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
        marginTop: 16,
    },
});

export default InputForm;
