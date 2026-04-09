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
  Title1,
  Subtitle1,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext";
import boeLogo from "../assets/boe-logo.png";

const hearingModes = [
  { value: "IN_PERSON", label: "In person" },
  { value: "PHONE", label: "Phone" },
  { value: "WAIVED", label: "Waived" },
];

const contactRolesBase = [
  { key: "owner", label: "Property Owner" },
  { key: "agent", label: "Authorized Agent" },
];

function isValidEmail(v) {
  const s = (v || "").trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isValidPhone(v) {
  const s = (v || "").trim();
  if (!s) return false;
  const digits = s.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function ContactCard({ role, label, contact, onChange }) {
  const emailTrim = (contact.email || "").trim();
  const phoneTrim = (contact.phone || "").trim();

  const emailProvided = !!emailTrim;
  const phoneProvided = !!phoneTrim;

  const emailOk = !emailProvided || isValidEmail(emailTrim);
  const phoneOk = !phoneProvided || isValidPhone(phoneTrim);

  const ownerEmailRequired = role === "owner";
  const ownerPhoneRequired = role === "owner";

  const ownerEmailOk = !ownerEmailRequired ? emailOk : isValidEmail(emailTrim);
  const ownerPhoneOk = !ownerPhoneRequired ? phoneOk : isValidPhone(phoneTrim);

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
        <Field
          label="Telephone"
          required={role === "owner"}
          validationState={ownerPhoneOk ? "none" : "error"}
          validationMessage={ownerPhoneOk ? undefined : "Enter a valid phone number."}
        >
          <Input value={contact.phone} onChange={(_, d) => onChange({ phone: d.value })} />
        </Field>
        <Field
          label="Email"
          required={role === "owner"}
          validationState={ownerEmailOk ? "none" : "error"}
          validationMessage={ownerEmailOk ? undefined : "Enter a valid email address."}
        >
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
  const { intake, updateAppeal, updateContact, setPrimaryContactRole, setHasAuthorizedAgent } = useIntake();
  const a = intake.appeal;
  const hasAgent = !!a.hasAuthorizedAgent;

  const contactRoles = useMemo(
    () => contactRolesBase.filter((r) => (r.key === "agent" ? hasAgent : true)),
    [hasAgent]
  );

  const primaryOptions = useMemo(() => {
    return contactRoles.map((r) => ({
      ...r,
      disabled: r.key === "owner" ? !a.contacts.owner.fullName.trim() : !a.contacts[r.key].fullName.trim(),
    }));
  }, [a.contacts, contactRoles]);

  const ownerEmailOk = useMemo(() => isValidEmail(a.contacts.owner.email), [a.contacts.owner.email]);
  const ownerPhoneOk = useMemo(() => isValidPhone(a.contacts.owner.phone), [a.contacts.owner.phone]);

  const ready = useMemo(() => {
    return (
      a.accountNumber.trim() &&
      a.ownerName.trim() &&
      a.situsAddress.trim() &&
      a.situsCity.trim() &&
      a.situsZip.trim() &&
      typeof a.hasAuthorizedAgent === "boolean" &&
      a.hearingMode &&
      typeof a.isFilingThreePlus === "boolean" &&
      a.ownerOpinionValue.trim() &&
      a.contacts.owner.fullName.trim() &&
      ownerEmailOk &&
      ownerPhoneOk &&
      a.primaryContactRole
    );
  }, [a, ownerEmailOk, ownerPhoneOk]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "8px 0" }}>
      <Card>
        {/* Header block above the form title (matches Landing) */}
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

          {/* Divider under the header */}
          <div style={{ height: 12 }} />
          <Divider />
        </div>

        {/* Section header aligned with form content */}
        <div style={{ padding: "0 16px" }}>
          <Text size={600} weight="semibold">Appeal Information</Text>
        </div>


        <div style={{ padding: 16, display: "grid", gap: 16 }}>
          <Field label="Property Account Number" required>
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

          <Divider />

          <Field label="Does this appeal have an authorized agent?" required>
            <RadioGroup
              value={typeof a.hasAuthorizedAgent === "boolean" ? (hasAgent ? "YES" : "NO") : ""}
              onChange={(_, d) => {
                const yes = d.value === "YES";
                setHasAuthorizedAgent(yes);
                if (!yes) {
                  setPrimaryContactRole("OWNER");
                }
              }}
            >
              <div style={{ display: "flex", gap: 14 }}>
                <Radio value="YES" label="Yes" />
                <Radio value="NO" label="No" />
              </div>
            </RadioGroup>
            <Text size={200} style={{ color: "#5f6a6a" }}>
              An authorized agent exists whenever someone other than the property owner is filing this appeal form or will
              represent the property owner at their hearing, on the property owner&apos;s behalf, and in their absence.
            </Text>
          </Field>

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

          <Field label="In total, are you filing three or more appeals?" required>
            <RadioGroup
              value={typeof a.isFilingThreePlus === "boolean" ? (a.isFilingThreePlus ? "YES" : "NO") : ""}
              onChange={(_, d) => updateAppeal({ isFilingThreePlus: d.value === "YES" })}
            >
              <div style={{ display: "flex", gap: 14 }}>
                <Radio value="YES" label="Yes" />
                <Radio value="NO" label="No" />
              </div>
            </RadioGroup>
            <Text size={200} style={{ color: "#5f6a6a" }}>
              For scheduling purposes, if you as an individual (in your capacity as a property owner, authorized agent, or attorney) are submitting three or more appeals, select &quot;Yes&quot; so your hearings can be arranged to occur together.
            </Text>
          </Field>

          {/* Divider above Owner's Opinion of Fair Market Value */}
          <Divider />

          <Field label="Owner's Opinion of Fair Market Value" required>
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

          {/* Make Party Contact Information same style as Appeal Information */}
          <Text size={600} weight="semibold">Party Contact Information</Text>

          <Text size={200} style={{ color: "#5f6a6a" }}>
            Provide contact details for the owner and any authorized representatives. The primary point of
            contact will receive communications.
          </Text>

          <div style={{ display: "grid", gap: 12 }}>
            {contactRoles.map((r) =>
              r.key === "agent" && !hasAgent ? null : (
                <ContactCard
                  key={r.key}
                  role={r.key}
                  label={r.label}
                  contact={a.contacts[r.key]}
                  onChange={(patch) => updateContact(r.key, patch)}
                />
              )
            )}
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