import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardHeader, CardFooter, Button, Text,
  Divider
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext.jsx";

function fmtBytes(n) {
  if (!Number.isFinite(n)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function UploadPage() {
  const nav = useNavigate();
  const inputRef = useRef(null);
  const { intake, addUploads, removeUpload } = useIntake();

  return (
    <div style={{ maxWidth: 860, margin: "40px auto", padding: 16 }}>
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Upload Supporting Documents</Text>}
          description={<Text>Upload any evidence you want the Board to review (PDFs, photos, appraisals, estimates, etc.).</Text>}
        />

        <div style={{ padding: 16, display: "grid", gap: 12 }}>
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length) {
                addUploads(e.target.files);
                e.target.value = ""; // allow re-adding same file name
              }
            }}
          />

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button appearance="primary" onClick={() => inputRef.current?.click()}>
              Choose files
            </Button>
            <Text>{intake.uploadsMeta.length ? `${intake.uploadsMeta.length} file(s) selected` : "No files selected"}</Text>
          </div>

          <Divider />

          {intake.uploadsMeta.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {intake.uploadsMeta.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #e1e1e1",
                    borderRadius: 10,
                    padding: "10px 12px",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "grid" }}>
                    <Text weight="semibold">{u.name}</Text>
                    <Text size={200}>{fmtBytes(u.size)} Â| {u.type || "unknown type"}</Text>
                  </div>

                  <Button appearance="secondary" onClick={() => removeUpload(u.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Text size={200}>Optional. You can submit with no documents.</Text>
          )}
        </div>

        <CardFooter>
          <Button appearance="secondary" onClick={() => nav(-1)}>Back</Button>
          <Button appearance="primary" onClick={() => nav("/scheduling")}>Next</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
