import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tin_intake_v2";

const emptyContact = {
  fullName: "",
  mailingAddress: "",
  phone: "",
  email: "",
};

const defaultIntake = {
  appeal: {
    accountNumber: "",
    ownerName: "",
    situsAddress: "",
    situsCity: "",
    situsZip: "",
    hearingMode: "IN_PERSON",
    ownerOpinionValue: "",
    narrative: "",
    contacts: {
      owner: { ...emptyContact },
      agent: { ...emptyContact },
      attorney: { ...emptyContact },
      other: { ...emptyContact },
    },
    primaryContactRole: "OWNER",
  },
  uploadsMeta: [], // persisted: [{id,name,size,type}]
  uploads: [],     // in-memory only: [{id,file,name,size,type}]
  scheduling: {
    wantsToSchedule: null, // true/false (kept for future use)
    slot: null,            // later: {start,end}
  },
  signature: {
    pngDataUrl: "",
    signedName: "",
    signedAtIso: "",
  },
  submission: {
    receiptId: "",
    submittedAtIso: "",
  },
};

const IntakeContext = createContext(null);

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function newId() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export function IntakeProvider({ children }) {
  const [intake, setIntake] = useState(() => {
    const persisted = safeParse(localStorage.getItem(STORAGE_KEY));
    if (!persisted) return defaultIntake;

    return {
      ...defaultIntake,
      ...persisted,
      appeal: { ...defaultIntake.appeal, ...(persisted.appeal || {}) },
      scheduling: { ...defaultIntake.scheduling, ...(persisted.scheduling || {}) },
      signature: { ...defaultIntake.signature, ...(persisted.signature || {}) },
      submission: { ...defaultIntake.submission, ...(persisted.submission || {}) },
      uploads: [], // never persisted (File objects cannot be persisted)
      uploadsMeta: Array.isArray(persisted.uploadsMeta) ? persisted.uploadsMeta : [],
    };
  });

  // Derived: if uploadsMeta exists but no uploads, user must reattach files
  const uploadsNeedReattach = useMemo(() => {
    return Array.isArray(intake.uploadsMeta) &&
      intake.uploadsMeta.length > 0 &&
      Array.isArray(intake.uploads) &&
      intake.uploads.length === 0;
  }, [intake.uploadsMeta, intake.uploads]);

  // Persist everything EXCEPT File objects
  useEffect(() => {
    try {
      const { uploads, ...persistable } = intake;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      // ignore
    }
  }, [intake]);

  const api = useMemo(
    () => ({
      intake,
      setIntake,
      uploadsNeedReattach,

      updateAppeal: (patch) =>
        setIntake((prev) => ({ ...prev, appeal: { ...prev.appeal, ...patch } })),

      updateContact: (role, patch) =>
        setIntake((prev) => {
          const contacts = prev.appeal.contacts || {};
          if (!contacts[role]) return prev;
          return {
            ...prev,
            appeal: {
              ...prev.appeal,
              contacts: {
                ...contacts,
                [role]: { ...contacts[role], ...patch },
              },
            },
          };
        }),

      setPrimaryContactRole: (role) =>
        setIntake((prev) => ({
          ...prev,
          appeal: { ...prev.appeal, primaryContactRole: role },
        })),

      setSignature: (sig) =>
        setIntake((prev) => ({ ...prev, signature: { ...prev.signature, ...sig } })),

      setScheduling: (patch) =>
        setIntake((prev) => ({ ...prev, scheduling: { ...prev.scheduling, ...patch } })),

      addUploads: (files) =>
        setIntake((prev) => {
          const additions = Array.from(files || []).map((file) => {
            const id = newId();
            return {
              id,
              file,
              name: file.name,
              size: file.size,
              type: file.type || "application/octet-stream",
            };
          });

          const uploads = [...(prev.uploads || []), ...additions];

          // Keep meta aligned with uploads. If user re-attaches after refresh,
          // we REPLACE meta with current selections (avoid ghost stale meta).
          const uploadsMeta = uploads.map(({ id, name, size, type }) => ({ id, name, size, type }));

          return { ...prev, uploads, uploadsMeta };
        }),

      removeUpload: (id) =>
        setIntake((prev) => {
          const uploads = (prev.uploads || []).filter((u) => u.id !== id);
          const uploadsMeta = (prev.uploadsMeta || []).filter((u) => u.id !== id);
          return { ...prev, uploads, uploadsMeta };
        }),

      setSubmission: (patch) =>
        setIntake((prev) => ({ ...prev, submission: { ...prev.submission, ...patch } })),

      clearAll: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        setIntake(defaultIntake);
      },
    }),
    [intake, uploadsNeedReattach]
  );

  return <IntakeContext.Provider value={api}>{children}</IntakeContext.Provider>;
}

export function useIntake() {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error("useIntake must be used inside <IntakeProvider>");
  return ctx;
}
