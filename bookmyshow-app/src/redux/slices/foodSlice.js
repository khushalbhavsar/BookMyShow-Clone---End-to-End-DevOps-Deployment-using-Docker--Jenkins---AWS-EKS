// Food Slice - Manages food/snacks state

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    cart: [],
    loading: false,
    error: null,
};

const foodSlice = createSlice({
    name: 'food',
    initialState,
    reducers: {
        setFoodItems: (state, action) => {
            state.items = action.payload;
        },
        addToCart: (state, action) => {
            const existingItem = state.cart.find(item => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.cart.push({ ...action.payload, quantity: 1 });
            }
        },
        removeFromCart: (state, action) => {
            state.cart = state.cart.filter(item => item.id !== action.payload);
        },
        updateCartQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cart.find(item => item.id === id);
            if (item) {
                item.quantity = quantity;
            }
        },
        clearCart: (state) => {
            state.cart = [];
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setFoodItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setLoading,
    setError,
} = foodSlice.actions;

export default foodSlice.reducer;
