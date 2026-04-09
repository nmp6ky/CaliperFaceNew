import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardFooter,
  Button,
  Text,
  Divider,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext";

function fmtBytes(n) {
  if (!Number.isFinite(n)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function UploadPage() {
  const nav = useNavigate();
  const supportRef = useRef(null);
  const agentRef = useRef(null);
  const { intake, addUploads, removeUpload } = useIntake();

  const hasAgent = !!intake.appeal?.hasAuthorizedAgent;
  const isThreePlus = !!intake.appeal?.isFilingThreePlus;
  const supportUploads = (intake.uploadsMeta || []).filter((u) => u.category === "support");
  const agentUploads = (intake.uploadsMeta || []).filter((u) => u.category === "agent");

  const renderList = (uploads) =>
    uploads.length ? (
      <div style={{ display: "grid", gap: 8 }}>
        {uploads.map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #e1e1e1",
              borderRadius: 0,
              padding: "10px 12px",
              gap: 10,
            }}
          >
            <div style={{ display: "grid" }}>
              <Text weight="semibold">{u.name}</Text>
              <Text size={200}>
                {fmtBytes(u.size)} | {u.type || "unknown type"}
              </Text>
            </div>

            <Button appearance="secondary" onClick={() => removeUpload(u.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    ) : null;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "8px 0" }}>
      <Card style={{ border: "none", boxShadow: "none", background: "transparent" }}>

        {/* Section header aligned with content (replaces CardHeader) */}
        <div style={{ padding: "12px 16px 0", display: "grid", gap: 6 }}>
          <Text size={600} weight="semibold">
            Upload Documents
          </Text>
          <Text>
            Provide supporting evidence and (if applicable) an agent authorization form.
          </Text>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 16 }}>
          {/* Supporting Documentation */}
          <div style={{ display: "grid", gap: 8 }}>
            <Text weight="semibold">Supporting Documentation</Text>
            <Text size={200}>Evidence for your appeal (PDFs, photos, appraisals, estimates, etc.).</Text>
            <input
              ref={supportRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length) {
                  addUploads(e.target.files, "support");
                  e.target.value = "";
                }
              }}
            />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Button appearance="primary" onClick={() => supportRef.current?.click()}>
                Add supporting files
              </Button>
              <Text>{supportUploads.length ? `${supportUploads.length} file(s)` : "None selected"}</Text>
            </div>
            {renderList(supportUploads) || <Text size={200}>Optional. You can submit with no documents.</Text>}
          </div>

          <Divider />

          {/* Agent Authorization Form */}
          {hasAgent ? (
            <div style={{ display: "grid", gap: 8 }}>
              <Text weight="semibold">Agent Authorization Form</Text>
              <Text size={200}>Required when an authorized agent is representing the owner.</Text>
              <input
                ref={agentRef}
                type="file"
                multiple={false}
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length) {
                    addUploads(e.target.files, "agent");
                    e.target.value = "";
                  }
                }}
              />
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button appearance="primary" onClick={() => agentRef.current?.click()}>
                  Upload authorization form
                </Button>
                <Text>{agentUploads.length ? `${agentUploads.length} file(s)` : "None selected"}</Text>
              </div>
              {renderList(agentUploads) || (
                <Text size={200} style={{ color: "crimson" }}>
                  Required for agent filings.
                </Text>
              )}
            </div>
          ) : null}
        </div>

        <CardFooter>
          <Button appearance="secondary" onClick={() => nav(-1)}>
            Back
          </Button>
          <Button
            appearance="primary"
            disabled={hasAgent && agentUploads.length === 0}
            onClick={() => nav(isThreePlus ? "/schedule-note" : "/scheduling")}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
