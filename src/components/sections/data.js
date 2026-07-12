import {
  Calendar,
  Coffee,
  IceCream,
  Leaf,
  MapPin,
  Phone,
  Star,
  UtensilsCrossed,
  Users,
} from "lucide-react";

export const NAV_LINKS = ["Menu", "Gallery", "Reservations", "Hours", "About", "Reviews"];

export const HOURS = [
  { day: "Monday – Friday", open: "8:00 AM", close: "5:00 PM" },
  { day: "Saturday", open: "Closed", close: "" },
  { day: "Sunday", open: "Closed", close: "" },
];

export const MENU_CATEGORIES = [
  {
    id: "mains",
    label: "Mains",
    icon: UtensilsCrossed,
    timeNote: "Available 12–5 PM only",
    items: [
      {
        name: "Chicken & Sausage",
        desc: "With mashed potato, corn and carrots, rice",
        price: "₱350",
      },
      {
        name: "Grilled Liempo",
        desc: "With mashed potato, corn and carrots, rice",
        price: "₱220",
      },
      {
        name: "Baby Back Ribs",
        desc: "With mashed potato, corn and carrots, rice",
        price: "₱320",
      },
      {
        name: "Fish Fillet",
        desc: "With mashed potato, corn and carrots, rice",
        price: "₱180",
      },
      {
        name: "Stuffed Pusit",
        desc: "With mashed potato, corn and carrots, rice",
        price: "₱180",
      },
      {
        name: "Special Sizzling Sisig",
        desc: "Sizzling plate with egg, calamansi, and mayo",
        price: "₱180",
      },
    ],
  },
  {
    id: "pasta",
    label: "Pasta",
    icon: UtensilsCrossed,
    timeNote: "Available 12–5 PM only",
    items: [
      {
        name: "Seafood Marinara",
        desc: "Pasta in rich tomato sauce with mixed seafood, served with toast",
        price: "₱180",
      },
      {
        name: "Creamy Tuna Pesto",
        desc: "Spaghetti tossed in pesto with flaked tuna, served with toast",
        price: "₱180",
      },
      {
        name: "Truffle Pasta",
        desc: "Creamy truffle mushroom sauce over fettuccine",
        price: "₱200",
      },
      {
        name: "Spanish Sardines w/ Olives & Tomato",
        desc: "Spanish sardines, olives, and fresh tomato over pasta, served with toast",
        price: "₱165",
      },
      {
        name: "Aglio Olio",
        desc: "Garlic, olive oil, parsley over spaghetti",
        price: "₱165",
      },
      {
        name: "Salted Egg Chicken",
        desc: "Creamy salted egg sauce with chicken over pasta",
        price: "₱165",
      },
      {
        name: "Carbonara",
        desc: "Classic creamy carbonara",
        price: "₱165",
      },
      {
        name: "Spaghetti",
        desc: "House spaghetti with meat sauce",
        price: "₱155",
      },
      {
        name: "Pancit Canton / Bihon",
        desc: "Stir-fried noodles with vegetables and protein",
        price: "₱80",
      },
    ],
  },
  {
    id: "snacks",
    label: "Snacks",
    icon: IceCream,
    timeNote: "Available 12–5 PM only",
    items: [
      {
        name: "BLT w/ Cheese Sandwich",
        desc: "Bacon, lettuce, tomato, and cheese on toasted bread",
        price: "₱185",
      },
      {
        name: "Cheeseburger",
        desc: "Beef patty with cheese, lettuce, and tomato",
        price: "₱180",
      },
      {
        name: "Ham & Cheese Omelette Sandwich",
        desc: "Fluffy omelette with ham and melted cheese on toast",
        price: "₱150",
      },
      {
        name: "Cheesecake French Toast",
        desc: "Brioche stuffed with cheesecake, topped with whipped cream",
        price: "₱195",
        isNew: true,
      },
      {
        name: "Croffle",
        desc: "Banana & Almond, Banana & Nutella, or Biscoff Cookie & Syrup",
        price: "₱120",
      },
      {
        name: "Waffle",
        desc: "Add Oreo +₱15, Add Banana & Almond +₱30.",
        price: "₱65",
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    icon: Coffee,
    drinkSections: [
      {
        section: "Espresso",
        columns: [
          { key: "hotSm", label: "Hot S" },
          { key: "hotMd", label: "Hot M" },
          { key: "icedMd", label: "Iced M" },
          { key: "icedLg", label: "Iced L" },
        ],
        items: [
          { name: "Cappuccino", hotSm: "110", hotMd: "120" },
          { name: "Americano", hotSm: "110", hotMd: "120", icedMd: "140", icedLg: "160" },
          { name: "Cafe Latte", hotSm: "110", hotMd: "120", icedMd: "140", icedLg: "160" },
          { name: "Cafe Mocha", hotSm: "110", hotMd: "120", icedMd: "140", icedLg: "160" },
          { name: "Caramel Macchiato", hotSm: "110", hotMd: "120", icedMd: "140", icedLg: "160" },
          { name: "Spanish Latte", hotSm: "110", hotMd: "120", icedMd: "140", icedLg: "160" },
          { name: "White Mocha Latte", hotSm: "110", hotMd: "120", icedMd: "140", icedLg: "160" },
          { name: "Hazelnut Latte", hotSm: "110", hotMd: "120", icedMd: "140", icedLg: "160" },
          { name: "Salted Caramel Latte", hotSm: "110", hotMd: "120", icedMd: "140", icedLg: "160" },
          { name: "Matcha Latte", hotSm: "120", hotMd: "130", icedMd: "150", icedLg: "160" },
          { name: "Vietnamese Latte", hotSm: "120", hotMd: "130", icedMd: "150", icedLg: "160" },
          { name: "Dirty Matcha Latte", hotSm: "130", hotMd: "140", icedMd: "160", icedLg: "170" },
        ],
      },
      {
        section: "Frapp & Non-Coffee",
        columns: [
          { key: "md", label: "Medium" },
          { key: "lg", label: "Large" },
        ],
        items: [
          { name: "Matcha", md: "160", lg: "190" },
          { name: "White Mocha", md: "150", lg: "180" },
          { name: "Salted Caramel", md: "150", lg: "180" },
          { name: "Cinnamon Caramel", md: "150", lg: "180" },
          { name: "Java Chip", md: "150", lg: "180" },
          { name: "Chocolate Milkshake", md: "160", lg: "200" },
        ],
      },
      {
        section: "Hot Chocolate",
        columns: [
          { key: "sm", label: "Small" },
          { key: "md", label: "Medium" },
        ],
        items: [
          { name: "Hot Chocolate", sm: "110", md: "120" },
        ],
      },
      {
        section: "Yogurt Smoothie",
        columns: [
          { key: "md", label: "Medium" },
          { key: "lg", label: "Large" },
        ],
        items: [
          { name: "Blueberry", md: "160", lg: "200" },
          { name: "Strawberry", md: "160", lg: "200" },
          { name: "Peach Mango", md: "160", lg: "200" },
          { name: "Very Berry", md: "160", lg: "200" },
        ],
      },
      {
        section: "Fruit Soda",
        note: "+₱10 for sinkers",
        columns: [
          { key: "md", label: "Medium" },
          { key: "lg", label: "Large" },
        ],
        items: [
          { name: "Blueberry Peach", md: "80", lg: "90" },
          { name: "Strawberry Peach", md: "80", lg: "90" },
          { name: "Apple Lemon", md: "80", lg: "90" },
          { name: "Lychee Lemon", md: "80", lg: "90" },
          { name: "Mixed Berries", md: "80", lg: "90" },
        ],
      },
    ],
  },
];

export const GALLERY_PHOTOS = [
  {
    url: "/CateringSample1.jpg",
    alt: "Catering spread with assorted dishes",
  },
  {
    url: "/CateringSample2.png",
    alt: "Catering food presentation",
  },
  {
    url: "/CateringSample3.png",
    alt: "Plated catering dishes",
  },
  {
    url: "/CateringSample4.jpg",
    alt: "Catering event setup",
  },
  {
    url: "/CateringSample5.jpg",
    alt: "Catering buffet arrangement",
  },
  {
    url: "/CateringSample6.jpg",
    alt: "Cafe Museo catering service",
  },
  {
    url: "/CateringSample7.jpg",
    alt: "Event catering by Cafe Museo",
  },
  {
    url: "/CateringSample8.jpg",
    alt: "Leni Robredo",
  },
  {
    url: "/CateringSample9.jpg",
    alt: "Catering Event for Students",
  },
];

export const TESTIMONIALS = [];

export const CONTACT_INFO = [
  { icon: Calendar, text: "Mon–Fri catering available" },
  { icon: Users, text: "All group sizes welcome" },
  { icon: Phone, text: "+63 920 906 0188" },
  { icon: MapPin, text: "Museo De La Salle, DLSU–Dasmariñas" },
];

export const FOOTER_LINKS = [
  ["Menu", "menu"],
  ["Gallery", "gallery"],
  ["Reservations", "reservations"],
  ["Hours", "hours"],
  ["About", "about"],
  ["Reviews", "reviews"],
];

export const ABOUT_STATS = [
  ["14+", "Years serving"],
  ["300+", "Events catered"],
  ["4", "Menu categories"],
];

export const GALLERY_ASSETS = {
  hero: "https://images.unsplash.com/photo-1779843746003-6e50839040ce?w=1600&h=1000&fit=crop&auto=format",
  avp: "Hero_CafeMuseo.png",
  aboutPrimary: "/Museo_Pic.png",
  aboutSecondary: "/AboutCafeMuseo.jpg",
  hours: "/Lake_View.jpg",
};

export const EXTRA_BADGES = [
  { id: "menu", label: "Available 12–5 PM only" },
];

export const REVIEW_INPUT_FIELDS = [
  { label: "Your Name *", key: "name", placeholder: "Juan dela Cruz" },
  { label: "Your Review *", key: "text", placeholder: "Tell us about your visit..." },
];

export const STAR_ICON = Star;
export const LEAF_ICON = Leaf;
