"use client";

import { useState } from "react";

type Notification = {
  id: string;
  type: "bid" | "contract" | "tender" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

// Mock notifications - in production, these would come from an API
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "bid",
    title: "New Bid Received",
    message: "You received a bid on Premium SAF lot from SkyLink Air",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "contract",
    title: "Contract Milestone Due",
    message: "Delivery milestone for Q3 2025 contract due in 5 days",
    timestamp: "1 day ago",
    read: false,
  },
  {
    id: "3",
    type: "tender",
    title: "New Tender Available",
    message: "Global Vista Airlines posted a new tender: Transatlantic Summer Blend",
    timestamp: "2 days ago",
    read: true,
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "bid":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0176d3]/10">
            <svg className="h-4 w-4 text-[#0176d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case "contract":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff9800]/10">
            <svg className="h-4 w-4 text-[#ff9800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "tender":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2e844a]/10">
            <svg className="h-4 w-4 text-[#2e844a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#706e6b]/10">
            <svg className="h-4 w-4 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#706e6b] transition-colors hover:bg-[#f3f2f2] hover:text-[#181818]"
        aria-label="Notifications"
      >
        <div className="relative">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c23934] text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <span>Notifications</span>
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-[#e5e5e5] bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-[#181818]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-[#706e6b]">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-[#0176d3] transition-colors hover:text-[#014486]"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f9fa]">
                    <svg className="h-6 w-6 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[#706e6b]">No notifications</p>
                  <p className="mt-1 text-xs text-[#706e6b]">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-[#f3f2f2] px-4 py-3 transition-colors hover:bg-[#f8f9fa] ${
                      !notification.read ? "bg-[#f8f9fa]" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[#181818]">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#0176d3]" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#706e6b]">
                          {notification.message}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-[#706e6b]">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-[#e5e5e5] px-4 py-2.5 text-center">
                <button className="text-xs font-medium text-[#0176d3] transition-colors hover:text-[#014486]">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

