"use server";

import { prisma } from "@/lib/prisma";
import { buildWaLink } from "@/lib/wa";
import type { ListingType } from "@prisma/client";

export type SubmitResult = { ok: true; waLink: string } | { ok: false; error: string };

export async function submitInquiry(slug: string, formData: FormData): Promise<SubmitResult> {
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) {
    return { ok: false, error: "This page doesn't exist." };
  }

  const guestName = String(formData.get("guestName") ?? "").trim();
  if (!guestName) {
    return { ok: false, error: "Name is required." };
  }

  const listingTypeRaw = formData.get("listingType");
  const listingType: ListingType | null =
    listingTypeRaw === "RENT" || listingTypeRaw === "BUY" ? listingTypeRaw : null;

  const inquiry = await prisma.inquiry.create({
    data: {
      businessId: business.id,
      guestName,
      location: emptyToNull(formData.get("location")),
      guests: toInt(formData.get("guests")),
      bedrooms: toInt(formData.get("bedrooms")),
      listingType,
      checkIn: toDate(formData.get("checkIn")),
      checkOut: toDate(formData.get("checkOut")),
      budget: emptyToNull(formData.get("budget")),
      note: emptyToNull(formData.get("note")),
    },
  });

  const waLink = buildWaLink(business.whatsapp, inquiry);

  return { ok: true, waLink };
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function toInt(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function toDate(v: FormDataEntryValue | null): Date | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
