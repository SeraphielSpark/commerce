/* Wolemusic catalogue — the ONE place to edit products, prices, delivery fees and the laptop deal.
   The website AND the payment server both read this file, so prices always match.
   Keep the part after "window.CATALOG =" as valid JSON (double quotes, no trailing commas).
   Prices are in naira. TODO: replace samples with Wole's real products.
   "payments_enabled": false → checkout sends the order to Wole's WhatsApp.
                       true  → checkout takes payment with Paystack (needs the PHP server + key). */
window.CATALOG = {
  "payments_enabled": false,
  "whatsapp": "2340000000000",
  "shop": {
    "phone": "0800 000 0000",
    "email": "orders@wolemusic.com",
    "address": "Shop address, OAU Campus, Ile-Ife, Osun State",
    "hours": "Monday – Saturday, 9:00am – 6:00pm",
    "mapQuery": "Obafemi Awolowo University, Ile-Ife"
  },
  "delivery": [
    {
      "id": "pickup",
      "name": "Pickup at our OAU shop",
      "note": "Ready same day once payment is confirmed",
      "fee": 0
    },
    {
      "id": "campus",
      "name": "Delivery on OAU campus / Ile-Ife",
      "note": "Same or next day",
      "fee": 1500
    },
    {
      "id": "osun",
      "name": "Delivery elsewhere in Osun State",
      "note": "2 – 4 working days",
      "fee": 5000
    }
  ],
  "deal": {
    "cat": "laptops",
    "min": 200000,
    "off": 30000
  },
  "categories": [
    {
      "id": "laptops",
      "img": "1515378960530-7c0da6231fb1",
      "name": "Laptops & Tablets",
      "blurb": "For school, work and design",
      "icon": "laptop",
      "bg": "#fdeccf",
      "fg": "#b86a0c"
    },
    {
      "id": "audio",
      "img": "1609081219090-a6d81d3085bf",
      "name": "Audio",
      "blurb": "Earbuds, headsets, speakers",
      "icon": "headphones",
      "bg": "#e3e7f5",
      "fg": "#2f3a6b"
    },
    {
      "id": "accessories",
      "img": "1587831990711-23ca6441447b",
      "name": "Accessories",
      "blurb": "Keyboards, mice, bags, power",
      "icon": "keys",
      "bg": "#e4f4ea",
      "fg": "#1c7a43"
    },
    {
      "id": "furniture",
      "img": "1518455027359-f3f8164ba6bd",
      "name": "Office Furniture",
      "blurb": "Ergonomic chairs and more",
      "icon": "chair",
      "bg": "#f6e3e1",
      "fg": "#a23b2f"
    }
  ],
  "products": [
    {
      "id": 1,
      "img": "1622286346003-c5c7e63b1088",
      "name": "14\" Laptop (Core i5, 8GB RAM)",
      "cat": "laptops",
      "price": 250000,
      "old": 350000,
      "tag": "Student deal",
      "featured": true,
      "summary": "A reliable laptop for lectures, assignments, coding and everyday work.",
      "features": [
        "Intel Core i5 processor",
        "8GB RAM, fast SSD storage",
        "14-inch screen, light to carry",
        "Qualifies for the student laptop deal"
      ]
    },
    {
      "id": 2,
      "img": "1590658268037-6bf12165a8df",
      "name": "Wireless Earbuds with Charging Case",
      "cat": "audio",
      "price": 50000,
      "old": 100000,
      "tag": "Awoof deal",
      "featured": true,
      "summary": "True wireless earbuds with clear sound and a pocket-size charging case.",
      "features": [
        "Bluetooth connection",
        "Charging case for extra battery",
        "Built-in mic for calls",
        "Touch controls"
      ]
    },
    {
      "id": 3,
      "img": "1546868871-0f936769675e",
      "name": "10\" Tablet with Keyboard Case",
      "cat": "laptops",
      "price": 90000,
      "old": 100000,
      "featured": true,
      "summary": "A 10-inch tablet with a keyboard case — great for notes, reading and light work.",
      "features": [
        "10-inch display",
        "Detachable keyboard case",
        "Long battery life",
        "Good for students and remote work"
      ]
    },
    {
      "id": 4,
      "img": "1776548759455-310ef8cd49ec",
      "name": "Ergonomic Office Chair (Mesh Back)",
      "cat": "furniture",
      "price": 230000,
      "old": 265000,
      "tag": "Bestseller",
      "featured": true,
      "summary": "Breathable mesh back that keeps you comfortable through long study and work days.",
      "features": [
        "Adjustable seat height",
        "Built-in lumbar support",
        "Padded armrests",
        "360° swivel with smooth-rolling castors"
      ]
    },
    {
      "id": 5,
      "img": "1595303526913-c7037797ebe7",
      "name": "Everyday Laptop for School & Work",
      "cat": "laptops",
      "price": 150000,
      "old": 300000,
      "tag": "Awoof deal",
      "summary": "An affordable laptop for browsing, typing, online classes and office work.",
      "features": [
        "Good everyday performance",
        "Webcam for online classes",
        "Wi-Fi and Bluetooth",
        "Light and portable"
      ]
    },
    {
      "id": 6,
      "img": "1611241893603-3c359704e0ee",
      "name": "Graphics Drawing Tablet with Pen",
      "cat": "laptops",
      "price": 10000,
      "old": 20000,
      "summary": "A pen tablet for drawing, design and note-taking on your computer.",
      "features": [
        "Pressure-sensitive pen",
        "Works with design software",
        "USB connection",
        "Great for students and designers"
      ]
    },
    {
      "id": 7,
      "img": "1610041321327-b794c052db27",
      "name": "Stereo Headset with Mic",
      "cat": "audio",
      "price": 15000,
      "old": 25000,
      "summary": "Comfortable over-ear headset with a mic for calls, classes and gaming.",
      "features": [
        "Built-in microphone",
        "Padded ear cups",
        "In-line volume control",
        "Works with laptops and phones"
      ]
    },
    {
      "id": 8,
      "img": "1589003077984-894e133dabab",
      "name": "Portable Bluetooth Speaker",
      "cat": "audio",
      "price": 35000,
      "tag": "New",
      "summary": "Portable Bluetooth speaker with big sound for your room or hangouts.",
      "features": [
        "Bluetooth connection",
        "Rechargeable battery",
        "Compact and portable",
        "Hands-free calls"
      ]
    },
    {
      "id": 9,
      "img": "1768839719877-c280c9a3633f",
      "name": "Wireless Keyboard & Mouse Combo",
      "cat": "accessories",
      "price": 50000,
      "old": 120000,
      "summary": "A wireless keyboard and mouse set for a clean, comfortable desk.",
      "features": [
        "Wireless USB receiver",
        "Full-size keyboard",
        "Quiet keys",
        "Battery powered"
      ]
    },
    {
      "id": 10,
      "img": "1618384887929-16ec33fab9ef",
      "name": "Mechanical Gaming Keyboard (RGB)",
      "cat": "accessories",
      "price": 45000,
      "summary": "Mechanical keyboard with RGB lighting for gaming and fast typing.",
      "features": [
        "Mechanical switches",
        "RGB backlight",
        "Durable keycaps",
        "USB connection"
      ]
    },
    {
      "id": 11,
      "img": "1553062407-98eeb64c6a62",
      "name": "Laptop Backpack (Water-Resistant)",
      "cat": "accessories",
      "price": 30000,
      "old": 40000,
      "summary": "A padded backpack that keeps your laptop and books safe on campus.",
      "features": [
        "Padded laptop compartment",
        "Water-resistant fabric",
        "Comfortable straps",
        "Extra pockets for chargers"
      ]
    },
    {
      "id": 12,
      "img": "1760708825913-65a50b3dc39b",
      "name": "20,000mAh Power Bank",
      "cat": "accessories",
      "price": 25000,
      "summary": "Keep your phone and gadgets charged through long days on campus.",
      "features": [
        "20,000mAh capacity",
        "Charges multiple devices",
        "USB and Type-C ports",
        "LED charge indicator"
      ]
    }
  ]
};
