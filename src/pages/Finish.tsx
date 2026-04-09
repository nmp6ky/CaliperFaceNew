import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardFooter,
  Button,
  Text,
  Divider,
  Spinner,
  Title1,
  Subtitle1,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext";
import boeLogo from "../assets/boe-logo.png";
import { confirmIntake, toErrorMessage, isLikelyServiceDown } from "../api/intakeClient";

function formatIso(iso) {
  const s = String(iso || "").trim();
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

export default function Finish() {
  const nav = useNavigate();
  const { intake, clearAll } = useIntake();
  const sub = intake.submission || {};

  const submittedDisplay = useMemo(() => formatIso(sub.submittedAtIso), [sub.submittedAtIso]);
  const [confirming, setConfirming] = useState(true);
  const [confirmError, setConfirmError] = useState("");
  const [confirmation, setConfirmation] = useState(sub.confirmation || null);

  useEffect(() => {
    let active = true;
    const receiptId = String(sub.receiptId || "").trim();
    const token = String(sub.confirmationToken || "").trim();

    if (!receiptId || !token) {
      setConfirmError("Confirmation is required before this page can be shown.");
      setConfirming(false);
      return () => {
        active = false;
      };
    }

    confirmIntake({ receiptId, confirmationToken: token })
      .then((resp) => {
        if (!active) return;
        setConfirmation(resp?.confirmation || null);
      })
      .catch((e) => {
        if (!active) return;
        const msg = toErrorMessage(e);
        setConfirmError(msg || "Unable to confirm the appeal.");
        if (isLikelyServiceDown(e)) {
          nav("/service-down");
        }
      })
      .finally(() => {
        if (active) setConfirming(false);
      });

    return () => {
      active = false;
    };
  }, [nav, sub.confirmationToken, sub.receiptId]);

  async function copyReceipt() {
    const id = String(sub.receiptId || "").trim();
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      // ignore; clipboard not always available
    }
  }

  if (confirming) {
    return (
      <div style={{ maxWidth: 860, margin: "40px auto", padding: 16 }}>
        <Card>
          <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <Spinner />
            <Text>Confirming your appeal...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (confirmError) {
    return (
      <div style={{ maxWidth: 860, margin: "40px auto", padding: 16 }}>
        <Card>
          <div style={{ padding: 24, display: "grid", gap: 10 }}>
            <Text weight="semibold">Confirmation required</Text>
            <Text>{confirmError}</Text>
          </div>
          <CardFooter>
            <Button appearance="secondary" onClick={() => nav("/confirmation")}>
              Back to confirmation
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const appealNo = (confirmation?.appeal_no || confirmation?.appealNo || sub.appealNo || "").trim();
  const documentsCreated = confirmation?.documents_created ?? confirmation?.documentsCreated;
  const hearingScheduled = confirmation?.hearing_scheduled ?? confirmation?.hearingScheduled;

  return (
    <div style={{ maxWidth: 860, margin: "40px auto", padding: 16 }}>
      <Card>
        {/* Header block + divider (matches other pages) */}
        <div style={{ padding: 24, paddingBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <img
              src={boeLogo}
              alt="St. Charles County Board of Equalization"
              style={{
                height: 44,
                width: "auto",
                objectFit: "contain",
              }}
            />
            <Subtitle1>St. Charles County Board of Equalization</Subtitle1>
          </div>

          <Title1>Property Tax Assessment Appeal Form</Title1>

          <div style={{ height: 12 }} />
          <Divider />
        </div>

        {/* Section header aligned with content (replaces CardHeader) */}
        <div style={{ padding: "12px 16px 0", display: "grid", gap: 6 }}>
          <Text size={600} weight="semibold">
            Thanks - Appeal Submitted
          </Text>
          <Text>Keep this page for your records.</Text>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 10 }}>
          <Text>
            Receipt ID: <Text weight="semibold">{sub.receiptId || "Pending / Not provided"}</Text>
          </Text>

          {appealNo ? (
            <Text>
              Appeal No: <Text weight="semibold">{appealNo}</Text>
            </Text>
          ) : null}

          {sub.receiptId ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Button appearance="secondary" onClick={copyReceipt}>
                Copy receipt
              </Button>
              <Text size={200}>Use this ID if you contact the Board about this submission.</Text>
            </div>
          ) : null}

          <Text>
            Submitted: <Text weight="semibold">{submittedDisplay}</Text>
          </Text>

          <Text weight="semibold" style={{ marginTop: 10 }}>
            Next steps
          </Text>
          <Text>1) The Board will review your submission and documents.</Text>
          {typeof documentsCreated === "number" ? (
            <Text>Documents received: {documentsCreated}</Text>
          ) : null}
          {typeof hearingScheduled === "boolean" ? (
            <Text>
              Hearing scheduled: {hearingScheduled ? "Yes" : "Not scheduled"}
            </Text>
          ) : (
            <Text>2) If scheduling was selected, you may receive a separate hearing confirmation.</Text>
          )}
          <Text>3) Watch your email for notices and requests for additional information.</Text>
        </div>

        <CardFooter>
          <Button
            appearance="secondary"
            onClick={() => {
              clearAll();
              nav("/landing");
            }}
          >
            File another appeal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
