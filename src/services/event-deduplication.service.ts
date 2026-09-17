export interface EventDeduplicationService { claim(eventId: string): boolean; }
export class InMemoryEventDeduplicationService implements EventDeduplicationService {
  private readonly events = new Map<string, number>();
  constructor(private readonly ttlMs = 24 * 60 * 60 * 1000) {}
  claim(eventId: string): boolean { const now = Date.now(); for (const [id, expires] of this.events) if (expires <= now) this.events.delete(id); if (this.events.has(eventId)) return false; this.events.set(eventId, now + this.ttlMs); return true; }
}
