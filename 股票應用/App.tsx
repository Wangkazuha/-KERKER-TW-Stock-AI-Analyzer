
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StockChart from './components/StockChart';
import BackupChart from './components/BackupChart';
import NewsCard from './components/NewsCard';
import FinancialMetric from './components/FinancialMetric';
import RevenueCard from './components/RevenueCard';
import CompanyInfoCard from './components/CompanyInfoCard';
import { analyzeStock } from './services/geminiService';
import { StockData } from './types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity, 
  BarChart3, 
  FileText,
  AlertCircle,
  Briefcase
} from 'lucide-react';

const App: React.FC = () => {
  const [stockCode, setStockCode] = useState('2330');
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (code: string) => {
    setStockCode(code);
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeStock(code);
      setData(result);
    } catch (err) {
      setError("無法獲取數據。請稍後再試或檢查股票代碼。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleSearch('2330');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine trend color (TWSE: Red = Up, Green = Down)
  const isPositive = data?.change.includes('+') || (parseFloat(data?.change || '0') > 0);
  const trendColor = isPositive ? 'text-red-500' : 'text-green-500';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header onSearch={handleSearch} loading={loading} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
             <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="text-gray-500 font-medium animate-pulse">正在分析 {stockCode} 市場數據...</p>
             <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
                <span>讀取 MOPS 財務報表 (月營收 & 獲利能力)...</span>
                <span>載入 TradingView 技術線圖...</span>
                <span>彙整 HiStock & MoneyDJ 新聞資訊...</span>
             </div>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-8">
            
            {/* Top Section: Header Info & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Chart Area */}
              <div className="lg:col-span-2 flex flex-col">
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-bold text-gray-900">{data.symbol}</h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                            {data.sector}
                          </span>
                        </div>
                        <h3 className="text-xl text-gray-500 mt-1">{data.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className={`text-4xl font-bold tracking-tight flex items-center justify-end gap-2 ${trendColor}`}>
                          {data.price}
                          <TrendIcon className="w-8 h-8" />
                        </div>
                        <div className={`text-lg font-medium mt-1 ${trendColor}`}>
                          {data.change} ({data.changePercent})
                        </div>
                        <div className="text-sm text-gray-400 mt-1">最後更新: {data.updateTime}</div>
                      </div>
                    </div>
                 </div>

                 {/* TradingView Advanced Chart */}
                 <StockChart symbol={data.symbol} />
                 
                 {/* Backup Chart Section (New Layout) */}
                 <BackupChart symbol={data.symbol} />
              </div>

              {/* Side Metrics & AI Summary */}
              <div className="flex flex-col gap-6">
                 <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 shadow-sm flex-grow">
                    <div className="flex items-center gap-2 mb-4 text-indigo-700 font-semibold text-xl">
                      <Activity className="w-6 h-6" />
                      AI 市場分析觀點
                    </div>
                    <p className="text-gray-800 text-xl leading-relaxed text-justify font-medium">
                      {data.aiSummary}
                    </p>
                 </div>

                 {/* Basic Info Card (New) */}
                 <CompanyInfoCard symbol={data.symbol} />

                 {/* Basic Metrics Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    <FinancialMetric 
                      label="本益比 (P/E)" 
                      value={data.peRatio || 'N/A'} 
                      subtext="PER"
                      icon={<PieChart className="w-4 h-4" />}
                    />
                    <FinancialMetric 
                      label="股價淨值比 (P/B)" 
                      value={data.pbRatio || 'N/A'} 
                      subtext="PBR"
                      icon={<Briefcase className="w-4 h-4" />}
                    />
                    <FinancialMetric 
                      label="殖利率" 
                      value={data.dividendYield || 'N/A'} 
                      subtext="Yield"
                      icon={<DollarSign className="w-4 h-4" />}
                    />
                    <FinancialMetric 
                      label="每股盈餘 (EPS)" 
                      value={data.eps || 'N/A'} 
                      subtext="Earnings"
                      icon={<BarChart3 className="w-4 h-4" />}
                    />
                 </div>
              </div>
            </div>

            {/* Middle Section: Financial Charts (Revenue & Profit) */}
            <div className="w-full mt-8">
              <RevenueCard 
                revenueHistory={data.revenueHistory}
                marginHistory={data.marginHistory}
              />
            </div>

            {/* Bottom Section: News & Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
              <div className="lg:col-span-2">
                <NewsCard news={data.news} />
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      參考資料來源
                   </h3>
                   <ul className="space-y-3">
                     <li>
                        <a href={`https://www.wantgoo.com/stock/${data.symbol}/technical-chart`} target="_blank" rel="noreferrer" className="text-base text-indigo-600 hover:underline flex items-center gap-2">
                           WantGoo 玩股網技術線圖
                        </a>
                     </li>
                     <li>
                        <a href={`https://goodinfo.tw/tw/ShowK_Chart.asp?STOCK_ID=${data.symbol}`} target="_blank" rel="noreferrer" className="text-base text-indigo-600 hover:underline flex items-center gap-2">
                           GoodInfo 股市資訊網
                        </a>
                     </li>
                     <div className="h-px bg-gray-100 my-2"></div>
                     {data.sourceUrls && data.sourceUrls.length > 0 ? (
                       data.sourceUrls.map((source, idx) => (
                         <li key={idx}>
                           <a 
                              href={source.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-sm text-gray-600 hover:text-indigo-800 hover:underline truncate block"
                            >
                             {source.title}
                           </a>
                         </li>
                       ))
                     ) : (
                       <>
                        <li><a href="https://mops.twse.com.tw" target="_blank" rel="noreferrer" className="text-sm text-gray-600 hover:underline block">MOPS 公開資訊觀測站</a></li>
                        <li><a href="https://m.moneydj.com" target="_blank" rel="noreferrer" className="text-sm text-gray-600 hover:underline block">MoneyDJ 理財網</a></li>
                       </>
                     )}
                   </ul>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-300">請輸入台股代碼 (例如: 2330)</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
