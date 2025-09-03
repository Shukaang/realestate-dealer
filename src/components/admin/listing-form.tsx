"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { toast } from "sonner";

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

// File validation utility
const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "Please select a valid image file" };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: "Image size should be less than 10MB" };
  }

  // Check if file is readable
  if (file.size === 0) {
    return { isValid: false, error: "File appears to be empty or corrupted" };
  }

  return { isValid: true };
};

// Create a safe preview URL with validation
const createSafePreviewUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsDataURL(file);
  });
};

interface ImagePreviewProps {
  file?: File;
  url?: string;
  alt: string;
  className?: string;
  onRemove?: () => void;
}

function ImagePreview({
  file,
  url,
  alt,
  className = "",
  onRemove,
}: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.error || "Invalid file");
        setLoading(false);
        return;
      }

      createSafePreviewUrl(file)
        .then(setPreviewUrl)
        .catch((err) => {
          console.error("Preview error:", err);
          setError("Unable to preview image");
        })
        .finally(() => setLoading(false));

      return () => {
        if (previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    } else if (url) {
      setPreviewUrl(url);
      setLoading(false);
    }
  }, [file, url]);

  if (loading) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border-2 border-dashed border-red-200 rounded-lg flex flex-col items-center justify-center p-4 ${className}`}
      >
        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-xs text-red-600 text-center">{error}</p>
        {onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="mt-2 bg-transparent"
          >
            Remove
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative group rounded-lg overflow-hidden ${className}`}>
      <Image
        src={previewUrl || "/placeholder.svg"}
        alt={alt}
        width={128}
        height={128}
        className="w-full h-full object-cover"
        onError={() => setError("Failed to load image")}
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

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
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  // Utility function to delete images from storage
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

  const uploadNewImage = async (
    file: File,
    progressKey: string
  ): Promise<string> => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return new Promise((resolve, reject) => {
      try {
        console.log(
          "[v0] Starting upload for:",
          file.name,
          "Progress key:",
          progressKey
        );
        setUploadProgress((prev) => ({ ...prev, [progressKey]: 0 }));

        const path = `listings/${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}_${file.name}`;
        const imageRef = ref(storage, path);

        console.log("[v0] Upload path:", path);
        const uploadTask = uploadBytesResumable(imageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Calculate upload progress
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("[v0] Upload progress:", Math.round(progress), "%");
            setUploadProgress((prev) => ({
              ...prev,
              [progressKey]: Math.round(progress),
            }));
          },
          (error) => {
            console.error("[v0] Upload error:", error);
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[progressKey];
              return newProgress;
            });

            if (error.code === "storage/retry-limit-exceeded") {
              reject(
                new Error(
                  "Upload failed. Please check your internet connection and try again."
                )
              );
            } else if (error.code === "storage/canceled") {
              reject(new Error("Upload was canceled"));
            } else {
              reject(new Error(`Upload failed: ${error.message}`));
            }
          },
          async () => {
            try {
              console.log("[v0] Upload completed, getting download URL");
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("[v0] Download URL obtained:", downloadURL);

              setUploadProgress((prev) => ({ ...prev, [progressKey]: 100 }));

              // Clean up progress after a short delay
              setTimeout(() => {
                setUploadProgress((prev) => {
                  const newProgress = { ...prev };
                  delete newProgress[progressKey];
                  return newProgress;
                });
              }, 1000);

              resolve(downloadURL);
            } catch (error) {
              console.error("[v0] Error getting download URL:", error);
              reject(error);
            }
          }
        );
      } catch (error) {
        console.error("[v0] Error starting upload:", error);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[progressKey];
          return newProgress;
        });
        reject(error);
      }
    });
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

  const handleReplaceImage = async (index: number, file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setReplacedImages((prev) => ({ ...prev, [index]: file }));
    toast.success("Image selected for replacement");
  };

  const handleRemoveReplacement = (index: number) => {
    setReplacedImages((prev) => {
      const newReplacements = { ...prev };
      delete newReplacements[index];
      return newReplacements;
    });

    // Reset the file input
    const fileInput = document.getElementById(
      `image-${index}`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.docId) return toast.error("Missing document ID");

    const replacementCount = Object.keys(replacedImages).length;
    if (replacementCount === 0) {
      toast.error("No changes to save");
      return;
    }

    setIsUpdating(true);

    try {
      // Handle image updates with progress tracking
      const updatedImages = [...existingImages];
      const uploadPromises = [];

      for (const index in replacedImages) {
        const idx = Number.parseInt(index);
        const file = replacedImages[idx];
        if (!file) continue;

        const progressKey = `replace-${idx}`;
        uploadPromises.push(
          (async () => {
            try {
              // Delete old image if it exists
              if (existingImages[idx]) {
                await deleteFromStorageByUrl(existingImages[idx]);
              }

              // Upload new image
              const newUrl = await uploadNewImage(file, progressKey);
              updatedImages[idx] = newUrl;

              toast.success(`Image ${idx + 1} uploaded successfully`);
            } catch (error) {
              console.error(`Failed to upload image ${idx + 1}:`, error);
              toast.error(
                `Failed to upload image ${idx + 1}: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
              throw error;
            }
          })()
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

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
      console.error("Update error:", err);
      toast.error(
        `Failed to update listing: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
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
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Property Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {featureOptions.map((feature) => (
              <div
                key={feature}
                className="flex items-center space-x-2 border rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`feature-${feature}`}
                  className="text-sm cursor-pointer"
                >
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Images
          </h3>
          <div className="grid gap-6">
            {existingImages.map((url, index) => {
              const isReplaced = replacedImages[index];
              const progressKey = `replace-${index}`;
              const progress = uploadProgress[progressKey];

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border"
                >
                  {/* Image Preview */}
                  <div className="relative">
                    <ImagePreview
                      file={isReplaced || undefined}
                      url={!isReplaced ? url : undefined}
                      alt={`Image ${index + 1}`}
                      className="w-24 h-24 sm:w-32 sm:h-32"
                      onRemove={
                        isReplaced
                          ? () => handleRemoveReplacement(index)
                          : undefined
                      }
                    />

                    {/* Upload Progress Overlay */}
                    {progress !== undefined && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-xs font-medium">
                          {progress}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Replace Image {index + 1}
                      </label>
                      {isReplaced && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Ready to upload
                        </span>
                      )}
                    </div>

                    <input
                      id={`image-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        console.log(
                          "[v0] File input triggered on mobile",
                          e.target.files
                        );
                        if (e.target.files?.[0]) {
                          console.log(
                            "[v0] File selected:",
                            e.target.files[0].name,
                            e.target.files[0].size
                          );
                          handleReplaceImage(index, e.target.files[0]);
                        }
                      }}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    {/* File Info */}
                    {isReplaced && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>File: {isReplaced.name}</p>
                        <p>
                          Size: {(isReplaced.size / 1024 / 1024).toFixed(2)}MB
                        </p>
                        <p>Type: {isReplaced.type}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        disabled={isUpdating || Object.keys(replacedImages).length === 0}
      >
        {isUpdating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Saving Changes...
          </div>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}

const inputStyle = `
  w-full border border-gray-300 dark:border-gray-600 p-3 rounded-md
  bg-white dark:bg-gray-800 text-black dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  transition-colors
`;
