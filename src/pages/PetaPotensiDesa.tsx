import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import NavbarDesa from "@/components/NavbarDesa";
import FooterDesa from "@/components/FooterDesa";
import PetaNav from "@/components/PetaNav";
import { renderToStaticMarkup } from "react-dom/server";
import { useDesa } from "@/contexts/DesaContext";
import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { DesaData } from "@/types/desa";
import {
  MapPin,
  Calendar,
  Building2,
  Maximize2,
  Minimize2,
  Search,
  LucideIcon,
  Wheat,
  Factory,
  Mountain,
  Link as LinkIcon,
} from "lucide-react";
import { PiFarm } from "react-icons/pi";
import type { IconType } from "react-icons";
// Memperbaiki masalah icon Leaflet di React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

interface PotensiFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
    tags: {
      "addr:housenumber"?: string;
      "addr:street": string;
      amenity: string;
      building: string;
      name: string;
    };
    artikel_id?: number | null;
  };
}

// Dummy data for potensi
const dummyPotensiData: PotensiFeature[] = [
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [107.5105222441776, -6.912986707035502],
    },
    properties: {
      name: "Sawah Padi Desa",
      tags: {
        "addr:street": "Jalan Sawah",
        amenity: "farm",
        building: "farm",
        name: "Sawah Padi Desa",
      },
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [107.5115222441776, -6.913986707035502],
    },
    properties: {
      name: "Peternakan Ayam",
      tags: {
        "addr:street": "Jalan Peternakan",
        amenity: "farmyard",
        building: "farmyard",
        name: "Peternakan Ayam",
      },
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [107.5125222441776, -6.914986707035502],
    },
    properties: {
      name: "Industri Kecil",
      tags: {
        "addr:street": "Jalan Industri",
        amenity: "industrial",
        building: "industrial",
        name: "Industri Kecil",
      },
    },
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [107.5135222441776, -6.915986707035502],
    },
    properties: {
      name: "Wisata Alam",
      tags: {
        "addr:street": "Jalan Wisata",
        amenity: "tourism",
        building: "tourism",
        name: "Wisata Alam",
      },
    },
  },
];

const categoryConfig = [
  {
    key: "pertanian",
    label: "Pertanian",
    icon: Wheat,
    color: "green",
    bgColor: "bg-green-500",
    textColor: "text-green-600",
  },
  {
    key: "peternakan",
    label: "Peternakan",
    icon: PiFarm,
    color: "blue",
    bgColor: "bg-blue-500",
    textColor: "text-blue-600",
  },
  {
    key: "industri",
    label: "Industri",
    icon: Factory,
    color: "red",
    bgColor: "bg-red-500",
    textColor: "text-red-600",
  },
  {
    key: "wisata",
    label: "Wisata",
    icon: Mountain,
    color: "orange",
    bgColor: "bg-orange-500",
    textColor: "text-orange-600",
  },
];

const createShadowIcon = (
  IconComponent: LucideIcon | IconType,
  color: string,
  size = 20,
) => {
  const iconMarkup = renderToStaticMarkup(
    <div style={{ position: "relative" }}>
      {/* Shadow */}
      <div
        style={{
          position: "absolute",
          top: "4px",
          left: "2px",
          width: "40px",
          height: "40px",
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "50%",
          filter: "blur(3px)",
        }}
      />
      {/* Main icon */}
      <div
        style={{
          position: "relative",
          backgroundColor: color,
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid white",
          zIndex: 1,
        }}
      >
        <IconComponent size={size} color="white" strokeWidth={2} />
      </div>
    </div>,
  );

  return L.divIcon({
    html: iconMarkup,
    iconSize: [44, 48],
    iconAnchor: [22, 24],
    popupAnchor: [0, -24],
    className: "custom-shadow-marker",
  });
};

// Update getMarkerIcon untuk shadow style
const getMarkerIcon = (amenity: string) => {
  switch (amenity) {
    case "farm":
      return createShadowIcon(Wheat, "#10b981");
    case "farmyard":
      return createShadowIcon(PiFarm, "#3b82f6");
    case "industrial":
      return createShadowIcon(Factory, "#ef4444");
    case "tourism":
      return createShadowIcon(Mountain, "#f97316");
    default:
      return createShadowIcon(Building2, "#6b7280");
  }
};

export default function PetaPotensiDesa() {
  const { desaConfig, loading } = useDesa();
  const [allPotensiData, setAllPotensiData] = React.useState<PotensiFeature[]>(
    [],
  );
  const [isLoadingPotensi, setIsLoadingPotensi] = React.useState(true);
  const [polygonData, setPolygonData] = React.useState<[number, number][]>([]);
  const [isLoadingPolygon, setIsLoadingPolygon] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const mapRef = React.useRef<L.Map | null>(null);
  const popupRef = React.useRef<L.Popup | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPotensi, setSelectedPotensi] =
    React.useState<PotensiFeature | null>(null);

  // State untuk kategori yang aktif
  const [activeCategories, setActiveCategories] = React.useState<{
    pertanian: boolean;
    peternakan: boolean;
    industri: boolean;
    wisata: boolean;
  }>({
    pertanian: true,
    peternakan: true,
    industri: true,
    wisata: true,
  });

  // Simplified loading state
  const isPageLoading = loading || isLoadingPotensi || isLoadingPolygon;

  // Toggle kategori
  const toggleCategory = (kategori: keyof typeof activeCategories) => {
    setActiveCategories((prev) => ({
      ...prev,
      [kategori]: !prev[kategori],
    }));
  };

  // Function to categorize Potensi based on amenity
  const categorizePotensi = (amenity: string): string => {
    switch (amenity) {
      case "farm":
        return "pertanian";
      case "farmyard":
        return "peternakan";
      case "industrial":
        return "industri";
      case "tourism":
        return "wisata";
      default:
        return "lainnya";
    }
  };

  // Filter Potensi data based on active categories and search query
  const filteredPotensiData = React.useMemo(() => {
    return allPotensiData.filter((feature) => {
      const category = categorizePotensi(feature.properties.tags.amenity);
      const matchesCategory =
        activeCategories[category as keyof typeof activeCategories];

      // Add null checks for search
      const searchLower = searchQuery.toLowerCase();
      const name = feature.properties.name?.toLowerCase() || "";
      const street =
        feature.properties.tags["addr:street"]?.toLowerCase() || "";

      const matchesSearch =
        searchQuery === "" ||
        name.includes(searchLower) ||
        street.includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [allPotensiData, activeCategories, searchQuery]);

  // Fetch polygon data
  React.useEffect(() => {
    const fetchPolygonData = async () => {
      try {
        setIsLoadingPolygon(true);
        const response = await axios.get<DesaData>(
          `${API_CONFIG.baseURL}/api/publik/profil-desa/1`,
          { headers: API_CONFIG.headers },
        );
        if (response.data.polygon_desa) {
          const coordinates = response.data.polygon_desa.map(
            (coord) => [coord[1], coord[0]] as [number, number],
          );
          setPolygonData(coordinates);
        }
      } catch (error) {
        console.error("Error fetching polygon data:", error);
      } finally {
        setIsLoadingPolygon(false);
      }
    };

    fetchPolygonData();
  }, []);

  // Fetch potensi data from API
  React.useEffect(() => {
    const fetchPotensiData = async () => {
      setIsLoadingPotensi(true);
      try {
        const response = await axios.get(
          `${API_CONFIG.baseURL}/api/publik/map/poi/all`,
          { headers: API_CONFIG.headers },
        );
        const data = response.data;
        // Only use relevant categories
        const relevantCategories = [
          "pertanian",
          "peternakan",
          "industri",
          "wisata",
        ];
        let features: PotensiFeature[] = [];
        // Define a type for the API feature
        type ApiFeature = {
          type: string;
          geometry: {
            type: string;
            coordinates: [string | number, string | number];
          };
          properties: {
            name: string;
            kategori: string;
            tags?: string[];
          };
        };
        relevantCategories.forEach((cat) => {
          if (data[cat] && Array.isArray(data[cat].features)) {
            features = features.concat(
              data[cat].features
                .map((feature: unknown) => {
                  // Type guard for API feature
                  if (
                    typeof feature === "object" &&
                    feature !== null &&
                    (feature as ApiFeature).geometry &&
                    (feature as ApiFeature).geometry.type === "Point" &&
                    Array.isArray(
                      (feature as ApiFeature).geometry.coordinates,
                    ) &&
                    typeof (feature as ApiFeature).properties?.name === "string"
                  ) {
                    const apiFeature = feature as ApiFeature;
                    const coords = apiFeature.geometry.coordinates.map(
                      Number,
                    ) as [number, number];
                    return {
                      type: "Feature",
                      geometry: {
                        type: "Point",
                        coordinates: [coords[0], coords[1]],
                      },
                      properties: {
                        name: apiFeature.properties.name,
                        tags: {
                          "addr:street":
                            Array.isArray(apiFeature.properties.tags) &&
                            apiFeature.properties.tags.length > 0
                              ? apiFeature.properties.tags[0]
                              : "",
                          amenity:
                            cat === "pertanian"
                              ? "farm"
                              : cat === "peternakan"
                                ? "farmyard"
                                : cat === "industri"
                                  ? "industrial"
                                  : cat === "wisata"
                                    ? "tourism"
                                    : "other",
                          building: cat,
                          name: apiFeature.properties.name,
                        },
                        artikel_id:
                          (
                            apiFeature.properties as {
                              artikel_id?: number | null;
                            }
                          ).artikel_id ?? null,
                      },
                    };
                  }
                  // fallback: skip if not valid
                  return null;
                })
                .filter(Boolean) as PotensiFeature[],
            );
          }
        });
        setAllPotensiData(features);
      } catch {
        // Fallback to dummy data if API fails
        setAllPotensiData(dummyPotensiData);
      } finally {
        setIsLoadingPotensi(false);
      }
    };
    fetchPotensiData();
  }, []);

  // Fix untuk icon Leaflet di React
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Add a small delay to ensure the map container has resized
    setTimeout(() => {
      if (mapRef.current) {
        if (!isFullscreen) {
          // When entering fullscreen, zoom in
          mapRef.current.setZoom(16);
        } else {
          // When exiting fullscreen, zoom out
          mapRef.current.setZoom(15);
        }
        // Trigger a resize event to ensure the map updates properly
        mapRef.current.invalidateSize();
      }
    }, 100);
  };

  // Function to handle potensi selection
  const handlePotensiSelect = (potensi: PotensiFeature) => {
    setSelectedPotensi(potensi);
    if (mapRef.current) {
      const [longitude, latitude] = potensi.geometry.coordinates;
      mapRef.current.setView([latitude, longitude], 17, {
        animate: true,
        duration: 0.4,
        easeLinearity: 0.25,
        noMoveStart: false,
      });
      // Close any open popup
      if (popupRef.current) {
        popupRef.current.close();
      }
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <NavbarDesa />
        <div className="container mx-auto space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 lg:space-y-8 lg:px-6 lg:py-8">
          <PetaNav activeTab="potensi" />

          {/* Header Section Skeleton */}
          <div className="mb-4 sm:mb-8 lg:mb-16">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600/50 via-blue-700/50 to-indigo-700/50 p-4 text-white shadow-2xl sm:rounded-2xl sm:p-6 lg:rounded-3xl lg:p-8">
              <div className="relative z-10">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-white/20 sm:h-10 sm:w-10"></div>
                    <div className="h-6 w-48 animate-pulse rounded-xl bg-white/20 sm:h-8 sm:w-64 lg:h-10 lg:w-96"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-pulse rounded-full bg-white/20 sm:h-5 sm:w-5"></div>
                      <div className="h-4 w-64 animate-pulse rounded-lg bg-white/20 sm:h-5 sm:w-96"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-pulse rounded-full bg-white/20 sm:h-5 sm:w-5"></div>
                      <div className="h-4 w-48 animate-pulse rounded-lg bg-white/20 sm:h-5 sm:w-72"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center sm:mt-4">
                  <div className="mx-auto h-4 w-48 animate-pulse rounded-lg bg-white/20 sm:h-5 sm:w-64"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-8">
            <div className="mb-6 text-center sm:mb-8">
              <div className="mx-auto h-8 w-64 animate-pulse rounded-xl bg-gray-200 sm:h-10 sm:w-80 dark:bg-gray-700"></div>
              <div className="mx-auto mt-2 h-4 w-48 animate-pulse rounded-lg bg-gray-200 sm:h-5 sm:w-64 dark:bg-gray-700"></div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 xl:grid-cols-3">
              {/* Map Skeleton */}
              <div className="relative z-0 col-span-1 overflow-hidden rounded-xl border border-gray-200 bg-white sm:rounded-2xl xl:col-span-2">
                <div className="absolute top-2 right-2 z-[1000] h-8 w-8 animate-pulse rounded-lg bg-gray-200 sm:top-4 sm:right-4 dark:bg-gray-700"></div>
                <div className="h-[50vh] w-full animate-pulse bg-gray-200 sm:h-[60vh] xl:h-[750px] dark:bg-gray-700"></div>
              </div>

              {/* Potensi List Skeleton */}
              <div className="col-span-1 flex h-[50vh] flex-col sm:h-[60vh] xl:h-[750px]">
                {/* Filter dan Search - fixed height */}
                <div className="mb-6 flex-shrink-0 space-y-4">
                  {/* Filter Kategori Skeleton */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-9 flex-1 animate-pulse rounded-lg bg-gray-200 sm:h-10 sm:rounded-xl dark:bg-gray-700"
                      ></div>
                    ))}
                  </div>

                  {/* Search Bar Skeleton */}
                  <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200 sm:h-12 dark:bg-gray-700"></div>
                </div>

                {/* Potensi List Items Skeleton */}
                <div className="flex-1 overflow-hidden">
                  <div className="grid h-full grid-cols-1 gap-3 overflow-y-auto pr-2 sm:gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:gap-4 sm:rounded-2xl sm:p-4"
                      >
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 sm:h-11 sm:w-11 dark:bg-gray-700"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterDesa />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavbarDesa />
      <div className="container mx-auto space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 lg:space-y-8 lg:px-6 lg:py-8">
        <PetaNav activeTab="potensi" />

        {/* Header Section */}
        <div className="mb-4 sm:mb-8 lg:mb-16">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 text-white shadow-2xl sm:rounded-2xl sm:p-6 lg:rounded-3xl lg:p-8">
            {/* Background icon - hide di mobile */}
            <div className="absolute top-0 right-0 hidden h-32 w-32 opacity-10 sm:block lg:h-64 lg:w-64">
              <Building2
                size={100}
                className="rotate-12 transform lg:size-[200px]"
              />
            </div>

            <div className="relative z-10">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm sm:p-2">
                    <Building2 size={16} className="sm:size-5 lg:size-6" />
                  </div>
                  <h1 className="text-lg font-bold sm:text-2xl lg:text-4xl">
                    Peta Potensi Desa {desaConfig?.nama_desa}
                  </h1>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-100">
                    <MapPin size={12} className="sm:size-4" />
                    <span className="text-xs sm:text-sm lg:text-lg">
                      Desa {desaConfig?.nama_desa}, Kec.{" "}
                      {desaConfig?.nama_kecamatan}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <Calendar size={12} className="sm:size-4" />
                    <span className="text-xs sm:text-sm">
                      Data Terakhir Diperbarui:{" "}
                      {new Date().toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center sm:mt-4">
                <p className="text-xs text-blue-100 sm:text-sm">
                  Menampilkan {filteredPotensiData.length} dari{" "}
                  {allPotensiData.length} potensi
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Combined Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-8">
              <div className="mb-6 text-center sm:mb-8">
                <h2 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl">
                  Peta & Daftar Potensi
                </h2>
                <p className="text-sm text-gray-600 sm:text-base">
                  Potensi yang tersedia di Desa {desaConfig?.nama_desa}
                </p>
              </div>

              <div
                className={`grid gap-4 sm:gap-6 lg:gap-8 ${
                  isFullscreen ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-3"
                }`}
              >
                {/* Map Section */}
                <div
                  className={`${
                    isFullscreen ? "col-span-1" : "col-span-1 xl:col-span-2"
                  } relative z-0 overflow-hidden rounded-xl border border-gray-200 bg-white sm:rounded-2xl`}
                >
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-2 right-2 z-[1000] rounded-lg bg-white/90 p-1.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-xl sm:top-4 sm:right-4 sm:p-2 dark:bg-gray-800/90 dark:hover:bg-gray-800"
                    title={
                      isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                    }
                  >
                    {isFullscreen ? (
                      <Minimize2
                        size={16}
                        className="text-gray-700 sm:size-5 dark:text-gray-300"
                      />
                    ) : (
                      <Maximize2
                        size={16}
                        className="text-gray-700 sm:size-5 dark:text-gray-300"
                      />
                    )}
                  </button>
                  <div className="z-0 h-[50vh] w-full sm:h-[60vh] xl:h-[750px]">
                    <MapContainer
                      center={desaConfig?.center_map}
                      zoom={15.333333}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={true}
                      dragging={true}
                      touchZoom={true}
                      doubleClickZoom={true}
                      zoomControl={true}
                      ref={mapRef}
                    >
                      <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {polygonData.length > 0 && (
                        <Polygon
                          positions={polygonData}
                          pathOptions={{
                            color: "#3b82f6",
                            fillColor: "#60a5fa",
                            fillOpacity: 0.3,
                            weight: 2,
                          }}
                        >
                          <Popup>
                            <div className="text-center">
                              <h3 className="mb-1 text-lg font-bold text-blue-600">
                                {desaConfig?.nama_desa}
                              </h3>
                              <div className="mb-2 h-0.5 w-full bg-blue-200"></div>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Alamat:</span>
                                <br /> {desaConfig?.alamat_desa}
                              </p>
                            </div>
                          </Popup>
                        </Polygon>
                      )}
                      {filteredPotensiData.map((feature, index) => {
                        const [longitude, latitude] =
                          feature.geometry.coordinates;
                        const { name, tags } = feature.properties;
                        const amenity = tags.amenity;

                        return (
                          <Marker
                            key={`${longitude}-${latitude}-${name}-${index}`}
                            position={[latitude, longitude]}
                            icon={getMarkerIcon(amenity)}
                          >
                            <Popup
                              ref={(popup) => {
                                if (popup) {
                                  popupRef.current = popup;
                                }
                              }}
                            >
                              <div className="p-1">
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                  {name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {tags["addr:street"]}
                                  {tags["addr:housenumber"] &&
                                    ` No. ${tags["addr:housenumber"]}`}
                                </p>
                                <p className="mt-1 text-xs text-blue-600 capitalize dark:text-blue-400">
                                  {amenity.replace(/_/g, " ")}
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </div>

                {/* Potensi List Section */}
                {!isFullscreen && (
                  <div className="col-span-1 flex h-[50vh] flex-col sm:h-[60vh] xl:h-[750px]">
                    {/* Filter dan Search - fixed height */}
                    <div className="mb-6 flex-shrink-0 space-y-4">
                      {/* Filter Kategori */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap">
                        {categoryConfig.map((config) => (
                          <button
                            key={config.key}
                            onClick={() =>
                              toggleCategory(
                                config.key as keyof typeof activeCategories,
                              )
                            }
                            className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm lg:flex-1 ${
                              activeCategories[
                                config.key as keyof typeof activeCategories
                              ]
                                ? `${config.textColor} bg-${config.color}-100 shadow-sm`
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            <config.icon size={14} className="sm:size-4" />
                            <span className="hidden sm:inline">
                              {config.label}
                            </span>
                            <span className="sm:hidden">
                              {config.label.split(" ")[0]}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Cari potensi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-4 pl-10 text-xs shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:py-3 sm:pl-12 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                          <Search
                            size={16}
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 sm:left-4 sm:size-5"
                          />
                        </div>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Potensi List - flex grow */}
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full overflow-y-auto pr-2">
                        {filteredPotensiData.map((feature, index) => {
                          const { name, tags } = feature.properties;
                          const amenity = tags.amenity;
                          const category = categorizePotensi(amenity);
                          const config = categoryConfig.find(
                            (c) => c.key === category,
                          );
                          const IconComponent = config?.icon || Building2;

                          return (
                            <div
                              key={index}
                              onClick={() => handlePotensiSelect(feature)}
                              className={`group mb-3 transform cursor-pointer rounded-xl border bg-white p-3 transition-all duration-300 hover:shadow-lg sm:mb-4 sm:rounded-2xl sm:p-4 ${
                                selectedPotensi?.properties.name === name
                                  ? "border-blue-500"
                                  : "border-gray-200 hover:border-blue-400"
                              }`}
                            >
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div
                                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11 ${config?.bgColor || "bg-gray-500"}`}
                                >
                                  <IconComponent
                                    size={18}
                                    className="sm:size-[22px]"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h3 className="mb-1 truncate text-sm font-bold text-blue-700 sm:text-base">
                                    {name}
                                  </h3>
                                  <p className="mb-2 truncate text-xs text-gray-500 sm:text-sm">
                                    {tags["addr:street"]}
                                    {tags["addr:housenumber"] &&
                                      ` No. ${tags["addr:housenumber"]}`}
                                  </p>
                                  <div>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${config?.textColor || "text-gray-600"} bg-${config?.color || "gray"}-100`}
                                    >
                                      {config?.label || "Lainnya"}
                                    </span>
                                  </div>
                                  {feature.properties.artikel_id && (
                                    <button
                                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm transition hover:bg-blue-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/artikeldesa/${feature.properties.artikel_id}`;
                                      }}
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                      Lihat Selengkapnya
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {filteredPotensiData.length === 0 && (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Building2
                                  size={24}
                                  className="text-gray-400"
                                />
                              </div>
                              <h3 className="mb-2 text-base font-semibold text-gray-700">
                                Tidak Ada Potensi
                              </h3>
                              <p className="text-sm text-gray-500">
                                {searchQuery
                                  ? "Tidak ada potensi yang sesuai dengan pencarian."
                                  : "Tidak ada potensi yang sesuai dengan filter yang dipilih."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <FooterDesa />
      </div>
    </div>
  );
}
