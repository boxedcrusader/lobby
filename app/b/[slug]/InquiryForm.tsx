"use client";

import { Fragment, useState, useTransition } from "react";
import type { Vertical } from "@prisma/client";
import { submitInquiry } from "./actions";

type SummaryRow = { label: string; value: string };

type Ticket = {
  waLink: string;
  rows: SummaryRow[];
};

export function InquiryForm({
  slug,
  businessName,
  vertical,
}: {
  slug: string;
  businessName: string;
  vertical: Vertical;
}) {
  const [isPending, startTransition] = useTransition();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const rows = buildSummaryRows(formData, vertical);

    startTransition(async () => {
      const result = await submitInquiry(slug, formData);
      if (result.ok) {
        setTicket({ waLink: result.waLink, rows });
      } else {
        setError(result.error);
      }
    });
  }

  if (ticket) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="ticket ticket-reveal relative w-full rounded-3xl border border-line bg-ivory px-6 py-6 shadow-[0_24px_60px_-28px_rgba(27,33,51,0.4)]">
          <div className="absolute right-5 top-5 flex h-11 w-11 rotate-6 items-center justify-center rounded-full border-2 border-glow text-glow">
            <CheckIcon className="h-5 w-5" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moon">
            Reservation ticket
          </p>
          <h2 className="mt-1 max-w-[75%] font-display text-2xl italic text-ink">{businessName}</h2>
          <p className="mt-1 text-sm text-moon">One tap away — send to confirm</p>

          <div className="ticket-perforation -mx-6 my-5 border-t-2 border-dashed border-line" />

          <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 font-mono text-[13px] text-ink">
            {ticket.rows.map((row) => (
              <Fragment key={row.label}>
                <dt className="uppercase tracking-wide text-[11px] text-moon">{row.label}</dt>
                <dd className="break-words">{row.value}</dd>
              </Fragment>
            ))}
          </dl>
        </div>

        <a
          href={ticket.waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1FA855] px-6 py-4 text-center text-lg font-semibold text-white shadow-md transition active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Send on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <Field label="Name" name="guestName" required />

      {vertical === "SHORTLET" ? (
        <>
          <Field label="Preferred location" name="location" />
          <Field label="Number of guests" name="guests" type="number" min={1} />
          <Field label="Check-in date" name="checkIn" type="date" />
          <Field label="Check-out date" name="checkOut" type="date" />
          <Field label="Budget" name="budget" placeholder="e.g. 150k" />
          <TextArea label="Note" name="note" />
        </>
      ) : (
        <>
          <SelectField
            label="Looking to"
            name="listingType"
            options={[
              { value: "RENT", label: "Rent" },
              { value: "BUY", label: "Buy" },
            ]}
          />
          <Field label="Area / location" name="location" />
          <Field label="Bedrooms" name="bedrooms" type="number" min={0} />
          <Field label="Budget" name="budget" placeholder="e.g. 100-200k" />
          <TextArea label="Timeframe / note" name="note" />
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full rounded-2xl bg-dusk px-6 py-4 text-lg font-semibold text-ivory transition active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Review & send"}
      </button>
    </form>
  );
}

function buildSummaryRows(formData: FormData, vertical: Vertical): SummaryRow[] {
  const get = (name: string) => String(formData.get(name) ?? "").trim();
  const rows: SummaryRow[] = [{ label: "Guest", value: get("guestName") }];

  if (vertical === "SHORTLET") {
    if (get("location")) rows.push({ label: "Location", value: get("location") });
    if (get("guests")) rows.push({ label: "Guests", value: get("guests") });
    if (get("checkIn")) rows.push({ label: "Check-in", value: formatDate(get("checkIn")) });
    if (get("checkOut")) rows.push({ label: "Check-out", value: formatDate(get("checkOut")) });
  } else {
    const listingType = get("listingType");
    if (listingType) {
      rows.push({ label: "Looking to", value: listingType === "RENT" ? "Rent" : "Buy" });
    }
    if (get("location")) rows.push({ label: "Area", value: get("location") });
    if (get("bedrooms")) rows.push({ label: "Bedrooms", value: get("bedrooms") });
  }

  if (get("budget")) rows.push({ label: "Budget", value: get("budget") });
  if (get("note")) rows.push({ label: "Note", value: get("note") });

  return rows;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-moon">
      {label}
      {required && <span className="text-dusk"> *</span>}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        className="rounded-xl border border-line bg-ivory px-4 py-3 text-base font-normal normal-case tracking-normal text-ink placeholder:text-moon/60 focus-visible:border-glow focus-visible:outline-none"
      />
    </label>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-moon">
      {label}
      <textarea
        name={name}
        rows={3}
        className="rounded-xl border border-line bg-ivory px-4 py-3 text-base font-normal normal-case tracking-normal text-ink placeholder:text-moon/60 focus-visible:border-glow focus-visible:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-moon">
      {label}
      <select
        name={name}
        required
        defaultValue=""
        className="rounded-xl border border-line bg-ivory px-4 py-3 text-base font-normal normal-case tracking-normal text-ink focus-visible:border-glow focus-visible:outline-none"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.02h-.01a8.1 8.1 0 0 1-4.14-1.13l-.3-.18-3.1.82.83-3.02-.19-.31a8.09 8.09 0 0 1-1.24-4.3c0-4.47 3.64-8.11 8.12-8.11 2.17 0 4.2.85 5.73 2.38a8.04 8.04 0 0 1 2.38 5.73c0 4.47-3.64 8.12-8.08 8.12Zm4.44-6.06c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.2-1.42-1.34-1.66-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
