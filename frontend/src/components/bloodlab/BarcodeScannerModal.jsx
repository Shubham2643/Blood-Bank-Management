import { useState, useEffect } from "react";
import { Camera, QrCode, Scan, X, CheckCircle, RefreshCw, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedBag, setScannedBag] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setScannedBag(null);
    }
  }, [isOpen]);

  const handleSimulatedScan = () => {
    setScanning(false);
    const mockBag = {
      serialNumber: "BAG-2026-O-NEG-9842",
      bloodGroup: "O-",
      quantity: 1,
      collectedAt: new Date().toLocaleDateString(),
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      testingStatus: "safe",
      temperature: "4.2°C"
    };
    setScannedBag(mockBag);
    toast.success("Blood bag barcode scanned successfully! 📷");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Scan className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">Blood Bag Scanner</h3>
              <p className="text-[11px] text-red-100 font-semibold">Camera QR & Barcode Reader</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-red-100 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="p-6">
          {!scannedBag ? (
            <div className="relative w-full h-64 rounded-2xl bg-slate-900 border-2 border-dashed border-red-500/40 overflow-hidden flex flex-col items-center justify-center shadow-inner group">
              {/* Laser Scan Line animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-lg shadow-red-500 animate-bounce top-1/3" />
              
              <Camera className="w-12 h-12 text-slate-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black text-slate-300 uppercase tracking-wider text-center px-4">
                Align Blood Bag Barcode Within Frame
              </p>
              <span className="text-[10px] text-slate-500 font-semibold mt-1">Supports Code128, QR, & GS1 DataMatrix</span>

              <button
                onClick={handleSimulatedScan}
                className="mt-5 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Zap size={14} /> Simulate Camera Scan
              </button>
            </div>
          ) : (
            /* Scanned Result Card */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-black text-emerald-950 text-xs uppercase tracking-wide">Barcode Verified</h4>
                  <p className="text-[11px] text-emerald-700 font-bold">{scannedBag.serialNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Blood Group</span>
                  <p className="font-black text-red-600 text-base">{scannedBag.bloodGroup}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Testing Status</span>
                  <p className="font-black text-emerald-600 uppercase">{scannedBag.testingStatus}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Cold Temp</span>
                  <p className="font-black text-slate-800">{scannedBag.temperature}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Expiry Date</span>
                  <p className="font-black text-slate-800">{scannedBag.expiryDate}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setScannedBag(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Scan Another
                </button>
                <button
                  onClick={() => {
                    if (onScanSuccess) onScanSuccess(scannedBag);
                    onClose();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/25 transition-all hover:scale-105"
                >
                  Import Bag Record
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
