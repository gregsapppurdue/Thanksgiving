export interface MenuItem {
  id: string;
  name: string;
  photo: string;
  hover: {
    history: string;
    ingredients: string[];
  };
}

export declare const menuItems: MenuItem[];

