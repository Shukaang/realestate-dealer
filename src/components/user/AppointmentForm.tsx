"use client";

import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

interface AppointmentFormProps {
  listingTitle: string;
  numericId: number;
  listingImage: string;
}

export default function AppointmentForm({
  listingTitle,
  numericId,
  listingImage,
}: AppointmentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !phone || !scheduledDate || !scheduledTime) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Validate date is not in the past
    const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();
    if (selectedDateTime <= now) {
      toast.error("Please select a future date and time.");
      return;
    }

    setLoading(true);

    try {
      // 1. Get current counter for appointments
      const counterRef = doc(db, "meta", "appointmentsCounter");
      const counterSnap = await getDoc(counterRef);
      const currentCount = counterSnap.exists()
        ? counterSnap.data().count || 1
        : 1;

      // 2. Create the scheduled date properly
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      // 3. Create new appointment with unique numericId
      await addDoc(collection(db, "appointments"), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone,
        message: message.trim(),
        listingTitle,
        listingImage,
        listingNumericId: numericId,
        numericId: currentCount.toString(),
        createdAt: serverTimestamp(),
        scheduledDate: scheduledDateTime,
        status: "pending",
        viewed: false,
      });

      // 4. Increment appointment counter
      await updateDoc(counterRef, { count: currentCount + 1 });

      toast.success("Appointment booked successfully!");

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setScheduledDate("");
      setScheduledTime("");
      setMessage("");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4 border">
      <h4 className="text-lg font-semibold">Schedule a Visit</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter your full name"
          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          placeholder="Enter your phone number"
          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          min={today}
          required
          style={{
            colorScheme: "light",
          }}
          onFocus={(e) => {
            if (!e.target.value) {
              e.target.setAttribute("placeholder", "Select a Date");
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Time <span className="text-red-500">*</span>
        </label>

        <input
          type="time"
          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          required
          style={{
            colorScheme: "light",
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="Any additional information or special requests..."
          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </Button>

      <div className="text-xs text-gray-500 mt-2">
        <p>
          <span className="text-red-500">*</span> Required fields
        </p>
        <p>We'll contact you within 24 hours to confirm your appointment.</p>
      </div>
    </div>
  );
}
