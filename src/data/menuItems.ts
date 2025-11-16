export interface MenuItem {
  id: string;
  name: string;
  photo: string;
  hover: {
    history: string;
    ingredients: string[];
  };
}

export const menuItems: MenuItem[] = [
  {
    id: "roast-turkey",
    name: "Roast Turkey",
    photo: "/Images/Thanksgiving Turkey.png",
    hover: {
      history:
        "Turkey became the symbolic centerpiece of American Thanksgiving in the 19th century, representing abundance, harvest, and family togetherness.",
      ingredients: [
        "Whole turkey",
        "Butter",
        "Salt",
        "Pepper",
        "Rosemary",
        "Thyme",
        "Sage",
        "Garlic",
        "Onion",
        "Carrots",
        "Celery"
      ]
    }
  },
  {
    id: "turkey-gravy",
    name: "Turkey Gravy",
    photo: "/Images/Thanksgiving Gravy.png",
    hover: {
      history:
        "Turkey gravy reflects early American home cooking traditions of using every part of the bird and turning drippings into a rich, comforting sauce.",
      ingredients: [
        "Turkey drippings",
        "Flour",
        "Butter",
        "Salt",
        "Pepper",
        "Chicken broth"
      ]
    }
  },
  {
    id: "classic-bread-stuffing",
    name: "Classic Bread Stuffing",
    photo: "/Images/Thanksgiving Stufing.png",
    hover: {
      history:
        "Bread-based stuffing evolved from European recipes but became distinctly American, with each region adding its own twist, making it a core Thanksgiving side.",
      ingredients: [
        "Bread cubes",
        "Butter",
        "Onion",
        "Celery",
        "Chicken broth",
        "Sage",
        "Thyme",
        "Salt",
        "Pepper"
      ]
    }
  },
  {
    id: "mashed-potatoes",
    name: "Mashed Potatoes",
    photo: "/Images/Thanksgiving Mashed Potatoes.png",
    hover: {
      history:
        "Mashed potatoes are a classic American comfort food and a universal Thanksgiving staple, known for soaking up gravy and anchoring the plate.",
      ingredients: ["Potatoes", "Butter", "Milk or cream", "Salt", "Pepper"]
    }
  },
  {
    id: "sweet-potato-casserole",
    name: "Sweet Potato Casserole with Marshmallows",
    photo: "/Images/Thanksgiving Sweet Potatoes.png",
    hover: {
      history:
        "Sweet potatoes are native to the Americas, and topping them with marshmallows emerged in the early 1900s as a marketing idea, becoming a beloved modern Thanksgiving dish.",
      ingredients: [
        "Sweet potatoes",
        "Butter",
        "Brown sugar",
        "Milk",
        "Eggs",
        "Marshmallows"
      ]
    }
  },
  {
    id: "green-bean-casserole",
    name: "Green Bean Casserole",
    photo: "/Images/Thanksgiving Green Bean.png",
    hover: {
      history:
        "Green bean casserole was created in 1955 by the Campbell Soup Company and quickly became a Thanksgiving classic, representing mid-century American convenience cooking.",
      ingredients: [
        "Green beans",
        "Cream of mushroom soup",
        "Fried onions",
        "Milk",
        "Salt",
        "Pepper"
      ]
    }
  },
  {
    id: "cranberry-sauce",
    name: "Cranberry Sauce",
    photo: "/Images/Thanksgiving Cranberry.png",
    hover: {
      history:
        "Cranberries are native to North America and were used by Indigenous peoples long before European settlers; cranberry sauce now symbolizes the autumn harvest and adds bright acidity to the meal.",
      ingredients: ["Fresh cranberries", "Sugar", "Water"]
    }
  },
  {
    id: "cornbread",
    name: "Cornbread",
    photo: "/Images/Thanksgiving Cornbread.png",
    hover: {
      history:
        "Cornbread is rooted in Indigenous corn-based cooking methods, later adapted by European settlers and the American South, making it a core comfort side at many Thanksgiving tables.",
      ingredients: [
        "Cornmeal",
        "Flour",
        "Sugar",
        "Baking powder",
        "Salt",
        "Eggs",
        "Milk",
        "Butter"
      ]
    }
  },
  {
    id: "corn-casserole",
    name: "Corn Casserole",
    photo: "/Images/Thanksgiving Corn.png",
    hover: {
      history:
        "Corn casserole blends corn, dairy, and baking mix into a soft, custardy side dish, reflecting the importance of corn in American agriculture and holiday comfort food.",
      ingredients: [
        "Corn kernels",
        "Creamed corn",
        "Eggs",
        "Butter",
        "Sour cream",
        "Corn muffin mix"
      ]
    }
  },
  {
    id: "apple-cider",
    name: "Hot Apple Cider",
    photo: "/Images/Thanksgiving Apple Cider.png",
    hover: {
      history:
        "Apple cider has deep roots in colonial America, when apples were widely grown and pressed for cider; today it's a signature fall drink served warm at holiday gatherings.",
      ingredients: ["Apple cider", "Cinnamon sticks", "Cloves", "Orange slices"]
    }
  },
  {
    id: "deviled-eggs",
    name: "Deviled Eggs",
    photo: "/Images/Thanksgiving Eggs.png",
    hover: {
      history:
        "Deviled eggs became popular in 20th-century American home entertaining and potlucks, and they often appear as an appetizer at family holiday gatherings like Thanksgiving.",
      ingredients: [
        "Eggs",
        "Mayonnaise",
        "Mustard",
        "Vinegar",
        "Salt",
        "Pepper",
        "Paprika"
      ]
    }
  },
  {
    id: "stuffed-acorn-squash",
    name: "Stuffed Acorn Squash with Wild Rice, Cranberries & Pecans",
    photo: "/Images/Thanksgiving Squash.png",
    hover: {
      history:
        "Stuffed acorn squash highlights Indigenous North American ingredients—squash, wild rice, cranberries, and nuts—capturing the harvest spirit and serving as a hearty vegetarian centerpiece.",
      ingredients: [
        "Acorn squash",
        "Wild rice",
        "Cranberries",
        "Pecans",
        "Olive oil",
        "Salt",
        "Pepper",
        "Thyme",
        "Vegetable broth"
      ]
    }
  },
  {
    id: "harvest-salad",
    name: "Harvest Apple & Walnut Salad",
    photo: "/Images/Thanksgiving Apple Walnut Salad.png",
    hover: {
      history:
        "A bright, fresh complement to rich Thanksgiving dishes, combining fall apples, nuts, and seasonal greens.",
      ingredients: [
        "Mixed greens",
        "Apples",
        "Candied walnuts",
        "Dried cranberries",
        "Feta",
        "Maple vinaigrette"
      ]
    }
  },
  {
    id: "raisin-pie",
    name: "Raisin Pie",
    photo: "/Images/Thanksgiving Raisin Pie.png",
    hover: {
      history:
        "Raisin pie is an old-fashioned American dessert that predates easy access to fresh fruit in winter, reflecting how preserved ingredients were used for holiday treats.",
      ingredients: [
        "Raisins",
        "Pie crust",
        "Sugar",
        "Butter",
        "Cornstarch",
        "Cinnamon",
        "Lemon juice",
        "Water"
      ]
    }
  },
  {
    id: "pumpkin-pie",
    name: "Pumpkin Pie",
    photo: "/Images/Thanksgiving Pumpkin Pie.png",
    hover: {
      history:
        "Pumpkin, native to North America, has been used since colonial times, and pumpkin pie became an iconic symbol of New England Thanksgiving and autumn harvests.",
      ingredients: [
        "Pumpkin purée",
        "Pie crust",
        "Eggs",
        "Sugar",
        "Cinnamon",
        "Nutmeg",
        "Ginger",
        "Evaporated milk"
      ]
    }
  }
];

