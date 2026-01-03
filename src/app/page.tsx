import { WalletCard } from '@/components/WalletCard';
import { ProfitLossCard } from '@/components/ProfitLossCard';
import { getServerWalletAddress } from '@/lib/ethereum';

export default async function Home() {
  const serverWalletAddress = await getServerWalletAddress();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex items-center justify-center p-4 md:p-8 min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <WalletCard serverAddress={serverWalletAddress} />
            {serverWalletAddress && <ProfitLossCard walletAddress={serverWalletAddress} />}
          </div>
        </div>
      </div>
    </main>
  );
}
