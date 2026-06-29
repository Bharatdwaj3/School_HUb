
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ContentState {
  savedSubjects: string[];
  visitedProfiles: string[];
  searchQuery: string;
  selectedCategory: string;
}

const getCurrentUserId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('currentUserId') || undefined;
};

const loadFromLocalStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const userId = getCurrentUserId();
    const finalKey = userId ? `${key}_${userId}` : key;
    const saved = localStorage.getItem(finalKey);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  const userId = getCurrentUserId();
  const finalKey = userId ? `${key}_${userId}` : key;
  localStorage.setItem(finalKey, JSON.stringify(value));
};

const initialState: ContentState = {
  savedSubjects: loadFromLocalStorage<string[]>('schoolhub_savedSubjects', []),
  visitedProfiles: loadFromLocalStorage<string[]>('schoolhub_visitedProfiles', []),
  searchQuery: '',
  selectedCategory: 'all',
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    toggleSavedSubject: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.savedSubjects.indexOf(id);
      if (index > -1) {
        state.savedSubjects.splice(index, 1);
      } else {
        state.savedSubjects.push(id);
      }
      saveToLocalStorage('schoolhub_savedSubjects', state.savedSubjects);
    },

    markVisited: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.visitedProfiles.indexOf(id);
      if (index > -1) state.visitedProfiles.splice(index, 1);
      state.visitedProfiles.unshift(id);
      if (state.visitedProfiles.length > 20) {
        state.visitedProfiles = state.visitedProfiles.slice(0, 20);
      }
      saveToLocalStorage('schoolhub_visitedProfiles', state.visitedProfiles);
    },
    clearVisitedProfiles: (state) => {
      state.visitedProfiles = [];
      saveToLocalStorage('schoolhub_visitedProfiles', []);
    },
    clearSavedSubjects: (state) => {
      state.savedSubjects = [];
      saveToLocalStorage('schoolhub_savedSubjects', []);
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setFilter: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
  rehydrate: (state) => {
state.savedSubjects = loadFromLocalStorage<string[]>('schoolhub_savedSubjects', []);
state.visitedProfiles = loadFromLocalStorage<string[]>('schoolhub_visitedProfiles', []);
    },
  },
});

export const {
   rehydrate,
  toggleSavedSubject,
  markVisited,
  clearVisitedProfiles,
  clearSavedSubjects,
  setSearchQuery,
  setFilter,
} = contentSlice.actions;

export default contentSlice.reducer;