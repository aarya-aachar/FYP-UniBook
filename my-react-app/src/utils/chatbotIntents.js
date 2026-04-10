/**
 * Intent-Based NLP Mapping for UniBook AI Assistant
 * This file contains the keyword clusters and their respective intelligent responses.
 */

export const CHATBOT_INTENTS = [
  {
    name: "Booking Intent",
    keywords: ["book", "reserve", "appointment", "schedule", "new", "time", "date", "service", "provider"],
    response: "To book a service, browse your matching category, select a provider, pick an available time slot, and proceed to checkout."
  },
  {
    name: "Payment Intent",
    keywords: ["payment", "pay", "esewa", "khalti", "price", "cost", "money", "transaction", "amount"],
    response: "Currently, we support secure digital payments exclusively via eSewa. You can complete your payment securely during the checkout process."
  },
  {
    name: "Cancellation Intent",
    keywords: ["cancel", "delete", "remove", "stop", "change", "reschedule", "modify"],
    response: "There is no direct cancellation or rescheduling policy in the system. Please contact the UniBook Administration via our support chat to request manual changes to your bookings."
  },
  {
    name: "Contact Intent",
    keywords: ["contact", "support", "help", "admin", "chat", "message", "assistance"],
    response: "You can reach out to our team at any time through the 'Contact Support' button in your navigation menu or by messaging an administrator directly via the chat feature."
  },
  {
    name: "Profile Intent",
    keywords: ["profile", "settings", "account", "update", "edit", "name", "email", "password", "photo"],
    response: "You can update your personal information, change your password, or upload a new profile picture in the 'Profile Settings' section."
  },
  {
    name: "Services Intent",
    keywords: ["categories", "restaurants", "futsal", "hospitals", "salon", "spa", "gym"],
    response: "We offer a wide range of services across categories like Restaurants, Futsal, Hospitals, and Salons. Explore the 'Browse Categories' section on your dashboard to see all available options."
  },
  {
    name: "Greetings",
    keywords: ["hi", "hello", "hey", "greet", "assistant", "ai"],
    response: "Hello! I am your UniBook AI Assistant. How can I help you navigate the platform today?"
  }
];

export const DEFAULT_RESPONSE = "I'm not exactly sure how to answer that. Try asking about 'how to book', 'payment methods', or 'how to contact support'.";
