import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "userMessages"), {
        ...formData,
        createdAt: Timestamp.now(),
        viewed: false,
      });
      toast.success("Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* form inputs go here with name and value set */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          type="text"
          placeholder="First Name"
          className="border border-gray-200 px-4 py-2 rounded-md text-sm w-full"
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          type="text"
          placeholder="Last Name"
          className="border border-gray-200 px-4 py-2 rounded-md text-sm w-full"
        />
      </div>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        type="email"
        placeholder="Email Address"
        className="border border-gray-200 px-4 py-2 rounded-md text-sm w-full"
      />
      <input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        type="tel"
        placeholder="Phone Number"
        className="border border-gray-200 px-4 py-2 rounded-md text-sm w-full"
      />
      <select
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        className="border px-4 py-2 rounded-md text-sm w-full"
      >
        <option value="">Select Subject</option>
        <option value="General Inquiry">General Inquiry</option>
        <option value="Property Information">Property Information</option>
        <option value="Buying a Property">Buying a Property</option>
        <option value="Selling a Property">Selling a Property</option>
      </select>
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        rows={5}
        placeholder="Message"
        className="border px-4 py-2 rounded-md text-sm w-full"
      ></textarea>
      <button
        type="submit"
        className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
      >
        Send Message
      </button>
    </form>
  );
}
