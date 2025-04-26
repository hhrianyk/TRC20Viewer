import { ethers } from 'ethers';
import { TRC20_ABI } from './constants/abi';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Универсальный сервис для взаимодействия с TRC20 контрактом
 * Работает на веб, Android и iOS
 */
class ContractService {
  constructor() {
    this.contract = null;
    this.provider = null;
    this.signer = null;
  }

  /**
   * Инициализация подключения к контракту в зависимости от платформы
   * @param {string} contractAddress Адрес контракта
   * @param {string} rpcUrl URL RPC-провайдера (только для мобильных)
   */
  async initialize(contractAddress, rpcUrl) {
    // Определение типа платформы и соответствующая инициализация
    if (Platform.OS === 'web') {
      await this._initializeWeb(contractAddress);
    } else {
      await this._initializeMobile(contractAddress, rpcUrl);
    }
    
    return this.contract;
  }

  /**
   * Инициализация для веб-платформы
   * @private
   */
  async _initializeWeb(contractAddress) {
    // Проверка наличия провайдера Ethereum в браузере
    if (window.ethereum) {
      try {
        // Запрос на подключение к кошельку
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Создание провайдера и подписанта
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        
        // Инициализация контракта
        this.contract = new ethers.Contract(
          contractAddress,
          TRC20_ABI,
          this.signer
        );
        
        console.log('Веб-контракт инициализирован');
      } catch (error) {
        console.error('Ошибка при инициализации веб-контракта:', error);
        throw error;
      }
    } else {
      throw new Error('Провайдер Ethereum не обнаружен. Установите MetaMask или TronLink.');
    }
  }

  /**
   * Инициализация для мобильных платформ
   * @private
   */
  async _initializeMobile(contractAddress, rpcUrl) {
    try {
      // Создание провайдера с использованием указанного RPC URL
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      
      // Загрузка приватного ключа из безопасного хранилища
      // ПРИМЕЧАНИЕ: Это упрощённый пример. В реальном приложении используйте 
      // KeyChain для iOS или Keystore для Android
      const privateKey = await AsyncStorage.getItem('user_private_key');
      
      if (!privateKey) {
        throw new Error('Приватный ключ не найден. Пожалуйста, создайте или импортируйте кошелек.');
      }
      
      // Создание подписанта с приватным ключом
      this.signer = new ethers.Wallet(privateKey, this.provider);
      
      // Инициализация контракта
      this.contract = new ethers.Contract(
        contractAddress,
        TRC20_ABI,
        this.signer
      );
      
      console.log('Мобильный контракт инициализирован');
    } catch (error) {
      console.error('Ошибка при инициализации мобильного контракта:', error);
      throw error;
    }
  }

  /**
   * Получение баланса токенов
   * @param {string} address Адрес пользователя
   * @returns {Promise<string>} Баланс в виде строки
   */
  async getBalance(address) {
    try {
      const balance = await this.contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, await this.contract.decimals());
    } catch (error) {
      console.error('Ошибка при получении баланса:', error);
      throw error;
    }
  }

  /**
   * Перевод токенов
   * @param {string} to Адрес получателя
   * @param {string} amount Сумма в виде строки
   * @returns {Promise<ethers.providers.TransactionResponse>} Результат транзакции
   */
  async transfer(to, amount) {
    try {
      const decimals = await this.contract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount, decimals);
      const tx = await this.contract.transfer(to, amountInWei);
      return tx;
    } catch (error) {
      console.error('Ошибка при переводе токенов:', error);
      throw error;
    }
  }

  /**
   * Получение общего предложения токенов
   * @returns {Promise<string>} Общее предложение в виде строки
   */
  async getTotalSupply() {
    try {
      const totalSupply = await this.contract.totalSupply();
      return ethers.utils.formatUnits(totalSupply, await this.contract.decimals());
    } catch (error) {
      console.error('Ошибка при получении общего предложения:', error);
      throw error;
    }
  }

  /**
   * Получение имени токена
   * @returns {Promise<string>} Имя токена
   */
  async getName() {
    try {
      return await this.contract.name();
    } catch (error) {
      console.error('Ошибка при получении имени токена:', error);
      throw error;
    }
  }

  /**
   * Получение символа токена
   * @returns {Promise<string>} Символ токена
   */
  async getSymbol() {
    try {
      return await this.contract.symbol();
    } catch (error) {
      console.error('Ошибка при получении символа токена:', error);
      throw error;
    }
  }

  /**
   * Получение количества десятичных знаков токена
   * @returns {Promise<number>} Количество десятичных знаков
   */
  async getDecimals() {
    try {
      return await this.contract.decimals();
    } catch (error) {
      console.error('Ошибка при получении десятичных знаков:', error);
      throw error;
    }
  }
}

export default new ContractService(); 