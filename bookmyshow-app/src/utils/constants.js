// Application Constants

export const APP_NAME = 'BookMyShow';
export const APP_VERSION = '1.0.0';

// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Local Storage Keys
export const STORAGE_KEYS = {
    USER: 'user',
    TOKEN: 'token',
    BOOKING_HISTORY: 'bookingHistory',
    CART: 'cart',
};

// Routes
export const ROUTES = {
    HOME: '/',
    MOVIE: '/movie/:id',
    BOOKING: '/booking',
    PAYMENT: '/payment',
    SUMMARY: '/summary',
    LOGIN: '/login',
    HISTORY: '/history',
};

// Booking Status
export const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
};
