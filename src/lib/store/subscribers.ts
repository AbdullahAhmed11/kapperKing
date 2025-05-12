import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { useNotificationStore } from './notifications';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'subscribed' | 'unsubscribed';
}

interface SubscriberState {
  subscribers: Subscriber[];
  loading: boolean;
  error: string | null;
  fetchSubscribers: () => Promise<void>;
  addSubscriber: (email: string, name?: string) => Promise<boolean>;
  deleteSubscriber: (subscriberId: string) => Promise<void>;
}

export const useSubscriberStore = create<SubscriberState>()(
  persist(
    (set, get) => ({
      subscribers: [],
      loading: false,
      error: null,

      fetchSubscribers: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('https://kapperking.runasp.net/api/SuperAdmin/GetSubscribers');
          
          if (!response.ok) {
            throw new Error('Failed to fetch subscribers');
          }
          
          const data = await response.json();
          set({ subscribers: data, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
          toast.error('Failed to fetch subscribers');
        }
      },

      addSubscriber: async (email, name) => {
        const lowerEmail = email.toLowerCase().trim();
        const existing = get().subscribers.find(s => s.email === lowerEmail);
        
        if (existing) {
          toast.error(`Email ${lowerEmail} is already subscribed.`);
          return false;
        }

        try {
          set({ loading: true });
          const response = await fetch('https://kapperking.runasp.net/api/SuperAdmin/AddSubscriber', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: lowerEmail, name: name?.trim() }),
          });

          if (!response.ok) {
            throw new Error('Failed to add subscriber');
          }

          const newSubscriber = await response.json();
          set(state => ({ 
            subscribers: [...state.subscribers, newSubscriber],
            loading: false 
          }));

          toast.success(`Subscribed ${lowerEmail} successfully!`);
          useNotificationStore.getState().addNotification({
            message: `New subscriber: ${newSubscriber.email}${newSubscriber.name ? ` (${newSubscriber.name})` : ''}`,
            type: 'new_subscriber',
            relatedId: newSubscriber.id,
          });
          return true;
        } catch (error) {
          set({ loading: false });
          toast.error('Failed to add subscriber');
          return false;
        }
      },

      deleteSubscriber: async (subscriberId) => {
        try {
          set({ loading: true });
          const response = await fetch(`https://kapperking.runasp.net/api/SuperAdmin/DeleteSubscriber/${subscriberId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete subscriber');
          }

          set(state => ({
            subscribers: state.subscribers.filter(s => s.id !== subscriberId),
            loading: false
          }));
          toast.success('Subscriber deleted successfully');
        } catch (error) {
          set({ loading: false });
          toast.error('Failed to delete subscriber');
        }
      },
    }),
    {
      name: 'kapperking-subscribers',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ subscribers: state.subscribers }), // Only persist subscribers
    }
  )
);

// Selectors
export const selectAllSubscribers = (state: SubscriberState) => state.subscribers;
export const selectSubscriberCount = (state: SubscriberState) => state.subscribers.length;
export const selectLoading = (state: SubscriberState) => state.loading;
export const selectError = (state: SubscriberState) => state.error;