import assert from "node:assert/strict";
import test from "node:test";
import { normalizeNamibianPhone } from "./phone";
import { addonLineTotal, calculateAppointment, resolveServicePrice, specialApplies } from "./pricing";
import { makeReference } from "./reference";
import { classifyDay, generateSlots, slotTakenByBooking } from "./slots";
import { intervalsOverlap, timeToMinutes } from "./time";
import { isValidDateString } from "../dates";

test("touching appointments do not overlap", () => {
  assert.equal(intervalsOverlap({ start: 60, end: 120 }, { start: 120, end: 180 }), false);
  assert.equal(intervalsOverlap({ start: 90, end: 150 }, { start: 120, end: 180 }), true);
});

test("90 minute service avoids an 11:00 to 12:30 booking", () => {
  const slots = generateSlots({
    openTime: "09:00",
    closeTime: "17:00",
    durationMinutes: 90,
    stepMinutes: 30,
    breaks: [],
    blocks: [],
    bookings: [{ start: timeToMinutes("11:00"), end: timeToMinutes("12:30") }],
  });
  assert.equal(slots.includes("09:00"), true);
  assert.equal(slots.includes("09:30"), true);
  assert.equal(slots.includes("10:00"), false);
  assert.equal(slots.includes("11:00"), false);
  assert.equal(slots.includes("12:00"), false);
  assert.equal(slots.includes("12:30"), true);
  assert.equal(slots.includes("15:30"), true);
  assert.equal(slots.includes("16:00"), false);
});

test("slots do not cross closing time", () => {
  const slots = generateSlots({
    openTime: "09:00",
    closeTime: "17:00",
    durationMinutes: 60,
    stepMinutes: 60,
    breaks: [],
    blocks: [],
    bookings: [],
  });
  assert.equal(slots.at(-1), "16:00");
  assert.equal(slots.includes("17:00"), false);
});

test("breaks and blocks remove overlapping slots", () => {
  const slots = generateSlots({
    openTime: "09:00",
    closeTime: "17:00",
    durationMinutes: 60,
    stepMinutes: 60,
    breaks: [{ start: timeToMinutes("13:00"), end: timeToMinutes("14:00") }],
    blocks: [{ start: timeToMinutes("15:00"), end: timeToMinutes("16:00") }],
    bookings: [],
  });
  assert.equal(slots.includes("12:00"), true);
  assert.equal(slots.includes("13:00"), false);
  assert.equal(slots.includes("14:00"), true);
  assert.equal(slots.includes("15:00"), false);
});

test("day classification", () => {
  assert.equal(classifyDay({ date: "2026-09-01", today: "2026-09-02", isOpen: true, allDayBlocked: false, slots: ["09:00"] }), "past");
  assert.equal(classifyDay({ date: "2026-09-02", today: "2026-09-02", isOpen: false, allDayBlocked: false, slots: [] }), "closed");
  assert.equal(classifyDay({ date: "2026-09-02", today: "2026-09-02", isOpen: true, allDayBlocked: true, slots: [] }), "blocked");
  assert.equal(classifyDay({ date: "2026-09-02", today: "2026-09-02", isOpen: true, allDayBlocked: false, slots: [] }), "full");
  assert.equal(classifyDay({ date: "2026-09-02", today: "2026-09-02", isOpen: true, allDayBlocked: false, slots: ["09:00"] }), "available");
});

test("slot taken message condition", () => {
  const bookings = [{ start: timeToMinutes("14:00"), end: timeToMinutes("15:00") }];
  assert.equal(slotTakenByBooking("14:00", 60, bookings), true);
  assert.equal(slotTakenByBooking("15:00", 60, bookings), false);
});

test("quantity and fixed add-ons", () => {
  assert.equal(addonLineTotal("quantity", 10, 4), 40);
  assert.equal(addonLineTotal("fixed", 25, 4), 25);
  const totals = calculateAppointment([
    {
      price: 160,
      durationMinutes: 60,
      depositAmount: null,
      addons: [{ pricingType: "quantity", unitPrice: 10, quantity: 3 }],
    },
    {
      price: 90,
      durationMinutes: 45,
      depositAmount: 50,
      addons: [],
    },
  ]);
  assert.deepEqual(totals, { total: 280, duration: 105, deposit: 50 });
});

test("specials stop applying after the end date", () => {
  const special = { active: true, startDate: "2026-09-01", endDate: "2026-09-20", specialPrice: 250 };
  assert.equal(specialApplies(special, "2026-09-20"), true);
  assert.equal(specialApplies(special, "2026-09-21"), false);
  assert.equal(specialApplies({ ...special, active: false }, "2026-09-10"), false);
  assert.equal(resolveServicePrice(280, special, "2026-09-10"), 250);
  assert.equal(resolveServicePrice(280, special, "2026-09-21"), 280);
});

test("Namibian phone numbers normalize to +264", () => {
  assert.equal(normalizeNamibianPhone("081 222 8178"), "+264812228178");
  assert.equal(normalizeNamibianPhone("0812228178"), "+264812228178");
  assert.equal(normalizeNamibianPhone("+264 81 822 8178"), "+264818228178");
  assert.equal(normalizeNamibianPhone("264818228178"), "+264818228178");
  assert.equal(normalizeNamibianPhone("818228178"), "+264818228178");
  assert.equal(normalizeNamibianPhone("00264818228178"), "+264818228178");
  assert.equal(normalizeNamibianPhone("123"), null);
  assert.equal(normalizeNamibianPhone("+1 202 555 0143"), null);
});

test("references stay short and dated", () => {
  assert.equal(makeReference("2026-09-22", 1), "EB-260922-01");
  assert.equal(makeReference("2024-09-12", 12), "EB-240912-12");
});

test("invalid calendar dates are rejected", () => {
  assert.equal(isValidDateString("2026-02-31"), false);
  assert.equal(isValidDateString("2026-09-22"), true);
});
