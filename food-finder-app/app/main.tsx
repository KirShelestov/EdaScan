import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import InputForm from '../components/InputForm';

const MainScreen = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}
        onPress={() => router.push('/favorites')}
      >
        <Ionicons name="heart" size={32} color="#FFA500" />
        {/* Заменить на svg, когда уже apk файл буду собирать */}
      </TouchableOpacity>
      <InputForm />
    </View>
  );
};

export default MainScreen; 