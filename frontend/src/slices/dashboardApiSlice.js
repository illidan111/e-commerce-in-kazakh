import { apiSlice } from './apiSlice';

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: '/api/dashboard/stats',
      }),
      providesTags: ['Dashboard'],
    }),
    getMonthlySales: builder.query({
      query: () => ({
        url: '/api/dashboard/monthly-sales',
      }),
      providesTags: ['Dashboard'],
    }),
    getRecentOrders: builder.query({
      query: () => ({
        url: '/api/dashboard/recent-orders',
      }),
      providesTags: ['Order'],
    }),
    getTopProducts: builder.query({
      query: () => ({
        url: '/api/dashboard/top-products',
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetMonthlySalesQuery,
  useGetRecentOrdersQuery,
  useGetTopProductsQuery,
} = dashboardApiSlice;
