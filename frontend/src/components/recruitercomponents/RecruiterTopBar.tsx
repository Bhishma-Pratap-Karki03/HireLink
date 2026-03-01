import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RecruiterTopBar.css";
import { connectSocket, getSocket } from "../../lib/socketClient";

// Import images
import searchIcon from "../../images/Recruiter Profile Page Images/search icon.svg";
import plusIcon from "../../images/Recruiter Profile Page Images/plus icon.svg";
import notificationsIcon from "../../images/Register Page Images/281_1327.svg";
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";

interface RecruiterTopBarProps {
  onPostJob?: () => void;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

interface NotificationItem {
  id: string;
  type:
    | "connection_request_received"
    | "connection_request_accepted"
    | "application_status_updated"
    | "message_received";
  isRead: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
  targetPath: string;
  unreadMessageCount?: number;
  actor?: {
    id: string;
    fullName: string;
    role: string;
    profilePicture?: string;
  };
}

interface MessageConversationItem {
  user: {
    id: string;
    fullName: string;
    role: string;
    profilePicture?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
  unreadCount?: number;
}

const resolveAvatar = (value?: string) => {
  if (!value) return defaultAvatar;
  if (value.startsWith("http")) return value;
  return `http://localhost:5000${value}`;
};

const getNotificationTime = (item: NotificationItem) => {
  const primary = new Date(item.updatedAt || item.createdAt).getTime();
  if (!Number.isNaN(primary)) return primary;
  const fallback = new Date(item.createdAt).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
};

const RecruiterTopBar: React.FC<RecruiterTopBarProps> = ({
  onPostJob = () => {},
  onSearch = () => {},
  showSearch = false,
  searchPlaceholder = "Search candidates, jobs, or keywords...",
}) => {
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const parsedUser =
    typeof window !== "undefined"
      ? (() => {
          try {
            const raw = localStorage.getItem("userData");
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })()
      : null;
  const userRole = parsedUser?.role || "";
  const userId = parsedUser?.id || "";

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [connectionNotificationItems, setConnectionNotificationItems] =
    useState<NotificationItem[]>([]);
  const [messageNotificationItems, setMessageNotificationItems] = useState<
    NotificationItem[]
  >([]);
  const [connectionUnreadCount, setConnectionUnreadCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);

  const notificationItems = useMemo(() => {
    return [...connectionNotificationItems, ...messageNotificationItems]
      .sort((a, b) => getNotificationTime(b) - getNotificationTime(a))
      .slice(0, 5);
  }, [connectionNotificationItems, messageNotificationItems]);

  const unreadNotificationCount = connectionUnreadCount + messageUnreadCount;

  const fetchConnectionNotifications = async (silent = false) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setConnectionNotificationItems([]);
      setConnectionUnreadCount(0);
      return;
    }
    try {
      if (!silent) {
        setNotificationLoading(true);
        setNotificationError("");
      }
      const response = await fetch(
        "http://localhost:5000/api/connections/notifications?limit=5",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load notifications");
      }
      setConnectionNotificationItems(data?.notifications || []);
      setConnectionUnreadCount(Number(data?.unreadCount || 0));
    } catch (error: any) {
      if (!silent) {
        setNotificationError(error?.message || "Failed to load notifications");
      }
    } finally {
      if (!silent) {
        setNotificationLoading(false);
      }
    }
  };

  const fetchMessageNotifications = async (silent = false) => {
    const token = localStorage.getItem("authToken");
    if (!token || userRole !== "recruiter") {
      setMessageNotificationItems([]);
      setMessageUnreadCount(0);
      return;
    }

    try {
      if (!silent) {
        setNotificationLoading(true);
        setNotificationError("");
      }
      const response = await fetch(
        "http://localhost:5000/api/messages/conversations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load message notifications",
        );
      }

      const conversations = (data?.conversations || []) as MessageConversationItem[];
      const unreadConversations = conversations.filter(
        (item) => Number(item?.unreadCount || 0) > 0,
      );
      const totalUnread = unreadConversations.reduce(
        (sum, item) => sum + Number(item?.unreadCount || 0),
        0,
      );

      const mapped = unreadConversations
        .map((item) => {
          const unreadCount = Number(item.unreadCount || 0);
          const messageBody = item.lastMessage?.content?.trim()
            ? item.lastMessage.content
            : "sent you a message.";
          return {
            id: `message:${item.user.id}`,
            type: "message_received" as const,
            isRead: false,
            message:
              unreadCount > 1
                ? `${item.user.fullName} sent ${unreadCount} new messages.`
                : `${item.user.fullName}: ${messageBody}`,
            createdAt: item.lastMessage?.createdAt || item.updatedAt,
            updatedAt: item.lastMessage?.createdAt || item.updatedAt,
            targetPath: `/recruiter/messages?user=${item.user.id}`,
            unreadMessageCount: unreadCount,
            actor: {
              id: item.user.id,
              fullName: item.user.fullName || "User",
              role: item.user.role || "",
              profilePicture: item.user.profilePicture || "",
            },
          };
        })
        .sort((a, b) => getNotificationTime(b) - getNotificationTime(a))
        .slice(0, 5);

      setMessageNotificationItems(mapped);
      setMessageUnreadCount(totalUnread);
    } catch (error: any) {
      if (!silent) {
        setNotificationError(
          error?.message || "Failed to load message notifications",
        );
      }
    } finally {
      if (!silent) {
        setNotificationLoading(false);
      }
    }
  };

  const toggleNotificationMenu = () => {
    setIsNotificationOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchConnectionNotifications();
        fetchMessageNotifications();
      }
      return next;
    });
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (item.type === "message_received") {
      setMessageNotificationItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, isRead: true } : entry,
        ),
      );
      const consumedUnread = Number(item.unreadMessageCount || 0);
      if (consumedUnread > 0) {
        setMessageUnreadCount((prev) => Math.max(prev - consumedUnread, 0));
      }
      setIsNotificationOpen(false);
      navigate(item.targetPath || "/recruiter/messages");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/connections/notifications/read",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ notificationId: item.id }),
          },
        );
        const data = await response.json();
        if (response.ok) {
          setConnectionNotificationItems((prev) =>
            prev.map((entry) =>
              entry.id === item.id ? { ...entry, isRead: true } : entry,
            ),
          );
          setConnectionUnreadCount(Number(data?.unreadCount || 0));
        }
      } catch {
        // continue navigation even if read update fails
      }
    }

    setIsNotificationOpen(false);
    if (item.type === "connection_request_received") {
      navigate("/recruiter/friend-requests");
      return;
    }
    navigate(item.targetPath || "/home");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    if (!token || userRole !== "recruiter") return;

    const socket = connectSocket(token);
    if (!socket) return;

    const handleConnectionNotification = (payload: {
      notification?: NotificationItem;
      unreadCount?: number;
    }) => {
      const incoming = payload?.notification;
      if (!incoming) return;
      setConnectionNotificationItems((prev) => {
        const merged = [incoming, ...prev.filter((item) => item.id !== incoming.id)];
        return merged.slice(0, 5);
      });
      setConnectionUnreadCount((prev) =>
        typeof payload?.unreadCount === "number"
          ? Number(payload.unreadCount)
          : prev + 1,
      );
    };

    const handleMessageNotification = (payload: any) => {
      const receiverId = String(payload?.receiverId || "");
      const senderId = String(payload?.senderId || "");
      const actor = payload?.sender;

      if (!receiverId || !senderId || !userId || receiverId !== userId) return;

      const nextUpdatedAt = payload?.createdAt || new Date().toISOString();
      setMessageNotificationItems((prev) => {
        const existing = prev.find((item) => item.id === `message:${senderId}`);
        const unreadCount = Number(existing?.unreadMessageCount || 0) + 1;
        const updatedItem: NotificationItem = {
          id: `message:${senderId}`,
          type: "message_received",
          isRead: false,
          message: `${actor?.fullName || "User"}: ${payload?.content || "sent you a message."}`,
          createdAt: nextUpdatedAt,
          updatedAt: nextUpdatedAt,
          targetPath: `/recruiter/messages?user=${senderId}`,
          unreadMessageCount: unreadCount,
          actor: {
            id: senderId,
            fullName: actor?.fullName || "User",
            role: actor?.role || "",
            profilePicture: actor?.profilePicture || "",
          },
        };
        const merged = [updatedItem, ...prev.filter((item) => item.id !== updatedItem.id)];
        return merged.slice(0, 5);
      });
      setMessageUnreadCount((prev) => prev + 1);
    };

    const handleSocketConnect = () => {
      fetchConnectionNotifications(true);
      fetchMessageNotifications(true);
    };

    socket.on("connect", handleSocketConnect);
    socket.on("notification:connection:new", handleConnectionNotification);
    socket.on("message:new", handleMessageNotification);

    fetchConnectionNotifications(true);
    fetchMessageNotifications(true);

    return () => {
      const activeSocket = getSocket();
      activeSocket?.off("connect", handleSocketConnect);
      activeSocket?.off(
        "notification:connection:new",
        handleConnectionNotification,
      );
      activeSocket?.off("message:new", handleMessageNotification);
    };
  }, [userId, userRole]);

  const handlePostJobClick = () => {
    onPostJob();
  };

  return (
    <header
      className={`recruiter-top-bar${showSearch ? " has-search" : ""}`}
    >
      {showSearch && (
        <div className="recruiter-search-container">
          <img src={searchIcon} alt="Search" className="recruiter-search-icon" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="recruiter-search-input"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}
      <div className="recruiter-top-actions">
        <button className="recruiter-btn-primary" onClick={handlePostJobClick}>
          <img src={plusIcon} alt="Plus" />
          <span>Post New Job</span>
        </button>
        <div className="recruiter-icon-group" ref={notificationRef}>
          <button
            className="recruiter-icon-btn"
            type="button"
            onClick={toggleNotificationMenu}
          >
            <img src={notificationsIcon} alt="Notifications" />
            {unreadNotificationCount > 0 && (
              <span className="recruiter-top-notification-badge">
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </span>
            )}
          </button>
          {isNotificationOpen && (
            <div className="recruiter-top-notification-dropdown">
              <div className="recruiter-top-notification-header">
                Recent Notifications
              </div>
              {notificationLoading && (
                <div className="recruiter-top-notification-state">Loading...</div>
              )}
              {!notificationLoading && notificationError && (
                <div className="recruiter-top-notification-state error">
                  {notificationError}
                </div>
              )}
              {!notificationLoading &&
                !notificationError &&
                notificationItems.length === 0 && (
                  <div className="recruiter-top-notification-state">
                    No recent notifications
                  </div>
                )}
              {!notificationLoading &&
                !notificationError &&
                notificationItems.length > 0 && (
                  <ul className="recruiter-top-notification-list">
                    {notificationItems.map((item) => (
                      <li
                        key={item.id}
                        className={`recruiter-top-notification-item ${
                          item.isRead ? "read" : "unread"
                        }`}
                        onClick={() => handleNotificationClick(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleNotificationClick(item);
                          }
                        }}
                      >
                        <img
                          src={resolveAvatar(item.actor?.profilePicture)}
                          alt={item.actor?.fullName || "User"}
                          className={`recruiter-top-notification-avatar ${
                            item.actor?.role === "recruiter"
                              ? "recruiter-logo"
                              : ""
                          }`}
                          onError={(e) => {
                            e.currentTarget.src = defaultAvatar;
                          }}
                        />
                        <div className="recruiter-top-notification-content">
                          <div className="recruiter-top-notification-top">
                            <span className="recruiter-top-notification-status">
                              {item.type === "message_received"
                                ? "Message"
                                : item.type === "application_status_updated"
                                  ? "Application"
                                  : item.type === "connection_request_accepted"
                                    ? "Accepted"
                                    : "New Request"}
                            </span>
                            <span className="recruiter-top-notification-time">
                              {new Date(
                                item.updatedAt || item.createdAt,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="recruiter-top-notification-message">
                            {item.message}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default RecruiterTopBar;
