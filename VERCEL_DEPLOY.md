# Інструкція: Налаштування змінних оточення на Vercel

## Проблема
Якщо на задеплоєному сайті не відображаються дані про баланс, але локально все працює, це означає, що на Vercel не налаштовані змінні оточення.

## Рішення: Додати Environment Variables на Vercel

### Крок 1: Відкрийте Dashboard Vercel
1. Перейдіть на https://vercel.com/dashboard
2. Увійдіть у свій акаунт
3. Знайдіть проєкт `crypto-chart` і натисніть на нього

### Крок 2: Додайте Environment Variables
1. Перейдіть в **Settings** (натисніть на назву проєкту → Settings)
2. У меню зліва виберіть **Environment Variables**
3. Додайте наступні 3 змінні:

#### 1. ETHERSCAN_API_KEY
- **Key:** `ETHERSCAN_API_KEY`
- **Value:** Ваш API ключ з Etherscan
- **Environment:** Виберіть всі: Production, Preview, Development
- Як отримати: https://etherscan.io/apis → створити акаунт → отримати API ключ

#### 2. WALLET_PRIVATE_KEY
- **Key:** `WALLET_PRIVATE_KEY`
- **Value:** Ваш приватний ключ Ethereum гаманця (без `0x` або з `0x` - як у вас локально)
- **Environment:** Виберіть всі: Production, Preview, Development
- ⚠️ **ВАЖЛИВО:** Це секретна інформація! Переконайтеся, що ключ правильний

#### 3. ETHEREUM_RPC_URL
- **Key:** `ETHEREUM_RPC_URL`
- **Value:** URL вашого RPC провайдера
  - Приклад Infura: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
  - Приклад Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
  - Або інший провайдер
- **Environment:** Виберіть всі: Production, Preview, Development

### Крок 3: Передеплойте проєкт
Після додавання всіх змінних:
1. Перейдіть на вкладку **Deployments**
2. Знайдіть останній деплой
3. Натисніть на три крапки (⋯) праворуч
4. Виберіть **Redeploy**
5. Підтвердіть **Redeploy**

АБО зробіть новий commit і push у ваш GitHub репозиторій - Vercel автоматично задеплоїть знову.

## Перевірка
Після передеплою:
1. Відкрийте задеплоєний сайт
2. Перевірте, чи з'явився баланс
3. Перевірте консоль браузера (F12) на наявність помилок

## Альтернативний спосіб через CLI
Якщо ви хочете додати змінні через CLI:

```bash
# Додати змінну для всіх середовищ
vercel env add ETHERSCAN_API_KEY production preview development

# Повторити для інших змінних
vercel env add WALLET_PRIVATE_KEY production preview development
vercel env add ETHEREUM_RPC_URL production preview development

# Передеплоїти
vercel --prod
```

## Як перевірити, які змінні вже налаштовані
Через Dashboard:
1. Settings → Environment Variables - побачите список усіх змінних

Через CLI:
```bash
vercel env ls
```

## Важливі нотатки
- ⚠️ Змінні оточення чутливі до регістру (case-sensitive): `ETHERSCAN_API_KEY` ≠ `etherscan_api_key`
- ⚠️ Після додавання змінних обов'язково зробіть redeploy
- ⚠️ Переконайтеся, що значення змінних точно такі ж, як локально (перевірте `.env.local` файл)

