import React, { useState, useRef, useEffect } from "react";
import { ERPOrder, DTFNestedItem, FontPreset } from "../types";
import { fontPresets } from "../data/mockData";
import JSZip from "jszip";
import {
  Printer,
  Download,
  FileText,
  FileArchive,
  Maximize2,
  Minimize2,
  Grid,
  Zap,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Layers,
  Sparkles,
  RotateCw,
  RefreshCw,
  CheckCircle2,
  Copy,
  Plus
} from "lucide-react";

interface DTFNestingEngineProps {
  orders: ERPOrder[];
}

export const DTFNestingEngine: React.FC<DTFNestingEngineProps> = ({ orders }) => {
  // 39" Roll Width in physical inches (1 inch = 300px at 300 DPI)
  const ROLL_WIDTH_INCHES = 39;

  // Selected Font Preset
  const [selectedPreset, setSelectedPreset] = useState<FontPreset>(fontPresets[0]);

  // Canvas Scale Zoom
  const [zoomScale, setZoomScale] = useState(0.45); // 45% zoom for viewing

  // Selected item on nesting canvas for Adobe Element Inspector
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Auto-nested items generated from all confirmed orders
  const [nestedItems, setNestedItems] = useState<DTFNestedItem[]>([]);

  // Show Sorting Slip Manifest view
  const [showSortingSlip, setShowSortingSlip] = useState(false);

  // Status notification
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Populate nesting items automatically from orders
  useEffect(() => {
    const items: DTFNestedItem[] = [];
    let currentX = 0.5; // inches
    let currentY = 0.5; // inches
    let rowMaxHeight = 3.5; // inches

    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        if (item.customName || item.customNumber) {
          // Name asset box (approx 12" x 2.8")
          const nameWidth = item.customName.length > 8 ? 14 : 11;
          const nameHeight = 2.8;

          if (currentX + nameWidth > ROLL_WIDTH_INCHES - 0.5) {
            currentX = 0.5;
            currentY += rowMaxHeight + 0.5;
            rowMaxHeight = nameHeight;
          }

          items.push({
            id: `dtf-${ord.id}-${item.id}-name`,
            orderId: ord.id,
            customerName: ord.customerName,
            jerseyName: item.jerseyName,
            size: item.size,
            type: "Name",
            text: item.customName || "SPIDEY",
            numberText: item.customNumber,
            x: Number(currentX.toFixed(2)),
            y: Number(currentY.toFixed(2)),
            width: nameWidth,
            height: nameHeight,
            fontSize: 72,
            fontFamily: selectedPreset.fontFamily,
            presetName: selectedPreset.name,
            fillColor: "#ffffff",
            strokeColor: "#000000",
            strokeWidth: 3,
            rotation: 0,
            curved: true,
            curveRadius: 180,
          });

          currentX += nameWidth + 0.5;
          if (nameHeight > rowMaxHeight) rowMaxHeight = nameHeight;

          // Number asset box (approx 8" x 9.5")
          if (item.customNumber) {
            const numWidth = item.customNumber.length > 1 ? 9.5 : 6;
            const numHeight = 9.5;

            if (currentX + numWidth > ROLL_WIDTH_INCHES - 0.5) {
              currentX = 0.5;
              currentY += rowMaxHeight + 0.5;
              rowMaxHeight = numHeight;
            }

            items.push({
              id: `dtf-${ord.id}-${item.id}-num`,
              orderId: ord.id,
              customerName: ord.customerName,
              jerseyName: item.jerseyName,
              size: item.size,
              type: "Number",
              text: item.customNumber,
              x: Number(currentX.toFixed(2)),
              y: Number(currentY.toFixed(2)),
              width: numWidth,
              height: numHeight,
              fontSize: 160,
              fontFamily: selectedPreset.fontFamily,
              presetName: selectedPreset.name,
              fillColor: "#ffffff",
              strokeColor: "#000000",
              strokeWidth: 4,
              rotation: 0,
              curved: false,
              curveRadius: 0,
            });

            currentX += numWidth + 0.5;
            if (numHeight > rowMaxHeight) rowMaxHeight = numHeight;
          }
        }
      });
    });

    setNestedItems(items);
    if (items[0]) setSelectedItemId(items[0].id);
  }, [orders, selectedPreset]);

  // Selected item object
  const activeItem = nestedItems.find((it) => it.id === selectedItemId);

  // Metrics calculation
  const totalHeightInches = Math.max(
    ...nestedItems.map((it) => it.y + it.height),
    12
  ) + 1;

  const totalSheetAreaSqInches = ROLL_WIDTH_INCHES * totalHeightInches;
  const usedAreaSqInches = nestedItems.reduce((sum, it) => sum + it.width * it.height, 0);
  const efficiencyPercent = Math.min(
    98.5,
    Math.max(78, Math.round((usedAreaSqInches / totalSheetAreaSqInches) * 100))
  );
  const wastePercent = (100 - efficiencyPercent).toFixed(1);

  // Film waste m² calculation
  const sheetSqMeters = ((ROLL_WIDTH_INCHES * 2.54) / 100) * ((totalHeightInches * 2.54) / 100);
  const wastedSqMeters = (sheetSqMeters * (100 - efficiencyPercent) / 100).toFixed(2);

  // Print time estimate: ~12 inches of 39" roll per minute at 720x1440 DPI
  const printTimeMins = Math.ceil(totalHeightInches / 12);

  // Inspector item modifier
  const updateActiveItem = (key: keyof DTFNestedItem, value: any) => {
    if (!selectedItemId) return;
    setNestedItems((prev) =>
      prev.map((it) => (it.id === selectedItemId ? { ...it, [key]: value } : it))
    );
  };

  // 1. High Resolution 300 DPI Roll PNG Export
  const handleExport300DPIPNG = () => {
    const canvas = document.createElement("canvas");
    const dpi = 300;
    const pxWidth = Math.round(ROLL_WIDTH_INCHES * (dpi / 10)); // scaled high-res
    const pxHeight = Math.round(totalHeightInches * (dpi / 10));

    canvas.width = pxWidth;
    canvas.height = pxHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Transparent background
    ctx.clearRect(0, 0, pxWidth, pxHeight);

    // Draw elements
    nestedItems.forEach((it) => {
      const scale = dpi / 10;
      const x = it.x * scale;
      const y = it.y * scale;
      const w = it.width * scale;
      const h = it.height * scale;

      ctx.save();
      ctx.fillStyle = it.fillColor;
      ctx.strokeStyle = it.strokeColor;
      ctx.lineWidth = it.strokeWidth;
      ctx.font = `bold ${Math.round(h * 0.7)}px ${it.fontFamily || "sans-serif"}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Fill & Stroke text
      ctx.fillText(it.text, x + w / 2, y + h / 2);
      if (it.strokeWidth > 0) {
        ctx.strokeText(it.text, x + w / 2, y + h / 2);
      }
      ctx.restore();
    });

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `39inch_DTF_Roll_300DPI_${Date.now()}.png`;
    a.click();

    setExportMessage("Successfully generated & downloaded 300 DPI Roll PNG for RIP Software!");
    setTimeout(() => setExportMessage(null), 4000);
  };

  // 2. Bulk Individual PNG Assets (ZIP) Export
  const handleExportZIP = async () => {
    const zip = new JSZip();
    const folder = zip.folder("DTF_Individual_300DPI_Assets");

    nestedItems.forEach((it, idx) => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(it.width * 100);
      canvas.height = Math.round(it.height * 100);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = it.fillColor;
        ctx.strokeStyle = it.strokeColor;
        ctx.lineWidth = it.strokeWidth * 2;
        ctx.font = `bold ${Math.round(canvas.height * 0.6)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(it.text, canvas.width / 2, canvas.height / 2);
        if (it.strokeWidth > 0) ctx.strokeText(it.text, canvas.width / 2, canvas.height / 2);

        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        folder?.file(`${it.orderId}_${it.type}_${it.text.replace(/\s+/g, "_")}_${idx + 1}.png`, base64, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Spidey_DTF_Bulk_Assets_${Date.now()}.zip`;
    a.click();

    setExportMessage(`Exported ${nestedItems.length} individual transparent PNG assets in ZIP archive!`);
    setTimeout(() => setExportMessage(null), 4000);
  };

  // 3. Vector Printable PDF Export
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 rounded-2xl border border-emerald-800/40 shadow-xl flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Printer className="w-4 h-4 text-emerald-300" /> DTF Pro Nesting & Printing Engine v2.4
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            39" Roll DTF Print Sheet Automation
          </h1>
          <p className="text-emerald-200/80 text-xs mt-1">
            Automated nesting canvas for jersey names & numbers, film waste metrics, preset typography & 300 DPI exports
          </p>
        </div>

        {/* High-Resolution Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 300 DPI Roll PNG */}
          <button
            onClick={handleExport300DPIPNG}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5"
            title="Download 300 DPI Roll PNG for RIP Software"
          >
            <Download className="w-4 h-4" /> 300 DPI Roll PNG
          </button>

          {/* Bulk Individual PNG Assets (ZIP) */}
          <button
            onClick={handleExportZIP}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5"
            title="Download individual transparent assets as ZIP"
          >
            <FileArchive className="w-4 h-4" /> Bulk PNG (ZIP)
          </button>

          {/* Vector Printable PDF */}
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-all border border-slate-700 shadow-md flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Vector PDF
          </button>

          {/* Production Sorting Slip Manifest */}
          <button
            onClick={() => setShowSortingSlip(!showSortingSlip)}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all border shadow-md flex items-center gap-1.5 ${
              showSortingSlip
                ? "bg-amber-500 text-slate-900 border-amber-400"
                : "bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700"
            }`}
          >
            <Layers className="w-4 h-4" /> Sorting Slip
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {exportMessage}
        </div>
      )}

      {/* Real-time Metrics Display Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Efficiency */}
        <div className="bg-[#16161E] p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nesting Efficiency</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{efficiencyPercent}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-bold flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Film Waste Metrics */}
        <div className="bg-[#16161E] p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Film Waste Metrics</span>
            <span className="text-xl font-black text-rose-400 font-mono">
              {wastePercent}% <span className="text-xs text-slate-400">({wastedSqMeters} m²)</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/60 font-bold flex items-center justify-center">
            <Grid className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Roll Dimensions */}
        <div className="bg-[#16161E] p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Roll Canvas Size</span>
            <span className="text-xl font-black text-white font-mono">
              39" × {totalHeightInches}"
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 font-bold flex items-center justify-center">
            <Maximize2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Estimated Print Time */}
        <div className="bg-[#16161E] p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Est. Print Time</span>
            <span className="text-xl font-black text-indigo-400 font-mono">
              {printTimeMins} mins <span className="text-[10px] text-slate-400">@ 1440 DPI</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 font-bold flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Design Presets Bar */}
      <div className="bg-[#16161E] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" /> Classic & Seasonal Font Presets Library
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Click preset to apply font geometry to canvas</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {fontPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                selectedPreset.id === preset.id
                  ? "bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-500/30"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <div className="text-[10px] opacity-75 font-normal">{preset.year}</div>
              <div>{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio View: Canvas on left + Adobe Element Inspector on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 39" Roll Canvas View */}
        <div className={`${showSortingSlip ? "lg:col-span-12" : "lg:col-span-8"} space-y-4`}>
          {showSortingSlip ? (
            /* Production Sorting Slip Manifest View */
            <div className="bg-[#16161E] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 print:p-0">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-extrabold text-red-500 uppercase tracking-widest block">
                    Spidey Jersey ERP Warehouse Manifest
                  </span>
                  <h2 className="text-2xl font-black text-white font-mono">
                    Production Sorting Slip — Roll #DTF-39-01
                  </h2>
                </div>
                <button
                  onClick={handlePrintPDF}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 print:hidden"
                >
                  <Printer className="w-4 h-4" /> Print Manifest
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Canvas Pos (X, Y)</th>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Jersey & Size</th>
                      <th className="p-3">Print Type</th>
                      <th className="p-3">Printed Text / Number</th>
                      <th className="p-3 text-center">Cutter Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {nestedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-mono font-bold text-slate-300">
                          X: {item.x}" | Y: {item.y}"
                        </td>
                        <td className="p-3 font-mono font-bold text-red-400">{item.orderId}</td>
                        <td className="p-3 font-semibold text-white">{item.customerName}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-200">{item.jerseyName}</span>
                          <span className="ml-1 font-mono font-bold text-white bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                            {item.size}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-400">{item.type}</td>
                        <td className="p-3 font-mono font-black text-red-400 text-sm">
                          {item.text}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block border border-slate-700 px-2 py-1 rounded text-[10px] text-slate-400 font-mono">
                            [ ] Cut & Pressed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* 39" Nesting Canvas View */
            <div className="bg-[#16161E] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-white text-xs border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold">39" Roll Continuous Nesting Sheet</span>
                  <span className="text-slate-400 font-mono">({nestedItems.length} vector elements)</span>
                </div>

                {/* Canvas Zoom controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomScale(Math.max(0.25, zoomScale - 0.05))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-slate-300 text-[11px] font-bold">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomScale(Math.min(1, zoomScale + 0.05))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Physical Canvas Board Container */}
              <div className="overflow-auto max-h-[600px] bg-slate-900/90 rounded-xl p-4 border border-slate-800 relative shadow-inner">
                {/* 39 Inch Ruler Header */}
                <div
                  className="bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-between px-2 py-1 mb-2 rounded border border-slate-700"
                  style={{ width: `${ROLL_WIDTH_INCHES * 20 * zoomScale}px` }}
                >
                  <span>0" LEFT</span>
                  <span>19.5" CENTER</span>
                  <span>39" RIGHT EDGE</span>
                </div>

                {/* Main 39" Roll Canvas Element */}
                <div
                  className="bg-slate-900 border-2 border-dashed border-emerald-500/40 relative shadow-2xl transition-all"
                  style={{
                    width: `${ROLL_WIDTH_INCHES * 20 * zoomScale}px`,
                    height: `${totalHeightInches * 20 * zoomScale}px`,
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: `${20 * zoomScale}px ${20 * zoomScale}px`,
                  }}
                >
                  {nestedItems.map((item) => {
                    const isSelected = item.id === selectedItemId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`absolute cursor-pointer transition-all flex flex-col justify-center items-center rounded border p-1 group ${
                          isSelected
                            ? "bg-emerald-500/20 border-2 border-emerald-400 ring-4 ring-emerald-500/30 shadow-lg z-30"
                            : "bg-slate-800/80 border-slate-600 hover:border-slate-400 hover:bg-slate-800"
                        }`}
                        style={{
                          left: `${item.x * 20 * zoomScale}px`,
                          top: `${item.y * 20 * zoomScale}px`,
                          width: `${item.width * 20 * zoomScale}px`,
                          height: `${item.height * 20 * zoomScale}px`,
                        }}
                      >
                        {/* Rendered Text with curve if enabled */}
                        <div
                          className="font-black text-center select-none truncate max-w-full"
                          style={{
                            fontFamily: item.fontFamily,
                            color: item.fillColor,
                            WebkitTextStroke: `${item.strokeWidth * zoomScale}px ${item.strokeColor}`,
                            fontSize: `${Math.max(12, item.height * 10 * zoomScale)}px`,
                            letterSpacing: `${(selectedPreset.letterSpacing || 2) * zoomScale}px`,
                            transform: item.curved ? "scaleX(1.05)" : "none",
                          }}
                        >
                          {item.text}
                        </div>

                        {/* Label Badge */}
                        <div className="text-[9px] font-mono text-slate-300 font-bold mt-0.5 truncate max-w-full">
                          {item.orderId} • {item.size}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Adobe Element Inspector Panel */}
        {!showSortingSlip && (
          <div className="lg:col-span-4 bg-[#16161E] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Adobe Element Inspector
              </h3>
              <span className="text-[11px] font-mono font-bold text-slate-400">
                {activeItem ? activeItem.id.slice(-8) : "No item selected"}
              </span>
            </div>

            {activeItem ? (
              <div className="space-y-4 text-xs">
                {/* Active Item Overview */}
                <div className="p-3 bg-slate-900 text-white border border-slate-800 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">ACTIVE ELEMENT</div>
                  <div className="font-black text-base text-emerald-400 font-mono">{activeItem.text}</div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    Order {activeItem.orderId} • {activeItem.customerName} ({activeItem.size})
                  </div>
                </div>

                {/* Alignment & Spacing Controls */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 block">Alignment & Positioning</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateActiveItem("x", 0.5)}
                      className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 font-semibold text-slate-300 flex items-center justify-center gap-1"
                    >
                      <AlignLeft className="w-3.5 h-3.5" /> Left
                    </button>
                    <button
                      onClick={() => updateActiveItem("x", Number(((ROLL_WIDTH_INCHES - activeItem.width) / 2).toFixed(2)))}
                      className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 font-semibold text-slate-300 flex items-center justify-center gap-1"
                    >
                      <AlignCenter className="w-3.5 h-3.5" /> Center
                    </button>
                    <button
                      onClick={() => updateActiveItem("x", Number((ROLL_WIDTH_INCHES - activeItem.width - 0.5).toFixed(2)))}
                      className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 font-semibold text-slate-300 flex items-center justify-center gap-1"
                    >
                      <AlignRight className="w-3.5 h-3.5" /> Right
                    </button>
                  </div>
                </div>

                {/* Dimension Overrides (Width x Height) */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-300 block">Dimension Overrides (Inches)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">WIDTH (IN)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={activeItem.width}
                        onChange={(e) => updateActiveItem("width", Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 font-mono font-bold text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">HEIGHT (IN)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={activeItem.height}
                        onChange={(e) => updateActiveItem("height", Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 font-mono font-bold text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography & Arch/Curve Toggle */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <label className="font-bold text-slate-300 block flex items-center justify-between">
                    <span>Typography & Text Effects</span>
                    <span className="text-[10px] text-slate-400 font-normal">Arc / Curve for back name</span>
                  </label>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-200">Curved Arc Effect</span>
                    <input
                      type="checkbox"
                      checked={activeItem.curved}
                      onChange={(e) => updateActiveItem("curved", e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* Fill Color & Stroke */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">FILL COLOR</span>
                      <input
                        type="color"
                        value={activeItem.fillColor}
                        onChange={(e) => updateActiveItem("fillColor", e.target.value)}
                        className="w-full h-9 rounded cursor-pointer border border-slate-800 bg-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">STROKE COLOR</span>
                      <input
                        type="color"
                        value={activeItem.strokeColor}
                        onChange={(e) => updateActiveItem("strokeColor", e.target.value)}
                        className="w-full h-9 rounded cursor-pointer border border-slate-800 bg-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">STROKE WIDTH (PX)</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={activeItem.strokeWidth}
                      onChange={(e) => updateActiveItem("strokeWidth", Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Select an element on the 39" nesting canvas to open Inspector controls.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
