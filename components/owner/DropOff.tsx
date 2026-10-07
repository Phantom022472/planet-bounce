"use client";

import { useEffect, useState } from "react";
import { SignaturePad } from "@/components/booking/SignaturePad";
import type { OwnerBooking } from "./OwnerApp";

type Step = "photos" | "items" | "sign" | "done";

// Drop-off proof: photos of the setup, a checklist of what was left, and the customer's signature.
// Preview only for now; nothing is uploaded or saved.
export function DropOff({ booking, onClose, onDone }: { booking: OwnerBooking; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<Step>("photos");
  const [photos, setPhotos] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [signature, setSignature] = useState("");

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p)), [photos]);

  const allChecked = booking.items.every((i) => checked.has(i));
  const steps: Step[] = ["photos", "items", "sign"];

  return (
    <div className="omodal" role="dialog" aria-modal="true" aria-labelledby="drop-title">
      <div className="osheet">
        <div className="orow">
          <h2 id="drop-title">Drop-off: {booking.rental}</h2>
          <button type="button" className="oclose" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="ometa">{booking.customer} · {booking.address}</p>
        {step !== "done" && (
          <ol className="odots" aria-label="Steps">
            {steps.map((s, i) => (
              <li key={s} className={steps.indexOf(step) >= i ? "on" : ""}>{i + 1}</li>
            ))}
          </ol>
        )}

        {step === "photos" && (
          <>
            <h3>Take photos of the setup</h3>
            <p className="ohint">Get the whole unit, the stakes or sandbags, and the blower.</p>
            <label className="oupload" htmlFor="drop-photo">
              📷 Take a photo
              <input id="drop-photo" type="file" accept="image/*" capture="environment" multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setPhotos((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
                  e.target.value = "";
                }} />
            </label>
            {photos.length > 0 && (
              <div className="ophotos">
                {photos.map((p) => <img key={p} src={p} alt="Drop-off photo" />)}
              </div>
            )}
            <button type="button" className="obtn sun wide" onClick={() => setStep("items")}>
              {photos.length ? `Next (${photos.length} photo${photos.length > 1 ? "s" : ""})` : "Skip photos for now"}
            </button>
          </>
        )}

        {step === "items" && (
          <>
            <h3>Check what you left</h3>
            <div className="ocheck">
              {booking.items.map((item) => (
                <label key={item}>
                  <input type="checkbox" checked={checked.has(item)}
                    onChange={() => setChecked((s) => { const n = new Set(s); if (n.has(item)) n.delete(item); else n.add(item); return n; })} />
                  {item}
                </label>
              ))}
            </div>
            <button type="button" className="obtn sun wide" disabled={!allChecked} onClick={() => setStep("sign")}>
              {allChecked ? "Next" : "Check every item"}
            </button>
          </>
        )}

        {step === "sign" && (
          <>
            <h3>Hand the phone to the customer</h3>
            <p className="ohint">“I received the {booking.rental} set up and in good condition.”</p>
            <SignaturePad onChange={setSignature} />
            <button type="button" className="obtn sun wide" disabled={!signature}
              onClick={() => { setStep("done"); onDone(); }}>
              Finish drop-off
            </button>
          </>
        )}

        {step === "done" && (
          <div className="odone">
            <span className="oic">✓</span>
            <h3>Dropped off</h3>
            <p className="ohint">
              In the finished app, the photos and signature are saved to this booking and the customer gets a copy by text and email.
            </p>
            <button type="button" className="obtn dark wide" onClick={onClose}>Back to today</button>
          </div>
        )}
      </div>
    </div>
  );
}
