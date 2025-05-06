import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  created_at: string;
  user_id: string; // The user this notification is for (staff/owner)
  salon_id: string; // The salon this notification relates to
  type: 'new_appointment' | 'new_client' | 'appointment_cancelled' | 'other'; // Example types
  title: string; // Short summary
  message: string; // Full message
  is_read: boolean;
  related_appointment_id?: string | null;
  related_client_id?: string | null;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (userId: string, salonId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string, salonId: string) => Promise<void>;
  // TODO: Add listener for real-time updates using Supabase Realtime
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (userId, salonId) => {
    if (!userId || !salonId) return;
    set({ loading: true, error: null });
    try {
      const { data, error, count } = await supabase
        .from('notifications') // Assuming 'notifications' table
        .select('*', { count: 'exact' }) // Fetch count for unread badge
        .eq('user_id', userId)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false })
        .limit(50); // Limit initial fetch

      if (error) throw error;

      const unread = data?.filter(n => !n.is_read).length || 0;
      set({ notifications: data || [], unreadCount: unread, loading: false });

    } catch (error: any) {
      toast.error(`Failed to fetch notifications: ${error.message}`);
      set({ error: error.message, loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    // Optimistic update
    const originalNotifications = get().notifications;
    const originalCount = get().unreadCount;
    let wasUnread = false;
    set(state => {
       const updatedNotifications = state.notifications.map(n => {
          if (n.id === notificationId && !n.is_read) {
             wasUnread = true;
             return { ...n, is_read: true };
          }
          return n;
       });
       return {
          notifications: updatedNotifications,
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
       };
    });

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
         // Revert optimistic update on error
         set({ notifications: originalNotifications, unreadCount: originalCount });
         toast.error(`Failed to mark notification as read: ${error.message}`);
         throw error;
      }
    } catch (error: any) {
       console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async (userId, salonId) => {
     // Optimistic update
     const originalNotifications = get().notifications;
     set(state => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
     }));

     try {
       const { error } = await supabase
         .from('notifications')
         .update({ is_read: true })
         .eq('user_id', userId)
         .eq('salon_id', salonId)
         .eq('is_read', false); // Only update unread ones

       if (error) {
          // Revert optimistic update
          set({ notifications: originalNotifications });
          // Recalculate count or refetch
          get().fetchNotifications(userId, salonId); 
          toast.error(`Failed to mark all as read: ${error.message}`);
          throw error;
       }
     } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
     }
  },
}));

// Selectors
export const selectNotifications = (state: NotificationStore) => state.notifications;
export const selectUnreadCount = (state: NotificationStore) => state.unreadCount;