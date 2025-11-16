declare module "../services/rsvpService.js" {
  export interface RsvpData {
    name: string;
    email?: string;
    phone?: string;
    item: string;
    dietaryRestrictions?: string;
  }

  export interface Rsvp {
    id: string;
    name: string;
    email: string;
    phone?: string;
    item: string;
    dietaryRestrictions?: string;
    submittedAt: string;
  }

  export function fetchRsvps(): Promise<Rsvp[]>;
  export function submitRsvp(data: RsvpData): Promise<Rsvp>;
  export function deleteRsvp(id: string): Promise<void>;
}

