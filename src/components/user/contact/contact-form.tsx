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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, email, phone, subject } = formData;

    if (!firstName || !(phone || email) || !subject) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            type="text"
            placeholder="First Name"
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            type="text"
            placeholder="Last Name"
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          placeholder="Email Address"
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          type="tel"
          placeholder="Phone Number"
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        >
          <option value="">Select Subject</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Property Information">Property Information</option>
          <option value="Buying a Property">Buying a Property</option>
          <option value="Selling a Property">Selling a Property</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Message (Optional)
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          placeholder="Your message..."
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
