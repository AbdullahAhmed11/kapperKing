type Listener<T = any> = (payload: T) => void;

class EventEmitter {
  private events: Record<string, Listener[]> = {};

  on<T>(eventName: string, listener: Listener<T>): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);

    // Return an unsubscribe function
    return () => {
      this.off(eventName, listener);
    };
  }

  off<T>(eventName: string, listenerToRemove: Listener<T>): void {
    if (!this.events[eventName]) {
      return;
    }
    this.events[eventName] = this.events[eventName].filter(
      (listener) => listener !== listenerToRemove
    );
  }

  emit<T>(eventName: string, payload?: T): void {
    if (!this.events[eventName]) {
      return;
    }
    // Call listeners in a timeout to avoid potential issues within store actions
    setTimeout(() => {
        this.events[eventName].forEach((listener) => listener(payload as T));
    }, 0);
  }
}

// Export a singleton instance
export const emitter = new EventEmitter();