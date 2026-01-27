import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './slices/bookingSlice';
import cinemaReducer from './slices/cinemaSlice';
import foodReducer from './slices/foodSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    booking: bookingReducer,
    cinema: cinemaReducer,
    food: foodReducer,
    user: userReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export { store };
