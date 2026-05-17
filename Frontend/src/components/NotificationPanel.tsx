'use client';

import { useState, FormEvent } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface NotificationPanelProps {
  userId?: string;
}

interface FormDataType {
  title: string;
  message: string;
  type: string;
}

interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: string;
  icon: string;
  read: boolean;
  timestamp: string;
}

export default function NotificationPanel({
  userId = 'user-1',
}: NotificationPanelProps) {
  const {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useWebSocket(userId);

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    message: '',
    type: 'message',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendNotification = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

    const params = new URLSearchParams({
      user_id: userId,
      title: formData.title,
      message: formData.message,
      notif_type: formData.type,
      icon: getIcon(formData.type),
    });

    try {
      const response = await fetch(
        `http://localhost:5000/send-notification?${params.toString()}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setFormData({
          title: '',
          message: '',
          type: 'message',
        });

        alert('✅ Notification Sent!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error sending notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string): string => {
    const icons: Record<string, string> = {
      message: '💬',
      order: '📦',
      payment: '💳',
      alert: '⚠️',
      success: '✅',
    };

    return icons[type] || '🔔';
  };

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);

    const seconds = Math.floor(
      (new Date().getTime() - date.getTime()) / 1000
    );

    if (seconds < 60) return 'Just now';
    if (seconds < 3600)
      return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)}h ago`;

    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] relative overflow-hidden">
      
      {/* Background Blur */}
      <div className="absolute top-0 left-0 w-64 sm:w-80 md:w-96 lg:w-100 h-64 sm:h-80 md:h-96 lg:h-100 bg-blue-500/20 blur-[80px] sm:blur-[100px] md:blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-64 sm:w-80 md:w-96 lg:w-100 h-64 sm:h-80 md:h-96 lg:h-100 bg-purple-500/20 blur-[80px] sm:blur-[100px] md:blur-[120px] rounded-full" />

      <div className="relative z-10 w-full min-h-screen px-3 sm:px-4 md:px-6 lg:px-10 py-6 sm:py-8 md:py-10">
        
        {/* Top Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5">
            
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white wrap-break-word">
                Realtime Notifications
              </h1>

              <p className="text-gray-300 mt-2 sm:mt-3 text-sm sm:text-base md:text-lg">
                WebSocket powered notification dashboard
              </p>
            </div>

            {/* Status Cards */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
              
              {/* Connection Status */}
              <div className="bg-white/10 border border-white/10 backdrop-blur-xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl md:rounded-2xl">
                <p className="text-gray-300 text-xs sm:text-sm">
                  Connection
                </p>

                <div
                  className={`mt-1 font-bold text-xs sm:text-sm ${
                    isConnected
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {isConnected
                    ? '🟢 Connected'
                    : '🔴 Offline'}
                </div>
              </div>

              {/* Unread Count */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-br from-pink-500 to-red-500 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold text-white shadow-xl sm:shadow-2xl">
                {unreadCount}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid - Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
          
          {/* Left Side - Form */}
          <div className="md:col-span-1 w-full">
            <div className="sticky top-4 sm:top-6 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] sm:shadow-[0_0_50px_rgba(0,0,0,0.3)]">

              <div className="mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-5 shadow-lg sm:shadow-xl">
                  🚀
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Send Alert
                </h2>

                <p className="text-gray-400 mt-1 sm:mt-2 text-sm">
                  Send realtime notifications instantly
                </p>
              </div>

              <form
                onSubmit={handleSendNotification}
                className="space-y-4 sm:space-y-5"
              >
                
                {/* User ID */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-1 sm:mb-2">
                    User ID
                  </label>

                  <input
                    type="text"
                    value={userId}
                    disabled
                    className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-sm"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-1 sm:mb-2">
                    Title
                  </label>

                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter title..."
                    className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/30 transition text-sm"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-1 sm:mb-2">
                    Message
                  </label>

                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message: e.target.value,
                      })
                    }
                    placeholder="Write your message..."
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/30 transition resize-none text-sm"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-200 mb-1 sm:mb-2">
                    Type
                  </label>

                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value,
                      })
                    }
                    className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/30 transition text-sm"
                  >
                    <option value="message" className="bg-[#111827]">
                      💬 Message
                    </option>

                    <option value="order" className="bg-[#111827]">
                      📦 Order
                    </option>

                    <option value="payment" className="bg-[#111827]">
                      💳 Payment
                    </option>

                    <option value="alert" className="bg-[#111827]">
                      ⚠️ Alert
                    </option>

                    <option value="success" className="bg-[#111827]">
                      ✅ Success
                    </option>
                  </select>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base md:text-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_5px_20px_rgba(59,130,246,0.3)] sm:shadow-[0_10px_40px_rgba(59,130,246,0.4)] mt-2 sm:mt-4"
                >
                  {isSubmitting ? 'Sending...' : 'Send Notification ✨'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Notifications List */}
          <div className="md:col-span-2 w-full">
            
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] sm:shadow-[0_0_50px_rgba(0,0,0,0.3)]">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    Notifications
                  </h2>

                  <p className="text-gray-400 mt-1 text-xs sm:text-sm">
                    Latest realtime updates
                  </p>
                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg sm:shadow-xl shrink-0">
                  🔔
                </div>
              </div>

              <div className="space-y-3 sm:space-y-5 max-h-100 sm:max-h-125 md:max-h-187.5 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500/40 scrollbar-track-transparent">
                
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-24 text-center">
                    
                    <div className="text-5xl sm:text-6xl md:text-8xl mb-4 sm:mb-6">
                      📭
                    </div>

                    <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                      No Notifications Yet
                    </h3>

                    <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                      Your realtime notifications will appear here
                    </p>
                  </div>
                ) : (
                  notifications.map((notif: NotificationType) => (
                    <div
                      key={notif.id}
                      className={`relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl border p-3 sm:p-4 md:p-5 transition-all duration-300 hover:scale-[1.01] ${
                        notif.read
                          ? 'bg-white/5 border-white/10'
                          : 'bg-linear-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20'
                      }`}
                    >
                      
                      {!notif.read && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">

                        {/* Content */}
                        <div className="flex gap-2 sm:gap-4 flex-1 min-w-0">
                          
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg sm:rounded-2xl bg-white/10 flex items-center justify-center text-lg sm:text-2xl md:text-3xl shrink-0">
                            {notif.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white wrap-break-word">
                                {notif.title}
                              </h3>

                              {!notif.read && (
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/20 shrink-0">
                                  NEW
                                </span>
                              )}
                            </div>

                            <p className="text-gray-300 leading-relaxed mt-2 sm:mt-3 text-xs sm:text-sm md:text-base wrap-break-word">
                              {notif.message}
                            </p>

                            <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-4 text-xs sm:text-sm text-gray-400 flex-wrap">
                              
                              <span>
                                ⏰ {formatTimeAgo(notif.timestamp)}
                              </span>

                              <span>•</span>

                              <span className="uppercase tracking-widest text-blue-300 text-xs">
                                {notif.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                          
                          {!notif.read && (
                            <button
                              onClick={() =>
                                markAsRead(notif.id)
                              }
                              className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-2xl bg-green-500/20 hover:bg-green-500/30 border border-green-400/20 text-green-200 text-xs sm:text-sm font-semibold transition"
                            >
                              ✓ Read
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteNotification(notif.id)
                            }
                            className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/20 text-red-200 text-xs sm:text-sm font-semibold transition"
                          >
                            ✕ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}