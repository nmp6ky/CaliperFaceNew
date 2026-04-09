import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardFooter,
  Button,
  Text,
  Field,
  Input,
  Spinner,
  Divider,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext";
import SignaturePad from "../components/SignaturePad";
import { submitIntake, toErrorMessage, isLikelyServiceDown } from "../api/intakeClient";

function isValidEmail(email) {
  const e = String(email || "").trim();
  if (!e) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function ContactReview({ label, contact }) {
  const name = contact?.fullName?.trim();
  const phone = contact?.phone?.trim();
  const email = contact?.email?.trim();
  const addr = contact?.mailingAddress?.trim();
  return (
    <div style={{ display: "grid", gap: 2 }}>
      <Text weight="semibold">{label}</Text>
      <Text>Name: {name || "-"}</Text>
      <Text>Address: {addr || "-"}</Text>
      <Text>Phone: {phone || "-"}</Text>
      <Text>Email: {email || "-"}</Text>
    </div>
  );
}

export default function Confirmation() {
  const nav = useNavigate();
  const { intake, setSignature, setSubmission, uploadsNeedReattach } = useIntake();

  const a = intake.appeal;
  const hasAgent = !!a.hasAuthorizedAgent;
  const sig = intake.signature;

  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const primaryContact =
    a.primaryContactRole && a.contacts[a.primaryContactRole.toLowerCase()]
      ? a.contacts[a.primaryContactRole.toLowerCase()]
      : null;

  const agentUploads = (intake.uploadsMeta || []).filter((u) => u.category === "agent");

  const ready = useMemo(() => {
    const hasRequired =
      a.accountNumber.trim() &&
      a.ownerName.trim() &&
      a.situsAddress.trim() &&
      a.situsCity.trim() &&
      a.situsZip.trim() &&
      a.hearingMode &&
      a.contacts.owner.fullName.trim() &&
      a.primaryContactRole;

    const primaryHasName = primaryContact?.fullName?.trim();
    const primaryHasContact = primaryContact && (primaryContact.email?.trim() || primaryContact.phone?.trim());

    const agentOk = hasAgent ? !!agentUploads.length && a.contacts.agent.fullName.trim() : true;

    // Typed name is now required
    const typedNameOk = (sig.signedName || "").trim().length > 0;

    return hasRequired && primaryHasName && primaryHasContact && sig.pngDataUrl && agentOk && typedNameOk;
  }, [a, primaryContact, sig.pngDataUrl, hasAgent, agentUploads.length, sig.signedName]);

  async function onSubmit() {
    if (submitting) return;

    setErrMsg("");
    setSubmitting(true);

    try {
      if (hasAgent && !agentUploads.length) {
        setErrMsg("Agent authorization form is required when an authorized agent is declared.");
        setSubmitting(false);
        return;
      }

      if (!(sig.signedName || "").trim()) {
        setErrMsg("Typed name is required.");
        setSubmitting(false);
        return;
      }

      const sched = intake.scheduling || {};
      const slotIdValue = sched.slotId ?? (sched.slot && sched.slot.id) ?? null;

      if (sched.scheduleNow === "YES" && !slotIdValue) {
        setErrMsg("Please select a time slot before submitting.");
        setSubmitting(false);
        return;
      }

      const schedulingPayload =
        sched.scheduleNow === "YES" && sched.selectedDateYmd && sched.selectedTimeLabel
          ? {
              scheduleNow: sched.scheduleNow,
              selectedDateYmd: sched.selectedDateYmd,
              selectedTimeLabel: sched.selectedTimeLabel,
              slotId: typeof slotIdValue === "number" ? slotIdValue : Number(slotIdValue) || null,
              slot: sched.slot || null,
            }
          : {};

      const payload = {
        property: {
          accountNumber: a.accountNumber,
          ownerName: a.ownerName,
          situsAddress: a.situsAddress,
          situsCity: a.situsCity,
          situsZip: a.situsZip,
          ownerOpinionValue: a.ownerOpinionValue,
          hearingMode: a.hearingMode,
        },
        hasAuthorizedAgent: hasAgent,
        contacts: [
          { role: "OWNER", ...a.contacts.owner },
          ...(hasAgent ? [{ role: "AGENT", ...a.contacts.agent }] : []),
        ],
        primaryContactRole: a.primaryContactRole,
        narrative: a.narrative,
        signature: sig,
        uploadsMeta: intake.uploadsMeta,
        scheduling: schedulingPayload,
      };

      const files = (intake.uploads || []).map((u) => u.file).filter(Boolean);

      const resp = await submitIntake({ payload, files });

      if (!resp?.confirmationToken) {
        setErrMsg("Your appeal could not be confirmed by the server. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmission({
        receiptId: resp.receiptId || "",
        submittedAtIso: resp.submittedAtIso || new Date().toISOString(),
        confirmationToken: resp.confirmationToken || "",
        confirmation: resp.confirmation || null,
        appealNo: resp.pieAppealNo || "",
      });

      nav("/finish");
    } catch (e) {
      const msg = toErrorMessage(e);
      setErrMsg(msg);
      if (isLikelyServiceDown(e)) {
        nav("/service-down");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const uploadsAttachedCount = (intake.uploads || []).length;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "8px 0" }}>
      <Card style={{ border: "none", boxShadow: "none", background: "transparent" }}>

        {/* Section header aligned with content (replaces CardHeader) */}
        <div style={{ padding: "12px 16px 0", display: "grid", gap: 6 }}>
          <Text size={600} weight="semibold">
            Confirm &amp; Sign
          </Text>
          <Text>Final check + signature. Submit sends your intake to the server.</Text>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 14 }}>
          <Text weight="semibold">Review</Text>

          <div style={{ display: "grid", gap: 6 }}>
            <Text>Account: {a.accountNumber || "-"}</Text>
            <Text>Owner: {a.ownerName || "-"}</Text>
            <Text>
              Situs: {a.situsAddress || "-"}, {a.situsCity || ""} {a.situsZip || ""}
            </Text>
            <Text>Hearing mode: {a.hearingMode || "-"}</Text>
            <Text>Owner&apos;s opinion of value: {a.ownerOpinionValue || "-"}</Text>
            <Text>Uploads attached now: {uploadsAttachedCount ? `${uploadsAttachedCount} file(s)` : "None"}</Text>
          </div>

          <Divider />
          <Text weight="semibold">Contacts</Text>
          <div style={{ display: "grid", gap: 8 }}>
            <ContactReview label="Owner" contact={a.contacts.owner} />
            {hasAgent ? <ContactReview label="Authorized Agent" contact={a.contacts.agent} /> : null}
            <Text>Primary point of contact: {a.primaryContactRole || "-"}</Text>
          </div>

          <Divider />
          <Text weight="semibold">Written Explanation</Text>
          <Text>{a.narrative || "-"}</Text>

          {/* Divider below Written Explanation */}
          <Divider />

          {uploadsNeedReattach ? (
            <Text style={{ color: "crimson" }}>
              Note: This session shows previously selected upload metadata, but the actual files are not attached. If you
              intend to submit attachments, go back and re-upload them before submitting.
            </Text>
          ) : null}

          {!isValidEmail(primaryContact?.email) && primaryContact?.email?.trim() ? (
            <Text style={{ color: "crimson" }}>
              Primary contact email looks invalid. Please correct it before submitting.
            </Text>
          ) : null}

          {/* Signature attestation text */}
          <Text>This appeal must be signed by the owner or the owner&apos;s agent.</Text>
          <div style={{ height: 8 }} />
          <Text weight="semibold">
            By signing below: I declare that I have examined this form, including all attachments and directions, and to
            the best of my knowledge and belief, the information I have provided is true, accurate and complete.
          </Text>

          <Text weight="semibold" style={{ marginTop: 6 }}>
            Signature
          </Text>

          {/* Reduce signature pad size slightly by constraining its container */}
          <div style={{ maxWidth: 720 }}>
            <SignaturePad
              onChangePngDataUrl={(png) =>
                setSignature({
                  pngDataUrl: png,
                  signedAtIso: png ? new Date().toISOString() : "",
                })
              }
            />
          </div>

          {/* Typed name moved below signature pad and now required */}
          <Field
            label="Typed Name"
            required
            validationState={(sig.signedName || "").trim() ? "none" : "error"}
            validationMessage={(sig.signedName || "").trim() ? undefined : "Required."}
          >
            <Input
              value={sig.signedName}
              onChange={(_, d) => setSignature({ signedName: d.value })}
              placeholder="Type your full name"
            />
          </Field>

          {sig.pngDataUrl ? (
            <div style={{ marginTop: 8 }}>
              <Text>Preview:</Text>
              <img
                src={sig.pngDataUrl}
                alt="Signature preview"
                style={{
                  marginTop: 8,
                  border: "1px solid #c8c8c8",
                  borderRadius: 8,
                  maxWidth: 420,
                }}
              />
            </div>
          ) : null}

          {submitting ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Spinner />
              <Text>Submitting...</Text>
            </div>
          ) : null}

          {errMsg ? <Text style={{ color: "crimson" }}>{errMsg}</Text> : null}
        </div>

        <CardFooter>
          <Button appearance="secondary" onClick={() => nav(-1)} disabled={submitting}>
            Back
          </Button>
          <Button appearance="primary" disabled={!ready || submitting} onClick={onSubmit}>
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
