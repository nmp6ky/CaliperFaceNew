import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardFooter,
  Button,
  Text,
  Divider,
  RadioGroup,
  Radio,
  Title1,
  Subtitle1,
} from "@fluentui/react-components";
import { useIntake } from "../state/IntakeContext";
import boeLogo from "../assets/boe-logo.png";

const BASE_INTAKE = import.meta.env.VITE_INTAKE_API_BASE_URL || "";
const SLOTS_API_URL =
  import.meta.env.VITE_SLOTS_API_URL ||
  (BASE_INTAKE ? `${BASE_INTAKE.replace(/\/+$/, "")}/api/scheduling/slots` : "/api/scheduling/slots");

function ymd(dateObj, timeZone = "America/Chicago") {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(dateObj);
}
function startOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1);
}
function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
function isWeekdayMonFri(date) {
  const day = date.getDay(); // 0 Sun ... 6 Sat
  return day >= 1 && day <= 5;
}
function formatSelected(dateObj, timeLabel) {
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);
  return `${dateFmt} at ${timeLabel} CST`;
}
function defaultFallbackTimes() {
  return [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
  ].map((t) => ({ label: t }));
}

export default function Scheduling() {
  const nav = useNavigate();
  const intakeApi = useIntake();

  const intake = intakeApi?.intake ?? {};
  const setIntake =
    intakeApi?.setIntake ||
    intakeApi?.updateIntake ||
    intakeApi?.patchIntake ||
    null;

  const scheduling = intake.scheduling ?? {};
  const persistedScheduleNow = scheduling?.scheduleNow; // "YES" | "NO" | undefined
  const persistedSelectedYmd = scheduling?.selectedDateYmd; // "YYYY-MM-DD"
  const persistedSelectedTime = scheduling?.selectedTimeLabel; // "9:00 AM"
  const persistedSlotId = scheduling?.slotId ?? (scheduling?.slot && scheduling.slot.id);

  const now = new Date();
  const defaultYear = Number.isFinite(now.getFullYear()) ? now.getFullYear() : 2026;

  const [viewYear, setViewYear] = useState(defaultYear);
  const [viewMonth, setViewMonth] = useState(6); // July
  const [scheduleNow, setScheduleNowState] = useState(persistedScheduleNow ?? "");
  const [selectedDateYmd, setSelectedDateYmd] = useState(persistedSelectedYmd ?? "");
  const [selectedTimeLabel, setSelectedTimeLabel] = useState(persistedSelectedTime ?? "");
  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");

  const availableDaysSet = useMemo(() => {
    const list = Array.isArray(scheduling.availableDays) ? scheduling.availableDays : null;
    return list ? new Set(list) : null;
  }, [scheduling.availableDays]);

  const availableTimesByDay = scheduling.availableTimesByDay || {};
  const timesForSelectedDay = useMemo(() => {
    if (!selectedDateYmd) return [];
    const fromBackend = Array.isArray(availableTimesByDay[selectedDateYmd])
      ? availableTimesByDay[selectedDateYmd]
      : null;
    return fromBackend ?? [];
  }, [availableTimesByDay, selectedDateYmd]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDateYmd) return null;
    const [y, m, d] = selectedDateYmd.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }, [selectedDateYmd]);

  const selectionSummary = useMemo(() => {
    if (!selectedDateObj || !selectedTimeLabel) return "";
    return formatSelected(selectedDateObj, selectedTimeLabel);
  }, [selectedDateObj, selectedTimeLabel]);

  function persistSchedulingPatch(patch) {
    if (!setIntake) return;
    try {
      setIntake((prev) => {
        const prevObj = prev ?? intake;
        return {
          ...prevObj,
          scheduling: {
            ...(prevObj.scheduling ?? {}),
            ...patch,
          },
        };
      });
    } catch {
      const next = {
        ...intake,
        scheduling: {
          ...(intake.scheduling ?? {}),
          ...patch,
        },
      };
      setIntake(next);
    }
  }

  async function fetchOpenSlots() {
    setLoadingSlots(true);
    setSlotError("");
    try {
      const resp = await fetch(SLOTS_API_URL, { headers: { Accept: "application/json" } });
      if (!resp.ok) {
        const bodyText = await resp.text();
        const err = new Error(`Slots endpoint responded ${resp.status}`);
        err.body = bodyText;
        throw err;
      }
      const data = await resp.json();
      const slots = Array.isArray(data) ? data : data?.results || [];

      const openSlots = slots.filter((s) => (s.status || "").toUpperCase() === "OPEN");

      const timesByDay = {};
      const dayList = new Set();

      openSlots.forEach((slot) => {
        if (!slot.start_at) return;
        const start = new Date(slot.start_at);
        if (Number.isNaN(start.getTime())) return;
        const key =
          typeof slot.start_at === "string" && slot.start_at.length >= 10
            ? slot.start_at.slice(0, 10)
            : ymd(start, "America/Chicago");
        dayList.add(key);

        const timeLabel = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "America/Chicago",
        }).format(start);

        const item = {
          id: slot.id,
          label: timeLabel,
          start: slot.start_at,
          end: slot.end_at || "",
        };
        if (!timesByDay[key]) timesByDay[key] = [];
        timesByDay[key].push(item);
      });

      Object.values(timesByDay).forEach((arr) => arr.sort((a, b) => new Date(a.start) - new Date(b.start)));

      const daysArray = Array.from(dayList).sort();
      persistSchedulingPatch({
        availableDays: daysArray,
        availableTimesByDay: timesByDay,
      });

      if (selectedDateYmd && !dayList.has(selectedDateYmd)) {
        setSelectedDateYmd("");
        setSelectedTimeLabel("");
        persistSchedulingPatch({ selectedDateYmd: "", selectedTimeLabel: "", slot: null });
      } else if (selectedDateYmd && selectedTimeLabel) {
        const arr = timesByDay[selectedDateYmd] || [];
        const stillExists = arr.some((t) => t.label === selectedTimeLabel);
        if (!stillExists) {
          setSelectedTimeLabel("");
          persistSchedulingPatch({ selectedTimeLabel: "", slot: null });
        }
      }
    } catch (err) {
      console.error("Scheduling: failed to fetch open slots", {
        error: err,
        message: err?.message,
        status: err?.status || err?.httpStatus,
        body: err?.body,
        url: SLOTS_API_URL,
      });
      setSlotError("We could not load available hearing times right now. You can continue and staff will contact you.");
    } finally {
      setLoadingSlots(false);
    }
  }

  useMemo(() => {
    fetchOpenSlots();
  }, []);

  useMemo(() => {
    if (scheduleNow === "YES" && !persistedSlotId) {
      setSelectedDateYmd("");
      setSelectedTimeLabel("");
      persistSchedulingPatch({ selectedDateYmd: "", selectedTimeLabel: "", slot: null, slotId: null });
    }
  }, [scheduleNow, persistedSlotId]);

  function handleScheduleNowChange(_, data) {
    const value = data.value; // "YES" | "NO"
    setScheduleNowState(value);
    persistSchedulingPatch({ scheduleNow: value });

    if (value === "NO") {
      setSelectedDateYmd("");
      setSelectedTimeLabel("");
      persistSchedulingPatch({
        selectedDateYmd: "",
        selectedTimeLabel: "",
        slot: null,
      });
    }
  }

  function handlePickDay(dateObj) {
    const key = ymd(dateObj);
    setSelectedDateYmd(key);
    setSelectedTimeLabel("");
    persistSchedulingPatch({
      selectedDateYmd: key,
      selectedTimeLabel: "",
      slot: null,
      slotId: null,
    });
  }

  function handlePickTime(time) {
    setSelectedTimeLabel(time.label);

    const dateStr = selectedDateYmd || "";
    const slot = {
      id: typeof time.id === "number" ? time.id : Number(time.id) || null,
      date: dateStr,
      label: time.label,
      start: time.start || "",
      end: time.end || "",
    };

    persistSchedulingPatch({
      selectedTimeLabel: time.label,
      slotId: typeof time.id === "number" ? time.id : Number(time.id) || null,
      slot,
    });
  }

  function handleContinue() {
    setAttemptedContinue(true);
    if (!scheduleNow) return;

    if (scheduleNow === "YES") {
      if (!selectedDateYmd || !selectedTimeLabel) return;
    }

    nav("/confirmation");
  }

  const calendar = useMemo(() => {
    const first = startOfMonth(viewYear, viewMonth);
    const total = daysInMonth(viewYear, viewMonth);

    const firstDow = first.getDay();
    const firstMonIndex = (firstDow + 6) % 7;

    const fullCells = [];
    for (let i = 0; i < firstMonIndex; i++) fullCells.push(null);
    for (let day = 1; day <= total; day++) fullCells.push(new Date(viewYear, viewMonth, day));
    while (fullCells.length % 7 !== 0) fullCells.push(null);

    const weeks = [];
    for (let i = 0; i < fullCells.length; i += 7) {
      const week = fullCells.slice(i, i + 7);
      weeks.push(week.slice(0, 5));
    }

    return weeks;
  }, [viewYear, viewMonth]);

  const monthTitle = useMemo(() => {
    const dt = new Date(viewYear, viewMonth, 1);
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(dt);
  }, [viewYear, viewMonth]);

  function goPrevMonth() {
    const m = viewMonth - 1;
    if (m < 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth(m);
    }
  }

  function goNextMonth() {
    const m = viewMonth + 1;
    if (m > 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth(m);
    }
  }

  const dayBtnStyle = {
    width: 40,
    height: 40,
    minWidth: 40,
    padding: 0,
    justifyContent: "center",
  };

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
            Confirm how you want to handle your hearing time. You can proceed now and staff will follow up if needed.
          </Text>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 14 }}>
          {/* (1) Hearing Location & Attendance Details */}
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
                If you chose to waive the right to attend your hearing, you will be assigned a hearing time and your
                hearing will be conducted in your absence.
              </Text>
            </div>
          </div>

          <Divider />

          {/* (2) Required schedule-now question */}
          <div style={{ display: "grid", gap: 8 }}>
            <Text weight="semibold">Would you like to schedule your hearing time now?</Text>

            <RadioGroup
              layout="horizontal"
              value={scheduleNow}
              onChange={handleScheduleNowChange}
              aria-label="Would you like to schedule your hearing time now?"
            >
              <Radio value="YES" label="Yes" />
              <Radio value="NO" label="No" />
            </RadioGroup>

            {attemptedContinue && !scheduleNow ? (
              <Text size={200} style={{ color: "#b10e1c" }}>
                This field is required.
              </Text>
            ) : null}
          </div>

          {/* (3) Pick a Hearing Time OR Deferred View */}
          {scheduleNow === "NO" ? (
            <Card>
              <div style={{ padding: 16, display: "grid", gap: 8 }}>
                <Text weight="semibold">Deferred Scheduling</Text>
                <Text>
                  A hearing time will be assigned for your appeal and communicated to you by USPS mail, email, or telephone.
                </Text>
              </div>
            </Card>
          ) : scheduleNow === "YES" ? (
            <div style={{ display: "grid", gap: 12 }}>
              <Text weight="semibold">Pick a hearing time</Text>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 12,
                  alignItems: "start",
                }}
              >
                {/* Calendar (Mon–Fri only) */}
                <Card>
                  <div style={{ padding: 12, display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <Button appearance="secondary" onClick={goPrevMonth}>
                        Prev
                      </Button>
                      <Text weight="semibold">{monthTitle}</Text>
                      <Button appearance="secondary" onClick={goNextMonth}>
                        Next
                      </Button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                        <Text key={d} size={200} style={{ textAlign: "center", color: "#5f6a6a" }}>
                          {d}
                        </Text>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 6,
                        justifyItems: "center",
                      }}
                    >
                      {calendar.flat().map((dateObj, idx) => {
                        if (!dateObj) return <div key={`blank-${idx}`} style={dayBtnStyle} />;

                        const key = ymd(dateObj);
                        const allowedByBackend = availableDaysSet ? availableDaysSet.has(key) : true;
                        const allowed = isWeekdayMonFri(dateObj) && allowedByBackend;
                        const isSelected = selectedDateYmd === key;

                        return (
                          <Button
                            key={key}
                            size="small"
                            appearance={isSelected ? "primary" : "secondary"}
                            disabled={!allowed}
                            onClick={() => handlePickDay(dateObj)}
                            style={dayBtnStyle}
                            title={allowed ? "Select day" : "Unavailable"}
                          >
                            {dateObj.getDate()}
                          </Button>
                        );
                      })}
                    </div>

                    <Text size={200} style={{ color: "#5f6a6a" }}>
                      Only Monday–Friday hearing days are selectable.
                    </Text>
                  </div>
                </Card>

                {/* Available times */}
                <Card>
                  <div style={{ padding: 12, display: "grid", gap: 10 }}>
                    <Text weight="semibold">Available times</Text>

                    {!selectedDateYmd ? (
                      <Text size={200} style={{ color: "#5f6a6a" }}>
                        Select a day on the left to view available hearing times.
                      </Text>
                    ) : timesForSelectedDay.length === 0 ? (
                      <Text size={200} style={{ color: "#b10e1c" }}>
                        No times are available for the selected day.
                      </Text>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {timesForSelectedDay.map((t) => {
                          const isSelected = selectedTimeLabel === t.label;
                          return (
                            <Button
                              key={t.label}
                              appearance={isSelected ? "primary" : "secondary"}
                              onClick={() => handlePickTime(t)}
                            >
                              {t.label}
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    {attemptedContinue && scheduleNow === "YES" && (!selectedDateYmd || !selectedTimeLabel) ? (
                      <Text size={200} style={{ color: "#b10e1c" }}>
                        Please select a hearing day and time.
                      </Text>
                    ) : null}
                  </div>
                </Card>
              </div>

              {/* Selected Hearing Time card */}
              {selectedDateObj && selectedTimeLabel ? (
                <Card>
                  <div style={{ padding: 16, display: "grid", gap: 6 }}>
                    <Text weight="semibold">Selected Hearing Time:</Text>
                    <Text>{selectionSummary}</Text>
                  </div>
                </Card>
              ) : null}

              <Divider />

              <Text size={200} style={{ color: "#5f6a6a" }}>
                If online self-scheduling is unavailable, your submission will still be accepted. The clerk will contact
                you to assign a hearing time.
              </Text>
              {slotError ? (
                <Text size={200} style={{ color: "#b10e1c" }}>
                  {slotError}
                </Text>
              ) : null}
              {loadingSlots ? <Text size={200} style={{ color: "#5f6a6a" }}>Loading available times…</Text> : null}
            </div>
          ) : (
            <Text size={200} style={{ color: "#5f6a6a" }}>
              Select “Yes” or “No” above to continue.
            </Text>
          )}
        </div>

        <CardFooter>
          <Button appearance="secondary" onClick={() => nav(-1)}>
            Back
          </Button>
          <Button appearance="primary" onClick={handleContinue}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
