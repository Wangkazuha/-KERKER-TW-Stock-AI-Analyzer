
import React, { useEffect, useRef } from 'react';

interface StockChartProps {
  symbol: string; // e.g., "2330"
}

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget if any
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Map common Taiwan stocks to TWSE format, default to TWSE prefix
    const tvSymbol = symbol.includes(':') ? symbol : `TWSE:${symbol}`;

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": tvSymbol,
      "interval": "D",
      "timezone": "Asia/Taipei",
      "theme": "light",
      "style": "1", // 1 = Candles, 3 = Area
      "locale": "zh_TW",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    
    container.current.appendChild(widgetContainer);
    container.current.appendChild(script);

  }, [symbol]);

  return (
    <div className="h-[500px] w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
      <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
        {/* Widget will be injected here */}
      </div>
    </div>
  );
};

export default StockChart;
