import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardFooter, Button, Text } from "@fluentui/react-components";

export default function ServiceDown() {
  const nav = useNavigate();

  return (
    <div style={{ maxWidth: 860, margin: "40px auto", padding: 16 }}>
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Service Unavailable</Text>}
          description={<Text>The appeal submission service is temporarily unavailable.</Text>}
        />
        <div style={{ padding: 16, display: "grid", gap: 10 }}>
          <Text>Please try again in a few minutes.</Text>
          <Text>
            If a deadline is near, contact the Board directly using the official phone/email for filing guidance.
          </Text>
          <Text size={200}>This page should not reveal internal errors to the public.</Text>
        </div>
        <CardFooter>
          <Button appearance="secondary" onClick={() => nav(-1)}>Try again</Button>
          <Button appearance="primary" onClick={() => nav("/landing")}>Return to start</Button>
        </CardFooter>
      </Card>
    </div>
  );
}