"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";

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
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [replacedImages, setReplacedImages] = useState<{
    [index: number]: File | null;
  }>({});
  const [isUpdating, setIsUpdating] = useState(false);

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
        area: Number(initialData.area) || 0,
        bedrooms: Number(initialData.bedrooms) || 0,
        bathrooms: Number(initialData.bathrooms) || 0,
      });

      setExistingImages(initialData.images || []);
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

  const deleteFromStorageByUrl = async (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url.split("?")[0]);
      const path = decodedUrl.split("/o/")[1];
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
    } catch (err) {
      console.warn("Failed to delete old image:", err);
    }
  };

  const uploadNewImage = async (file: File): Promise<string> => {
    const path = `listings/${Date.now()}_${file.name}`;
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.docId) return toast.error("Missing document ID");
    setIsUpdating(true);

    try {
      const updatedImages = [...existingImages];
      for (const index in replacedImages) {
        const idx = parseInt(index);
        const file = replacedImages[idx];
        if (!file) continue;

        if (existingImages[idx])
          await deleteFromStorageByUrl(existingImages[idx]);

        const newUrl = await uploadNewImage(file);
        updatedImages[idx] = newUrl;
      }

      const refDoc = doc(db, "listings", initialData.docId);
      await updateDoc(refDoc, {
        ...formData,
        images: updatedImages,
        updatedAt: new Date(),
      });

      toast.success("Listing updated successfully!", {
        duration: 1500,
        onAutoClose: () => {
          router.push("/admin/listings");
          window.scrollTo(0, 0);
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update listing!");
    }

    setIsUpdating(false);
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

      <button
        type="submit"
        className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        disabled={isUpdating}
      >
        {isUpdating ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

const inputStyle = `
  w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md
  bg-white dark:bg-gray-800 text-black dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500
`;
