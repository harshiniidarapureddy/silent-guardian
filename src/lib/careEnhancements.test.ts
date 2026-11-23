import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_HOSPITAL_SPECIAL_DEVICES,
  adjustHospitalDeviceStock,
  assignHospitalDeviceUnit,
  computeAvailableUnits,
  computeStockStatus,
  getWhereToBuyGuide,
  loadHospitalSpecialDevices,
  returnHospitalDeviceUnit,
  saveHospitalSpecialDevices,
} from "./specialDevicesLogic";
import {
  AWARENESS_LANGUAGES,
  PREDEFINED_AWARENESS_VIDEOS,
  createAwarenessVideo,
  filterAwarenessVideos,
  formatVideoTime,
  getActiveChapterAndCaption,
  loadAwarenessVideos,
  saveAwarenessVideos,
  toggleAwarenessVideoStatus,
} from "./awarenessVideoCatalog";

function createMockStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

test("Hospital Special Devices inventory math computes stock status, adjusts stock safely, and assigns/returns units", () => {
  assert.equal(INITIAL_HOSPITAL_SPECIAL_DEVICES.length, 10);
  const vitalsDevices = INITIAL_HOSPITAL_SPECIAL_DEVICES.filter(
    (d) => d.category === "Vitals & Health Monitoring"
  );
  assert.equal(vitalsDevices.length, 5);

  // Verify initial status classification covers In Stock, Low Stock, and Out of Stock
  const glasses = INITIAL_HOSPITAL_SPECIAL_DEVICES.find((d) => d.id === "hsd-vision-glasses")!;
  const pagers = INITIAL_HOSPITAL_SPECIAL_DEVICES.find((d) => d.id === "hsd-visual-pagers")!;
  const switches = INITIAL_HOSPITAL_SPECIAL_DEVICES.find((d) => d.id === "hsd-voice-switches")!;

  assert.equal(computeStockStatus(computeAvailableUnits(glasses), glasses.lowStockThreshold), "In Stock");
  assert.equal(computeStockStatus(computeAvailableUnits(pagers), pagers.lowStockThreshold), "Out of Stock");
  assert.equal(computeStockStatus(computeAvailableUnits(switches), switches.lowStockThreshold), "Low Stock");

  // Assign a unit of glasses -> assigned increases by 1, available decreases by 1
  const afterAssign = assignHospitalDeviceUnit(INITIAL_HOSPITAL_SPECIAL_DEVICES, glasses.id);
  const updatedGlasses = afterAssign.find((d) => d.id === glasses.id)!;
  assert.equal(updatedGlasses.assignedUnits, glasses.assignedUnits + 1);
  assert.equal(computeAvailableUnits(updatedGlasses), computeAvailableUnits(glasses) - 1);

  // Return a unit -> restores assigned count
  const afterReturn = returnHospitalDeviceUnit(afterAssign, glasses.id);
  assert.equal(afterReturn.find((d) => d.id === glasses.id)!.assignedUnits, glasses.assignedUnits);

  // Cannot reduce total stock below assigned units
  const afterAttemptBelow = adjustHospitalDeviceStock(INITIAL_HOSPITAL_SPECIAL_DEVICES, pagers.id, -5);
  assert.equal(afterAttemptBelow.find((d) => d.id === pagers.id)!.totalStock, pagers.assignedUnits);

  // Restocking Out of Stock pagers by +5 brings them back In Stock
  const afterRestock = adjustHospitalDeviceStock(INITIAL_HOSPITAL_SPECIAL_DEVICES, pagers.id, 5);
  const restockedPagers = afterRestock.find((d) => d.id === pagers.id)!;
  assert.equal(computeAvailableUnits(restockedPagers), 5);
  assert.equal(computeStockStatus(computeAvailableUnits(restockedPagers), restockedPagers.lowStockThreshold), "In Stock");

  // Persistence round-trip
  const storage = createMockStorage();
  saveHospitalSpecialDevices(afterRestock, storage);
  const reloaded = loadHospitalSpecialDevices(storage);
  assert.equal(reloaded.find((d) => d.id === pagers.id)!.totalStock, pagers.totalStock + 5);
});

test("Where to Buy guides return verified purchase channels, price ranges, and availability types for all devices", () => {
  const keys = [
    "smart-vision-glasses",
    "digital-hearing-aids",
    "bone-conduction-headsets",
    "visual-vibrating-pagers",
    "hands-free-voice-switches",
    "bp-monitor",
    "pulse-oximeter",
    "glucometer",
    "ir-thermometer",
    "nebulizer-ecg",
    "AI Smart Vision Glasses",
    "Bluetooth Hearing Aid",
    "Digital Blood Pressure (BP) Monitor",
    "Fingertip Pulse Oximeter (SpO2 & Heart Rate)",
    "Blood Glucose Monitor (Glucometer)",
    "Digital / Infrared Thermometer",
    "Portable Nebulizer & Compact ECG Monitor",
  ];
  for (const key of keys) {
    const guide = getWhereToBuyGuide(key);
    assert.ok(guide.estimatedPriceRange.length > 5);
    assert.ok(guide.availabilityTypes.length >= 2);
    assert.ok(guide.channels.length >= 3);
    assert.ok(guide.channels.every((c) => c.url.startsWith("https://")));
  }
});

test("Multilingual Awareness Catalog supports 6 languages, synced captions, filtering, and Admin publish/add flow", () => {
  assert.deepEqual(
    AWARENESS_LANGUAGES.map((l) => l.code),
    ["en", "hi", "te", "ta", "kn", "es"]
  );
  assert.equal(PREDEFINED_AWARENESS_VIDEOS.length, 6);
  assert.equal(formatVideoTime(255), "04:15");

  // Verify every video has captions in all 6 languages
  for (const vid of PREDEFINED_AWARENESS_VIDEOS) {
    for (const lang of AWARENESS_LANGUAGES) {
      const { caption } = getActiveChapterAndCaption(vid, 10, lang.code);
      assert.ok(caption.length > 15, `Missing ${lang.code} caption for ${vid.id}`);
    }
  }

  // Verify chapter synchronization changes by timestamp
  const svgVid = PREDEFINED_AWARENESS_VIDEOS[0];
  const chStart = getActiveChapterAndCaption(svgVid, 12, "te");
  const chMid = getActiveChapterAndCaption(svgVid, 90, "te");
  assert.equal(chStart.chapterIndex, 0);
  assert.equal(chMid.chapterIndex, 1);
  assert.notEqual(chStart.caption, chMid.caption);

  // Admin toggle Published -> Draft hides video from patient publishedOnly filter
  const toggled = toggleAwarenessVideoStatus(PREDEFINED_AWARENESS_VIDEOS, svgVid.id);
  assert.equal(toggled.find((v) => v.id === svgVid.id)!.published, false);
  const patientVisible = filterAwarenessVideos(toggled, { publishedOnly: true });
  assert.equal(patientVisible.length, PREDEFINED_AWARENESS_VIDEOS.length - 1);

  // Admin creates new video & persists
  const added = createAwarenessVideo({
    title: "Using Vibrating Pagers at Home & Hospital",
    category: "Assistive Technology Guides",
    description: "Practical guide to pairing vibrating alert pagers with Care Preempt.",
    durationSec: 195,
    medicalSource: "Care Preempt Clinical Board",
    languages: ["en", "kn", "ta"],
    published: true,
  });
  const storage = createMockStorage();
  saveAwarenessVideos([added, ...toggled], storage);
  const loaded = loadAwarenessVideos(storage);
  assert.equal(loaded.length, PREDEFINED_AWARENESS_VIDEOS.length + 1);
  const kannadaOnly = filterAwarenessVideos(loaded, { language: "kn", publishedOnly: true });
  assert.ok(kannadaOnly.some((v) => v.id === added.id));
});
