// API Utility Functions

import { API_BASE_URL } from './constants';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
export const fetchApi = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

/**
 * GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} - Response data
 */
export const get = (endpoint) => fetchApi(endpoint, { method: 'GET' });

/**
 * POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise} - Response data
 */
export const post = (endpoint, data) =>
    fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });

/**
 * PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise} - Response data
 */
export const put = (endpoint, data) =>
    fetchApi(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });

/**
 * DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} - Response data
 */
export const del = (endpoint) => fetchApi(endpoint, { method: 'DELETE' });
