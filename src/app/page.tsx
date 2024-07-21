"use client";

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockData, selectStockData, selectSymbols, selectSymbol, setSymbol, addSymbol, removeSymbol, clearStockData, setSymbols } from '../slices/stockSlice';
import axios from 'axios';
import StockTable from './components/StockTable';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { AppDispatch } from '../store';
import 'tailwindcss/tailwind.css';

// Register chart.js components
Chart.register(...registerables);

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector(selectStockData);
  const symbols = useSelector(selectSymbols);
  const symbol = useSelector(selectSymbol);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const fetchSymbols = async () => {
      const response = await axios.get('http://localhost:5000/api/symbols');
      dispatch(setSymbols(response.data));
    };

    fetchSymbols();
    const interval = setInterval(fetchSymbols, 5000); // Fetch symbols every 5 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (isFetching && symbol) {
      dispatch(fetchStockData(symbol));
      const interval = setInterval(() => {
        dispatch(fetchStockData(symbol));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [dispatch, symbol, isFetching]);

  const handleSymbolChange = (newSymbol: string) => {
    dispatch(setSymbol(newSymbol));
  };

  const addNewSymbol = async (e: any) => {
    e.preventDefault();
    const newSymbol = e.target.symbol.value.toUpperCase();
    if (newSymbol && !symbols.includes(newSymbol)) {
      await axios.post('http://localhost:5000/api/stock', { symbol: newSymbol });
      dispatch(addSymbol(newSymbol));
      dispatch(setSymbols([...symbols, newSymbol])); // Update local state
    }
    e.target.reset();
  };

  const removeSymbolHandler = (symbolToRemove: string) => {
    dispatch(removeSymbol({ symbol: symbolToRemove, fromAdmin: false }));
    dispatch(setSymbols(symbols.filter((sym) => sym !== symbolToRemove))); // Update local state
  };
  

  const toggleFetching = () => {
    setIsFetching(!isFetching);
  };

  const handleClear = () => {
    dispatch(clearStockData());
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const chartData = {
    labels: data.map(entry => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.map(entry => entry.price),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen p-8`}>
      <div className="container mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center">Real-Time Crypto Prices</h1>
        <div className="flex justify-end mb-4">
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={toggleTheme}
          >
            Toggle Theme
          </button>
        </div>
        <div className="flex justify-center space-x-4 mb-8">
          {symbols.map((sym) => (
            <div key={sym} className="flex items-center space-x-2">
              <button
                className={`${
                  sym === symbol ? 'bg-blue-700' : 'bg-blue-500'
                } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300`}
                onClick={() => handleSymbolChange(sym)}
              >
                {sym}
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded transition duration-300"
                onClick={() => removeSymbolHandler(sym)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            className={`${
              isFetching ? 'bg-red-500' : 'bg-green-500'
            } hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300`}
            onClick={toggleFetching}
          >
            {isFetching ? 'Pause' : 'Resume'}
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
        <form onSubmit={addNewSymbol} className="flex justify-center mb-8">
          <input
            type="text"
            name="symbol"
            placeholder="Add Symbol"
            className="bg-gray-700 text-white px-4 py-2 rounded-l focus:outline-none"
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r transition duration-300"
          >
            Add
          </button>
        </form>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          {symbol && (
            <>
              <h2 className="text-3xl font-bold mb-4 text-center">{symbol} Price Chart</h2>
              <Line data={chartData} />
            </>
          )}
        </div>
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
          <StockTable data={data} />
        </div>
      </div>
    </div>
  );
};

export default Home;
