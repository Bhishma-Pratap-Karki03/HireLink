export const fetchUserProfile = async () => {
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

export const getProfileImageUrl = (profilePicture: string): string => {
  const defaultAvatar = "/images/Register Page Images/Default Profile.webp";

  if (!profilePicture || profilePicture === "") {
    return defaultAvatar;
  }

  if (profilePicture.startsWith("http")) {
    // Add cache-busting timestamp
    const separator = profilePicture.includes("?") ? "&" : "?";
    return `${profilePicture}${separator}t=${Date.now()}`;
  } else {
    // Add cache-busting timestamp
    return `http://localhost:5000${profilePicture}?t=${Date.now()}`;
  }
};
