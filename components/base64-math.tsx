import { textToBytes } from "@/lib/bytes";
import { cn } from "@/lib/utils";

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * A static, worked example of Base64's bit-packing for one 3-byte group.
 * The whole point lives in seeing the *same 24 bits* bracketed two ways:
 * three 8-bit bytes going in, four 6-bit groups coming out.
 */
export function Base64Math({ word = "Sun" }: { word?: string }) {
  const bytes = Array.from(textToBytes(word)).slice(0, 3);
  const bits = bytes.map((b) => b.toString(2).padStart(8, "0")).join("");
  const sextets = (bits.match(/.{1,6}/g) ?? []).map((s) => ({
    bits: s,
    value: parseInt(s, 2),
    char: ALPHABET[parseInt(s, 2)],
  }));

  const bitArray = bits.split("");

  return (
    <div className="rounded-xl border border-encode/30 bg-card/50 p-5 sm:p-6">
      {/* IN: three bytes */}
      <p className="label-spec">in · 3 bytes</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {bytes.map((b, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-background/50 p-3 text-center"
          >
            <div className="font-display text-2xl leading-none">
              {word[i]}
            </div>
            <div className="mt-1.5 font-data text-xs text-muted-foreground">
              {b}
            </div>
            <div className="mt-1 font-data text-[11px] text-encode">
              {b.toString(2).padStart(8, "0")}
            </div>
          </div>
        ))}
      </div>

      {/* the 24-bit stream, bracketed two ways */}
      <p className="label-spec mt-6">24 bits, two groupings</p>
      <div className="mt-3 space-y-2 overflow-x-auto">
        <BitRow bits={bitArray} groupOf={8} accent="border-muted-foreground/40" />
        <div className="flex justify-center">
          <span className="font-data text-[11px] text-muted-foreground">
            ↑ split every 8 (bytes) · split every 6 (base64) ↓
          </span>
        </div>
        <BitRow bits={bitArray} groupOf={6} accent="border-encode/60" />
      </div>

      {/* OUT: four base64 chars */}
      <p className="label-spec mt-6">out · 4 characters</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {sextets.map((s, i) => (
          <div
            key={i}
            className="rounded-lg border border-encode/30 bg-encode-soft p-3 text-center"
          >
            <div className="font-data text-[11px] text-encode">{s.bits}</div>
            <div className="mt-1 font-data text-xs text-muted-foreground">
              = {s.value}
            </div>
            <div className="mt-1.5 font-display text-2xl leading-none text-encode">
              {s.char}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 font-data text-[12px] leading-relaxed text-muted-foreground">
        “{word}” → <span className="text-encode">{sextets.map((s) => s.char).join("")}</span>
        . Twenty-four bits don&apos;t care how you slice them — 3×8 going in,
        4×6 coming out. That 3-to-4 ratio is the whole +33% size cost.
      </p>
    </div>
  );
}

function BitRow({
  bits,
  groupOf,
  accent,
}: {
  bits: string[];
  groupOf: number;
  accent: string;
}) {
  return (
    <div className="flex min-w-fit justify-center gap-1.5">
      {Array.from({ length: Math.ceil(bits.length / groupOf) }).map((_, g) => (
        <div
          key={g}
          className={cn(
            "flex gap-px rounded-md border bg-background/40 px-1.5 py-1.5",
            accent,
          )}
        >
          {bits.slice(g * groupOf, g * groupOf + groupOf).map((bit, i) => (
            <span
              key={i}
              className={cn(
                "grid size-4 place-items-center font-data text-[11px]",
                bit === "1" ? "text-foreground" : "text-muted-foreground/50",
              )}
            >
              {bit}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
