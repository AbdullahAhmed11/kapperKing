import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { useNotificationStore } from './notifications'; // Import notification store

export interface Subscriber {
  id: string;
  email: string;
  name?: string; // Optional name
  subscribedAt: string; // ISO date string
  status: 'subscribed' | 'unsubscribed';
}

interface SubscriberState {
  subscribers: Subscriber[];
  addSubscriber: (email: string, name?: string) => boolean;
  deleteSubscriber: (subscriberId: string) => void; // Add delete action type
  // Add actions for unsubscribe later if needed
}

// Initial mock data
const initialSubscribers: Subscriber[] = [
  { id: 'sub1', email: 'test1@example.com', name: 'Test User One', subscribedAt: new Date().toISOString(), status: 'subscribed' },
  { id: 'sub2', email: 'test2@example.com', subscribedAt: new Date().toISOString(), status: 'subscribed' },
];

export const useSubscriberStore = create<SubscriberState>()(
  persist(
    (set, get) => ({
      subscribers: initialSubscribers,

      addSubscriber: (email, name) => {
        const lowerEmail = email.toLowerCase().trim();
        const existing = get().subscribers.find(s => s.email === lowerEmail);
        if (existing) {
          toast.error(`Email ${lowerEmail} is already subscribed.`);
          return false; // Indicate failure (already exists)
        }
        const newSubscriber: Subscriber = {
          id: `sub-${Date.now()}`,
          email: lowerEmail,
          name: name?.trim(),
          subscribedAt: new Date().toISOString(),
          status: 'subscribed',
        };
        set(state => ({ subscribers: [...state.subscribers, newSubscriber] }));
        toast.success(`Subscribed ${lowerEmail} successfully!`);
        // Add notification
        useNotificationStore.getState().addNotification({
          message: `New subscriber: ${newSubscriber.email}${newSubscriber.name ? ` (${newSubscriber.name})` : ''}`,
          type: 'new_subscriber',
          relatedId: newSubscriber.id,
        });
        return true; // Indicate success
      },
      // TODO: Implement unsubscribe logic if needed
      deleteSubscriber: (subscriberId) => {
         set(state => ({
           subscribers: state.subscribers.filter(s => s.id !== subscriberId)
         }));
         toast.success(`Subscriber deleted.`);
      },
    }),
    {
      name: 'kapperking-subscribers', // localStorage key
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

// Selectors
export const selectAllSubscribers = (state: SubscriberState) => state.subscribers;
export const selectSubscriberCount = (state: SubscriberState) => state.subscribers.length;