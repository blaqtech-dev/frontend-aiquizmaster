import { Navigate }
from "react-router-dom";

import { useAuth }
from "../../context/authcontext/authcontext";

function ProtectedRoute({
  children,
  role,
  requirePro = false,
}) {

  const {
    user,
    profile,
    loading,
  } = useAuth();

  if (loading) {

    return (
      <div>
        Loading...
      </div>
    );
  }

  if (!user) {

    return (
      <Navigate to="/login" />
    );
  }

  if (
    role &&
    profile?.role !== role
  ) {

    return (
      <Navigate to="/" />
    );
  }

  // ================= PRO CHECK =================

  if (
    requirePro &&
    profile?.plan !== "pro"
  ) {

    return (
      <Navigate to="/pricing" />
    );
  }

  return children;
}

export default ProtectedRoute;