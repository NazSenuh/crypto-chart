This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Швидкий деплой через Vercel CLI

1. **Встановіть Vercel CLI** (якщо ще не встановлено):
   ```bash
   npm i -g vercel
   ```

2. **Увійдіть у Vercel**:
   ```bash
   vercel login
   ```

3. **Деплой проєкту**:
   ```bash
   vercel
   ```
   
   Під час деплою Vercel запитає:
   - Link to existing project? → `N` (для нового проєкту)
   - Project name → введіть назву проєкту або натисніть Enter
   - Directory → натисніть Enter (використовується поточний каталог)

4. **Додайте змінні оточення**:
   
   Після першого деплою, додайте необхідні змінні оточення:
   
   ```bash
   vercel env add ETHERSCAN_API_KEY
   vercel env add WALLET_PRIVATE_KEY
   vercel env add ETHEREUM_RPC_URL
   ```
   
   Або через веб-інтерфейс Vercel:
   - Перейдіть на https://vercel.com/dashboard
   - Виберіть ваш проєкт
   - Перейдіть в Settings → Environment Variables
   - Додайте наступні змінні:
     - `ETHERSCAN_API_KEY` - ключ API з Etherscan (отримайте на https://etherscan.io/apis)
     - `WALLET_PRIVATE_KEY` - приватний ключ гаманця Ethereum
     - `ETHEREUM_RPC_URL` - URL RPC провайдера (наприклад, Infura або Alchemy)

5. **Розгорніть знову** після додавання змінних:
   ```bash
   vercel --prod
   ```

### Деплой через GitHub

1. **Завантажте проєкт на GitHub** (якщо ще не зроблено):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Імпортуйте проєкт у Vercel**:
   - Перейдіть на https://vercel.com/new
   - Увійдіть через GitHub
   - Виберіть репозиторій `crypto-chart`
   - Натисніть "Import"

3. **Налаштуйте змінні оточення**:
   - В Settings → Environment Variables додайте:
     - `ETHERSCAN_API_KEY`
     - `WALLET_PRIVATE_KEY`
     - `ETHEREUM_RPC_URL`

4. **Деплой**:
   - Vercel автоматично задеплоїть проєкт після налаштування
   - Кожен push у `main` гілку автоматично створює новий деплой

### Необхідні змінні оточення

Проєкт потребує наступні змінні оточення:

- **ETHERSCAN_API_KEY** - API ключ з Etherscan.io для отримання даних про транзакції
- **WALLET_PRIVATE_KEY** - Приватний ключ Ethereum гаманця для серверних транзакцій
- **ETHEREUM_RPC_URL** - URL RPC провайдера (наприклад: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`)

⚠️ **ВАЖЛИВО:** Без цих змінних проєкт не зможе отримувати дані про баланс та транзакції!

📖 **Детальна інструкція:** Дивіться [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) для покрокового налаштування змінних оточення на Vercel.

### Додаткова інформація

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)
