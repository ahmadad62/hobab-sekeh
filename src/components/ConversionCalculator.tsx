'use client';

import { useState, useEffect } from 'react';

interface PurchaseRecord {
  date: string;
  price: number;
  count: number;
  totalValue: number;
  type: 'coin' | 'gold';
  goldGrams?: number;
  equivalentCoins?: number;
}

const STORAGE_KEY = 'hobab-sekeh-history';

const formatNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '');
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
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);

  // Load purchase history from local storage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setPurchaseHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading purchase history:', error);
      }
    }
  }, []);

  // Save purchase history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

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

    const EIGHTEEN_KARAT_FACTOR = 4.3318;
    const eighteenKaratPrice = numGoldPrice / EIGHTEEN_KARAT_FACTOR;
    const totalSekehValue = numSekehPrice * numSekehCount;
    return totalSekehValue / eighteenKaratPrice;
  };

  const calculateSekehCount = () => {
    const numSekehPrice = parseFormattedNumber(sekehPrice);
    const numGoldPrice = parseFormattedNumber(goldPrice);
    const numGoldGrams = parseFloat(goldGrams);

    if (isNaN(numSekehPrice) || isNaN(numGoldPrice) || isNaN(numGoldGrams)) {
      return null;
    }

    const EIGHTEEN_KARAT_FACTOR = 4.3318;
    const eighteenKaratPrice = numGoldPrice / EIGHTEEN_KARAT_FACTOR;
    const totalGoldValue = eighteenKaratPrice * numGoldGrams;
    const sekehCount = totalGoldValue / numSekehPrice;

    const SEKAH_WEIGHT = 8.133;
    const SEKAH_KARAT = 900;
    const TARGET_KARAT = 750;
    
    const pureGoldWeight = (SEKAH_WEIGHT * SEKAH_KARAT) / 1000;
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

    const EIGHTEEN_KARAT_FACTOR = 4.3318;
    const eighteenKaratPrice = numGoldPrice / EIGHTEEN_KARAT_FACTOR;

    const SEKAH_WEIGHT = 8.133;
    const SEKAH_KARAT = 900;
    const TARGET_KARAT = 750;
    
    const pureGoldWeight = (SEKAH_WEIGHT * SEKAH_KARAT) / 1000;
    const targetGoldWeight = (pureGoldWeight * 1000) / TARGET_KARAT;
    
    const goldValue = targetGoldWeight * eighteenKaratPrice;
    const premium = numSekehPrice - goldValue;
    const premiumPercentage = (premium / goldValue) * 100;
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

  const handleSavePurchase = () => {
    if (activeTab === 'sekeh') {
      const price = parseFormattedNumber(sekehPrice);
      const count = parseFloat(sekehCount);
      
      if (!price || !count) return;

      const newRecord: PurchaseRecord = {
        date: new Date().toLocaleDateString('fa-IR'),
        price,
        count,
        totalValue: price * count,
        type: 'coin'
      };

      setPurchaseHistory(prevHistory => [...prevHistory, newRecord]);
    } else {
      const price = parseFormattedNumber(goldPrice);
      const grams = parseFloat(goldGrams);
      const sekehPriceNum = parseFormattedNumber(sekehPrice);
      
      if (!price || !grams || !sekehPriceNum || !sekehResult) return;

      const newRecord: PurchaseRecord = {
        date: new Date().toLocaleDateString('fa-IR'),
        price,
        count: grams,
        totalValue: sekehResult.totalGoldValue,
        type: 'gold',
        goldGrams: grams,
        equivalentCoins: sekehResult.sekehCount
      };

      setPurchaseHistory(prevHistory => [...prevHistory, newRecord]);
    }
  };

  // Add delete functionality
  const handleDeleteRecord = (index: number) => {
    setPurchaseHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };

  const result = calculateGoldGrams();
  const sekehResult = calculateSekehCount();
  const premiumInfo = calculatePremium();
  const totalValue = result !== null ? parseFormattedNumber(sekehPrice) * parseFloat(sekehCount) : 0;
  const totalGoldValue = sekehResult !== null ? sekehResult.totalGoldValue : 0;

  return (
    <div className="w-full space-y-8 p-4 md:p-6">
      {/* Calculator */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-4 md:p-8 space-y-8 border border-gray-100 dark:border-gray-700">
        {/* Tabs */}
        <div className="flex justify-center gap-2 md:gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
          <button
            onClick={() => setActiveTab('sekeh')}
            className={`px-4 md:px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'sekeh'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            سکه به طلا
          </button>
          <button
            onClick={() => setActiveTab('gold')}
            className={`px-4 md:px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'gold'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            طلا به سکه
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-6">
          {activeTab === 'sekeh' ? (
            <>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    قیمت فروش سکه امامی
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                value={sekehPrice}
                onChange={(e) => handlePriceChange(e.target.value, setSekehPrice)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-right pl-20 font-medium"
                      placeholder="۳۰,۰۰۰,۰۰۰"
                    />
                    <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 rounded-l-xl">
                      تومان
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    مظنه
                  </label>
                  <div className="relative flex items-center">
                    <input
                type="text"
                value={goldPrice}
                onChange={(e) => handlePriceChange(e.target.value, setGoldPrice)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-right pl-20 font-medium"
                      placeholder="۲,۵۰۰,۰۰۰"
                    />
                    <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 rounded-l-xl">
                      تومان
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    تعداد سکه
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                value={sekehCount}
                onChange={(e) => setSekehCount(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-right pl-16 font-medium"
                      placeholder="۱۰"
                    />
                    <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 rounded-l-xl">
                      عدد
                    </span>
                  </div>
                </div>
              </div>

              {/* Results */}
              {result !== null && premiumInfo && (
                <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">معادل طلای ۱۸ عیار</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mt-2 ltr">
                        {result.toFixed(2)} گرم
                      </p>
                    </div>
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">حباب سکه</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mt-2 ltr">
                        {premiumInfo.premiumPercentage.toFixed(1)}٪
                      </p>
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg">
                    <p className="text-sm text-amber-100">ارزش کل</p>
                    <p className="text-2xl font-bold text-white mt-2 ltr">
                      {formatNumber(totalValue.toString())} تومان
                    </p>
                  </div>
                  
                  {/* Add Save Button */}
                  <button
                    onClick={handleSavePurchase}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/30"
                  >
                    ذخیره خرید
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  قیمت خرید سکه امامی
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                value={sekehPrice}
                onChange={(e) => handlePriceChange(e.target.value, setSekehPrice)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-right pl-20 font-medium"
                    placeholder="۳۰,۰۰۰,۰۰۰"
                  />
                  <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 rounded-l-xl">
                    تومان
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مظنه
                </label>
                <div className="relative flex items-center">
                  <input
                type="text"
                value={goldPrice}
                onChange={(e) => handlePriceChange(e.target.value, setGoldPrice)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-right pl-20 font-medium"
                    placeholder="۲,۵۰۰,۰۰۰"
                  />
                  <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 rounded-l-xl">
                    تومان
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مقدار طلا
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                value={goldGrams}
                onChange={(e) => setGoldGrams(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-right pl-16 font-medium"
                    placeholder="۱۰۰"
                  />
                  <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 rounded-l-xl">
                    گرم
                  </span>
                </div>
              </div>

              {/* Results for Gold to Coin conversion */}
              {sekehResult !== null && (
                <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">معادل سکه</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mt-2 ltr">
                        {sekehResult.sekehCount.toFixed(2)} عدد
                      </p>
                    </div>
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">وزن طلای ۱۸ عیار هر سکه</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mt-2 ltr">
                        {sekehResult.goldWeightPerSekeh.toFixed(3)} گرم
                      </p>
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg">
                    <p className="text-sm text-amber-100">ارزش کل</p>
                    <p className="text-2xl font-bold text-white mt-2 ltr">
                      {formatNumber(totalGoldValue.toString())} تومان
                    </p>
                  </div>
                  
                  {/* Add Save Button for Gold */}
                  <button
                    onClick={handleSavePurchase}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/30"
                  >
                    ذخیره خرید
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Purchase History Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Coin Purchase History */}
        <div className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mb-6">تاریخچه تبدیل به سکه</h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">تاریخ</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">قیمت (تومان)</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">تعداد</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">کل (تومان)</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {purchaseHistory
                        .filter(record => record.type === 'coin')
                        .map((record, index) => (
                          <tr key={index} className="text-right text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                            <td className="px-3 py-3 whitespace-nowrap">{record.date}</td>
                            <td className="px-3 py-3 whitespace-nowrap ltr">{formatNumber(record.price.toString())}</td>
                            <td className="px-3 py-3 whitespace-nowrap ltr">{record.count} عدد</td>
                            <td className="px-3 py-3 whitespace-nowrap ltr">{formatNumber(record.totalValue.toString())}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteRecord(index)}
                                className="text-red-500 hover:text-red-600 transition-colors duration-200"
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                      {!purchaseHistory.some(record => record.type === 'coin') && (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                            تاریخچه تبدیل به سکه موجود نیست
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gold Purchase History */}
        <div className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mb-6">تاریخچه تبدیل به طلا</h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">تاریخ</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">قیمت (تومان)</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">گرم</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">معادل سکه</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">کل (تومان)</th>
                        <th scope="col" className="px-3 py-3 whitespace-nowrap">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {purchaseHistory
                        .filter(record => record.type === 'gold')
                        .map((record, index) => (
                          <tr key={index} className="text-right text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                            <td className="px-3 py-3 whitespace-nowrap">{record.date}</td>
                            <td className="px-3 py-3 whitespace-nowrap ltr">{formatNumber(record.price.toString())}</td>
                            <td className="px-3 py-3 whitespace-nowrap ltr">{record.goldGrams} گرم</td>
                            <td className="px-3 py-3 whitespace-nowrap ltr">{record.equivalentCoins?.toFixed(2)} عدد</td>
                            <td className="px-3 py-3 whitespace-nowrap ltr">{formatNumber(record.totalValue.toString())}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteRecord(index)}
                                className="text-red-500 hover:text-red-600 transition-colors duration-200"
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                      {!purchaseHistory.some(record => record.type === 'gold') && (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                            تاریخچه تبدیل به طلا موجود نیست
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionCalculator; 