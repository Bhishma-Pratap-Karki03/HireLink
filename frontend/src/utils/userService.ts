export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  about?: string;
  currentJobTitle?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

// Fetch user profile from backend
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return null;
  }

  try {
    const response = await fetch("http://localhost:5000/api/profile/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    } else if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      return null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Get profile image URL with cache busting
export const getProfileImageUrl = (profilePicture?: string): string => {
  const defaultAvatar = "/images/Register Page Images/Default Profile.webp";

  if (!profilePicture || profilePicture.trim() === "") {
    return defaultAvatar;
  }

  // If it's already a full URL
  if (profilePicture.startsWith("http")) {
    const separator = profilePicture.includes("?") ? "&" : "?";
    return `${profilePicture}${separator}t=${Date.now()}`;
  }

  // If it's a relative path
  return `http://localhost:5000${profilePicture}?t=${Date.now()}`;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("authToken");
  return !!token;
};

// Get user role
export const getUserRole = (): string | null => {
  const userDataStr = localStorage.getItem("userData");
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return userData.role || null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

// Get user data from localStorage
export const getUserData = (): any | null => {
  const userDataStr = localStorage.getItem("userData");
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};
