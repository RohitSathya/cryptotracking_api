"use client";

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockData, selectStockData, selectSymbols, setSymbol, addSymbol, removeSymbol, clearStockData, setSymbols } from '../slices/stockSlice';
import axios from 'axios';
import StockTable from './components/StockTable';
import { AppDispatch } from '../store';
import styles from './page.module.css';

const Admin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector(selectStockData);
  const symbols = useSelector(selectSymbols);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');

  useEffect(() => {
    const fetchSymbols = async () => {
      const response = await axios.get('http://localhost:5000/api/symbols');
      dispatch(setSymbols(response.data)); // Use dispatch to set symbols in the Redux state
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
    setSelectedSymbol(newSymbol);
    dispatch(setSymbol(newSymbol));
  };

  const addNewSymbol = async (e: any) => {
    e.preventDefault();
    const newSymbol = e.target.symbol.value.toUpperCase();
    if (newSymbol && !symbols.includes(newSymbol)) {
      await axios.post('http://localhost:5000/api/stock', { symbol: newSymbol });
      dispatch(addSymbol(newSymbol));
    }
    e.target.reset();
  };

  const removeSymbolHandler = (symbolToRemove: string) => {
    dispatch(removeSymbol(symbolToRemove));
  };

  const toggleFetching = () => {
    setIsFetching(!isFetching);
  };

  const handleClear = () => {
    dispatch(clearStockData());
  };

  return (
    <div className={styles.main}>
      <div className="relative bg-gray-800 text-white min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <div className="flex justify-center space-x-4 mb-6">
          {symbols.map((sym) => (
            <div key={sym} className="flex items-center space-x-2">
              <button
                className={`${
                  sym === selectedSymbol ? 'bg-blue-700' : 'bg-blue-500'
                } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
                onClick={() => handleSymbolChange(sym)}
              >
                {sym}
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                onClick={() => removeSymbolHandler(sym)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`${
              isFetching ? 'bg-red-500' : 'bg-green-500'
            } hover:bg-red-700 text-white font-bold py-2 px-4 rounded`}
            onClick={toggleFetching}
          >
            {isFetching ? 'Pause' : 'Resume'}
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
        <form onSubmit={addNewSymbol} className="mt-6 flex justify-center">
          <input
            type="text"
            name="symbol"
            placeholder="Add Symbol"
            className="bg-gray-700 text-white px-4 py-2 rounded-l focus:outline-none"
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r"
          >
            Add
          </button>
        </form>
        <div className="p-8 w-full">
          <StockTable data={data} />
        </div>
      </div>
    </div>
  );
};

export default Admin;
