/* eslint-disable @typescript-eslint/no-explicit-any */
// store/avatarSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { api } from '@/lib/api';

const loadUserFromStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const persistUserToStorage = (user: any) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_user');
  }
};

export interface SchoolUser {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' ;
  avatar?: string | null;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  schoolId?: string;
  classId?: string;
  section?: string;
  employeeId?: string;
  rollNumber?: string;
}

interface AvatarState {
  user: SchoolUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AvatarState = {
  user:    loadUserFromStorage(),
  loading: false,
  error:   null,
};

export const fetchUser = createAsyncThunk(
  'avatar/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    if (state.avatar.user) {
      return { skip: true };
    }

    try {
      const data = await api.get('/auth/profile');
      
      if (!data.success) {
        return rejectWithValue(null);
      }
      
      return data.user as SchoolUser;
    } catch (error: any) {
      return rejectWithValue(null);
    }
  }
);
const avatarSlice = createSlice({
  name: 'avatar',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
      state.loading = false;
      persistUserToStorage(action.payload);
    },
    clearUser: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
      persistUserToStorage(null);
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !(action.payload as any).skip) {
          state.user = action.payload as SchoolUser;
          persistUserToStorage(action.payload);
        }
      })

      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to load user';
      });
  },
});

export const { clearUser, setUser, setLoading } = avatarSlice.actions;
export default avatarSlice.reducer;