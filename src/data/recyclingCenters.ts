export interface RecyclingCenter {
  id: string;
  name: string;
  type: "e-waste" | "hazardous" | "recyclable" | "organic";
  address: string;
  city: string;
  state: string;
  distance?: string;
  phone?: string;
  hours: string;
  acceptedItems: string[];
  coordinates: { lat: number; lng: number };
}

export const RECYCLING_CENTERS: RecyclingCenter[] = [
  // Karnataka
  {
    id: "1",
    name: "E-Parisaraa Pvt Ltd",
    type: "e-waste",
    address: "Dobbspet Industrial Area",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 2371 5253",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    acceptedItems: ["Computers", "Mobiles", "TVs", "Printers", "Batteries"],
    coordinates: { lat: 13.0827, lng: 77.5877 }
  },
  {
    id: "2",
    name: "Saahas Zero Waste",
    type: "recyclable",
    address: "HSR Layout, Sector 1",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 4965 1234",
    hours: "Mon-Sat: 8:00 AM - 6:00 PM",
    acceptedItems: ["Paper", "Plastic", "Glass", "Tetra packs", "E-waste"],
    coordinates: { lat: 12.9121, lng: 77.6446 }
  },
  {
    id: "3",
    name: "Karnataka Compost Development Corporation",
    type: "organic",
    address: "Mavallipura, Yelahanka",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91 80 2846 7890",
    hours: "Mon-Sun: 6:00 AM - 8:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Agricultural waste"],
    coordinates: { lat: 13.1007, lng: 77.5963 }
  },
  {
    id: "4",
    name: "Mysore E-Waste Recyclers",
    type: "e-waste",
    address: "Hebbal Industrial Area",
    city: "Mysore",
    state: "Karnataka",
    phone: "+91 821 242 5678",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Laptops", "Phones", "Cables", "Circuit boards"],
    coordinates: { lat: 12.3051, lng: 76.6551 }
  },

  // Maharashtra
  {
    id: "5",
    name: "Mumbai Waste Management Ltd",
    type: "recyclable",
    address: "Dadar East",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91 22 2411 5678",
    hours: "Mon-Sun: 7:00 AM - 8:00 PM",
    acceptedItems: ["Paper", "Cardboard", "Plastic bottles", "Glass", "Metal cans"],
    coordinates: { lat: 19.0178, lng: 72.8478 }
  },
  {
    id: "6",
    name: "E-Waste Recyclers India",
    type: "e-waste",
    address: "Andheri East, MIDC",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91 22 2836 4567",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM",
    acceptedItems: ["Computers", "Servers", "Networking equipment", "Phones"],
    coordinates: { lat: 19.1136, lng: 72.8697 }
  },
  {
    id: "7",
    name: "Pune Municipal Hazardous Waste Facility",
    type: "hazardous",
    address: "Hadapsar Industrial Estate",
    city: "Pune",
    state: "Maharashtra",
    phone: "+91 20 2687 1234",
    hours: "Mon-Sat: 8:00 AM - 4:00 PM",
    acceptedItems: ["Batteries", "Chemicals", "Paint", "Pesticides", "Medical waste"],
    coordinates: { lat: 18.5089, lng: 73.9260 }
  },
  {
    id: "8",
    name: "GreenTech Recycling Nashik",
    type: "recyclable",
    address: "Satpur MIDC",
    city: "Nashik",
    state: "Maharashtra",
    phone: "+91 253 235 6789",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Paper", "Plastic", "Metal", "Glass"],
    coordinates: { lat: 20.0063, lng: 73.7895 }
  },
  {
    id: "9",
    name: "Nagpur Organic Waste Center",
    type: "organic",
    address: "Bhandara Road",
    city: "Nagpur",
    state: "Maharashtra",
    phone: "+91 712 256 7890",
    hours: "Mon-Sun: 6:00 AM - 7:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Coconut shells", "Leaves"],
    coordinates: { lat: 21.1458, lng: 79.0882 }
  },

  // Delhi NCR
  {
    id: "10",
    name: "Delhi Green Composting",
    type: "organic",
    address: "Okhla Phase II",
    city: "New Delhi",
    state: "Delhi",
    phone: "+91 11 2634 7890",
    hours: "Mon-Sun: 6:00 AM - 9:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Coconut shells", "Leaves"],
    coordinates: { lat: 28.5355, lng: 77.268 }
  },
  {
    id: "11",
    name: "Attero Recycling",
    type: "e-waste",
    address: "Sector 63, Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    phone: "+91 120 4567890",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    acceptedItems: ["Laptops", "Phones", "Tablets", "Cables", "PCBs"],
    coordinates: { lat: 28.6139, lng: 77.3726 }
  },
  {
    id: "12",
    name: "Delhi Hazardous Waste Management",
    type: "hazardous",
    address: "Narela Industrial Area",
    city: "New Delhi",
    state: "Delhi",
    phone: "+91 11 2789 4567",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Batteries", "Chemicals", "E-waste batteries", "Medical waste"],
    coordinates: { lat: 28.8252, lng: 77.0927 }
  },
  {
    id: "13",
    name: "Gurgaon Recyclables Hub",
    type: "recyclable",
    address: "Sector 37, Industrial Area",
    city: "Gurgaon",
    state: "Haryana",
    phone: "+91 124 456 7890",
    hours: "Mon-Sat: 8:00 AM - 6:00 PM",
    acceptedItems: ["Paper", "Plastic", "Glass", "Metal", "Cardboard"],
    coordinates: { lat: 28.4595, lng: 77.0266 }
  },

  // Telangana
  {
    id: "14",
    name: "Ramky Enviro Engineers",
    type: "hazardous",
    address: "Dundigal",
    city: "Hyderabad",
    state: "Telangana",
    phone: "+91 40 2304 5678",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Batteries", "Chemicals", "Paint", "Pesticides", "Medical waste"],
    coordinates: { lat: 17.5855, lng: 78.4235 }
  },
  {
    id: "15",
    name: "Hyderabad E-Waste Solutions",
    type: "e-waste",
    address: "Balanagar Industrial Area",
    city: "Hyderabad",
    state: "Telangana",
    phone: "+91 40 2340 1234",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    acceptedItems: ["Computers", "Mobiles", "TVs", "Refrigerators", "AC units"],
    coordinates: { lat: 17.4684, lng: 78.4428 }
  },
  {
    id: "16",
    name: "GHMC Composting Plant",
    type: "organic",
    address: "Jawaharnagar",
    city: "Hyderabad",
    state: "Telangana",
    phone: "+91 40 2345 6789",
    hours: "Mon-Sun: 6:00 AM - 8:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Agricultural waste"],
    coordinates: { lat: 17.4948, lng: 78.6047 }
  },

  // Tamil Nadu
  {
    id: "17",
    name: "Chennai E-Waste Hub",
    type: "e-waste",
    address: "Ambattur Industrial Estate",
    city: "Chennai",
    state: "Tamil Nadu",
    phone: "+91 44 2625 1234",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    acceptedItems: ["Computers", "Phones", "Printers", "Scanners", "Cables"],
    coordinates: { lat: 13.1143, lng: 80.1548 }
  },
  {
    id: "18",
    name: "Tamil Nadu Pollution Control Board Facility",
    type: "hazardous",
    address: "Gummidipoondi",
    city: "Chennai",
    state: "Tamil Nadu",
    phone: "+91 44 2623 4567",
    hours: "Mon-Sat: 8:00 AM - 4:00 PM",
    acceptedItems: ["Industrial chemicals", "Batteries", "Medical waste", "Paint"],
    coordinates: { lat: 13.4022, lng: 80.1092 }
  },
  {
    id: "19",
    name: "Coimbatore Green Recyclers",
    type: "recyclable",
    address: "SIDCO Industrial Estate",
    city: "Coimbatore",
    state: "Tamil Nadu",
    phone: "+91 422 234 5678",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Paper", "Plastic", "Glass", "Metal", "Textiles"],
    coordinates: { lat: 11.0168, lng: 76.9558 }
  },
  {
    id: "20",
    name: "Madurai Organic Waste Processing",
    type: "organic",
    address: "Thirumangalam Road",
    city: "Madurai",
    state: "Tamil Nadu",
    phone: "+91 452 234 6789",
    hours: "Mon-Sun: 6:00 AM - 7:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Agricultural waste"],
    coordinates: { lat: 9.9252, lng: 78.1198 }
  },

  // Gujarat
  {
    id: "21",
    name: "Ahmedabad E-Waste Recyclers",
    type: "e-waste",
    address: "Naroda GIDC",
    city: "Ahmedabad",
    state: "Gujarat",
    phone: "+91 79 2281 3456",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    acceptedItems: ["Computers", "Phones", "TVs", "Home appliances"],
    coordinates: { lat: 23.0707, lng: 72.6456 }
  },
  {
    id: "22",
    name: "Gujarat Enviro Protection",
    type: "hazardous",
    address: "Vatva GIDC",
    city: "Ahmedabad",
    state: "Gujarat",
    phone: "+91 79 2583 4567",
    hours: "Mon-Sat: 8:00 AM - 5:00 PM",
    acceptedItems: ["Industrial chemicals", "Batteries", "Paint", "Solvents"],
    coordinates: { lat: 22.9727, lng: 72.6315 }
  },
  {
    id: "23",
    name: "Surat Recycling Center",
    type: "recyclable",
    address: "Sachin GIDC",
    city: "Surat",
    state: "Gujarat",
    phone: "+91 261 239 8765",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    acceptedItems: ["Paper", "Plastic", "Metal", "Glass", "Textiles"],
    coordinates: { lat: 21.0851, lng: 72.8526 }
  },
  {
    id: "24",
    name: "Vadodara Green Waste",
    type: "organic",
    address: "Makarpura GIDC",
    city: "Vadodara",
    state: "Gujarat",
    phone: "+91 265 265 4321",
    hours: "Mon-Sun: 6:00 AM - 7:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Agricultural waste"],
    coordinates: { lat: 22.2587, lng: 73.1924 }
  },

  // West Bengal
  {
    id: "25",
    name: "Kolkata E-Waste Management",
    type: "e-waste",
    address: "Salt Lake Sector V",
    city: "Kolkata",
    state: "West Bengal",
    phone: "+91 33 2357 8901",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    acceptedItems: ["Computers", "Phones", "Networking equipment", "Cables"],
    coordinates: { lat: 22.5726, lng: 88.4331 }
  },
  {
    id: "26",
    name: "Bengal Hazardous Waste Facility",
    type: "hazardous",
    address: "Haldia Industrial Area",
    city: "Haldia",
    state: "West Bengal",
    phone: "+91 3224 256 789",
    hours: "Mon-Sat: 8:00 AM - 4:00 PM",
    acceptedItems: ["Industrial chemicals", "Batteries", "Medical waste"],
    coordinates: { lat: 22.0667, lng: 88.0698 }
  },
  {
    id: "27",
    name: "Kolkata Municipal Recycling",
    type: "recyclable",
    address: "Dhapa",
    city: "Kolkata",
    state: "West Bengal",
    phone: "+91 33 2286 5432",
    hours: "Mon-Sun: 7:00 AM - 7:00 PM",
    acceptedItems: ["Paper", "Plastic", "Glass", "Metal"],
    coordinates: { lat: 22.5341, lng: 88.4179 }
  },

  // Rajasthan
  {
    id: "28",
    name: "Jaipur E-Waste Solutions",
    type: "e-waste",
    address: "Sitapura Industrial Area",
    city: "Jaipur",
    state: "Rajasthan",
    phone: "+91 141 277 8901",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    acceptedItems: ["Computers", "Phones", "Printers", "Home appliances"],
    coordinates: { lat: 26.8505, lng: 75.8102 }
  },
  {
    id: "29",
    name: "Rajasthan State Recycling Hub",
    type: "recyclable",
    address: "Vishwakarma Industrial Area",
    city: "Jaipur",
    state: "Rajasthan",
    phone: "+91 141 233 4567",
    hours: "Mon-Sat: 8:00 AM - 5:00 PM",
    acceptedItems: ["Paper", "Plastic", "Metal", "Glass", "Cardboard"],
    coordinates: { lat: 26.8856, lng: 75.7624 }
  },
  {
    id: "30",
    name: "Udaipur Green Waste Center",
    type: "organic",
    address: "Pratap Nagar",
    city: "Udaipur",
    state: "Rajasthan",
    phone: "+91 294 245 6789",
    hours: "Mon-Sun: 6:00 AM - 7:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Agricultural waste"],
    coordinates: { lat: 24.5854, lng: 73.7125 }
  },

  // Kerala
  {
    id: "31",
    name: "Kochi E-Waste Recyclers",
    type: "e-waste",
    address: "Kakkanad Industrial Area",
    city: "Kochi",
    state: "Kerala",
    phone: "+91 484 242 3456",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Computers", "Phones", "TVs", "Appliances"],
    coordinates: { lat: 10.0159, lng: 76.3419 }
  },
  {
    id: "32",
    name: "Kerala State Pollution Control",
    type: "hazardous",
    address: "Eloor Industrial Area",
    city: "Kochi",
    state: "Kerala",
    phone: "+91 484 254 5678",
    hours: "Mon-Sat: 9:00 AM - 4:00 PM",
    acceptedItems: ["Chemicals", "Batteries", "Paint", "Medical waste"],
    coordinates: { lat: 10.0652, lng: 76.2919 }
  },
  {
    id: "33",
    name: "Thiruvananthapuram Clean Kerala",
    type: "recyclable",
    address: "Kazhakkoottam",
    city: "Thiruvananthapuram",
    state: "Kerala",
    phone: "+91 471 259 8765",
    hours: "Mon-Sat: 8:00 AM - 6:00 PM",
    acceptedItems: ["Paper", "Plastic", "Glass", "Metal", "Coconut waste"],
    coordinates: { lat: 8.5579, lng: 76.8813 }
  },

  // Punjab
  {
    id: "34",
    name: "Chandigarh E-Waste Hub",
    type: "e-waste",
    address: "Industrial Area Phase II",
    city: "Chandigarh",
    state: "Chandigarh",
    phone: "+91 172 265 4321",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Computers", "Phones", "Office equipment"],
    coordinates: { lat: 30.7046, lng: 76.8013 }
  },
  {
    id: "35",
    name: "Ludhiana Recycling Works",
    type: "recyclable",
    address: "Focal Point",
    city: "Ludhiana",
    state: "Punjab",
    phone: "+91 161 250 1234",
    hours: "Mon-Sat: 8:00 AM - 6:00 PM",
    acceptedItems: ["Paper", "Plastic", "Metal", "Textiles"],
    coordinates: { lat: 30.8727, lng: 75.8494 }
  },
  {
    id: "36",
    name: "Amritsar Green Organic",
    type: "organic",
    address: "Verka Milk Plant Road",
    city: "Amritsar",
    state: "Punjab",
    phone: "+91 183 250 6789",
    hours: "Mon-Sun: 6:00 AM - 7:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Agricultural waste"],
    coordinates: { lat: 31.6340, lng: 74.8723 }
  },

  // Madhya Pradesh
  {
    id: "37",
    name: "Bhopal E-Waste Center",
    type: "e-waste",
    address: "Govindpura Industrial Area",
    city: "Bhopal",
    state: "Madhya Pradesh",
    phone: "+91 755 267 8901",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Computers", "Phones", "TVs", "Batteries"],
    coordinates: { lat: 23.2599, lng: 77.4126 }
  },
  {
    id: "38",
    name: "Indore Municipal Recycling",
    type: "recyclable",
    address: "Sanwer Road",
    city: "Indore",
    state: "Madhya Pradesh",
    phone: "+91 731 255 4321",
    hours: "Mon-Sun: 7:00 AM - 7:00 PM",
    acceptedItems: ["Paper", "Plastic", "Glass", "Metal", "Cardboard"],
    coordinates: { lat: 22.7196, lng: 75.8577 }
  },
  {
    id: "39",
    name: "Indore Bio-Waste Processing",
    type: "organic",
    address: "Dewas Naka",
    city: "Indore",
    state: "Madhya Pradesh",
    phone: "+91 731 243 2109",
    hours: "Mon-Sun: 6:00 AM - 8:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Market waste"],
    coordinates: { lat: 22.7533, lng: 75.8937 }
  },

  // Odisha
  {
    id: "40",
    name: "Bhubaneswar E-Waste Solutions",
    type: "e-waste",
    address: "Mancheswar Industrial Estate",
    city: "Bhubaneswar",
    state: "Odisha",
    phone: "+91 674 258 7654",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Computers", "Phones", "Printers", "Office equipment"],
    coordinates: { lat: 20.2961, lng: 85.8245 }
  },
  {
    id: "41",
    name: "Odisha State Hazardous Waste",
    type: "hazardous",
    address: "Paradeep",
    city: "Jagatsinghpur",
    state: "Odisha",
    phone: "+91 6722 22 3456",
    hours: "Mon-Sat: 8:00 AM - 4:00 PM",
    acceptedItems: ["Industrial chemicals", "Batteries", "Medical waste"],
    coordinates: { lat: 20.2649, lng: 86.6085 }
  },

  // Bihar
  {
    id: "42",
    name: "Patna Recycling Hub",
    type: "recyclable",
    address: "Patliputra Industrial Area",
    city: "Patna",
    state: "Bihar",
    phone: "+91 612 227 8901",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Paper", "Plastic", "Metal", "Glass"],
    coordinates: { lat: 25.6207, lng: 85.1376 }
  },
  {
    id: "43",
    name: "Bihar E-Waste Management",
    type: "e-waste",
    address: "Hajipur Industrial Area",
    city: "Hajipur",
    state: "Bihar",
    phone: "+91 6224 23 4567",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Computers", "Phones", "TVs", "Appliances"],
    coordinates: { lat: 25.6870, lng: 85.2135 }
  },

  // Assam
  {
    id: "44",
    name: "Guwahati Green Recyclers",
    type: "recyclable",
    address: "Amingaon Industrial Area",
    city: "Guwahati",
    state: "Assam",
    phone: "+91 361 258 9012",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Paper", "Plastic", "Metal", "Glass"],
    coordinates: { lat: 26.1805, lng: 91.7577 }
  },
  {
    id: "45",
    name: "Assam E-Waste Center",
    type: "e-waste",
    address: "Rani Industrial Area",
    city: "Guwahati",
    state: "Assam",
    phone: "+91 361 268 3456",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Computers", "Phones", "Office equipment"],
    coordinates: { lat: 26.0853, lng: 91.5640 }
  },

  // Uttarakhand
  {
    id: "46",
    name: "Dehradun E-Waste Hub",
    type: "e-waste",
    address: "Selaqui Industrial Area",
    city: "Dehradun",
    state: "Uttarakhand",
    phone: "+91 135 264 7890",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Computers", "Phones", "Printers", "Cables"],
    coordinates: { lat: 30.3165, lng: 77.9507 }
  },
  {
    id: "47",
    name: "Haridwar Organic Waste",
    type: "organic",
    address: "SIDCUL Industrial Area",
    city: "Haridwar",
    state: "Uttarakhand",
    phone: "+91 1334 25 6789",
    hours: "Mon-Sun: 6:00 AM - 7:00 PM",
    acceptedItems: ["Food waste", "Garden waste", "Temple flower waste"],
    coordinates: { lat: 29.9457, lng: 78.1642 }
  },

  // Jharkhand
  {
    id: "48",
    name: "Ranchi Recycling Center",
    type: "recyclable",
    address: "Namkum Industrial Area",
    city: "Ranchi",
    state: "Jharkhand",
    phone: "+91 651 246 5432",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Paper", "Plastic", "Metal", "Glass"],
    coordinates: { lat: 23.3441, lng: 85.3096 }
  },
  {
    id: "49",
    name: "Jamshedpur E-Waste Solutions",
    type: "e-waste",
    address: "Adityapur Industrial Area",
    city: "Jamshedpur",
    state: "Jharkhand",
    phone: "+91 657 235 7890",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Computers", "Phones", "Industrial electronics"],
    coordinates: { lat: 22.7840, lng: 86.1520 }
  },

  // Goa
  {
    id: "50",
    name: "Goa Waste Management",
    type: "recyclable",
    address: "Verna Industrial Estate",
    city: "Verna",
    state: "Goa",
    phone: "+91 832 278 3456",
    hours: "Mon-Sat: 9:00 AM - 5:00 PM",
    acceptedItems: ["Paper", "Plastic", "Glass", "Metal", "Tetra packs"],
    coordinates: { lat: 15.3647, lng: 73.9370 }
  }
];

// Get unique states from the data
export const getUniqueStates = (): string[] => {
  const states = [...new Set(RECYCLING_CENTERS.map(center => center.state))];
  return states.sort();
};

// Get unique cities for a given state
export const getCitiesForState = (state: string): string[] => {
  const cities = [...new Set(
    RECYCLING_CENTERS
      .filter(center => center.state === state)
      .map(center => center.city)
  )];
  return cities.sort();
};
