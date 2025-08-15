"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

export default function ListingForm({ initialData }: { initialData: any }) {
  const router = useRouter();
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

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [replacedImages, setReplacedImages] = useState<{
    [index: number]: File | null;
  }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Utility function to delete images from storage
  const deleteFromStorageByUrl = async (url: string) => {
    try {
      // Extract the path from the download URL
      const decodedUrl = decodeURIComponent(url.split("?")[0]);
      const path = decodedUrl.split("/o/")[1];
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
    } catch (err) {
      console.warn("Failed to delete old image:", err);
    }
  };

  // Utility function to upload new images
  const uploadNewImage = async (file: File): Promise<string> => {
    const path = `listings/${Date.now()}_${file.name}`;
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        overview: initialData.overview || "",
        price: Number(initialData.price) || 0,
        location: initialData.location || "",
        type: initialData.type || "",
        status: initialData.status || "available",
        for: initialData.for || "Sale",
        area: Number(initialData.area) || 0,
        bedrooms: Number(initialData.bedrooms) || 0,
        bathrooms: Number(initialData.bathrooms) || 0,
      });

      setExistingImages(initialData.images || []);
      setSelectedFeatures(initialData.amenities || []);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "area", "bedrooms", "bathrooms"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleReplaceImage = (index: number, file: File) => {
    setReplacedImages((prev) => ({ ...prev, [index]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.docId) return toast.error("Missing document ID");
    setIsUpdating(true);

    try {
      // Handle image updates
      const updatedImages = [...existingImages];
      for (const index in replacedImages) {
        const idx = parseInt(index);
        const file = replacedImages[idx];
        if (!file) continue;

        if (existingImages[idx]) {
          await deleteFromStorageByUrl(existingImages[idx]);
        }

        const newUrl = await uploadNewImage(file);
        updatedImages[idx] = newUrl;
      }
      // Prepare update data
      const updateData: any = {
        ...formData,
        images: updatedImages,
        amenities: selectedFeatures,
        updatedAt: Timestamp.now(),
      };

      // Handle soldDate based on status
      if (formData.status === "sold") {
        updateData.soldDate = Timestamp.now();
      } else {
        updateData.soldDate = null;
      }

      // Update document
      const refDoc = doc(db, "listings", initialData.docId);
      await updateDoc(refDoc, updateData);
      toast.success("Listing updated successfully!", {
        duration: 1500,
        onAutoClose: () => {
          window.scrollTo(0, 0);
          router.push("/admin/listings");
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update listing!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
        Edit Listing
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          "title",
          "location",
          "price",
          "type",
          "bedrooms",
          "area",
          "bathrooms",
        ].map((field) => {
          const isNumber = ["price", "area", "bedrooms", "bathrooms"].includes(
            field
          );
          const label = field[0].toUpperCase() + field.slice(1);

          return (
            <div key={field} className="space-y-1">
              <label
                htmlFor={field}
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                {label}
              </label>
              <input
                id={field}
                name={field}
                type={isNumber ? "number" : "text"}
                value={(formData as any)[field]}
                onChange={handleInputChange}
                placeholder={label}
                className={inputStyle}
                required
              />
            </div>
          );
        })}

        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className={inputStyle}
        >
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="pending">Pending</option>
        </select>
        <select
          name="for"
          value={formData.for}
          onChange={handleInputChange}
          className={inputStyle}
        >
          <option value="Sale">Sale</option>
          <option value="Rent">Rent</option>
        </select>
      </div>
      <textarea
        name="description"
        rows={2}
        value={formData.description}
        onChange={handleInputChange}
        placeholder="Short Description"
        className={inputStyle}
      />
      <textarea
        name="overview"
        rows={3}
        value={formData.overview}
        onChange={handleInputChange}
        placeholder="Overview"
        className={inputStyle}
      />

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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Images
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {existingImages.map((url, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border"
            >
              <img
                src={
                  replacedImages[index]
                    ? URL.createObjectURL(replacedImages[index]!)
                    : url
                }
                alt={`Image ${index + 1}`}
                className="w-20 h-20 object-cover rounded border"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Replace Image {index + 1}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      handleReplaceImage(index, e.target.files[0]);
                  }}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isUpdating}>
        {isUpdating ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}

const inputStyle = `
  w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md
  bg-white dark:bg-gray-800 text-black dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500
`;
