// /admin/(protected)/upload/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  ImageIcon,
} from "lucide-react";
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

// Supported image types and maximum file size (5MB)
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

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
  const mainInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

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
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [creator, setCreator] = useState({
    uid: "",
    name: "",
    email: "",
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const auth = getAuth();

  const addDebugInfo = (message: string) => {
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

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
            email: user.email || "",
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

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview);
      }
      detailImagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [mainImagePreview, detailImagePreviews]);

  // Validate image file
  const validateImageFile = (
    file: File
  ): { valid: boolean; error?: string } => {
    // Check file type
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type: ${
          file.type
        }. Supported types: ${SUPPORTED_IMAGE_TYPES.join(", ")}`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB. Maximum size is 5MB.`,
      };
    }

    return { valid: true };
  };

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

    const file = e.target.files[0];

    // Validate the image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      addDebugInfo(`Main image rejected: ${validation.error}`);
      if (mainInputRef.current) mainInputRef.current.value = "";
      return;
    }

    setMainImage(file);

    // Create and set preview URL
    const previewUrl = URL.createObjectURL(file);
    setMainImagePreview(previewUrl);

    addDebugInfo(
      `Main image selected: ${file.name} (${(file.size / 1024).toFixed(
        0
      )} KB, ${file.type})`
    );
  };

  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];

    // Validate each file
    files.forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
        addDebugInfo(
          `Detail image selected: ${file.name} (${(file.size / 1024).toFixed(
            0
          )} KB, ${file.type})`
        );
      } else {
        toast.error(`Invalid image: ${file.name} - ${validation.error}`);
        addDebugInfo(
          `Detail image rejected: ${file.name} - ${validation.error}`
        );
      }
    });

    // Limit to 4 files
    const limitedFiles = validFiles.slice(0, 4);
    setDetailImages(limitedFiles);

    // Create preview URLs
    const previewUrls = limitedFiles.map((file) => URL.createObjectURL(file));
    setDetailImagePreviews(previewUrls);
  };

  const removeDetailImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(detailImagePreviews[index]);

    const removedFile = detailImages[index];
    addDebugInfo(`Removed detail image: ${removedFile.name}`);

    setDetailImages((prev) => prev.filter((_, i) => i !== index));
    setDetailImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    if (mainImage) {
      addDebugInfo(`Removed main image: ${mainImage.name}`);
    }

    setMainImage(null);
    setMainImagePreview("");
    if (mainInputRef.current) {
      mainInputRef.current.value = "";
    }
  };

  const triggerMainInput = () => {
    if (mainInputRef.current) {
      mainInputRef.current.click();
    }
  };

  const triggerDetailInput = () => {
    if (detailInputRef.current) {
      detailInputRef.current.click();
    }
  };

  const uploadFile = async (
    file: File,
    isMain: boolean = false
  ): Promise<string> => {
    const fileName = `${Date.now()}_${
      isMain ? "main" : "detail"
    }_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const fileRef = ref(storage, `listings/${fileName}`);

    // Add to progress tracking
    setUploadProgress((prev) => [
      ...prev,
      {
        fileName: file.name,
        progress: 0,
        status: "uploading",
      },
    ]);

    addDebugInfo(`Starting upload for: ${file.name}`);
    addDebugInfo(`Storage path: listings/${fileName}`);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Update progress
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) =>
            prev.map((item) =>
              item.fileName === file.name
                ? { ...item, progress, status: "uploading" }
                : item
            )
          );

          if (progress % 25 === 0) {
            // Log every 25% to avoid spam
            addDebugInfo(`Uploading ${file.name}: ${progress.toFixed(0)}%`);
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          const errorMsg = error.message || "Unknown upload error";
          setUploadProgress((prev) =>
            prev.map((item) =>
              item.fileName === file.name
                ? { ...item, status: "error", error: errorMsg }
                : item
            )
          );

          addDebugInfo(`Upload failed for ${file.name}: ${errorMsg}`);
          addDebugInfo(`Error code: ${error.code}`);
          reject(error);
        },
        async () => {
          // Handle successful uploads
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress((prev) =>
              prev.map((item) =>
                item.fileName === file.name
                  ? { ...item, progress: 100, status: "completed" }
                  : item
              )
            );

            addDebugInfo(`Upload completed for ${file.name}`);
            addDebugInfo(`File available at: ${downloadURL}`);

            resolve(downloadURL);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            setUploadProgress((prev) =>
              prev.map((item) =>
                item.fileName === file.name
                  ? { ...item, status: "error", error: errorMessage }
                  : item
              )
            );

            addDebugInfo(
              `Failed to get download URL for ${file.name}: ${errorMessage}`
            );
            reject(error);
          }
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous debug info
    setDebugInfo([]);
    setUploadProgress([]);

    addDebugInfo("Starting form submission...");
    addDebugInfo(`Supported image types: ${SUPPORTED_IMAGE_TYPES.join(", ")}`);
    addDebugInfo(
      `Max file size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
    );

    if (!mainImage) {
      const errorMsg = "Main image is required!";
      addDebugInfo(`ERROR: ${errorMsg}`);
      toast.error(errorMsg);
      return;
    }

    if (!creator.uid) {
      const errorMsg = "Creator information missing";
      addDebugInfo(`ERROR: ${errorMsg}`);
      toast.error(errorMsg);
      return;
    }

    setUploading(true);
    addDebugInfo("Upload process started");

    try {
      // 1. Generate numeric ID
      addDebugInfo("Generating numeric ID...");
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
        addDebugInfo(`Generated numeric ID: ${numericId}`);
      } catch (err) {
        const errorMsg = "Failed to generate listing ID";
        addDebugInfo(
          `ERROR: ${errorMsg} - ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        throw new Error(errorMsg);
      }

      // 2. Upload images - DETAIL IMAGES FIRST
      const imageUrls: string[] = [];

      // Upload detail images first (to test if main image is the issue)
      if (detailImages.length > 0) {
        addDebugInfo(`Uploading ${detailImages.length} detail images first...`);
        for (let i = 0; i < detailImages.length; i++) {
          const file = detailImages[i];
          try {
            addDebugInfo(
              `Starting upload for detail image ${i + 1}: ${file.name}`
            );
            const url = await uploadFile(file);
            imageUrls.push(url);
            addDebugInfo(`Detail image ${i + 1} uploaded successfully`);
          } catch (error) {
            const errorMsg = `Failed to upload detail image ${i + 1}`;
            const errorDetails =
              error instanceof Error ? error.message : "Unknown error";
            addDebugInfo(`ERROR: ${errorMsg} - ${errorDetails}`);
            toast.error(`Failed to upload ${file.name}`);
            // Continue with other images even if one fails
          }
        }
      } else {
        addDebugInfo("No detail images to upload");
      }

      // Upload main image AFTER detail images
      if (mainImage) {
        addDebugInfo("Uploading main image after detail images...");
        addDebugInfo(
          `Main image info: ${mainImage.name}, ${mainImage.type}, ${mainImage.size} bytes`
        );
        try {
          const mainUrl = await uploadFile(mainImage, true);
          imageUrls.unshift(mainUrl); // Add to beginning of array
          addDebugInfo("Main image uploaded successfully");
        } catch (error) {
          const errorMsg = "Failed to upload main image";
          const errorDetails =
            error instanceof Error ? error.message : "Unknown error";
          addDebugInfo(`ERROR: ${errorMsg} - ${errorDetails}`);
          toast.error(`Failed to upload main image: ${errorDetails}`);
          throw new Error(errorMsg);
        }
      }

      addDebugInfo(`All images uploaded. Total URLs: ${imageUrls.length}`);

      // 3. Create listing document only if we have at least the main image
      if (imageUrls.length > 0) {
        addDebugInfo("Creating listing document in Firestore...");
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

        await addDoc(collection(db, "listings"), listingData);
        addDebugInfo("Listing document created successfully");

        toast.success("Listing created successfully!", {
          duration: 1000,
          onAutoClose: () => {
            router.push("/admin/listings");
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

        // Clean up preview URLs
        if (mainImagePreview) {
          URL.revokeObjectURL(mainImagePreview);
        }
        detailImagePreviews.forEach((preview) => {
          URL.revokeObjectURL(preview);
        });

        setMainImage(null);
        setMainImagePreview("");
        setDetailImages([]);
        setDetailImagePreviews([]);
        setSelectedFeatures([]);

        // Reset file inputs
        if (mainInputRef.current) mainInputRef.current.value = "";
        if (detailInputRef.current) detailInputRef.current.value = "";

        addDebugInfo("Form reset completed");
      } else {
        throw new Error("No images were successfully uploaded");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Unknown error occurred";
      addDebugInfo(`SUBMISSION FAILED: ${errorMsg}`);

      if (err instanceof Error) {
        toast.error(`Failed to create listing: ${err.message}`);
      } else {
        toast.error("Failed to create listing: Unknown error");
      }
    } finally {
      setUploading(false);
      addDebugInfo("Upload process completed");
    }
  };

  const ProgressIndicator = ({ progress }: { progress: UploadProgress }) => {
    return (
      <div className="flex items-center justify-between p-2 border rounded mb-2">
        <div className="flex items-center">
          {progress.status === "completed" && (
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          )}
          {progress.status === "uploading" && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin mr-2" />
          )}
          {progress.status === "error" && (
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
          )}
          <span className="text-sm truncate max-w-[120px]">
            {progress.fileName}
          </span>
        </div>
        <div className="flex items-center">
          {progress.status === "uploading" && (
            <span className="text-xs text-gray-500 mr-2">
              {progress.progress.toFixed(0)}%
            </span>
          )}
          {progress.status === "error" && (
            <span className="text-xs text-red-500">Failed</span>
          )}
          {progress.status === "completed" && (
            <span className="text-xs text-green-500">Done</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-10 pt-15 dark:bg-slate-800 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800">
            Create New Listing
          </h2>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/listings")}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
        </div>

        {/* Debug Panel - Always visible on mobile */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Debug Information
          </h3>
          <div className="mt-2 h-40 overflow-y-auto text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
            {debugInfo.length === 0 ? (
              <p>
                No debug information yet. Submit the form to see upload
                progress.
              </p>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="mb-1">
                  {info}
                </div>
              ))
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                Upload Progress:
              </h4>
              {uploadProgress.map((progress, index) => (
                <ProgressIndicator key={index} progress={progress} />
              ))}
            </div>
          )}
        </div>

        {/* Supported Formats Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Supported Image Formats
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            JPEG, JPG, PNG, WEBP, GIF (Max 5MB each)
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Some image formats or metadata might cause upload issues. If an
            image fails, try converting it to JPEG or PNG.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="p-4 sm:p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">Property Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {featureOptions.map((feature) => (
              <div
                key={feature}
                className="flex items-center space-x-2 border rounded p-2"
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

        {/* Main Image Upload - Mobile Optimized */}
        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Main Image <span className="text-red-500">*</span>
          </label>

          <input
            ref={mainInputRef}
            type="file"
            accept="image/jpeg, image/jpg, image/png, image/webp, image/gif"
            onChange={handleMainImageChange}
            className="hidden"
          />

          <div
            onClick={triggerMainInput}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
          >
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {mainImage ? "Change main image" : "Tap to select main image"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Recommended: Square ratio, high quality
            </p>
          </div>

          {mainImagePreview && (
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={mainImagePreview}
                alt="Main Preview"
                className="rounded object-cover border"
                fill
                sizes="128px"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeMainImage();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Detail Images Upload - Mobile Optimized */}
        <div>
          <label className="block text-sm font-semibold text-blue-700 mb-2">
            Detail Images (up to 4)
          </label>

          <input
            ref={detailInputRef}
            type="file"
            accept="image/jpeg, image/jpg, image/png, image/webp, image/gif"
            multiple
            onChange={handleDetailImagesChange}
            className="hidden"
          />

          <div
            onClick={triggerDetailInput}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
          >
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {detailImages.length > 0
                ? "Add more images"
                : "Tap to select detail images"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Select up to 4 images</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {detailImagePreviews.map((preview, i) => (
              <div
                key={i}
                className="relative w-20 h-20 overflow-hidden rounded border"
              >
                <Image
                  src={preview}
                  alt={`Detail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDetailImage(i);
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg"
          disabled={uploading}
        >
          {uploading ? (
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Uploading...
            </div>
          ) : (
            "Submit Listing"
          )}
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t">
          <p className="text-gray-500 font-semibold text-sm">
            creating as:{" "}
            <span className="text-blue-500 px-3 py-1 border border-blue-500 bg-blue-50 dark:bg-blue-100 rounded-full">
              {adminName}
            </span>
          </p>
          <p className="text-sm">
            Role:{" "}
            <span className="font-semibold capitalize text-red-500 px-2 py-1 border border-red-100 rounded-full bg-red-50 dark:bg-red-100">
              {role}
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

const inputStyle = `
  w-full border border-gray-200 p-3 rounded-md
  focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm
  dark:bg-gray-800 dark:border-gray-700 dark:text-white
`;
