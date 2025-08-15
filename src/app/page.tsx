"use client";
import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowRight,
  faMapMarkerAlt,
  faTimes,
  faSliders,
  faBed,
  faBath,
  faRulerCombined,
} from "@fortawesome/free-solid-svg-icons";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import PageLoader from "@/components/shared/page-loader";
import Footer from "@/components/user/footer";
import PropertyCard from "@/components/user/property-card";
import MainTestimonial from "@/components/user/home/main-testimonials";
import WhyChooseUs from "@/components/user/home/why-choose-us";
import FeaturedCities from "@/components/user/home/featured-city";
import CTA from "@/components/user/home/cta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface Listing {
  id: string;
  numericId: number;
  title: string;
  location: string;
  price: number;
  description?: string;
  images?: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  for: string;
  createdAt: any;
}

interface FilterState {
  searchQuery: string;
  city: string;
  type: string;
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  areaRange: [number, number];
  propertyFor: string;
}

const CITIES = [
  "Adama",
  "Addis Ababa",
  "Bahirdar",
  "Hawassa",
  "Jigjiga",
  "Negele",
];
const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Penthouse", "Mansion"];
const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const BATHROOM_OPTIONS = ["1", "2", "3", "4+"];
const PROPERTY_FOR_OPTIONS = ["Sale", "Rent"];

export default function HomePage() {
  const { data: listings = [], isLoading } =
    useFirestoreCollection<Listing>("listings");

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    city: "",
    type: "",
    priceRange: [0, 50000000],
    bedrooms: "",
    bathrooms: "",
    areaRange: [0, 10000],
    propertyFor: "",
  });

  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filters.searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
        setSearchInputFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredListings = useMemo(() => {
    return listings
      .filter((l) => l.createdAt?.toDate && l.status === "available")
      .filter((l) => {
        const query = debouncedSearchQuery.toLowerCase();
        const location = l.location?.toLowerCase() ?? "";
        const title = l.title?.toLowerCase() ?? "";
        const description = l.description?.toLowerCase() ?? "";

        const matchesSearch =
          !debouncedSearchQuery ||
          title.includes(query) ||
          location.includes(query) ||
          description.includes(query);

        const matchesCity =
          !filters.city || location.includes(filters.city.toLowerCase());
        const matchesType =
          !filters.type || l.type?.toLowerCase() === filters.type.toLowerCase();
        const matchesPrice =
          l.price >= filters.priceRange[0] && l.price <= filters.priceRange[1];
        const matchesBedrooms =
          !filters.bedrooms ||
          (filters.bedrooms === "5+"
            ? l.bedrooms >= 5
            : l.bedrooms === Number.parseInt(filters.bedrooms));
        const matchesBathrooms =
          !filters.bathrooms ||
          (filters.bathrooms === "4+"
            ? l.bathrooms >= 4
            : l.bathrooms === Number.parseInt(filters.bathrooms));
        const matchesArea =
          l.area >= filters.areaRange[0] && l.area <= filters.areaRange[1];
        const matchesPropertyFor =
          !filters.propertyFor ||
          l.for?.toLowerCase() === filters.propertyFor.toLowerCase();

        return (
          matchesSearch &&
          matchesCity &&
          matchesType &&
          matchesPrice &&
          matchesBedrooms &&
          matchesBathrooms &&
          matchesArea &&
          matchesPropertyFor
        );
      })
      .sort(
        (a, b) =>
          b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );
  }, [listings, debouncedSearchQuery, filters]);

  const displayedListings = filteredListings.slice(0, 6);
  const searchResults = useMemo(
    () => filteredListings.slice(0, 8),
    [filteredListings]
  );
  const totalMatches = filteredListings.length;

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      city: "",
      type: "",
      priceRange: [0, 50000000],
      bedrooms: "",
      bathrooms: "",
      areaRange: [0, 10000],
      propertyFor: "",
    });
    setShowSearchResults(false);
  }, []);

  const getActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.city) count++;
    if (filters.type) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.areaRange[0] > 0 || filters.areaRange[1] < 10000) count++;
    if (filters.propertyFor) count++;
    return count;
  }, [filters]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-24 pt-10">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <Image
          src="/main-hero-bg.png"
          fill
          alt="Hero Background"
          className="object-cover opacity-70"
          priority
        />
        <div className="relative z-10 text-center w-full px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-4 drop-shadow-lg">
            Find Your Dream Home
          </h1>
          <p className="max-w-xl mx-auto text-lg text-blue-50 mb-8">
            Discover quality properties in top cities with our expert agents.
          </p>

          <div className="backdrop-blur-sm bg-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto space-y-6 text-left border border-white/20">
            {/* Active Filters Display */}
            {getActiveFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/20">
                <span className="text-sm text-white/80">Active filters:</span>
                {filters.searchQuery && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-600/80 text-white hover:bg-blue-700/80"
                  >
                    Search: "{filters.searchQuery}"
                    <button
                      onClick={() => updateFilter("searchQuery", "")}
                      className="ml-2 hover:text-red-300"
                    >
                      <FontAwesomeIcon icon={faTimes} size="xs" />
                    </button>
                  </Badge>
                )}
                {filters.city && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-600/80 text-white hover:bg-blue-700/80"
                  >
                    City: {filters.city}
                    <button
                      onClick={() => updateFilter("city", "")}
                      className="ml-2 hover:text-red-300"
                    >
                      <FontAwesomeIcon icon={faTimes} size="xs" />
                    </button>
                  </Badge>
                )}
                {filters.type && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-600/80 text-white hover:bg-blue-700/80"
                  >
                    Type: {filters.type}
                    <button
                      onClick={() => updateFilter("type", "")}
                      className="ml-2 hover:text-red-300"
                    >
                      <FontAwesomeIcon icon={faTimes} size="xs" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-white/80 hover:text-white hover:bg-white/10 h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
                <div className="text-sm text-blue-200 bg-blue-800/60 px-3 py-1 rounded-full">
                  {totalMatches}{" "}
                  {totalMatches !== 1 ? "properties" : "property"} found
                </div>
              </div>
            )}

            <div
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative"
              ref={searchRef}
            >
              {/* Enhanced Search Input */}
              <div className="lg:col-span-5 relative">
                <div className="relative">
                  <Input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => {
                      updateFilter("searchQuery", e.target.value);
                      setShowSearchResults(e.target.value.length > 0);
                    }}
                    onFocus={() => {
                      setSearchInputFocused(true);
                      setShowSearchResults(filters.searchQuery.length > 0);
                    }}
                    placeholder="Search by title, location, or description..."
                    className="h-12 pl-4 pr-12 text-black bg-white/95 border-white/30 focus:border-blue-400 focus:ring-blue-400/50 rounded-xl"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    {filters.searchQuery && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5"
                      >
                        {totalMatches}
                      </Badge>
                    )}
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-gray-400"
                    />
                  </div>
                </div>

                {/* Enhanced Search Dropdown */}
                {showSearchResults && searchInputFocused && (
                  <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {totalMatches} properties found
                      </span>
                      {totalMatches > 8 && (
                        <Link
                          href={`/listings?search=${encodeURIComponent(
                            filters.searchQuery
                          )}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => setShowSearchResults(false)}
                        >
                          View all →
                        </Link>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        searchResults.map((listing) => (
                          <Link
                            key={listing.id}
                            href={`/listings/${listing.numericId}`}
                            className="flex items-center p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                            onClick={() => setShowSearchResults(false)}
                          >
                            <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={listing.images?.[0] ?? "/Big Home1.jpg"}
                                alt={listing.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                                {listing.title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 mb-1">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="mr-1 text-blue-600"
                                  size="xs"
                                />
                                <span>{listing.location}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faBed} />
                                  {listing.bedrooms}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faBath} />
                                  {listing.bathrooms}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faRulerCombined} />
                                  {listing.area} sqft
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-blue-600">
                                {formatPrice(listing.price)}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {listing.for}
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="text-3xl mb-2 text-gray-300"
                          />
                          <p>No properties match your search</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Filters */}
              <div className="lg:col-span-2">
                <Select
                  value={filters.city}
                  onValueChange={(value) => updateFilter("city", value)}
                >
                  <SelectTrigger className="h-12 bg-white/95 border-white/30 focus:border-blue-400 rounded-xl">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilter("type", value)}
                >
                  <SelectTrigger className="h-12 bg-white/95 border-white/30 focus:border-blue-400 rounded-xl">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <Select
                  value={filters.propertyFor}
                  onValueChange={(value) => updateFilter("propertyFor", value)}
                >
                  <SelectTrigger className="h-12 bg-white/95 border-white/30 focus:border-blue-400 rounded-xl">
                    <SelectValue placeholder="For Sale/Rent" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_FOR_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Filters Button */}
              <div className="lg:col-span-1">
                <Popover
                  open={showAdvancedFilters}
                  onOpenChange={setShowAdvancedFilters}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 w-full bg-white/95 border-white/30 hover:bg-white text-gray-700 rounded-xl relative"
                    >
                      <FontAwesomeIcon icon={faSliders} />
                      {getActiveFiltersCount > 3 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-blue-600 text-white text-xs">
                          {getActiveFiltersCount - 3}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-6" align="end">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">Advanced Filters</h4>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Price Range: {formatPrice(filters.priceRange[0])} -{" "}
                          {formatPrice(filters.priceRange[1])}
                        </label>
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value) =>
                            updateFilter("priceRange", value)
                          }
                          max={50000000}
                          step={100000}
                          className="w-full"
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Bedrooms
                          </label>
                          <Select
                            value={filters.bedrooms}
                            onValueChange={(value) =>
                              updateFilter("bedrooms", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              {BEDROOM_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Bathrooms
                          </label>
                          <Select
                            value={filters.bathrooms}
                            onValueChange={(value) =>
                              updateFilter("bathrooms", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              {BATHROOM_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Area: {filters.areaRange[0]} - {filters.areaRange[1]}{" "}
                          sqft
                        </label>
                        <Slider
                          value={filters.areaRange}
                          onValueChange={(value) =>
                            updateFilter("areaRange", value)
                          }
                          max={10000}
                          step={100}
                          className="w-full"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFilters}
                          className="flex-1 bg-transparent"
                        >
                          Clear All
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowAdvancedFilters(false)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href="/listings">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  <FontAwesomeIcon icon={faSearch} className="mr-2" />
                  Search Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between mb-10 items-end">
          <div>
            <h1 className="text-3xl font-bold">Latest Listings</h1>
            <p className="text-sm text-gray-600 mt-2">
              Explore our newest properties on the market
            </p>
          </div>
          <Link href="/listings">
            <div className="inline-flex items-center gap-2 px-5 py-2 border border-blue-700 text-blue-700 font-medium text-sm rounded-md transition group hover:bg-blue-50">
              <p className="whitespace-nowrap">View All</p>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </div>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {displayedListings.map((listing) => (
            <PropertyCard key={listing.id} property={listing} view="grid" />
          ))}
        </div>
      </section>

      <WhyChooseUs />
      <MainTestimonial />
      <FeaturedCities />
      <CTA />
      <Footer />
    </div>
  );
}
