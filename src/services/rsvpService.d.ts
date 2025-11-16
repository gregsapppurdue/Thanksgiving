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

export declare function fetchRsvps(): Promise<Rsvp[]>;
export declare function submitRsvp(rsvpData: RsvpData): Promise<Rsvp>;
export declare function deleteRsvp(id: string): Promise<void>;

