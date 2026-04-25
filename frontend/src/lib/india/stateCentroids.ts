export type LatLng = { lat: number; lng: number };

// Lightweight centroid approximations (story > precision for hackathon).
// If a state isn't in the map, we still render deserts as lists.
export const INDIA_STATE_CENTROIDS: Record<string, LatLng> = {
  "Andhra Pradesh": { lat: 15.9129, lng: 79.74 },
  "Arunachal Pradesh": { lat: 28.218, lng: 94.7278 },
  Assam: { lat: 26.2006, lng: 92.9376 },
  Bihar: { lat: 25.0961, lng: 85.3131 },
  Chhattisgarh: { lat: 21.2787, lng: 81.8661 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Goa: { lat: 15.2993, lng: 74.124 },
  Gujarat: { lat: 22.2587, lng: 71.1924 },
  Haryana: { lat: 29.0588, lng: 76.0856 },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
  Jharkhand: { lat: 23.6102, lng: 85.2799 },
  Karnataka: { lat: 15.3173, lng: 75.7139 },
  Kerala: { lat: 10.8505, lng: 76.2711 },
  "Madhya Pradesh": { lat: 22.9734, lng: 78.6569 },
  Maharashtra: { lat: 19.7515, lng: 75.7139 },
  Manipur: { lat: 24.6637, lng: 93.9063 },
  Meghalaya: { lat: 25.467, lng: 91.3662 },
  Mizoram: { lat: 23.1645, lng: 92.9376 },
  Nagaland: { lat: 26.1584, lng: 94.5624 },
  Odisha: { lat: 20.9517, lng: 85.0985 },
  Punjab: { lat: 31.1471, lng: 75.3412 },
  Rajasthan: { lat: 27.0238, lng: 74.2179 },
  Sikkim: { lat: 27.533, lng: 88.5122 },
  "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
  Telangana: { lat: 18.1124, lng: 79.0193 },
  Tripura: { lat: 23.9408, lng: 91.9882 },
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
  Uttarakhand: { lat: 30.0668, lng: 79.0193 },
  "West Bengal": { lat: 22.9868, lng: 87.855 },
};

