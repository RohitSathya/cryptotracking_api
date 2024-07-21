"use client";

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockData, selectStockData, selectSymbols, selectSymbol, setSymbol, addSymbol, removeSymbol, clearStockData, setSymbols } from '../../slices/stockSlice';
import axios from 'axios';
import StockTable from '../components/StockTable';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { AppDispatch } from '../../store';
import 'tailwindcss/tailwind.css';

// Register chart.js components
Chart.register(...registerables);

const Admin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector(selectStockData);
  const symbols = useSelector(selectSymbols);
  const selectedSymbol = useSelector(selectSymbol);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const fetchSymbols = async () => {
      const response = await axios.get('http://localhost:5000/api/symbols');
      dispatch(setSymbols(response.data));
    };
    fetchSymbols();
  }, [dispatch]);

  useEffect(() => {
    if (isFetching && selectedSymbol) {
      dispatch(fetchStockData(selectedSymbol));
      const interval = setInterval(() => {
        dispatch(fetchStockData(selectedSymbol));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [dispatch, selectedSymbol, isFetching]);

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
        label: `${selectedSymbol} Price`,
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
        <div className="flex justify-between mb-8">
          <h1 className="text-5xl font-bold">Admin Dashboard</h1>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={toggleTheme}
          >
            Toggle Theme
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Manage Symbols</h2>
            <form onSubmit={addNewSymbol} className="flex justify-center mb-4">
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
            <div className="space-y-2">
              {symbols.map((sym) => (
                <div key={sym} className="flex items-center justify-between">
                  <button
                    className={`${
                      sym === selectedSymbol ? 'bg-blue-700' : 'bg-blue-500'
                    } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300`}
                    onClick={() => handleSymbolChange(sym)}
                  >
                    {sym}
                  </button>
                 
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Real-Time Data</h2>
            {selectedSymbol && (
              <>
                <h3 className="text-xl font-bold mb-2">{selectedSymbol} Price Chart</h3>
                <Line data={chartData} />
              </>
            )}
            <div className="flex justify-center space-x-4 mt-4">
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
          </div>

          <div className="col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Data Table</h2>
            <StockTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
