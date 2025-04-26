import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, Platform } from 'react-native';
import BalanceScreen from './screens/BalanceScreen';

/**
 * Основной компонент приложения
 * Работает на Web, Android и iOS
 */
const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Кросс-платформенный TRC20 Просмотрщик</Text>
        <Text style={styles.platformInfo}>
          Текущая платформа: {Platform.OS === 'web' ? 'Web' : Platform.OS}
        </Text>
      </View>
      <BalanceScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 15,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  platformInfo: {
    color: '#e0e0e0',
    fontSize: 12,
    marginTop: 5,
  },
});

export default App; 