import { configureStore } from '@reduxjs/toolkit';
import avatarReducer from './avatarSlice';
import contentReducer from './contentSlice';


export const store = configureStore({
  reducer: {
    avatar: avatarReducer,
    content: contentReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;