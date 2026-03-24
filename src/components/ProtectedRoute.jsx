import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect to their respective dashboard if they try to access unauthorized pages
        switch (currentUser.role) {
            case 'admin':
                return <Navigate to="/admin" replace />;
            case 'donor':
                return <Navigate to="/dashboard" replace />;
            case 'ngo':
                return <Navigate to="/feed" replace />;
            case 'volunteer':
                return <Navigate to="/tasks" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
