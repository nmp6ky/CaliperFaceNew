import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardFooter, Button, Text } from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext.jsx";

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

  async function copyReceipt() {
    const id = String(sub.receiptId || "").trim();
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      // ignore; clipboard not always available
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: "40px auto", padding: 16 }}>
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Thanks - Appeal Submitted</Text>}
          description={<Text>Keep this page for your records.</Text>}
        />
        <div style={{ padding: 16, display: "grid", gap: 10 }}>
          <Text>
            Receipt ID: {" "}
            <Text weight="semibold">
              {sub.receiptId || "Pending / Not provided"}
            </Text>
          </Text>

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

          <Text weight="semibold" style={{ marginTop: 10 }}>Next steps</Text>
          <Text>1) The Board will review your submission and documents.</Text>
          <Text>2) If scheduling was selected, you may receive a separate hearing confirmation.</Text>
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
