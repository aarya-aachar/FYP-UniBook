/**
 * The Reservation Manager (Booking Service)
 * 
 * relative path: /src/services/bookingService.js
 * 
 * This file handles all "Transaction" logic. It is responsible for 
 * looking up availability, creating new appointments, and handling 
 * user feedback (reviews).
 */

import api from './api';

/**
 * getBookedTimes
 * Pulls the busy schedule for a specific provider. 
 * Used to gray-out slots on the booking calendar.
 */
export const getBookedTimes = async (providerId, date) => {
  const res = await api.get(`/bookings/provider/${providerId}/date/${date}`);
  return res.data;
};

/**
 * createBooking
 * The main trigger to request an appointment slot.
 */
export const createBooking = async (bookingData) => {
  const res = await api.post('/bookings', bookingData);
  return res.data;
};

/**
 * getUserBookings
 * Fetches all UPCOMING appointments for the logged-in user.
 */
export const getUserBookings = async () => {
  const res = await api.get('/bookings/user');
  return res.data;
};

/**
 * getAllBookings
 * ADMIN ONLY: Fetches the entire history of the platform for audit.
 */
export const getAllBookings = async () => {
  const res = await api.get('/bookings/admin');
  return res.data;
};

/**
 * getPastUserBookings
 * Fetches HISTORICAL appointments for the "My Reports" section.
 */
export const getPastUserBookings = async () => {
  const res = await api.get('/bookings/user/reports');
  return res.data;
};

/**
 * --- REVIEW & FEEDBACK HANDLERS ---
 */

export const submitReview = async (booking_id, provider_id, rating, comment) => {
  const res = await api.post('/reviews', { booking_id, provider_id, rating, comment });
  return res.data;
};

export const getProviderReviews = async (providerId) => {
  const res = await api.get(`/reviews/provider/${providerId}`);
  return res.data;
};

export const getProviderReviewStats = async (providerId) => {
  const res = await api.get(`/reviews/provider/${providerId}/stats`);
  return res.data;
};


