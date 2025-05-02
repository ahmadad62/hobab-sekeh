'use client';

import { useState, useEffect } from 'react';

// 1. Type Definitions
interface PurchaseRecord {
  id: string;
  date: string;
  price: number;
  count: number;
  totalValue: number;
  type: 'coin' | 'gold';
  goldGrams?: number;
  equivalentCoins?: number;
  premium?: number;
  premiumPercentage?: number;
}

interface CalculationResult {
  value: number;
  premium?: number;
  premiumPercentage?: number;
  equivalent?: number;
  isProfitable?: boolean;
}

interface InputValues {
  sekehPrice: string;
  goldPrice: string;
  sekehCount: string;
  goldGrams: string;
}

// 2. Constants
const STORAGE_KEY = 'hobab-sekeh-history';
const SEKAH_WEIGHT = 8.133; // grams
const SEKAH_KARAT = 900; // 22k
const TARGET_KARAT = 750; // 18k
const EIGHTEEN_KARAT_FACTOR = 4.3318;

// 3. Utility Functions
const formatCurrency = (value: number): string => {
  return value.toLocaleString('fa-IR');
};

const parseInputValue = (value: string): number => {
  return parseInt(value.replace(/,/g, '')) || 0;
};

const formatInputValue = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const toPersianNumber = (value: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return value.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

const ConversionCalculator = () => {
  // 4. State Management
  const [inputs, setInputs] = useState<InputValues>({
    sekehPrice: '',
    goldPrice: '',
    sekehCount: '',
    goldGrams: ''
  });
  
  const [activeTab, setActiveTab] = useState<'sekeh' | 'gold'>('sekeh');
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);

  // 5. Data Persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        setPurchaseHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  // 6. Input Handlers
  const handleInputChange = (field: keyof InputValues, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: formatInputValue(value)
    }));
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.value = '';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, field: keyof InputValues) => {
    if (!e.target.value) {
      setInputs(prev => ({
        ...prev,
        [field]: prev[field]
      }));
    }
  };

  // 7. Core Calculation Functions
  const calculateGoldValue = (): CalculationResult | null => {
    const sekehPrice = parseInputValue(inputs.sekehPrice);
    const goldPrice = parseInputValue(inputs.goldPrice);
    const sekehCount = parseFloat(inputs.sekehCount);

    if (!sekehPrice || !goldPrice || !sekehCount) return null;

    const eighteenKaratPrice = goldPrice / EIGHTEEN_KARAT_FACTOR;
    const totalSekehValue = sekehPrice * sekehCount;
    const goldGrams = totalSekehValue / eighteenKaratPrice;
    
    const pureGoldWeight = (SEKAH_WEIGHT * SEKAH_KARAT) / 1000;
    const targetGoldWeight = (pureGoldWeight * 1000) / TARGET_KARAT;
    const goldValue = targetGoldWeight * eighteenKaratPrice;
    const premium = sekehPrice - goldValue;
    const premiumPercentage = (premium / goldValue) * 100;

    return {
      value: goldGrams,
      premium,
      premiumPercentage,
      equivalent: totalSekehValue,
      isProfitable: goldValue > totalSekehValue
    };
  };

  const calculateSekehValue = (): CalculationResult | null => {
    const sekehPrice = parseInputValue(inputs.sekehPrice);
    const goldPrice = parseInputValue(inputs.goldPrice);
    const goldGrams = parseFloat(inputs.goldGrams);

    if (!sekehPrice || !goldPrice || !goldGrams) return null;

    const eighteenKaratPrice = goldPrice / EIGHTEEN_KARAT_FACTOR;
    const totalGoldValue = eighteenKaratPrice * goldGrams;
    const sekehCount = totalGoldValue / sekehPrice;
    
    const pureGoldWeight = (SEKAH_WEIGHT * SEKAH_KARAT) / 1000;
    const targetGoldWeight = (pureGoldWeight * 1000) / TARGET_KARAT;
    const goldValuePerSekeh = targetGoldWeight * eighteenKaratPrice;
    const premium = sekehPrice - goldValuePerSekeh;
    const premiumPercentage = (premium / goldValuePerSekeh) * 100;

    return {
      value: sekehCount,
      premium,
      premiumPercentage,
      equivalent: totalGoldValue,
      isProfitable: totalGoldValue > (sekehCount * sekehPrice)
    };
  };

  // 8. Save Function with Validation
  const handleSavePurchase = () => {
    const commonFields = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fa-IR'),
    };

    if (activeTab === 'sekeh') {
      const sekehPrice = parseInputValue(inputs.sekehPrice);
      const sekehCount = parseFloat(inputs.sekehCount);
      const goldResult = calculateGoldValue();
      
      if (!sekehPrice || !sekehCount || !goldResult) return;

      const newRecord: PurchaseRecord = {
        ...commonFields,
        price: sekehPrice,
        count: sekehCount,
        totalValue: sekehPrice * sekehCount,
        type: 'coin',
        premium: goldResult.premium,
        premiumPercentage: goldResult.premiumPercentage,
        goldGrams: goldResult.value
      };

      setPurchaseHistory(prev => [...prev, newRecord]);
    } else {
      const goldPrice = parseInputValue(inputs.goldPrice);
      const goldGrams = parseFloat(inputs.goldGrams);
      const sekehResult = calculateSekehValue();

      if (!goldPrice || !goldGrams || !sekehResult) return;

      const newRecord: PurchaseRecord = {
        ...commonFields,
        price: goldPrice,
        count: goldGrams,
        totalValue: goldPrice * goldGrams,
        type: 'gold',
        premium: sekehResult.premium,
        premiumPercentage: sekehResult.premiumPercentage,
        equivalentCoins: sekehResult.value
      };

      setPurchaseHistory(prev => [...prev, newRecord]);
    }
  };

  // 9. Delete Function
  const handleDeleteRecord = (id: string) => {
    setPurchaseHistory(prev => prev.filter(record => record.id !== id));
  };

  // 10. Current Calculations
  const goldResult = calculateGoldValue();
  const sekehResult = calculateSekehValue();

  const formatNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseFormattedNumber = (value: string) => {
    return parseInt(value.replace(/,/g, ''), 10) || 0;
  };

  const result = goldResult;

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
                  const goldValue = record.goldGrams ? record.goldGrams * (parseFormattedNumber(inputs.goldPrice) / 4.3318) : 0;
                  const premium = totalValue - goldValue;
                  const premiumPercentage = (premium / goldValue) * 100;
                  const isProfitable = goldValue > totalValue;
                  
                  return (
                    <div key={index} className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#333333]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">{record.date}</span>
                              <button
                          onClick={() => handleDeleteRecord(record.id)}
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
                              value={inputs.sekehPrice}
                              onChange={(e) => handleInputChange('sekehPrice', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, 'sekehPrice')}
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
                              value={inputs.goldPrice}
                              onChange={(e) => handleInputChange('goldPrice', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, 'goldPrice')}
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
                              value={inputs.sekehCount}
                              onChange={(e) => handleInputChange('sekehCount', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, 'sekehCount')}
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
                      {result && (
                        <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-[#1A1A1A] rounded-xl space-y-4 sm:space-y-6 border border-[#333333]">
                          {/* Conversion Summary */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">معادل طلای ۱۸ عیار</p>
                              <p className="text-[clamp(14px,1vw,16px)] font-medium text-[#FFD700] mt-1 sm:mt-2">
                                {toPersianNumber(Number(result.value.toFixed(2)))} گرم
                              </p>
                            </div>
                          </div>

                          {/* Value Comparison */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش سکه‌های شما</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatCurrency(result.equivalent || 0)} تومان
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش معادل طلا</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatCurrency(result.value * parseInputValue(inputs.goldPrice))} تومان
                              </p>
                            </div>
                          </div>

                          {/* Premium Analysis */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش طلای خالص هر سکه</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatCurrency(result.value * parseInputValue(inputs.goldPrice))} تومان
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">درصد سود/زیان</p>
                              <p className="text-[clamp(16px,1.2vw,20px)] font-bold text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {result.premiumPercentage ? formatCurrency(result.premiumPercentage) : '0'}%
                              </p>
                            </div>
                          </div>

                          {/* Profit/Loss Analysis */}
                          <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                            <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA] mb-2">تحلیل سود و زیان</p>
                            <div className="flex flex-col items-center gap-2">
                              <p className={`text-[clamp(14px,1vw,16px)] font-medium ${result.value > (result.equivalent || 0) ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {result.value > (result.equivalent || 0) ? '✅' : '❌'} 
                                تبدیل به طلا {result.value > (result.equivalent || 0) ? 'سودده' : 'زیان‌ده'} است
                              </p>
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">
                                تفاوت: {formatCurrency(Math.abs(result.value - (result.equivalent || 0)))} تومان
                              </p>
                              <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA] mt-1">
                                {result.value > (result.equivalent || 0) 
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
                            value={inputs.sekehPrice}
                            onChange={(e) => handleInputChange('sekehPrice', e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={(e) => handleInputBlur(e, 'sekehPrice')}
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
                              value={inputs.goldPrice}
                              onChange={(e) => handleInputChange('goldPrice', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, 'goldPrice')}
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
                              value={inputs.goldGrams}
                              onChange={(e) => handleInputChange('goldGrams', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={(e) => handleInputBlur(e, 'goldGrams')}
                              className="w-full px-4 py-3.5 rounded-xl border border-[#333333] bg-[#1E1E1E] text-[#f5f5f5] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-200 text-right pl-16 font-medium"
                            placeholder="۱۰۰"
                          />
                        <span className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-[#A1A1AA] text-sm font-medium bg-[#1A1A1A] border-r border-[#333333] rounded-l-xl">
                            گرم
                          </span>
                        </div>
                      </div>

                      {/* Results for Gold to Coin conversion */}
                      {sekehResult && (
                        <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-[#1A1A1A] rounded-xl space-y-4 sm:space-y-6 border border-[#333333]">
                          {/* Conversion Summary */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">معادل سکه</p>
                              <p className="text-[clamp(14px,1vw,16px)] font-medium text-[#FFD700] mt-1 sm:mt-2">
                                {toPersianNumber(Number(sekehResult.value.toFixed(2)))} عدد
                              </p>
                            </div>
                          </div>

                          {/* Value Comparison */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش طلای شما</p>
                              <p className="text-[clamp(14px,1vw,16px)] font-medium text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatCurrency(Math.floor(sekehResult.equivalent || 0))} تومان
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش معادل سکه</p>
                              <p className="text-[clamp(14px,1vw,16px)] font-medium text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatCurrency(Math.floor(sekehResult.value * parseInputValue(inputs.sekehPrice)))} تومان
                              </p>
                            </div>
                          </div>

                          {/* Premium Analysis */}
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">ارزش طلای خالص هر سکه</p>
                              <p className="text-[clamp(14px,1vw,16px)] font-medium text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {formatCurrency(Math.floor(sekehResult.value * parseInputValue(inputs.sekehPrice)))} تومان
                              </p>
                            </div>
                            <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">درصد سود/زیان</p>
                              <p className="text-[clamp(14px,1vw,16px)] font-medium text-[#FFD700] mt-1 sm:mt-2 ltr">
                                {sekehResult.premiumPercentage ? formatCurrency(sekehResult.premiumPercentage) : '0'}%
                              </p>
                            </div>
                          </div>

                          {/* Profit/Loss Analysis */}
                          <div className="text-center p-2.5 sm:p-4 bg-[#121212] rounded-xl shadow-sm border border-[#333333]">
                            <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA] mb-2">تحلیل سود و زیان</p>
                            <div className="flex flex-col items-center gap-2">
                              <p className={`text-[clamp(14px,1vw,16px)] font-medium ${sekehResult.value > (sekehResult.equivalent || 0) ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                {sekehResult.value > (sekehResult.equivalent || 0) ? '✅' : '❌'} 
                                تبدیل به سکه در این شرایط به صرفه است
                              </p>
                              <p className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">
                                تفاوت: {formatCurrency(Math.abs(sekehResult.value - (sekehResult.equivalent || 0)))} تومان
                              </p>
                              <p className="text-[clamp(11px,0.8vw,13px)] text-[#A1A1AA] mt-1">
                                {sekehResult.value > (sekehResult.equivalent || 0) 
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
                  const coinValue = record.equivalentCoins ? record.equivalentCoins * parseFormattedNumber(inputs.sekehPrice) : 0;
                  const premium = coinValue - totalValue;
                  const premiumPercentage = (premium / totalValue) * 100;
                  const isProfitable = coinValue > totalValue;
                  
                  return (
                    <div key={index} className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#333333]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[clamp(12px,0.9vw,14px)] text-[#A1A1AA]">{record.date}</span>
                              <button
                          onClick={() => handleDeleteRecord(record.id)}
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