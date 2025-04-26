# Форматы глубоких ссылок (Deep Links) для Trust Wallet

Данное руководство описывает форматы глубоких ссылок, которые можно использовать для взаимодействия с Trust Wallet при тестировании отображения TRC20 токенов.

## Основные форматы для TRON

### 1. Просмотр информации о токене

```
https://link.trustwallet.com/open_url?url=https://tronscan.org/#/token20/{TOKEN_ADDRESS}
```

Эта ссылка открывает страницу токена в TronScan через Trust Wallet, что позволяет увидеть, как информация о токене отображается в интерфейсе Trust Wallet.

### 2. Добавление токена в Trust Wallet

```
https://link.trustwallet.com/add_asset?asset=c195_t{TOKEN_ADDRESS}
```

Данная ссылка напрямую предлагает добавить TRC20 токен в Trust Wallet, где `c195` - код для сети TRON.

### 3. Универсальная ссылка для открытия dApp в Trust Wallet

```
https://link.trustwallet.com/browser?url={ENCODED_URL}
```

Эта ссылка открывает встроенный браузер Trust Wallet и загружает указанный URL. Адрес должен быть URL-encoded.

### 4. Специальный формат с параметрами токена

```
tronlink://transaction?contract={TOKEN_ADDRESS}&name={TOKEN_NAME}&symbol={TOKEN_SYMBOL}&decimals={DECIMALS}
```

Этот формат используется для инициирования взаимодействия с токеном через TronLink, который интегрирован с Trust Wallet.

## Параметры для тестирования decimals

При тестировании различных значений decimals важно включать следующие параметры:

| Параметр | Описание | Пример |
|----------|----------|--------|
| address / contract | Адрес токена в сети TRON | TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t |
| decimals | Тестируемое значение decimals | 6, 18, 30 и т.д. |
| name | Название токена | USDT |
| symbol | Символ токена | USDT |

## Пример конструирования ссылки

```javascript
// Базовый URL
const baseUrl = "https://link.trustwallet.com/add_asset";

// Параметры токена
const tokenAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // USDT
const tokenName = "Tether USD";
const tokenSymbol = "USDT";
const testDecimals = 18; // Тестовое значение (оригинальное значение - 6)

// Конструирование ссылки
const deepLink = `${baseUrl}?asset=c195_t${tokenAddress}&name=${encodeURIComponent(tokenName)}&symbol=${encodeURIComponent(tokenSymbol)}&decimals=${testDecimals}`;
```

## Ограничения и особенности

1. **Различная поддержка на устройствах**:
   - Некоторые форматы ссылок могут работать только на iOS или только на Android
   - Старые версии Trust Wallet могут не поддерживать все форматы

2. **Безопасность**:
   - Trust Wallet показывает предупреждения при открытии глубоких ссылок
   - Пользователю необходимо подтвердить действия в кошельке

3. **Обработка параметров**:
   - Не все параметры могут обрабатываться Trust Wallet при просмотре информации о токене
   - Некоторые параметры могут игнорироваться в пользу данных из блокчейна

## Проверка работы глубоких ссылок

Для тестирования глубоких ссылок в рамках исследования:

1. Сгенерируйте ссылку с различными значениями decimals
2. Откройте ссылку на устройстве с установленным Trust Wallet
3. Наблюдайте, как отображается информация о токене
4. Запишите результаты в раздел "Результаты тестирования" в приложении

## Альтернативный подход: WalletConnect

Для более глубокого тестирования можно использовать протокол WalletConnect:

```
https://link.trustwallet.com/wc?uri={WALLET_CONNECT_URI}
```

WalletConnect позволяет создать более сложные сценарии тестирования, но требует дополнительной настройки и разработки. 