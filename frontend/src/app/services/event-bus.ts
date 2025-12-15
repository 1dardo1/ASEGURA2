type EventCallback = (payload: any) => void;

class EventBusClass {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, cb: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(cb);
  }

  off(event: string, cb: EventCallback) {
    this.listeners.get(event)?.delete(cb);
  }

  emit(event: string, payload: any = null) {
    this.listeners.get(event)?.forEach(cb => cb(payload));
  }
}

export const EventBus = new EventBusClass();
