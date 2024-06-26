import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { useSelector as useSelectorBase, TypedUseSelectorHook } from 'react-redux';
import { sessionApi } from '../services/session';
import ScreenReducer from './slices/screen';

export const store = configureStore({
  reducer: {
    [sessionApi.reducerPath]: sessionApi.reducer,
    screen: ScreenReducer,
  },

  middleware: (defaultMiddleware) => defaultMiddleware()
    .concat(sessionApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useSelector: TypedUseSelectorHook<RootState> = useSelectorBase;

setupListeners(store.dispatch);
