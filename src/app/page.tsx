import ConversionCalculator from '@/components/ConversionCalculator';

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            ماشین حساب تبدیل سکه و طلا
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            محاسبه قیمت و تبدیل سکه به طلا و بالعکس با دقت بالا
          </p>
        </div>
        <ConversionCalculator />
      </div>
    </div>
  );
}
