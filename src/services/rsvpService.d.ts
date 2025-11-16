declare module './rsvpService' {
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
  export function submitRsvp(rsvpData: RsvpData): Promise<Rsvp>;
  export function deleteRsvp(id: string): Promise<void>;
}

