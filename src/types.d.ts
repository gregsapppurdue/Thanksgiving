// Global type declarations for JavaScript modules

declare module '../data/menuItems' {
  export interface MenuItem {
    id: string;
    name: string;
    photo: string;
    hover: {
      history: string;
      ingredients: string[];
    };
  }

  export const menuItems: MenuItem[];
}

declare module '../services/rsvpService' {
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

