// Cinema Slice - Manages cinema/theater state

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cinemas: [],
    selectedCinema: null,
    showtimes: [],
    loading: false,
    error: null,
};

const cinemaSlice = createSlice({
    name: 'cinema',
    initialState,
    reducers: {
        setCinemas: (state, action) => {
            state.cinemas = action.payload;
        },
        setSelectedCinema: (state, action) => {
            state.selectedCinema = action.payload;
        },
        setShowtimes: (state, action) => {
            state.showtimes = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearCinemaSelection: (state) => {
            state.selectedCinema = null;
            state.showtimes = [];
        },
    },
});

export const {
    setCinemas,
    setSelectedCinema,
    setShowtimes,
    setLoading,
    setError,
    clearCinemaSelection,
} = cinemaSlice.actions;

export default cinemaSlice.reducer;
