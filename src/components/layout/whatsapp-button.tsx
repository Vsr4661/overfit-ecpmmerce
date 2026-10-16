import { MessageCircle } from "lucide-react";

/** Floating support link. Renders nothing unless WHATSAPP_NUMBER is set (digits with country code, e.g. 919876543210). */
export function WhatsAppButton() {
  const number = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!number) return null;
  const href = `https://wa.me/${number}?text=${encodeURIComponent("Hi Overfit, I have a question")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
