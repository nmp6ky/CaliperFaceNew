import { useNavigate } from "react-router-dom";
import {
  Card,
  CardFooter,
  Button,
  Text,
  Divider,
  Title1,
  Subtitle1,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext";
import boeLogo from "../assets/boe-logo.png";

export default function Scheduling() {
  const nav = useNavigate();
  useIntake(); // Keeping this hook call in case your flow expects intake context initialization.

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "8px 0" }}>
      <Card>
        {/* Header block + divider (matches Landing/Appeal/Uploads) */}
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
            Scheduling
          </Text>
          <Text>
            Confirm how you want to handle your hearing time. You can proceed now, and staff will follow up if needed.
          </Text>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 14 }}>
          {/* Hearing Location & Attendance Details */}
          <div>
            <Text size={500} weight="semibold">
              Hearing Location &amp; Attendance Details
            </Text>
            <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
              <Text>
                All hearings—regardless of the attendance mode selected by the appellant, including waiving one&apos;s right
                to attend—will take place in person at the St. Charles County Election Authority located at 397 Turner
                Boulevard, St. Peters, MO 63376.
              </Text>
              <Text>
                If you selected to attend your hearing by telephone, your attendance will be facilitated by conference
                call from the hearing location. At or around the time of your hearing, the telephone number provided for
                the primary point of contact will be called, and the audio will be broadcast aloud in the hearing room.
              </Text>
              <Text>
                If you chose to waive the right to attend your hearing, you will be assigned a hearing time, and your
                hearing will be conducted in your absence.
              </Text>
            </div>
          </div>

          <Divider />

          {/* Deferred Scheduling card */}
          <Card>
            <div style={{ padding: 16, display: "grid", gap: 8 }}>
              <Text weight="semibold">Deferred Scheduling</Text>
              <Text>
                A hearing time will be assigned for your appeal and communicated to you by USPS mail, email, or telephone.
              </Text>
            </div>
          </Card>

          <Text size={200} style={{ color: "#5f6a6a" }}>
            Your submission will still be accepted. The clerk will contact you to assign a hearing time.
          </Text>
        </div>

        <CardFooter>
          <Button appearance="secondary" onClick={() => nav(-1)}>
            Back
          </Button>
          <Button appearance="primary" onClick={() => nav("/confirmation")}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
