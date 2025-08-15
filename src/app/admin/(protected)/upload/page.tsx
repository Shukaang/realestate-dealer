"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useFirestoreCollection } from "@/lib/useFirestoreCollection";
import {
  collection,
  addDoc,
  runTransaction,
  doc,
  getDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Unauthorized } from "@/components/admin/unauthorized";

const featureOptions = [
  "Central Air Conditioning",
  "Gourmet Kitchen",
  "Smart Home Technology",
  "Fitness Center Access",
  "24/7 Security",
  "Laundry Room",
  "Hardwood Flooring",
  "Private Balcony",
  "Swimming Pool",
  "Garage Parking",
  "High Ceilings",
];

export default function CreateListing() {
  interface Admin {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }

  const router = useRouter();
  const { hasPermission, loading: authLoading, user, role } = useAuth();

  // Check permission first
  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!hasPermission("upload-content")) {
    return <Unauthorized />;
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    overview: "",
    price: 0,
    location: "",
    type: "",
    status: "available",
    for: "Sale",
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [creator, setCreator] = useState({
    uid: "",
    name: "",
    email: "",
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const auth = getAuth();

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const { data: adminsData = [] } = useFirestoreCollection("admins");
  // Fetch Admin Name from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminsData.length > 0) {
        const matchedAdmin = (adminsData as Admin[]).find(
          (admin) => admin.email === user.email
        );
        if (matchedAdmin) {
          setCreator({
            uid: user.uid,
            name: `${matchedAdmin.firstName} ${matchedAdmin.lastName}`,
            email: user.email,
          });
        }
      }
    });
    return () => unsubscribe();
  }, [adminsData]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminsData.length > 0) {
        const matchedAdmin = (adminsData as Admin[]).find(
          (admin) => admin.email === user.email
        );
        if (matchedAdmin) {
          setAdminName(`${matchedAdmin.firstName} ${matchedAdmin.lastName}`);
        }
      }
    });
    return () => unsubscribe();
  }, [adminsData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setMainImage(e.target.files[0]);
  };

  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4); // Limit to 4
    setDetailImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainImage) {
      toast.error("Main image is required!");
      return;
    }

    if (!creator.uid) {
      toast.error("Creator information missing");
      return;
    }

    setUploading(true);

    try {
      // 1. Generate numeric ID
      let numericId;
      try {
        numericId = await runTransaction(db, async (transaction) => {
          const counterRef = doc(db, "meta", "listingCounter");
          const snapshot = await transaction.get(counterRef);
          const current = snapshot.data()?.maxNumericId || 0;
          const next = current + 1;
          transaction.update(counterRef, { maxNumericId: next });
          return next;
        });
      } catch (err) {
        console.error("Transaction error:", err);
        throw new Error("Failed to generate listing ID");
      }

      // 2. Upload images
      const imageUrls: string[] = [];

      // Upload main image
      const mainRef = ref(
        storage,
        `listings/${Date.now()}_main_${mainImage.name}`
      );
      await uploadBytes(mainRef, mainImage);
      const mainUrl = await getDownloadURL(mainRef);
      imageUrls.push(mainUrl);

      // Upload detail images
      for (let file of detailImages) {
        const detailRef = ref(
          storage,
          `listings/${Date.now()}_detail_${file.name}`
        );
        await uploadBytes(detailRef, file);
        const url = await getDownloadURL(detailRef);
        imageUrls.push(url);
      }

      // 3. Create listing document
      const listingData = {
        ...formData,
        createdBy: creator,
        numericId,
        images: imageUrls,
        createdAt: Timestamp.now(),
        views: 0,
        amenities: selectedFeatures,
        price: Number(formData.price), // Ensure numbers
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
      };

      const docRef = await addDoc(collection(db, "listings"), listingData);

      toast.success("Listing created successfully!", {
        duration: 1000,
        onAutoClose() {
          window.scroll(0, 0);
        },
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        overview: "",
        price: 0,
        location: "",
        type: "",
        status: "available",
        for: "Sale",
        area: 0,
        bedrooms: 0,
        bathrooms: 0,
      });
      setMainImage(null);
      setDetailImages([]);
      setSelectedFeatures([]);
    } catch (err) {
      console.error("Error creating listing:", err);
      toast.error(`Failed to create listing: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pb-10 pt-15 dark:bg-slate-800">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-blue-800 mb-4">
            Create New Listing
          </h2>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/listings")}
            className="mb-5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputStyle}
          />
          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
            className={inputStyle}
          />
          <div>
            <label
              htmlFor="price"
              className="block mb-1 text-sm font-semibold text-blue-700"
            >
              Price (ETB)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>
          <input
            name="type"
            placeholder="Property Type"
            value={formData.type}
            onChange={handleChange}
            required
            className={inputStyle}
          />
          <div>
            <label
              htmlFor="bedrooms"
              className="block mb-1 text-sm font-semibold text-blue-700"
            >
              Bedrooms
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor="area"
              className="block mb-1 text-sm font-semibold text-blue-700"
            >
              Area (m²)
            </label>
            <input
              id="area"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label
              htmlFor="bathrooms"
              className="block mb-1 text-sm font-semibold text-blue-700"
            >
              Bathrooms
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputStyle}
          >
            <option className="bg-white dark:bg-slate-900" value="available">
              Available
            </option>
            <option className="bg-white dark:bg-slate-900" value="sold">
              Sold
            </option>
            <option className="bg-white dark:bg-slate-900" value="pending">
              Pending
            </option>
          </select>
          <select
            name="for"
            value={formData.for}
            onChange={handleChange}
            className={inputStyle}
          >
            <option className="bg-white dark:bg-slate-900" value="Sale">
              Sale
            </option>
            <option className="bg-white dark:bg-slate-900" value="Rent">
              Rent
            </option>
          </select>
        </div>

        <textarea
          name="description"
          rows={2}
          placeholder="Short Description"
          value={formData.description}
          onChange={handleChange}
          className={inputStyle}
        />

        <textarea
          name="overview"
          rows={3}
          placeholder="Overview"
          value={formData.overview}
          onChange={handleChange}
          className={inputStyle}
        />
        {/* Features Section */}
        {/* Features Section */}
        <div className="p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">Property Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {featureOptions.map((feature) => (
              <div
                key={feature}
                className="flex items-center space-x-2 border rounded p-1"
              >
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor={`feature-${feature}`} className="text-sm">
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>
        {/* Main Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Main Image <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className="mb-4"
          />
          {mainImage && (
            <Image
              src={URL.createObjectURL(mainImage)}
              alt="Main Preview"
              className="rounded w-32 h-32 object-cover border"
              width={128}
              height={128}
            />
          )}
        </div>

        {/* Detail Images Upload */}
        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Detail Images (up to 4)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleDetailImagesChange}
            className="mb-4"
          />
          <div className="flex gap-3 flex-wrap">
            {detailImages.map((img, i) => (
              <div key={i} className="w-20 h-20 overflow-hidden rounded border">
                <Image
                  src={URL.createObjectURL(img)}
                  alt={`Detail ${i + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Submit Listing"}
        </Button>
        <div className="sm:flex justify-between items-center hidden">
          <p className="text-gray-500 font-semibold text-sm">
            creating as:{" "}
            <span className="text-blue-500 px-3 py-1 border border-blue-500 bg-blue-50 dark:bg-blue-100 rounded-full">
              {adminName}
            </span>
          </p>
          <p className="">
            Role:{" "}
            <span className="font-semibold text-sm capitalize text-red-500 px-2 py-1 border border-red-100 rounded-full bg-red-50 dark:bg-red-100">
              {role}
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

const inputStyle = `
  w-full border border-gray-200 p-2 rounded-md
  focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm
`;
