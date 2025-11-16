declare module './menuItems' {
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

