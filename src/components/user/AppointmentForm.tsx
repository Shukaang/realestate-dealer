"use client";

import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
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
  numericId: number; // Changed to string to match the appointments page
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !phone || !scheduledDate) {
      toast.error("Please fill in all required fields.");
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

      // 2. Create new appointment with unique numericId
      await addDoc(collection(db, "appointments"), {
        name,
        email,
        phone,
        message,
        listingTitle,
        listingImage,
        listingNumericId: numericId, // This is the ID from the listing
        numericId: currentCount.toString(), // Convert to string to match type
        createdAt: serverTimestamp(),
        scheduledDate: new Date(scheduledDate),
        status: "pending",
        viewed: false,
      });

      // 3. Increment appointment counter
      await updateDoc(counterRef, { count: currentCount + 1 });

      toast.success("Appointment booked successfully!");

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setScheduledDate("");
      setMessage("");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4 border">
      <h4 className="text-lg font-semibold">Schedule a Visit</h4>
      <input
        type="text"
        placeholder="Full Name"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
        required
      />
      <textarea
        rows={3}
        placeholder="Optional Message"
        className="w-full border px-3 py-2 rounded-md text-sm"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>

      <Button
        onClick={handleSubmit}
        className="w-full bg-blue-700 hover:bg-blue-800"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </div>
  );
}
