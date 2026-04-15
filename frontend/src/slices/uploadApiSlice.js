import { apiSlice } from './apiSlice';
import { UPLOAD_URL } from '../constants';

export const uploadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Upload single image (for products)
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: UPLOAD_URL,
        method: 'POST',
        body: data,
      }),
    }),
    // Upload multiple images for reviews
    uploadReviewImages: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}/reviews`,
        method: 'POST',
        body: data,
      }),
    }),
    // Upload multiple images for seller listings
    uploadListingImages: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}/listings`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useUploadProductImageMutation,
  useUploadReviewImagesMutation,
  useUploadListingImagesMutation,
} = uploadApiSlice;
