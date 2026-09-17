export interface UserRateLimitService { canUse(userId: string): boolean; record(userId: string): void; }
export class InMemoryUserRateLimitService implements UserRateLimitService {
  private readonly counts = new Map<string, { day: string; count: number }>();
  constructor(private readonly limit: number) {}
  canUse(userId: string): boolean { const item = this.current(userId); return item.count < this.limit; }
  record(userId: string): void { this.current(userId).count += 1; }
  private current(userId: string): { day: string; count: number } { const day = new Date().toISOString().slice(0, 10); const old = this.counts.get(userId); if (!old || old.day !== day) { const next = { day, count: 0 }; this.counts.set(userId, next); return next; } return old; }
}
