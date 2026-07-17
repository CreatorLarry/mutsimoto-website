import type { Application } from "@/types";

export const applications: Application[] = [
  { id: "passenger", name: "Passenger Vehicles", group: "Automotive", description: "Everyday protection for petrol, diesel, and hybrid passenger vehicles.", equipmentTypes: ["Sedan", "SUV", "Pickup"] },
  { id: "commercial", name: "Commercial Vehicles", group: "Commercial", description: "Filtration for trucks, buses, vans, and high-mileage fleets.", equipmentTypes: ["Truck", "Bus", "Delivery van"] },
  { id: "construction", name: "Construction Equipment", group: "Construction", description: "Heavy-duty filters for dusty sites and long operating cycles.", equipmentTypes: ["Excavator", "Loader", "Grader"] },
  { id: "agriculture", name: "Agricultural Machinery", group: "Agriculture", description: "Reliable protection for tractors, harvesters, and irrigation equipment.", equipmentTypes: ["Tractor", "Harvester", "Pump"] },
  { id: "generators", name: "Generators", group: "Power generation", description: "Consistent filtration for standby and continuous power systems.", equipmentTypes: ["Diesel generator", "Genset", "Light tower"] },
  { id: "industrial", name: "Industrial Equipment", group: "Industrial", description: "Filtration for compressors, material handling, and plant machinery.", equipmentTypes: ["Compressor", "Forklift", "Plant equipment"] },
];
