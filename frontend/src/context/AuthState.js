// frontend/src/context/AuthState.js
import React, { useReducer, useEffect } from 'react';
import AuthContext from './AuthContext';
import api from '../api/axios';

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return { ...state, isAuthenticated: true, token: action.payload.token, error: null };
        case 'USER_LOADED':
            return { ...state, isAuthenticated: true, user: action.payload };
        case 'AUTH_ERROR':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return { ...state, token: null, isAuthenticated: false, user: null, error: action.payload };
        default:
            return state;
    }
};

const AuthState = ({ children }) => {
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        user: null,
        error: null,
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['x-auth-token'] = token;
            try {
                const res = await api.get('/auth/user');
                dispatch({ type: 'USER_LOADED', payload: res.data });
            } catch (err) {
                dispatch({ type: 'AUTH_ERROR' });
            }
        } else {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    useEffect(() => {
        if(state.token) {
            loadUser();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.token]);

    // Register User
    const register = async (formData) => {
        try {
            const res = await api.post('/auth/register', formData);
            dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
            return { success: true };
        } catch (err) {
            const errorMsg = err.response.data.msg || 'An error occurred';
            dispatch({ type: 'AUTH_ERROR', payload: errorMsg });
            return { success: false, error: errorMsg };
        }
    };

    // Login User
    const login = async (formData) => {
        try {
            const res = await api.post('/auth/login', formData);
            dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
            return { success: true };
        } catch (err) {
            const errorMsg = err.response.data.msg || 'An error occurred';
            dispatch({ type: 'AUTH_ERROR', payload: errorMsg });
            return { success: false, error: errorMsg };
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    return (
        <AuthContext.Provider value={{ ...state, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthState;