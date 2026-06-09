export const ROLE_DASHBOARD_PATHS = {
  donor: "/donor",
  hospital: "/hospital",
  "blood-lab": "/lab",
  admin: "/admin",
};

export const getDashboardPath = (role) =>
  ROLE_DASHBOARD_PATHS[role] || "/";

export const getProfilePath = (role) => {
  const paths = {
    donor: "/donor/profile",
    hospital: "/hospital/profile",
    "blood-lab": "/lab/profile",
    admin: "/admin",
  };
  return paths[role] || getDashboardPath(role);
};

export const persistAuthSession = (data) => {
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
        authProvider: data.user.authProvider,
      }),
    );
  }
};
