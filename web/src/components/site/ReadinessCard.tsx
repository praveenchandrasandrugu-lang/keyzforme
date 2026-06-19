import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadinessRowProps {
  label: string;
  status: "ready" | "waiting";
  statusText: string;
  isFirst?: boolean;
}

function ReadinessRow({ label, status, statusText, isFirst }: ReadinessRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 text-[14px]",
        !isFirst && "border-t border-line2"
      )}
    >
      <span className="text-ink">{label}</span>
      {status === "ready" ? (
        <span className="flex items-center gap-1 text-green font-bold">
          <Check size={14} strokeWidth={3} />
          {statusText}
        </span>
      ) : (
        <span className="text-gold font-semibold">{statusText}</span>
      )}
    </div>
  );
}

export default function ReadinessCard() {
  return (
    <div className="bg-surface rounded-[20px] border border-line p-[26px] shadow-card">
      {/* Top row: label + score on left, ring on right */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[13px] text-brandmuted font-semibold">
            Your home-readiness
          </div>
          <div className="font-serif text-[20px] text-navy font-semibold mt-1">
            On track
          </div>
        </div>

        {/* Conic gradient ring at 72% */}
        <div
          className="w-24 h-24 rounded-full grid place-items-center"
          style={{
            background: "conic-gradient(var(--color-green) 72%, var(--color-progress-track) 0)",
          }}
        >
          <div className="w-[74px] h-[74px] rounded-full bg-surface grid place-items-center text-center">
            <div>
              <b className="font-serif text-[24px] text-navy leading-none">
                72
              </b>
              <br />
              <small className="text-[10px] text-brandmuted">/ 100</small>
            </div>
          </div>
        </div>
      </div>

      {/* Readiness rows */}
      <ReadinessRow
        label="Down-payment savings"
        status="ready"
        statusText="Ready"
        isFirst
      />
      <ReadinessRow
        label="Credit health"
        status="ready"
        statusText="Ready"
      />
      <ReadinessRow
        label="Debt-to-income"
        status="waiting"
        statusText="2 steps left"
      />

      {/* Offer preview */}
      <div className="mt-[18px] bg-cream rounded-[14px] p-[14px_16px]">
        <div className="text-[12px] text-brandmuted font-bold tracking-[0.05em] uppercase mb-[10px]">
          Offers waiting when you&apos;re ready
        </div>

        {/* Summit Home Loans */}
        <div className="flex items-center justify-between bg-surface border border-line rounded-[10px] px-[13px] py-[10px] mb-2 text-[13.5px]">
          <span className="text-ink">Lender · Summit Home Loans</span>
          <span className="font-serif font-semibold text-navy text-[16px]">
            6.1%
          </span>
        </div>

        {/* M. Alvarez */}
        <div className="flex items-center justify-between bg-surface border border-line rounded-[10px] px-[13px] py-[10px] text-[13.5px]">
          <span className="text-ink">Realtor · M. Alvarez</span>
          <span className="bg-pill text-pilltext text-[11px] font-bold px-[9px] py-[3px] rounded-full">
            Top match
          </span>
        </div>
      </div>
    </div>
  );
}
