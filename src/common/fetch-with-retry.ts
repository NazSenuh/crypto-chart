const MAX_RETRIES = 5;
const RETRY_DELAY = 1500;
const MIN_REQUEST_INTERVAL = 400; // 2.5 requests per second

let lastRequestTime = 0;

const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
};

export const fetchWithRetry = async <T>(url: string, options?: RequestInit): Promise<T> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await waitForRateLimit();
    
    const response = await fetch(url, options);
    const data = await response.json();

    // Логування для діагностики
    if (data.status === '0') {
      console.error(`Etherscan API Error (attempt ${attempt}/${MAX_RETRIES}):`, {
        status: data.status,
        message: data.message,
        result: data.result,
        url: url.replace(/apikey=[^&]+/, 'apikey=***'), // Приховуємо API ключ в логах
      });
      
      if (data.result?.includes('rate limit') || data.message?.includes('rate limit') || data.result?.includes('Max calls per sec')) {
        console.log(`Rate limited, retry ${attempt}/${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        continue;
      }
    }

    return data;
  }

  throw new Error('Max retries reached for Etherscan API');
};