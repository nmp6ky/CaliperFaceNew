import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  Divider,
  Title1,
  Subtitle1,
  Body1,
} from "@fluentui/react-components";
import boeLogo from "../assets/boe-logo.png";

export default function Landing() {
  const nav = useNavigate();

  const COLLECTOR_URL = "https://www.stcharlesmocollector.com/#/WildfireSearch";
  const AGENT_FORM_URL =
    "https://www.sccmo.org/DocumentCenter/View/540/Agent-Authorization-Form-PDF?bidId=";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "var(--colorNeutralBackground2)",
      }}
    >
      <div style={{ width: "min(980px, 100%)" }}>
        <Card>
          {/* Header block above the form title */}
          <div style={{ padding: 24, paddingBottom: 0 }}>
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

            <Title1>Property Assessment Appeal Form</Title1>
          </div>

          <div style={{ padding: 24, paddingTop: 16 }}>
            {/* Single advisory card */}
            <Card
              style={{
                borderLeft: "6px solid #c50f1f",
                background: "#fff5f5",
                marginBottom: 16,
              }}
            >
              <div style={{ padding: 16 }}>
                <Body1>
                  Appeals must be received by the second Monday in July of the current
                  assessment year. Postmarks are not accepted as proof of timely filing.
                  Submit a separate appeal form for each piece of property you are appealing.
                </Body1>
              </div>
            </Card>

            <div style={{ height: 12 }} />
            <Divider />
            <div style={{ height: 20 }} />

            <Title1 style={{ fontSize: 22 }}>Before You Start</Title1>

            <div style={{ height: 12 }} />

            <Body1>
              Have your property account number ready. The account number is 8 to 10
              characters long, and you will be required to enter it to submit an appeal through
              this site. You can find it on your Notice of Reassessment, or by searching the
              Collector of Revenue website here:
            </Body1>

            <div style={{ height: 10 }} />

            <Button
              appearance="secondary"
              as="a"
              href={COLLECTOR_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Collector of Revenue Website
            </Button>

            <div style={{ height: 12 }} />

            <Body1>
              If you are not listed as an owner on the property you are appealing, you
              must submit an Agent Authorization form. This form must include the property
              owner's contact information and signature authorizing you to represent them in
              this matter. The Agent Authorization form can be found here:
            </Body1>

            <div style={{ height: 10 }} />

            <Button
              appearance="secondary"
              as="a"
              href={AGENT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Agent Authorization Form
            </Button>

            <div style={{ height: 12 }} />

            <Body1>
              If you have supporting materials you want the Board to review, please have them ready
              to upload. Examples include photos, repair estimates, appraisals, comparable
              sales, and any documentation supporting your opinion of value.
            </Body1>

            <div style={{ height: 20 }} />
            <Divider />

            <Title1 style={{ fontSize: 22, marginTop: 20 }}>Important Hearing Information</Title1>

            <div style={{ height: 12 }} />

            <Body1>
              Property owners who disagree with the Assessor's Notice of Value Change can appeal that
              decision to the Board of Equalization (BOE). The deadline to petition the BOE is the second
              Monday in July. You may submit your appeal by mail or in person. However, it must arrive by
              the second Monday in July. A postmark on the deadline does not qualify as timely.
            </Body1>

            <div style={{ height: 12 }} />

            <Body1>
              The mission of the BOE is to provide a fair and impartial venue for property owners to
              challenge the valuation and classification of real and personal property that is subject to
              taxation.
            </Body1>

            <div style={{ height: 12 }} />

            <Body1>
              The BOE is charged with hearing appeals, including but not limited to determinations of real
              and personal property, exemption denials, and current use determinations. Members of the BOE
              also are responsible for assuring that all real and personal property entered on the County's
              assessment roll is at true and fair market value.
            </Body1>

            <div style={{ height: 12 }} />

            <Body1>
              Tax relief for qualified citizens is available through the Missouri Property Tax Credit Claim
              (MO-PTC). This program is administered by the Missouri Department of Revenue.
            </Body1>

            <div style={{ height: 12 }} />

            <Body1>
              If your concern is the amount of tax you pay, the BOE does not have authority to change the
              amount. Although value and tax are interrelated, the process for determining each part is
              separate. The focus of the BOE is to determine the fair and equitable value regardless of the
              tax amount.
            </Body1>

            <div style={{ height: 12 }} />

            <Body1>
              There are several conditions or situations under which property value(s) may be affected. The
              most important information in determining real property value are the facts about the
              property. The metrics used in value estimates include land area, size of home, age, rooms,
              bathroom count, basement area and finish, garage area, and amenities such as patio, deck,
              fireplace, pool, outbuildings, etc. This is factual data. Verifying this data at
              lookups.sccmo.org/assessor or using the QR code on your notice will narrow the focus of
              dispute.
            </Body1>

            <div style={{ height: 12 }} />

            <Body1>
              The BOE will hear evidence and review supporting documentation from the property owner and
              the Assessor's office and ask pertinent questions that may assist in determining the fair
              market value. Documentation or valuation evidence may include photographs of the interior,
              exterior, and surrounding area; recent comparable sale prices or appraisal; comparable
              assessments; current rental amounts; current expenses; adverse conditions or estimates of
              cost to cure deficiencies. After hearing all the evidence, the BOE will deliberate and render
              a decision based on the evidence presented. You will be notified of this decision in writing.
              The meetings are recorded.
            </Body1>

            <div style={{ height: 12 }} />

            <Body1>
              If you submitted evidence during an informal hearing with the Assessor's office, you would
              need to submit the evidence again to the BOE with your appeal form. The BOE is not affiliated
              with the Assessor's office. Any evidence you submitted to the Assessor for your informal
              hearing will not be shared with the BOE.
            </Body1>

            <div style={{ height: 12 }} />

            <Body1>
              If you are an agent representing a property owner, mandatory license law prohibits any person
              who is not licensed or certified by the Missouri Real Estate Appraisers Commission as
              provided in Sections 339.500 to 339.549, RSMo, to, for a fee, develop and communicate a real
              estate appraisal before the State Tax Commission or a local BOE unless such person is exempt
              from licensure and certification pursuant to Section 339.501.5, RSMo Supp. 1998 (OPINION NO.
              79-99).
            </Body1>

            <div style={{ height: 24 }} />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button appearance="primary" onClick={() => nav("/appeal")}>
                Start an appeal
              </Button>
              <Button appearance="secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Back to top
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
