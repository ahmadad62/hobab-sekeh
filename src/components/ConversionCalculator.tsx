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

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.value = '';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, currentValue: string, setter: (value: string) => void) => {
    if (!e.target.value) {
      setter(currentValue);
    }
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
    const goldGrams = totalSekehValue / eighteenKaratPrice;

    // Calculate profit/loss information
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
      goldGrams,
      totalSekehValue,
      eighteenKaratPrice,
      goldValue,
      premium,
      premiumPercentage,
      goldGramsPerSekeh,
      targetGoldWeight
    };
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
    const totalCoinValue = sekehCount * numSekehPrice;

    const SEKAH_WEIGHT = 8.133;
    const SEKAH_KARAT = 900;
    const TARGET_KARAT = 750;
    
    const pureGoldWeight = (SEKAH_WEIGHT * SEKAH_KARAT) / 1000;
    const targetGoldWeight = (pureGoldWeight * 1000) / TARGET_KARAT;
    const goldValuePerSekeh = targetGoldWeight * eighteenKaratPrice;
    const premiumPerSekeh = numSekehPrice - goldValuePerSekeh;
    const premiumPercentage = (premiumPerSekeh / goldValuePerSekeh) * 100;

    return {
      sekehCount,
      totalGoldValue: totalGoldValue,
      totalCoinValue,
      goldWeightPerSekeh: targetGoldWeight,
      eighteenKaratPrice,
      goldValuePerSekeh,
      premiumPerSekeh,
      premiumPercentage
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
    <div className="w-full">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
        {/* Coin Purchase History - Right Side */}
        <div className="xl:col-span-4 order-2 xl:order-1">
          <div className="bg-[#1A1A1A] rounded-2xl shadow-xl p-3 sm:p-4 border border-[#333333] h-full">
            <h3 className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mb-3 sm:mb-4">
              تاریخچه تبدیل به سکه
            </h3>
            <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#333333]">
              {purchaseHistory
                .filter(record => record.type === 'coin')
                .map((record, index) => {
                  const totalValue = record.price * record.count;
                  const goldValue = record.goldGrams ? record.goldGrams * (parseFormattedNumber(goldPrice) / 4.3318) : 0;
                  const premium = totalValue - goldValue;
                  const premiumPercentage = (premium / goldValue) * 100;
                  const isProfitable = goldValue > totalValue;
                  
                  return (
                    <div key={index} className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#333333]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">{record.date}</span>
                        <button
                          onClick={() => handleDeleteRecord(index)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-[#D4AF37] hover:bg-[#FFD700] text-[#f5f5f5] transition-all duration-200"
                          aria-label="حذف"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">قیمت سکه</p>
                          <p className="text-[clamp(14px,1vw,16px)] font-medium ltr">{formatNumber(record.price.toString())}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">تعداد</p>
                          <p className="text-[clamp(14px,1vw,16px)] font-medium ltr">{record.count}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">ارزش کل</p>
                          <p className="text-[clamp(14px,1vw,16px)] font-medium ltr">{formatNumber(totalValue.toString())}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">ارزش معادل طلا</p>
                          <p className="text-[clamp(14px,1vw,16px)] font-medium ltr">{formatNumber(goldValue.toFixed(0))}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">حباب</p>
                          <p className={`text-[clamp(14px,1vw,16px)] font-medium ltr ${premiumPercentage > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                            {Math.abs(premiumPercentage).toFixed(1)}٪ {premiumPercentage > 0 ? 'زیاد' : 'کم'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">سود/زیان</p>
                          <p className={`text-[clamp(14px,1vw,16px)] font-medium ltr ${isProfitable ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {isProfitable ? '✅' : '❌'} {formatNumber(Math.abs(goldValue - totalValue).toFixed(0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {!purchaseHistory.some(record => record.type === 'coin') && (
                <div className="text-center py-8 text-[#A1A1AA]">
                  تاریخچه تبدیل به سکه موجود نیست
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calculator Section */}
        <div className="xl:col-span-4 order-1 xl:order-2">
          <div className="bg-[#1A1A1A] rounded-2xl shadow-xl p-4 sm:p-6 border border-[#333333] h-full">
            {/* Tabs */}
            <div className="relative flex justify-center gap-4 sm:gap-6 md:gap-10 border-b border-[#333333] pb-3 sm:pb-4 md:pb-6">
              {/* Coin-to-Gold Tab */}
              <button
                onClick={() => setActiveTab('sekeh')}
                className={`group relative px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 ${
                  activeTab === 'sekeh'
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-[#121212] shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30'
                    : 'text-[#A1A1AA] hover:text-[#FFD700] bg-[#1A1A1A]/50 hover:bg-[#1A1A1A]/60'
                }`}
              >
                {/* Animated gold circle behind active icon */}
                {activeTab === 'sekeh' && (
                  <span className="absolute inset-0 rounded-xl bg-[#FFD700]/10 animate-pulse"></span>
                )}
                
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-[clamp(16px,1.2vw,20px)] w-[clamp(16px,1.2vw,20px)] transition-colors ${
                    activeTab === 'sekeh' 
                      ? 'text-[#121212] scale-110' 
                      : 'text-[#D4AF37] group-hover:scale-105'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                  <path d="M12 2v20" />
                  <path d="M2 7h20" />
                  <path d="M2 17h20" />
                </svg>
                
                <span className="text-[clamp(12px,0.9vw,14px)] font-medium tracking-tight">
                    سکه به طلا
                </span>
                
                {/* Gold underline indicator */}
                <span className={`absolute -bottom-[clamp(12px,1vw,17px)] h-0.5 w-8/12 rounded-full transition-all ${
                  activeTab === 'sekeh' 
                    ? 'bg-[#FFD700] scale-100' 
                    : 'bg-transparent scale-0'
                }`}></span>
              </button>

              {/* Gold-to-Coin Tab */}
              <button
                onClick={() => setActiveTab('gold')}
                className={`group relative px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 ${
                  activeTab === 'gold'
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-[#121212] shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/30'
                    : 'text-[#A1A1AA] hover:text-[#FFD700] bg-[#1A1A1A]/50 hover:bg-[#1A1A1A]/60'
                }`}
              >
                {activeTab === 'gold' && (
                  <span className="absolute inset-0 rounded-xl bg-[#FFD700]/10 animate-pulse"></span>
                )}
                
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-[clamp(16px,1.2vw,20px)] w-[clamp(16px,1.2vw,20px)] transition-colors ${
                    activeTab === 'gold' 
                      ? 'text-[#121212] scale-110' 
                      : 'text-[#D4AF37] group-hover:scale-105'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                  <path d="M12 2v20" />
                  <path d="M2 7h20" />
                  <path d="M2 17h20" />
                  <path d="M12 2l10 5-10 5-10-5z" />
                  <path d="M12 12l10 5-10 5-10-5z" />
                </svg>
                
                <span className="text-[clamp(12px,0.9vw,14px)] font-medium tracking-tight">
                    طلا به سکه
                </span>
                
                <span className={`absolute -bottom-[clamp(12px,1vw,17px)] h-0.5 w-8/12 rounded-full transition-all ${
                  activeTab === 'gold' 
                    ? 'bg-[#FFD700] scale-100' 
                    : 'bg-transparent scale-0'
                }`}></span>
              </button>
            </div>

            {/* Input Fields */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6 mt-3 sm:mt-4 md:mt-6">
              {activeTab === 'sekeh' ? (
                <>
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-[clamp(12px,0.9vw,14px)] font-medium text-[#A1A1AA] mb-1.5 sm:mb-2">
                            قیمت فروش سکه امامی
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={sekehPrice}
                              onChange={(e) => handlePriceChange(e.target.value, setSekehPrice)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, sekehPrice, setSekehPrice)}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[#333333] bg-[#1E1E1E] text-[#f5f5f5] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 text-right pl-16 sm:pl-20 text-[clamp(14px,1vw,16px)] font-medium min-h-[44px] sm:min-h-[48px]"
                              placeholder="۳۰,۰۰۰,۰۰۰"
                            />
                        <span className="absolute left-0 top-0 bottom-0 px-3 sm:px-4 flex items-center justify-center text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA] font-medium bg-[#1A1A1A] border-r border-[#333333] rounded-l-xl min-h-[44px] sm:min-h-[48px]">
                              تومان
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[clamp(12px,0.9vw,14px)] font-medium text-[#A1A1AA] mb-1.5 sm:mb-2">
                            مظنه
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={goldPrice}
                              onChange={(e) => handlePriceChange(e.target.value, setGoldPrice)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, goldPrice, setGoldPrice)}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[#333333] bg-[#1E1E1E] text-[#f5f5f5] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 text-right pl-16 sm:pl-20 text-[clamp(14px,1vw,16px)] font-medium min-h-[44px] sm:min-h-[48px]"
                              placeholder="۲,۵۰۰,۰۰۰"
                            />
                        <span className="absolute left-0 top-0 bottom-0 px-3 sm:px-4 flex items-center justify-center text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA] font-medium bg-[#1A1A1A] border-r border-[#333333] rounded-l-xl min-h-[44px] sm:min-h-[48px]">
                              تومان
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[clamp(12px,0.9vw,14px)] font-medium text-[#A1A1AA] mb-1.5 sm:mb-2">
                            تعداد سکه
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={sekehCount}
                              onChange={(e) => setSekehCount(e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, sekehCount, setSekehCount)}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[#333333] bg-[#1E1E1E] text-[#f5f5f5] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 text-right pl-12 sm:pl-16 text-[clamp(14px,1vw,16px)] font-medium min-h-[44px] sm:min-h-[48px]"
                              placeholder="۱۰"
                            />
                        <span className="absolute left-0 top-0 bottom-0 px-3 sm:px-4 flex items-center justify-center text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA] font-medium bg-[#1A1A1A] border-r border-[#333333] rounded-l-xl min-h-[44px] sm:min-h-[48px]">
                              عدد
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Results for Coin to Gold conversion */}
                      {result !== null && (
                        <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-[#1A1A1A] rounded-xl space-y-4 sm:space-y-6 border border-[#333333]">
                          {/* Conversion Summary */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">معادل طلای ۱۸ عیار</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {result.goldGrams.toFixed(2)} گرم
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">وزن طلای ۱۸ عیار هر سکه</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {result.goldGramsPerSekeh.toFixed(3)} گرم
                              </p>
                            </div>
                          </div>

                          {/* Value Comparison */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش سکه‌های شما</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatNumber(result.totalSekehValue.toFixed(0))} تومان
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش معادل طلا</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatNumber(result.goldValue.toFixed(0))} تومان
                              </p>
                            </div>
                          </div>

                          {/* Premium Analysis */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش طلای خالص هر سکه</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatNumber(result.goldValue.toFixed(0))} تومان
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">حباب سکه</p>
                              <p className={`text-[clamp(16px,1.2vw,20px)] font-bold ${result.premiumPercentage > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'} mt-1 sm:mt-2 ltr`}>
                                {Math.abs(result.premiumPercentage).toFixed(1)}٪ {result.premiumPercentage > 0 ? 'زیاد' : 'کم'}
                              </p>
                            </div>
                          </div>

                          {/* Profit/Loss Analysis */}
                          <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                            <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA] mb-2">تحلیل سود و زیان</p>
                            <div className="flex flex-col items-center gap-2">
                              <p className={`text-[clamp(14px,1vw,16px)] font-medium ${result.goldValue > result.totalSekehValue ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {result.goldValue > result.totalSekehValue ? '✅' : '❌'} 
                                تبدیل به طلا {result.goldValue > result.totalSekehValue ? 'سودده' : 'زیان‌ده'} است
                              </p>
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">
                                تفاوت: {formatNumber(Math.abs(result.goldValue - result.totalSekehValue).toFixed(0))} تومان
                              </p>
                              <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA] mt-1">
                                {result.goldValue > result.totalSekehValue 
                                  ? 'تبدیل به طلا در این شرایط به صرفه است'
                                  : 'تبدیل به طلا در این شرایط به صرفه نیست'}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleSavePurchase}
                            className="w-full mt-3 sm:mt-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#D4AF37] hover:bg-[#FFD700] active:bg-[#996515] text-[#f5f5f5] text-[clamp(14px,1vw,16px)] font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#D4AF37]/30"
                          >
                            ذخیره خرید
                          </button>
                        </div>
                      )}
                </>
              ) : (
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                          قیمت خرید سکه امامی
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={sekehPrice}
                            onChange={(e) => handlePriceChange(e.target.value, setSekehPrice)}
                            onFocus={handleInputFocus}
                            onBlur={(e) => handleInputBlur(e, sekehPrice, setSekehPrice)}
                            className="w-full px-4 py-3.5 rounded-xl border border-[#333333] bg-[#1E1E1E] text-[#f5f5f5] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 text-right pl-20 font-medium"
                            placeholder="۳۰,۰۰۰,۰۰۰"
                          />
                        <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-[#A1A1AA] text-sm font-medium bg-[#1A1A1A] border-r border-[#333333] rounded-l-xl">
                            تومان
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                            مظنه
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={goldPrice}
                              onChange={(e) => handlePriceChange(e.target.value, setGoldPrice)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, goldPrice, setGoldPrice)}
                              className="w-full px-4 py-3.5 rounded-xl border border-[#333333] bg-[#1E1E1E] text-[#f5f5f5] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 text-right pl-20 font-medium"
                              placeholder="۲,۵۰۰,۰۰۰"
                            />
                        <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-[#A1A1AA] text-sm font-medium bg-[#1A1A1A] border-r border-[#333333] rounded-l-xl">
                            تومان
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                            مقدار طلا
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={goldGrams}
                              onChange={(e) => setGoldGrams(e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, goldGrams, setGoldGrams)}
                              className="w-full px-4 py-3.5 rounded-xl border border-[#333333] bg-[#1E1E1E] text-[#f5f5f5] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 text-right pl-16 font-medium"
                              placeholder="۱۰۰"
                            />
                        <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-[#A1A1AA] text-sm font-medium bg-[#1A1A1A] border-r border-[#333333] rounded-l-xl">
                            گرم
                          </span>
                        </div>
                      </div>

                      {/* Results for Gold to Coin conversion */}
                      {sekehResult !== null && (
                        <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-[#1A1A1A] rounded-xl space-y-4 sm:space-y-6 border border-[#333333]">
                          {/* Conversion Summary */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">معادل سکه</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {sekehResult.sekehCount.toFixed(2)} عدد
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">وزن طلای ۱۸ عیار هر سکه</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {sekehResult.goldWeightPerSekeh.toFixed(3)} گرم
                              </p>
                            </div>
                          </div>

                          {/* Value Comparison */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش طلای شما</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatNumber(sekehResult.totalGoldValue.toFixed(0))} تومان
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش معادل سکه</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatNumber(sekehResult.totalCoinValue.toFixed(0))} تومان
                              </p>
                            </div>
                          </div>

                          {/* Premium Analysis */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش طلای خالص هر سکه</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatNumber(sekehResult.goldValuePerSekeh.toFixed(0))} تومان
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">حباب سکه</p>
                              <p className={`text-[clamp(16px,1.2vw,20px)] font-bold ${sekehResult.premiumPercentage > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'} mt-1 sm:mt-2 ltr`}>
                                {Math.abs(sekehResult.premiumPercentage).toFixed(1)}٪ {sekehResult.premiumPercentage > 0 ? 'زیاد' : 'کم'}
                              </p>
                            </div>
                          </div>

                          {/* Profit/Loss Analysis */}
                          <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                            <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA] mb-2">تحلیل سود و زیان</p>
                            <div className="flex flex-col items-center gap-2">
                              <p className={`text-[clamp(14px,1vw,16px)] font-medium ${sekehResult.totalCoinValue > sekehResult.totalGoldValue ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {sekehResult.totalCoinValue > sekehResult.totalGoldValue ? '✅' : '❌'} 
                                تبدیل به سکه در این شرایط به صرفه است
                              </p>
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">
                                تفاوت: {formatNumber(Math.abs(sekehResult.totalCoinValue - sekehResult.totalGoldValue).toFixed(0))} تومان
                              </p>
                              <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA] mt-1">
                                {sekehResult.totalCoinValue > sekehResult.totalGoldValue 
                                  ? 'تبدیل به سکه در این شرایط به صرفه است'
                                  : 'تبدیل به سکه در این شرایط به صرفه نیست'}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleSavePurchase}
                            className="w-full mt-3 sm:mt-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#D4AF37] hover:bg-[#FFD700] active:bg-[#996515] text-[#f5f5f5] text-[clamp(14px,1vw,16px)] font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#D4AF37]/30"
                          >
                            ذخیره خرید
                          </button>
                        </div>
                      )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gold Purchase History - Left Side */}
        <div className="xl:col-span-4 order-3">
          <div className="bg-[#1A1A1A] rounded-2xl shadow-xl p-3 sm:p-4 border border-[#333333] h-full">
            <h3 className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mb-3 sm:mb-4">
              تاریخچه تبدیل به طلا
            </h3>
            <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#333333]">
              {purchaseHistory
                .filter(record => record.type === 'gold')
                .map((record, index) => {
                  const totalValue = record.price * record.count;
                  const coinValue = record.equivalentCoins ? record.equivalentCoins * parseFormattedNumber(sekehPrice) : 0;
                  const premium = coinValue - totalValue;
                  const premiumPercentage = (premium / totalValue) * 100;
                  const isProfitable = coinValue > totalValue;
                  
                  return (
                    <div key={index} className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#333333]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">{record.date}</span>
                        <button
                          onClick={() => handleDeleteRecord(index)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-[#D4AF37] hover:bg-[#FFD700] text-[#f5f5f5] transition-all duration-200"
                          aria-label="حذف"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">قیمت طلا</p>
                          <p className="text-[clamp(14px,1vw,16px)] font-medium ltr">{formatNumber(record.price.toString())}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">گرم</p>
                          <p className="text-[clamp(14px,1vw,16px)] font-medium ltr">{record.count}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">ارزش کل</p>
                          <p className="text-[clamp(14px,1vw,16px)] font-medium ltr">{formatNumber(totalValue.toString())}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">ارزش معادل سکه</p>
                          <p className="text-[clamp(14px,1vw,16px)] font-medium ltr">{formatNumber(coinValue.toFixed(0))}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">حباب</p>
                          <p className={`text-[clamp(14px,1vw,16px)] font-medium ltr ${premiumPercentage > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                            {Math.abs(premiumPercentage).toFixed(1)}٪ {premiumPercentage > 0 ? 'زیاد' : 'کم'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA]">سود/زیان</p>
                          <p className={`text-[clamp(14px,1vw,16px)] font-medium ltr ${isProfitable ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {isProfitable ? '✅' : '❌'} {formatNumber(Math.abs(coinValue - totalValue).toFixed(0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {!purchaseHistory.some(record => record.type === 'gold') && (
                <div className="text-center py-8 text-[#A1A1AA]">
                  تاریخچه تبدیل به طلا موجود نیست
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionCalculator; 