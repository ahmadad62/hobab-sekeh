import ConversionCalculator from '@/components/ConversionCalculator';

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          ماشین حساب تبدیل سکه و طلا
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          محاسبه قیمت و تبدیل سکه به طلا و بالعکس با دقت بالا
        </p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <ConversionCalculator />
      </div>
    </div>
  );
}
