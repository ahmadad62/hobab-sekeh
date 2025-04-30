'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  LocalOffer as PriceTagIcon,
  Scale as ScaleIcon,
  CompareArrows as ConvertIcon,
  TrendingUp as BubbleIcon,
  Info as InfoIcon,
  Sell as SellIcon,
  ShoppingCart as BuyIcon,
} from '@mui/icons-material';

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
    <Card 
      sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 4,
        boxShadow: '0 8px 32px rgba(234, 179, 8, 0.1)',
        borderRadius: '16px',
        transition: 'all 0.3s ease-in-out',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(234, 179, 8, 0.1)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(234, 179, 8, 0.15)',
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{
            color: 'rgb(234 179 8)',
            fontWeight: 800,
            mb: 4,
            textShadow: '2px 2px 4px rgba(234, 179, 8, 0.2)',
            letterSpacing: '-0.5px',
            background: (theme) => theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, #EAB308, #FCD34D)'
              : 'linear-gradient(45deg, #EAB308, #FCD34D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          تبدیل سکه به طلا و برعکس
        </Typography>
        
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(234, 179, 8, 0.2)' : 'divider', 
            mb: 4,
            '& .MuiTabs-indicator': {
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #EAB308, #FCD34D)'
                : 'linear-gradient(45deg, #EAB308, #FCD34D)',
              height: 4,
              borderRadius: '2px'
            }
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)} 
            centered
            sx={{
              '& .MuiTab-root': {
                color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                transition: 'all 0.3s ease',
                fontSize: '1rem',
                fontWeight: 500,
                py: 2,
                px: 3,
                '&.Mui-selected': {
                  color: 'rgb(234 179 8)',
                  fontWeight: 700,
                }
              }
            }}
          >
            <Tab 
              label="تبدیل سکه به مقدار طلای معادل" 
              value="sekeh" 
            />
            <Tab 
              label="تبدیل طلا به تعداد سکه معادل" 
              value="gold" 
            />
          </Tabs>
        </Box>

        <Box 
          sx={{ 
            mt: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
            '& .MuiTextField-root': {
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                borderRadius: '12px',
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(234, 179, 8, 0.05)',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(234, 179, 8, 0.08)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(234 179 8)',
                    borderWidth: 2,
                  }
                },
                '&.Mui-focused': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(234, 179, 8, 0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgb(234 179 8)',
                    borderWidth: 2,
                  }
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem',
                '&.Mui-focused': {
                  color: 'rgb(234 179 8)',
                }
              },
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                py: 1.5,
                color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
              },
              '& .MuiInputAdornment-root': {
                '& .MuiTypography-root': {
                  fontSize: '0.95rem',
                  color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                }
              },
              '& .MuiFormHelperText-root': {
                color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary',
              }
            }
          }}
        >
          {activeTab === 'sekeh' ? (
            <>
              <TextField
                fullWidth
                label="قیمت فروش سکه امامی"
                value={sekehPrice}
                onChange={(e) => handlePriceChange(e.target.value, setSekehPrice)}
                type="text"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SellIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                }}
                helperText="قیمت فروش یک عدد سکه تمام بهار آزادی طرح امامی"
              />
              <TextField
                fullWidth
                label="قیمت خرید طلای ۱۷ عیار"
                value={goldPrice}
                onChange={(e) => handlePriceChange(e.target.value, setGoldPrice)}
                type="text"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BuyIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                }}
                helperText="قیمت مظنه طلای ۱۷ عیار در بازار (قیمت خرید)"
              />
              <TextField
                fullWidth
                label="تعداد سکه‌های شما"
                value={sekehCount}
                onChange={(e) => setSekehCount(e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScaleIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">عدد</InputAdornment>,
                }}
                helperText="تعداد سکه‌هایی که می‌خواهید بفروشید و معادل طلای آن را بدانید"
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="قیمت خرید سکه امامی"
                value={sekehPrice}
                onChange={(e) => handlePriceChange(e.target.value, setSekehPrice)}
                type="text"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BuyIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                }}
                helperText="قیمت خرید یک عدد سکه تمام بهار آزادی طرح امامی"
              />
              <TextField
                fullWidth
                label="قیمت فروش طلای ۱۷ عیار"
                value={goldPrice}
                onChange={(e) => handlePriceChange(e.target.value, setGoldPrice)}
                type="text"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SellIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                }}
                helperText="قیمت مظنه طلای ۱۷ عیار در بازار (قیمت فروش)"
              />
              <TextField
                fullWidth
                label="مقدار طلای شما"
                value={goldGrams}
                onChange={(e) => setGoldGrams(e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScaleIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">گرم</InputAdornment>,
                }}
                helperText="مقدار طلای ۱۸ عیاری که می‌خواهید بفروشید و معادل سکه آن را بدانید"
              />
            </>
          )}

          {activeTab === 'sekeh' && result !== null && premiumInfo && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(18, 18, 18, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'rgba(234, 179, 8, 0.2)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(234, 179, 8, 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ConvertIcon sx={{ 
                  color: 'rgb(234 179 8)', 
                  fontSize: '2rem', 
                  mr: 2,
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(45deg, #EAB308, #FCD34D)'
                    : 'linear-gradient(45deg, #EAB308, #FCD34D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }} />
                <Typography variant="h5" gutterBottom sx={{ 
                  color: 'rgb(234 179 8)', 
                  fontWeight: 700,
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(45deg, #EAB308, #FCD34D)'
                    : 'linear-gradient(45deg, #EAB308, #FCD34D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  نتیجه تبدیل سکه به طلا:
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PriceTagIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  قیمت طلای ۱۸ عیار:{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{premiumInfo.eighteenKaratPrice.toLocaleString('fa-IR')} تومان</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  با فروش {sekehCount} سکه به ارزش{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{totalValue.toLocaleString('fa-IR')} تومان</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScaleIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  می‌توانید{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{(premiumInfo.goldGramsPerSekeh * parseFloat(sekehCount)).toFixed(3)} گرم</strong> طلای ۱۸ عیار خریداری کنید
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  وزن طلای هر سکه:{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{premiumInfo.goldWeight.toFixed(3)} گرم</strong> (عیار ۱۸)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BubbleIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  حباب هر سکه:{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{premiumInfo.premium.toLocaleString('fa-IR')} تومان</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BubbleIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }} color={premiumInfo.premiumPercentage > 0 ? 'error' : 'success'}>
                  درصد حباب:{' '}
                  <strong style={{ fontSize: '1.2rem' }}>{Math.abs(premiumInfo.premiumPercentage).toFixed(2)}%</strong>
                  {premiumInfo.premiumPercentage > 0 ? ' مثبت' : ' منفی'}
                </Typography>
              </Box>
            </Paper>
          )}

          {activeTab === 'gold' && sekehResult !== null && premiumInfo && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                bgcolor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(18, 18, 18, 0.8)'
                  : 'rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'rgba(234, 179, 8, 0.2)',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(234, 179, 8, 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ConvertIcon sx={{ 
                  color: 'rgb(234 179 8)', 
                  fontSize: '2rem', 
                  mr: 2,
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(45deg, #EAB308, #FCD34D)'
                    : 'linear-gradient(45deg, #EAB308, #FCD34D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }} />
                <Typography variant="h5" gutterBottom sx={{ 
                  color: 'rgb(234 179 8)', 
                  fontWeight: 700,
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(45deg, #EAB308, #FCD34D)'
                    : 'linear-gradient(45deg, #EAB308, #FCD34D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  نتیجه تبدیل طلا به سکه:
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PriceTagIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  قیمت طلای ۱۸ عیار:{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{sekehResult.eighteenKaratPrice.toLocaleString('fa-IR')} تومان</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  با فروش {goldGrams} گرم طلای ۱۸ عیار به ارزش{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{totalGoldValue.toLocaleString('fa-IR')} تومان</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScaleIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  می‌توانید{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{sekehResult.sekehCount.toFixed(3)} سکه</strong> خریداری کنید
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  وزن طلای هر سکه:{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{sekehResult.goldWeightPerSekeh.toFixed(3)} گرم</strong> (عیار ۱۸)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BubbleIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  حباب هر سکه:{' '}
                  <strong style={{ color: 'rgb(234 179 8)', fontSize: '1.2rem' }}>{(parseFormattedNumber(sekehPrice) - (sekehResult.goldWeightPerSekeh * sekehResult.eighteenKaratPrice)).toLocaleString('fa-IR')} تومان</strong>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BubbleIcon sx={{ color: 'rgb(234 179 8)', fontSize: '1.5rem', mr: 2 }} />
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }} color={premiumInfo.premiumPercentage > 0 ? 'error' : 'success'}>
                  درصد حباب:{' '}
                  <strong style={{ fontSize: '1.2rem' }}>{Math.abs(((parseFormattedNumber(sekehPrice) - (sekehResult.goldWeightPerSekeh * sekehResult.eighteenKaratPrice)) / (sekehResult.goldWeightPerSekeh * sekehResult.eighteenKaratPrice) * 100)).toFixed(2)}%</strong>
                  {premiumInfo.premiumPercentage > 0 ? ' مثبت' : ' منفی'}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConversionCalculator; 