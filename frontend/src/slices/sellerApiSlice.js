import { apiSlice } from './apiSlice';
import { SELLER_URL } from '../constants';

export const sellerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create seller listing
    createSellerListing: builder.mutation({
      query: (data) => ({
        url: `${SELLER_URL}/products`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SellerListings'],
    }),
    // Get user's own listings
    getMyListings: builder.query({
      query: () => ({
        url: `${SELLER_URL}/my-products`,
      }),
      providesTags: ['SellerListings'],
    }),
    // Update seller listing
    updateSellerListing: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${SELLER_URL}/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SellerListings', 'Product'],
    }),
    // Delete seller listing
    deleteSellerListing: builder.mutation({
      query: (id) => ({
        url: `${SELLER_URL}/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SellerListings'],
    }),
    // Get all seller listings (admin)
    getAllSellerListings: builder.query({
      query: () => ({
        url: `${SELLER_URL}/all`,
      }),
      providesTags: ['SellerListings', 'AdminListings'],
    }),
    // Approve/reject listing (admin)
    approveListing: builder.mutation({
      query: ({ id, status }) => ({
        url: `${SELLER_URL}/admin/products/${id}/approve`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['SellerListings', 'AdminListings', 'Product'],
    }),
    // Mark as sold
    markAsSold: builder.mutation({
      query: (id) => ({
        url: `${SELLER_URL}/products/${id}/sold`,
        method: 'PUT',
      }),
      invalidatesTags: ['SellerListings', 'Product'],
    }),
  }),
});

export const {
  useCreateSellerListingMutation,
  useGetMyListingsQuery,
  useUpdateSellerListingMutation,
  useDeleteSellerListingMutation,
  useGetAllSellerListingsQuery,
  useApproveListingMutation,
  useMarkAsSoldMutation,
} = sellerApiSlice;
