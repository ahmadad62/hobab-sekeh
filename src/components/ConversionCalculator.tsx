'use client';

import { useState } from 'react';

const formatNumber = (value: string) => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  // Add commas every 3 digits from right
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseFormattedNumber = (value: string) => {
  return parseInt(value.replace(/,/g, ''), 10) || 0;
};

const ConversionCalculator = () => {
  const [sekehPrice, setSekehPrice] = useState<string>('');
  const [goldPrice, setGoldPrice] = useState<string>('');
  const [sekehCount, setSekehCount] = useState<string>('');
  const [goldGrams, setGoldGrams] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sekeh' | 'gold'>('sekeh');

  const handlePriceChange = (value: string, setter: (value: string) => void) => {
    const formatted = formatNumber(value);
    setter(formatted);
  };

  const calculateGoldGrams = () => {
    const numSekehPrice = parseFormattedNumber(sekehPrice);
    const numGoldPrice = parseFormattedNumber(goldPrice);
    const numSekehCount = parseFloat(sekehCount);

    if (isNaN(numSekehPrice) || isNaN(numGoldPrice) || isNaN(numSekehCount)) {
      return null;
    }

    // تبدیل قیمت مظنه به قیمت طلای 18 عیار
    const EIGHTEEN_KARAT_FACTOR = 4.3318;
    const eighteenKaratPrice = numGoldPrice / EIGHTEEN_KARAT_FACTOR;

    // محاسبه ارزش کل سکه‌ها
    const totalSekehValue = numSekehPrice * numSekehCount;
    // محاسبه مقدار طلای قابل خرید با قیمت طلای 18 عیار
    return totalSekehValue / eighteenKaratPrice;
  };

  const calculateSekehCount = () => {
    const numSekehPrice = parseFormattedNumber(sekehPrice);
    const numGoldPrice = parseFormattedNumber(goldPrice);
    const numGoldGrams = parseFloat(goldGrams);

    if (isNaN(numSekehPrice) || isNaN(numGoldPrice) || isNaN(numGoldGrams)) {
      return null;
    }

    // تبدیل قیمت مظنه به قیمت طلای 18 عیار
    const EIGHTEEN_KARAT_FACTOR = 4.3318;
    const eighteenKaratPrice = numGoldPrice / EIGHTEEN_KARAT_FACTOR;

    // محاسبه ارزش کل طلای 18 عیار
    const totalGoldValue = eighteenKaratPrice * numGoldGrams;
    // محاسبه تعداد سکه قابل خرید
    const sekehCount = totalGoldValue / numSekehPrice;

    // محاسبه مقدار طلای معادل هر سکه
    const SEKAH_WEIGHT = 8.133; // وزن سکه با عیار 900
    const SEKAH_KARAT = 900;
    const TARGET_KARAT = 750; // عیار 18
    
    // تبدیل به وزن طلای خالص (عیار 1000)
    const pureGoldWeight = (SEKAH_WEIGHT * SEKAH_KARAT) / 1000;
    // تبدیل به وزن طلای 18 عیار
    const targetGoldWeight = (pureGoldWeight * 1000) / TARGET_KARAT;

    return {
      sekehCount,
      totalGoldValue,
      goldWeightPerSekeh: targetGoldWeight,
      eighteenKaratPrice
    };
  };

  const calculatePremium = () => {
    const numSekehPrice = parseFormattedNumber(sekehPrice);
    const numGoldPrice = parseFormattedNumber(goldPrice);
    
    if (isNaN(numSekehPrice) || isNaN(numGoldPrice)) {
      return null;
    }

    // تبدیل قیمت مظنه به قیمت طلای 18 عیار
    const EIGHTEEN_KARAT_FACTOR = 4.3318;
    const eighteenKaratPrice = numGoldPrice / EIGHTEEN_KARAT_FACTOR;

    // وزن سکه با عیار 900
    const SEKAH_WEIGHT = 8.133;
    const SEKAH_KARAT = 900;
    const TARGET_KARAT = 750; // عیار 18
    
    // تبدیل به وزن طلای خالص (عیار 1000)
    const pureGoldWeight = (SEKAH_WEIGHT * SEKAH_KARAT) / 1000;
    // تبدیل به وزن طلای 18 عیار
    const targetGoldWeight = (pureGoldWeight * 1000) / TARGET_KARAT;
    
    // ارزش طلای سکه بر اساس قیمت طلای 18 عیار
    const goldValue = targetGoldWeight * eighteenKaratPrice;
    // حباب (تفاوت قیمت سکه با ارزش طلای آن)
    const premium = numSekehPrice - goldValue;
    // درصد حباب
    const premiumPercentage = (premium / goldValue) * 100;

    // محاسبه مقدار طلای قابل خرید با یک سکه
    const goldGramsPerSekeh = numSekehPrice / eighteenKaratPrice;

    return {
      goldWeight: targetGoldWeight,
      goldValue,
      premium,
      premiumPercentage,
      goldGramsPerSekeh,
      eighteenKaratPrice
    };
  };

  const result = calculateGoldGrams();
  const sekehResult = calculateSekehCount();
  const premiumInfo = calculatePremium();
  const totalValue = result !== null ? parseFormattedNumber(sekehPrice) * parseFloat(sekehCount) : 0;
  const totalGoldValue = sekehResult !== null ? sekehResult.totalGoldValue : 0;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-yellow-200/10 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
        تبدیل سکه به طلا و برعکس
      </h1>
      
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab('sekeh')}
            className={`px-6 py-4 text-lg font-medium transition-colors duration-200 ${
              activeTab === 'sekeh'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
            }`}
          >
            تبدیل سکه به مقدار طلای معادل
          </button>
          <button
            onClick={() => setActiveTab('gold')}
            className={`px-6 py-4 text-lg font-medium transition-colors duration-200 ${
              activeTab === 'gold'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500'
            }`}
          >
            تبدیل طلا به تعداد سکه معادل
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'sekeh' ? (
          <>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  قیمت فروش سکه امامی
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sekehPrice}
                    onChange={(e) => handlePriceChange(e.target.value, setSekehPrice)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="قیمت سکه را وارد کنید"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    تومان
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  قیمت فروش یک عدد سکه تمام بهار آزادی طرح امامی
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  قیمت خرید طلای ۱۷ عیار
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={goldPrice}
                    onChange={(e) => handlePriceChange(e.target.value, setGoldPrice)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="قیمت طلا را وارد کنید"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    تومان
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  قیمت مظنه طلای ۱۷ عیار در بازار (قیمت خرید)
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تعداد سکه‌های شما
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={sekehCount}
                    onChange={(e) => setSekehCount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="تعداد سکه را وارد کنید"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    عدد
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  تعداد سکه‌هایی که می‌خواهید بفروشید و معادل طلای آن را بدانید
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  قیمت خرید سکه امامی
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sekehPrice}
                    onChange={(e) => handlePriceChange(e.target.value, setSekehPrice)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="قیمت سکه را وارد کنید"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    تومان
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  قیمت خرید یک عدد سکه تمام بهار آزادی طرح امامی
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  قیمت فروش طلای ۱۷ عیار
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={goldPrice}
                    onChange={(e) => handlePriceChange(e.target.value, setGoldPrice)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="قیمت طلا را وارد کنید"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    تومان
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  قیمت مظنه طلای ۱۷ عیار در بازار (قیمت فروش)
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  مقدار طلای شما
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={goldGrams}
                    onChange={(e) => setGoldGrams(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="مقدار طلا را وارد کنید"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    گرم
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  مقدار طلای ۱۸ عیاری که می‌خواهید بفروشید و معادل سکه آن را بدانید
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'sekeh' && result !== null && premiumInfo && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-yellow-200/20">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                نتیجه تبدیل سکه به طلا:
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  قیمت طلای ۱۸ عیار:{' '}
                  <span className="font-bold text-yellow-500">
                    {premiumInfo.eighteenKaratPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  با فروش {sekehCount} سکه به ارزش{' '}
                  <span className="font-bold text-yellow-500">
                    {totalValue.toLocaleString('fa-IR')} تومان
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  می‌توانید{' '}
                  <span className="font-bold text-yellow-500">
                    {(premiumInfo.goldGramsPerSekeh * parseFloat(sekehCount)).toFixed(3)} گرم
                  </span> طلای ۱۸ عیار خریداری کنید
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  وزن طلای هر سکه:{' '}
                  <span className="font-bold text-yellow-500">
                    {premiumInfo.goldWeight.toFixed(3)} گرم
                  </span> (عیار ۱۸)
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  حباب هر سکه:{' '}
                  <span className="font-bold text-yellow-500">
                    {premiumInfo.premium.toLocaleString('fa-IR')} تومان
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <p className={`text-gray-700 dark:text-gray-300 ${premiumInfo.premiumPercentage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  درصد حباب:{' '}
                  <span className="font-bold">
                    {Math.abs(premiumInfo.premiumPercentage).toFixed(2)}%
                  </span>
                  {premiumInfo.premiumPercentage > 0 ? ' مثبت' : ' منفی'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gold' && sekehResult !== null && premiumInfo && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-yellow-200/20">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                نتیجه تبدیل طلا به سکه:
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  قیمت طلای ۱۸ عیار:{' '}
                  <span className="font-bold text-yellow-500">
                    {sekehResult.eighteenKaratPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  با فروش {goldGrams} گرم طلای ۱۸ عیار به ارزش{' '}
                  <span className="font-bold text-yellow-500">
                    {totalGoldValue.toLocaleString('fa-IR')} تومان
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  می‌توانید{' '}
                  <span className="font-bold text-yellow-500">
                    {sekehResult.sekehCount.toFixed(3)} سکه
                  </span> خریداری کنید
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  وزن طلای هر سکه:{' '}
                  <span className="font-bold text-yellow-500">
                    {sekehResult.goldWeightPerSekeh.toFixed(3)} گرم
                  </span> (عیار ۱۸)
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-gray-700 dark:text-gray-300">
                  حباب هر سکه:{' '}
                  <span className="font-bold text-yellow-500">
                    {(parseFormattedNumber(sekehPrice) - (sekehResult.goldWeightPerSekeh * sekehResult.eighteenKaratPrice)).toLocaleString('fa-IR')} تومان
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <p className={`text-gray-700 dark:text-gray-300 ${premiumInfo.premiumPercentage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  درصد حباب:{' '}
                  <span className="font-bold">
                    {Math.abs(((parseFormattedNumber(sekehPrice) - (sekehResult.goldWeightPerSekeh * sekehResult.eighteenKaratPrice)) / (sekehResult.goldWeightPerSekeh * sekehResult.eighteenKaratPrice) * 100)).toFixed(2)}%
                  </span>
                  {premiumInfo.premiumPercentage > 0 ? ' مثبت' : ' منفی'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionCalculator; 