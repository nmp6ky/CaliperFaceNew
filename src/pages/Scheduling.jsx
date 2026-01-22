// Scheduling.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardFooter,
  Button,
  Text,
  Divider,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext.jsx";

function pad2(n) {
  return String(n).padStart(2, "0");
}
function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseISODate(iso) {
  const s = String(iso || "").trim();
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function isWeekend(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Placeholder availability: weekday slots every 30 minutes.
 * Swap this later with an API call (Bookings / your Django slots endpoint).
 */
function getSlotsForDay(date) {
  if (!date) return [];
  if (isWeekend(date)) return [];

  // block past dates
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const selMid = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (selMid.getTime() < todayMid.getTime()) return [];

  const slots = [];
  const pushRange = (startH, startM, endH, endM) => {
    let h = startH;
    let m = startM;
    while (h < endH || (h === endH && m <= endM)) {
      slots.push(`${pad2(h)}:${pad2(m)}`);
      m += 30;
      if (m >= 60) {
        m = 0;
        h += 1;
      }
    }
  };

  // Example blocks
  pushRange(9, 0, 11, 30);
  pushRange(13, 0, 16, 0);

  return slots;
}

export default function Scheduling() {
  const nav = useNavigate();
  const { intake, updateScheduling } = useIntake();

  const s = intake.scheduling || {
    selectedDateISO: "",
    selectedTime: "",
  };

  const selectedDate = useMemo(() => parseISODate(s.selectedDateISO), [s.selectedDateISO]);

  // month view anchor
  const initialMonth = useMemo(() => startOfMonth(selectedDate || new Date()), [selectedDate]);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  useEffect(() => {
    setViewMonth(startOfMonth(selectedDate || new Date()));
  }, [selectedDate?.getFullYear(), selectedDate?.getMonth()]);

  function set(partial) {
    updateScheduling({ ...s, ...partial });
  }

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const gridStart = addDays(monthStart, -monthStart.getDay()); // Sunday
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [viewMonth]);

  const monthLabel = useMemo(
    () => viewMonth.toLocaleString(undefined, { month: "long", year: "numeric" }),
    [viewMonth]
  );

  const slots = useMemo(() => getSlotsForDay(selectedDate), [selectedDate]);

  const canContinue = Boolean(s.selectedDateISO && s.selectedTime);

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Select a Hearing Time</Text>}
          description={
            <Text>
              Choose a date and an available time slot.
            </Text>
          }
        />

        <div style={{ padding: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            {/* Calendar */}
            <Card style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <Button appearance="secondary" onClick={() => setViewMonth(startOfMonth(addMonths(viewMonth, -1)))}>
                  {"<"}
                </Button>
                <Text weight="semibold">{monthLabel}</Text>
                <Button appearance="secondary" onClick={() => setViewMonth(startOfMonth(addMonths(viewMonth, 1)))}>
                  {">"}
                </Button>
              </div>

              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <Text key={d} size={200} style={{ textAlign: "center", opacity: 0.8 }}>
                    {d}
                  </Text>
                ))}

                {days.map((d) => {
                  const inMonth = d.getMonth() === viewMonth.getMonth();
                  const disabled = !inMonth || isWeekend(d);
                  const isSelected = selectedDate && isSameDay(d, selectedDate);

                  return (
                    <Button
                      key={d.toISOString()}
                      appearance={isSelected ? "primary" : "secondary"}
                      disabled={disabled}
                      onClick={() => set({ selectedDateISO: toISODate(d), selectedTime: "" })}
                      style={{
                        minWidth: 0,
                        padding: "8px 0",
                        justifyContent: "center",
                        opacity: inMonth ? 1 : 0.4,
                      }}
                    >
                      {d.getDate()}
                    </Button>
                  );
                })}
              </div>

              <Text size={200} style={{ marginTop: 10, opacity: 0.85 }}>
                Weekends are not available. Select a weekday to see time slots.
              </Text>
            </Card>

            {/* Time slots */}
            <Card style={{ padding: 12 }}>
              <Text weight="semibold">Available times</Text>

              <Text size={200} style={{ marginTop: 6, opacity: 0.85 }}>
                {selectedDate ? (
                  <>Selected day: {selectedDate.toLocaleDateString()}</>
                ) : (
                  <>Select a date to view times.</>
                )}
              </Text>

              <Divider style={{ marginTop: 10 }} />

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {selectedDate && slots.length === 0 ? (
                  <Text size={200}>
                    No times available for this day. Please choose another date.
                  </Text>
                ) : null}

                {slots.map((t) => {
                  const selected = s.selectedTime === t;
                  return (
                    <Button
                      key={t}
                      appearance={selected ? "primary" : "secondary"}
                      onClick={() => set({ selectedTime: t })}
                      disabled={!selectedDate}
                      style={{ justifyContent: "flex-start" }}
                    >
                      {t}
                    </Button>
                  );
                })}
              </div>

              <Text size={200} style={{ marginTop: 12, opacity: 0.85 }}>
                Your selected time will be confirmed by the Board.
              </Text>
            </Card>
          </div>
        </div>

        <CardFooter>
          <Button appearance="secondary" onClick={() => nav(-1)}>Back</Button>
          <Button appearance="primary" disabled={!canContinue} onClick={() => nav("/confirm")}>
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
