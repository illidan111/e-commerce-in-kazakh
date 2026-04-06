import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favoriteItems: localStorage.getItem('favorites')
    ? JSON.parse(localStorage.getItem('favorites'))
    : [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const product = action.payload;
      const existItem = state.favoriteItems.find((x) => x._id === product._id);

      if (!existItem) {
        state.favoriteItems.push(product);
        localStorage.setItem('favorites', JSON.stringify(state.favoriteItems));
      }
    },
    removeFromFavorites: (state, action) => {
      const productId = action.payload;
      state.favoriteItems = state.favoriteItems.filter((x) => x._id !== productId);
      localStorage.setItem('favorites', JSON.stringify(state.favoriteItems));
    },
    clearFavorites: (state) => {
      state.favoriteItems = [];
      localStorage.removeItem('favorites');
    },
  },
});

export const { addToFavorites, removeFromFavorites, clearFavorites } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;
