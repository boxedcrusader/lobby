import type { ListingType } from "@prisma/client";

export type InquiryInput = {
  guestName: string;
  location?: string | null;
  guests?: number | null;
  bedrooms?: number | null;
  listingType?: ListingType | null;
  checkIn?: Date | null;
  checkOut?: Date | null;
  budget?: string | null;
  note?: string | null;
};

function fmt(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildWaLink(ownerNumber: string, i: InquiryInput): string {
  const lines = [
    "New booking inquiry from your page:",
    `Name: ${i.guestName}`,
    i.location && `Location: ${i.location}`,
    i.guests && `Guests: ${i.guests}`,
    i.bedrooms && `Bedrooms: ${i.bedrooms}`,
    i.listingType && `Looking to: ${i.listingType}`,
    i.checkIn && `Check-in: ${fmt(i.checkIn)}`,
    i.checkOut && `Check-out: ${fmt(i.checkOut)}`,
    i.budget && `Budget: ${i.budget}`,
    i.note && `Note: ${i.note}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${ownerNumber}?text=${encodeURIComponent(lines)}`;
}
