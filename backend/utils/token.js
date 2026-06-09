import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

export const getRoleRedirect = (role) => {
  const paths = {
    donor: "/donor",
    hospital: "/hospital",
    "blood-lab": "/lab",
    admin: "/admin",
  };
  return paths[role] || "/";
};
