import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Text,
  Field,
  Input,
  Spinner,
  Divider,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext.jsx";
import SignaturePad from "../components/SignaturePad.jsx";
import { submitIntake, toErrorMessage, isLikelyServiceDown } from "../api/intakeClient.js";

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
  const sig = intake.signature;

  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const primaryContact =
    a.primaryContactRole && a.contacts[a.primaryContactRole.toLowerCase()]
      ? a.contacts[a.primaryContactRole.toLowerCase()]
      : null;

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

    return hasRequired && primaryHasName && primaryHasContact && sig.pngDataUrl;
  }, [a, primaryContact, sig.pngDataUrl]);

  async function onSubmit() {
    if (submitting) return;

    setErrMsg("");
    setSubmitting(true);

    try {
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
        contacts: [
          { role: "OWNER", ...a.contacts.owner },
          { role: "AGENT", ...a.contacts.agent },
          { role: "ATTORNEY", ...a.contacts.attorney },
          { role: "OTHER", ...a.contacts.other },
        ],
        primaryContactRole: a.primaryContactRole,
        narrative: a.narrative,
        signature: sig,
        uploadsMeta: intake.uploadsMeta,
        scheduling: intake.scheduling,
      };

      const files = (intake.uploads || []).map((u) => u.file).filter(Boolean);

      const resp = await submitIntake({ payload, files });

      setSubmission({
        receiptId: resp.receiptId || "",
        submittedAtIso: resp.submittedAtIso || new Date().toISOString(),
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
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Confirm & Sign</Text>}
          description={<Text>Final check + signature. Submit sends your intake to the server.</Text>}
        />

        <div style={{ padding: 16, display: "grid", gap: 14 }}>
          <Text weight="semibold">Review</Text>

          <div style={{ display: "grid", gap: 6 }}>
            <Text>Account: {a.accountNumber || "-"}</Text>
            <Text>Owner: {a.ownerName || "-"}</Text>
            <Text>Situs: {a.situsAddress || "-"}, {a.situsCity || ""} {a.situsZip || ""}</Text>
            <Text>Hearing mode: {a.hearingMode || "-"}</Text>
            <Text>Owner's opinion of value: {a.ownerOpinionValue || "-"}</Text>
            <Text>Uploads attached now: {uploadsAttachedCount ? `${uploadsAttachedCount} file(s)` : "None"}</Text>
          </div>

          <Divider />
          <Text weight="semibold">Contacts</Text>
          <div style={{ display: "grid", gap: 8 }}>
            <ContactReview label="Owner" contact={a.contacts.owner} />
            <ContactReview label="Authorized Agent" contact={a.contacts.agent} />
            <ContactReview label="Attorney" contact={a.contacts.attorney} />
            <ContactReview label="Other Contact" contact={a.contacts.other} />
            <Text>Primary point of contact: {a.primaryContactRole || "-"}</Text>
          </div>

          <Divider />
          <Text weight="semibold">Written Explanation</Text>
          <Text>{a.narrative || "-"}</Text>

          {uploadsNeedReattach ? (
            <Text style={{ color: "crimson" }}>
              Note: This session shows previously selected upload metadata, but the actual files are not attached.
              If you intend to submit attachments, go back and re-upload them before submitting.
            </Text>
          ) : null}

          {!isValidEmail(primaryContact?.email) && primaryContact?.email?.trim() ? (
            <Text style={{ color: "crimson" }}>
              Primary contact email looks invalid. Please correct it before submitting.
            </Text>
          ) : null}

          <Field label="Typed Name (optional)">
            <Input
              value={sig.signedName}
              onChange={(_, d) => setSignature({ signedName: d.value })}
            />
          </Field>

          <Text weight="semibold">Signature</Text>
          <SignaturePad
            onChangePngDataUrl={(png) =>
              setSignature({
                pngDataUrl: png,
                signedAtIso: png ? new Date().toISOString() : "",
              })
            }
          />

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
