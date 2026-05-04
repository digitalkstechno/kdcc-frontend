import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import cookieCutter from 'cookie-cutter';

interface AuthState {
  user: any | null;
  admin: any | null;
  users: any[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  admin: null,
  users: [],
  totalRecords: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const fetchUsers = createAsyncThunk(
  'auth/fetchUsers',
  async ({ page = 1, limit = 10, search = "" }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/builder/all?page=${page}&limit=${limit}&search=${search}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch builders');
    }
  }
);

export const createUserAdmin = createAsyncThunk(
  'auth/createUserAdmin',
  async (userData: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/user/create', userData);
      dispatch(fetchUsers({ page: 1 }));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'auth/toggleUserStatus',
  async ({ userId, status }: { userId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/user/update/${userId}`, { status });
      return { userId, status: response.data.data.status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/login', credentials);
      const { token, data: user } = response.data;
      
      if (user.role !== 'user') {
        throw new Error('Access denied. Please use the Admin login portal.');
      }
      
      localStorage.setItem('mkgroup_user_token', token);
      cookieCutter.set('mkgroup_user_auth', 'true', { path: '/' });
      
      return { token, user };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/login', credentials);
      const { token, data: admin } = response.data;
      
      if (admin.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      
      localStorage.setItem('mkgroup_admin_token', token);
      cookieCutter.set('mkgroup_admin_auth', 'true', { path: '/' });
      
      return { token, admin };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Admin login failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/me');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch current user');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/builder/me');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.put('/builder/me/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.admin = null;
      state.isAuthenticated = false;
      localStorage.removeItem('mkgroup_user_token');
      localStorage.removeItem('mkgroup_admin_token');
      cookieCutter.set('mkgroup_user_auth', 'false', { path: '/', expires: new Date(0) });
      cookieCutter.set('mkgroup_admin_auth', 'false', { path: '/', expires: new Date(0) });
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // User Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Admin Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.role === 'admin') {
          state.admin = action.payload;
        } else {
          state.user = action.payload;
        }
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pagination } = action.payload;
        state.users = data;
        state.totalRecords = pagination.totalRecords;
        state.currentPage = pagination.currentPage;
        state.totalPages = pagination.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create User
      .addCase(createUserAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUserAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUserAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle Status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        const userIndex = state.users.findIndex(u => u._id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].status = status;
        }
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
