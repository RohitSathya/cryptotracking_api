import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../store';
import axios from 'axios';

interface StockData {
  price: number;
  timestamp: string;
}

interface StockState {
  data: StockData[];
  symbols: string[];
  symbol: string | null;
}

const initialState: StockState = {
  data: [],
  symbols: [],
  symbol: null,
};

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setStockData: (state, action: PayloadAction<StockData[]>) => {
      state.data = action.payload;
    },
    setSymbols: (state, action: PayloadAction<string[]>) => {
      state.symbols = action.payload;
    },
    setSymbol: (state, action: PayloadAction<string>) => {
      state.symbol = action.payload;
    },
    addSymbol: (state, action: PayloadAction<string>) => {
      if (!state.symbols.includes(action.payload)) {
        state.symbols.push(action.payload);
      }
    },
    removeSymbol: (state, action: PayloadAction<{ symbol: string; fromAdmin: boolean }>) => {
      state.symbols = state.symbols.filter((symbol) => symbol !== action.payload.symbol);
      if (state.symbol === action.payload.symbol) {
        state.symbol = state.symbols.length > 0 ? state.symbols[0] : null;
        state.data = [];
      }
      if (!action.payload.fromAdmin) {
        // Only update state.symbol if the removal was not from admin
        state.symbol = state.symbols.length > 0 ? state.symbols[0] : null;
        state.data = [];
      }
    },
    clearStockData: (state) => {
      state.data = [];
    },
  },
});

export const { setStockData, setSymbols, setSymbol, addSymbol, removeSymbol, clearStockData } = stockSlice.actions;

export const fetchStockData = (symbol: string): AppThunk => async (dispatch) => {
  const response = await axios.get(`http://localhost:5000/api/stock/${symbol}`);
  dispatch(setStockData(response.data));
};

export const selectStockData = (state: RootState) => state.stock.data;
export const selectSymbols = (state: RootState) => state.stock.symbols;
export const selectSymbol = (state: RootState) => state.stock.symbol;

export default stockSlice.reducer;
