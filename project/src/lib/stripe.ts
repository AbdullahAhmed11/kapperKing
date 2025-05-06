import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe
export const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Types
export interface PaymentMethod {
  id: string;
  salonId: string;
  stripePaymentMethodId: string;
  type: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface PaymentTransaction {
  id: string;
  salonId: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}

// Helper functions
export const createPaymentIntent = async (amount: number, currency: string = 'eur') => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const savePaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(paymentMethod)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving payment method:', error);
    throw error;
  }
};

export const getPaymentMethods = async (salonId: string) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('salon_id', salonId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

export const setDefaultPaymentMethod = async (paymentMethodId: string, salonId: string) => {
  try {
    // First, set all payment methods for this salon to non-default
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('salon_id', salonId);

    // Then set the selected payment method as default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId);

    if (error) throw error;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

export const createSubscription = async (salonId: string, planId: string, paymentMethodId: string) => {
  try {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ salonId, planId, paymentMethodId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch(`/api/cancel-subscription/${subscriptionId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};