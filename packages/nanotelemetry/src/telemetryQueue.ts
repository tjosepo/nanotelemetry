import type { TelemetryEvent } from "./telemetryClient.js";

interface NotifyEventTelemetryEventAdded {
  type: "added";
  event: TelemetryEvent;
}

interface NotifyEventTelemetryEventRemoved {
  type: "removed";
  event: TelemetryEvent;
}

interface NotifyEventQueueCleared {
  type: "cleared";
}

type NotifyEvent =
  | NotifyEventTelemetryEventAdded
  | NotifyEventTelemetryEventRemoved
  | NotifyEventQueueCleared;

export class TelemetryQueue {
  #listeners: Array<(event: NotifyEvent) => void> = [];
  #events: Array<TelemetryEvent> = [];

  addEventListener(listener: (event: NotifyEvent) => void) {
    this.#listeners.push(listener);
  }

  removeEventListener(listener: (event: NotifyEvent) => void) {
    this.#listeners = this.#listeners.filter((l) => l !== listener);
  }

  #notify(event: NotifyEvent) {
    for (const listener of this.#listeners) {
      listener(event);
    }
  }

  getAll(): Array<TelemetryEvent> {
    return this.#events;
  }

  add(event: TelemetryEvent) {
    this.#events.push(event);
    this.#notify({ type: "added", event });
  }

  remove(event: TelemetryEvent) {
    this.#events = this.#events.filter((e) => e !== event);
    this.#notify({ type: "removed", event });
  }

  clear() {
    for (const event of this.getAll()) {
      this.remove(event);
    }
  }
}
