import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Glasses,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  adjustHospitalDeviceStock,
  assignHospitalDeviceUnit,
  computeAvailableUnits,
  computeStockStatus,
  getWhereToBuyGuide,
  loadHospitalSpecialDevices,
  returnHospitalDeviceUnit,
  saveHospitalSpecialDevices,
  type HospitalDeviceCategory,
  type HospitalSpecialDevice,
  type StockStatus,
  type WhereToBuyGuide,
} from "../../lib/specialDevicesLogic";
import { WhereToBuyDrawer } from "../shared/WhereToBuyDrawer";

const STATUS_FILTERS: Array<StockStatus | "All"> = [
  "All",
  "In Stock",
  "Low Stock",
  "Out of Stock",
];

const CATEGORY_FILTERS: Array<HospitalDeviceCategory | "All"> = [
  "All",
  "Accessibility & Sensory",
  "Vitals & Health Monitoring",
];

function StatusIndicator({ status }: { status: StockStatus }) {
  if (status === "Out of Stock") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
        <XCircle size={14} className="text-red-600 shrink-0" aria-hidden="true" />
        <span>Out of Stock</span>
      </span>
    );
  }
  if (status === "Low Stock") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 whitespace-nowrap">
        <AlertTriangle size={14} className="text-amber-600 shrink-0" aria-hidden="true" />
        <span>Low Stock</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 whitespace-nowrap">
      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" aria-hidden="true" />
      <span>In Stock</span>
    </span>
  );
}

export function HospitalSpecialDevicesTab() {
  const [devices, setDevices] = useState<HospitalSpecialDevice[]>(() =>
    loadHospitalSpecialDevices()
  );
  const [categoryFilter, setCategoryFilter] = useState<HospitalDeviceCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [buyGuide, setBuyGuide] = useState<WhereToBuyGuide | null>(null);

  const updateDevices = (
    updater: (prev: HospitalSpecialDevice[]) => HospitalSpecialDevice[]
  ) => {
    setDevices((prev) => {
      const next = updater(prev);
      saveHospitalSpecialDevices(next);
      return next;
    });
  };

  const handleAdjustStock = (device: HospitalSpecialDevice, delta: number) => {
    if (delta < 0 && device.totalStock <= device.assignedUnits) {
      toast.info(
        `Cannot reduce total stock below ${device.assignedUnits} assigned units. Return a unit first.`
      );
      return;
    }
    updateDevices((prev) => adjustHospitalDeviceStock(prev, device.id, delta));
    toast.success(
      `${device.name}: stock ${delta > 0 ? `+${delta}` : delta} unit (${device.totalStock + delta} total).`
    );
  };

  const handleAssignUnit = (device: HospitalSpecialDevice) => {
    const avail = computeAvailableUnits(device);
    if (avail <= 0) {
      toast.error(`No available units of ${device.name}. Restock or return a unit.`);
      return;
    }
    updateDevices((prev) => assignHospitalDeviceUnit(prev, device.id));
    toast.success(
      `Assigned 1 unit of ${device.name} to patient (${avail - 1} available).`
    );
  };

  const handleReturnUnit = (device: HospitalSpecialDevice) => {
    if (device.assignedUnits <= 0) {
      toast.info(`All units of ${device.name} are already returned to ward stock.`);
      return;
    }
    updateDevices((prev) => returnHospitalDeviceUnit(prev, device.id));
    toast.success(`Returned 1 unit of ${device.name} to sanitized ward inventory.`);
  };

  const summary = useMemo(() => {
    let totalUnits = 0;
    let availableUnits = 0;
    let assignedUnits = 0;
    let attentionCount = 0;

    for (const d of devices) {
      const avail = computeAvailableUnits(d);
      const st = computeStockStatus(avail, d.lowStockThreshold);
      totalUnits += d.totalStock;
      availableUnits += avail;
      assignedUnits += d.assignedUnits;
      if (st !== "In Stock") attentionCount += 1;
    }
    return { totalUnits, availableUnits, assignedUnits, attentionCount };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devices.filter((d) => {
      const cat = d.category || "Accessibility & Sensory";
      if (categoryFilter !== "All" && cat !== categoryFilter) return false;
      const avail = computeAvailableUnits(d);
      const st = computeStockStatus(avail, d.lowStockThreshold);
      if (statusFilter !== "All" && st !== statusFilter) return false;
      if (q) {
        const hay =
          `${d.name} ${d.targetGroup} ${d.wardLocation} ${d.clinicalUse} ${cat}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [devices, categoryFilter, statusFilter, search]);

  return (
    <div className="space-y-6" data-testid="hospital-special-devices-tab">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Inclusive Ward Equipment & Essential Vitals Inventory
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            Special Devices & Live Stock
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Track hospital-owned assistive hardware and essential vitals monitoring devices—assign sanitized units at intake, adjust live stock, or restock from verified biomedical suppliers.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setBuyGuide(getWhereToBuyGuide("smart-vision-glasses"))}
          className="border-slate-300 text-slate-800 hover:border-teal-700 hover:text-teal-900 text-xs font-semibold whitespace-nowrap shrink-0 self-start"
        >
          <ShoppingBag size={14} className="mr-1.5 text-teal-700" aria-hidden="true" />
          Procurement & Restock Guide
        </Button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">Total Fleet Stock</div>
          <div
            data-testid="hsd-kpi-total"
            className="mt-1.5 font-display text-3xl font-bold text-slate-900 tabular-nums"
          >
            {summary.totalUnits}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {devices.length} assistive &amp; vitals device types
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">Available for Intake</div>
          <div
            data-testid="hsd-kpi-available"
            className="mt-1.5 font-display text-3xl font-bold text-emerald-700 tabular-nums"
          >
            {summary.availableUnits}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Sanitized & ready in ward bays
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">Assigned to Patients</div>
          <div
            data-testid="hsd-kpi-assigned"
            className="mt-1.5 font-display text-3xl font-bold text-teal-800 tabular-nums"
          >
            {summary.assignedUnits}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Currently deployed in ER & inpatient rooms
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="text-xs font-semibold text-slate-500">Restock Alerts</div>
          <div
            data-testid="hsd-kpi-alerts"
            className={`mt-1.5 font-display text-3xl font-bold tabular-nums ${
              summary.attentionCount > 0 ? "text-amber-700" : "text-slate-900"
            }`}
          >
            {summary.attentionCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Low stock or out-of-stock categories
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter special devices by category"
          >
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
                data-testid={`hsd-cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat === "All" ? `All Devices (${devices.length})` : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search device, BP monitor, oximeter, ward..."
              className="pl-9 h-9 text-xs rounded-xl border-slate-300"
            />
          </div>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100"
          role="group"
          aria-label="Filter special devices by stock status"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Stock:
          </span>
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              aria-pressed={statusFilter === st}
              data-testid={`hsd-filter-${st.toLowerCase().replace(/\s+/g, "-")}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stock Inventory Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="px-4">Special &amp; Medical Device</TableHead>
                <TableHead className="px-3 text-right">Total</TableHead>
                <TableHead className="px-3 text-right">Available</TableHead>
                <TableHead className="px-3 text-right">Assigned</TableHead>
                <TableHead className="px-3">Status</TableHead>
                <TableHead className="px-3 text-center">Adjust Stock</TableHead>
                <TableHead className="px-4 text-right">Ward Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => {
                const available = computeAvailableUnits(device);
                const status = computeStockStatus(available, device.lowStockThreshold);

                return (
                  <TableRow
                    key={device.id}
                    data-testid={`hsd-row-${device.id}`}
                    className={
                      status === "Out of Stock"
                        ? "bg-red-50/35"
                        : status === "Low Stock"
                        ? "bg-amber-50/30"
                        : ""
                    }
                  >
                    <TableCell className="px-4 py-3.5 max-w-[320px]">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                            device.category === "Vitals & Health Monitoring"
                              ? "bg-teal-50 border-teal-200 text-teal-800"
                              : "bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          {device.category === "Vitals & Health Monitoring" ? (
                            <Activity size={15} aria-hidden="true" />
                          ) : (
                            <Glasses size={15} aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-slate-900">
                            {device.name}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {device.targetGroup}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {device.wardLocation} · Audited {device.lastAudited}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell
                      data-testid={`hsd-total-${device.id}`}
                      className="px-3 text-right font-mono font-bold text-sm text-slate-900 tabular-nums whitespace-nowrap"
                    >
                      {device.totalStock}
                    </TableCell>

                    <TableCell
                      data-testid={`hsd-available-${device.id}`}
                      className={`px-3 text-right font-mono font-bold text-sm tabular-nums whitespace-nowrap ${
                        status === "Out of Stock"
                          ? "text-red-700"
                          : status === "Low Stock"
                          ? "text-amber-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {available}
                    </TableCell>

                    <TableCell
                      data-testid={`hsd-assigned-${device.id}`}
                      className="px-3 text-right font-mono font-semibold text-sm text-slate-700 tabular-nums whitespace-nowrap"
                    >
                      {device.assignedUnits}
                    </TableCell>

                    <TableCell
                      data-testid={`hsd-status-${device.id}`}
                      className="px-3 whitespace-nowrap"
                    >
                      <StatusIndicator status={status} />
                    </TableCell>

                    <TableCell className="px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(device, -1)}
                          disabled={device.totalStock <= device.assignedUnits}
                          data-testid={`hsd-dec-${device.id}`}
                          aria-label={`Decrease stock for ${device.name}`}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed"
                        >
                          <Minus size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(device, 1)}
                          data-testid={`hsd-inc-${device.id}`}
                          aria-label={`Increase stock for ${device.name}`}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-teal-800 hover:bg-teal-50"
                        >
                          <Plus size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={available <= 0}
                          data-testid={`hsd-assign-${device.id}`}
                          onClick={() => handleAssignUnit(device)}
                          className="h-7 px-2.5 text-xs font-semibold border-teal-200 text-teal-800 hover:bg-teal-50 whitespace-nowrap"
                        >
                          <ArrowUpRight size={12} className="mr-1" aria-hidden="true" />
                          Assign
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={device.assignedUnits <= 0}
                          data-testid={`hsd-return-${device.id}`}
                          onClick={() => handleReturnUnit(device)}
                          className="h-7 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                        >
                          <ArrowDownLeft size={12} className="mr-1" aria-hidden="true" />
                          Return
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          data-testid={`hsd-buy-${device.id}`}
                          onClick={() =>
                            setBuyGuide(getWhereToBuyGuide(device.guideId))
                          }
                          className="h-7 px-2.5 text-xs font-semibold border-amber-300 text-amber-900 bg-amber-50/60 hover:bg-amber-100/70 whitespace-nowrap"
                        >
                          <ShoppingBag size={12} className="mr-1" aria-hidden="true" />
                          Where to Buy
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No special assistive devices match the current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Portaled Where to Buy / Hospital Procurement Drawer */}
      <WhereToBuyDrawer
        guide={buyGuide}
        mode="hospital"
        onClose={() => setBuyGuide(null)}
      />
    </div>
  );
}
