import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import ContractService from '../ContractService';

/**
 * Экран баланса токенов - работает на Web, Android и iOS
 */
const BalanceScreen = () => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [error, setError] = useState('');

  // Адрес контракта и URL RPC-узла для мобильных платформ
  const contractAddress = '0xYourContractAddressHere';
  const rpcUrl = 'https://api.trongrid.io';

  // Инициализация контракта при загрузке компонента
  useEffect(() => {
    const initializeContract = async () => {
      try {
        setLoading(true);
        setError('');
        
        await ContractService.initialize(contractAddress, rpcUrl);
        
        // Получение базовой информации о токене
        const name = await ContractService.getName();
        const symbol = await ContractService.getSymbol();
        
        setTokenName(name);
        setTokenSymbol(symbol);
        setInitialized(true);
        
        // Если на веб-платформе, можно получить адрес текущего пользователя
        if (Platform.OS === 'web' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            // Получение баланса
            fetchBalance(accounts[0]);
          }
        }
      } catch (err) {
        console.error('Ошибка при инициализации:', err);
        setError(`Ошибка инициализации: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeContract();
  }, []);

  // Получение баланса по заданному адресу
  const fetchBalance = async (addr) => {
    if (!addr) {
      setError('Пожалуйста, введите адрес');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await ContractService.getBalance(addr);
      setBalance(result);
    } catch (err) {
      console.error('Ошибка при получении баланса:', err);
      setError(`Ошибка получения баланса: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик нажатия кнопки "Получить баланс"
  const handleCheckBalance = () => {
    fetchBalance(address);
  };

  // Отображение состояния загрузки
  if (loading && !initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Инициализация контракта...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Заголовок с информацией о токене */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {tokenName} ({tokenSymbol})
        </Text>
        <Text style={styles.subtitle}>Просмотр баланса</Text>
      </View>

      {/* Поле ввода адреса */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Адрес кошелька:</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Введите адрес TRC20/ERC20 кошелька"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Кнопка запроса баланса */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleCheckBalance}
        disabled={loading || !initialized}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Получить баланс</Text>
        )}
      </TouchableOpacity>

      {/* Отображение ошибки */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {/* Отображение баланса */}
      {balance ? (
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Баланс:</Text>
          <Text style={styles.balanceValue}>
            {balance} {tokenSymbol}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

// Стили компонента
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
  },
  balanceContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default BalanceScreen; 