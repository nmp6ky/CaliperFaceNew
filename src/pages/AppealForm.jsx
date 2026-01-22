import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Text,
  Field,
  Input,
  Textarea,
  RadioGroup,
  Radio,
  Divider,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext.jsx";

const hearingModes = [
  { value: "IN_PERSON", label: "In person" },
  { value: "PHONE", label: "Phone" },
  { value: "WAIVED", label: "Waived" },
];

const contactRoles = [
  { key: "owner", label: "Property Owner" },
  { key: "agent", label: "Authorized Agent" },
  { key: "attorney", label: "Attorney" },
  { key: "other", label: "Other Contact" },
];

function ContactCard({ role, label, contact, onChange }) {
  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 12, display: "grid", gap: 10 }}>
      <Text weight="semibold">{label}</Text>
      <Field label="Full Name">
        <Input value={contact.fullName} onChange={(_, d) => onChange({ fullName: d.value })} />
      </Field>
      <Field label="Mailing Address">
        <Input value={contact.mailingAddress} onChange={(_, d) => onChange({ mailingAddress: d.value })} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Telephone">
          <Input value={contact.phone} onChange={(_, d) => onChange({ phone: d.value })} />
        </Field>
        <Field label="Email">
          <Input type="email" value={contact.email} onChange={(_, d) => onChange({ email: d.value })} />
        </Field>
      </div>
      {role === "owner" ? (
        <Text size={200} style={{ color: "#5f6a6a" }}>
          Owner contact is required. Others are optional but recommended.
        </Text>
      ) : null}
    </div>
  );
}

export default function AppealForm() {
  const nav = useNavigate();
  const { intake, updateAppeal, updateContact, setPrimaryContactRole } = useIntake();
  const a = intake.appeal;

  const primaryOptions = useMemo(() => {
    return contactRoles.map((r) => ({
      ...r,
      disabled: r.key === "owner" ? !a.contacts.owner.fullName.trim() : !a.contacts[r.key].fullName.trim(),
    }));
  }, [a.contacts]);

  const ready = useMemo(() => {
    return (
      a.accountNumber.trim() &&
      a.ownerName.trim() &&
      a.situsAddress.trim() &&
      a.situsCity.trim() &&
      a.situsZip.trim() &&
      a.hearingMode &&
      a.contacts.owner.fullName.trim() &&
      a.primaryContactRole
    );
  }, [a]);

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Appeal Form</Text>}
          description={<Text>Property details, contacts, hearing preference, and your opinion of value.</Text>}
        />

        <div style={{ padding: 16, display: "grid", gap: 16 }}>
          <Field label="Property Account / Parcel Number" required>
            <Input
              value={a.accountNumber}
              onChange={(_, d) => updateAppeal({ accountNumber: d.value })}
            />
          </Field>

          <Field label="Owner Name" required>
            <Input value={a.ownerName} onChange={(_, d) => updateAppeal({ ownerName: d.value })} />
          </Field>

          <Field label="Situs Address" required>
            <Input value={a.situsAddress} onChange={(_, d) => updateAppeal({ situsAddress: d.value })} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Situs City" required>
              <Input value={a.situsCity} onChange={(_, d) => updateAppeal({ situsCity: d.value })} />
            </Field>
            <Field label="Situs ZIP" required>
              <Input value={a.situsZip} onChange={(_, d) => updateAppeal({ situsZip: d.value })} />
            </Field>
          </div>

          <Field label="Hearing Mode" required>
            <RadioGroup
              value={a.hearingMode}
              onChange={(_, data) => updateAppeal({ hearingMode: data.value })}
            >
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {hearingModes.map((m) => (
                  <Radio key={m.value} value={m.value} label={m.label} />
                ))}
              </div>
            </RadioGroup>
          </Field>

          <Field label="Owner's Opinion of Fair Market Value (optional)">
            <Input
              value={a.ownerOpinionValue}
              onChange={(_, d) => updateAppeal({ ownerOpinionValue: d.value })}
              placeholder="e.g., 250000"
            />
          </Field>

          <Field label="Written Explanation (optional)">
            <Textarea
              resize="vertical"
              value={a.narrative}
              onChange={(_, d) => updateAppeal({ narrative: d.value })}
              placeholder="Briefly explain why you believe the assessed value should change."
            />
          </Field>

          <Divider />

          <Text weight="semibold">Contacts</Text>
          <Text size={200} style={{ color: "#5f6a6a" }}>
            Provide contact details for the owner and any authorized representatives. The primary point of
            contact will receive communications.
          </Text>

          <div style={{ display: "grid", gap: 12 }}>
            {contactRoles.map((r) => (
              <ContactCard
                key={r.key}
                role={r.key}
                label={r.label}
                contact={a.contacts[r.key]}
                onChange={(patch) => updateContact(r.key, patch)}
              />
            ))}
          </div>

          <Field label="Primary Point of Contact" required>
            <RadioGroup
              value={a.primaryContactRole}
              onChange={(_, data) => setPrimaryContactRole(data.value)}
            >
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {primaryOptions.map((r) => (
                  <Radio key={r.key} value={r.key.toUpperCase()} label={r.label} disabled={r.disabled} />
                ))}
              </div>
            </RadioGroup>
          </Field>
        </div>

        <CardFooter>
          <Button appearance="secondary" onClick={() => nav(-1)}>Back</Button>
          <Button appearance="primary" disabled={!ready} onClick={() => nav("/uploads")}>Next</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
