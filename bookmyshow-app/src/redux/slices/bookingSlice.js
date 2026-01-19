// Booking Slice - Manages booking state

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentBooking: null,
    selectedSeats: [],
    selectedDate: null,
    selectedTime: null,
    bookingHistory: [],
    loading: false,
    error: null,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setCurrentBooking: (state, action) => {
            state.currentBooking = action.payload;
        },
        setSelectedSeats: (state, action) => {
            state.selectedSeats = action.payload;
        },
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },
        setSelectedTime: (state, action) => {
            state.selectedTime = action.payload;
        },
        addToBookingHistory: (state, action) => {
            state.bookingHistory.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearBooking: (state) => {
            state.currentBooking = null;
            state.selectedSeats = [];
            state.selectedDate = null;
            state.selectedTime = null;
        },
    },
});

export const {
    setCurrentBooking,
    setSelectedSeats,
    setSelectedDate,
    setSelectedTime,
    addToBookingHistory,
    setLoading,
    setError,
    clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
