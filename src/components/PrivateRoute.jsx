import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loader from './Loader';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children }) => {
  const { user, status } = useSelector((state) => state.user);

  if (status === 'loading') return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
