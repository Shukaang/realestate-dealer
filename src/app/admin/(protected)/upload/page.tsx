"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useFirestoreCollection } from "@/lib/useFirestoreDoc";
import {
  collection,
  addDoc,
  runTransaction,
  doc,
  Timestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function CreateListing() {
  interface Admin {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }

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

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [adminName, setAdminName] = useState("");

  const auth = getAuth();

  const { data: adminsData = [] } = useFirestoreCollection("admins");
  // Fetch Admin Name from Firestore
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
    if (!mainImage) return toast.error("Main image is required!");
    setUploading(true);

    try {
      const numericId = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "meta", "listingCounter");
        const snapshot = await transaction.get(counterRef);
        const current = snapshot.data()?.maxNumericId || 0;
        const next = current + 1;
        transaction.update(counterRef, { maxNumericId: next });
        return next;
      });

      const imageUrls: string[] = [];
      const mainRef = ref(
        storage,
        `listings/${Date.now()}_main_${mainImage.name}`
      );
      await uploadBytes(mainRef, mainImage);
      const mainUrl = await getDownloadURL(mainRef);
      imageUrls.push(mainUrl);

      for (let file of detailImages) {
        const detailRef = ref(
          storage,
          `listings/${Date.now()}_detail_${file.name}`
        );
        await uploadBytes(detailRef, file);
        const url = await getDownloadURL(detailRef);
        imageUrls.push(url);
      }

      await addDoc(collection(db, "listings"), {
        ...formData,
        createdBy: adminName,
        numericId,
        images: imageUrls,
        createdAt: Timestamp.now(),
        views: 0,
      });

      toast.success("Listing created successfully!", {
        duration: 1500,
        onAutoClose: () => {
          window.scrollTo(0, 0);
        },
      });
      setFormData({
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
      setMainImage(null);
      setDetailImages([]);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }

    setUploading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow space-y-6"
    >
      <h2 className="text-3xl font-bold text-blue-800 mb-4">
        Create New Listing
      </h2>

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
          <option value="available">Available</option>
          <option value="sold">Sold</option>
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
        className="w-full bg-blue-700 hover:bg-blue-800"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Submit Listing"}
      </Button>
    </form>
  );
}

const inputStyle = `
  w-full border border-gray-300 p-2 rounded-md
  focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm
`;
