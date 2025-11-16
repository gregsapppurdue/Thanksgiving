declare module "../data/menuItems.js" {
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

