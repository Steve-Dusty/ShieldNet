import { useEffect, useState } from "react";

interface ScanLine {
  id: number;
  position: number;
  speed: number;
}

interface FraudHighlight {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
  type: 'warning' | 'error' | 'success';
}

export const PDFScanBackground = () => {
  const [scanLines, setScanLines] = useState<ScanLine[]>([]);
  const [fraudHighlights, setFraudHighlights] = useState<FraudHighlight[]>([]);

  // Sample invoice text lines - MORE TEXT
  const invoiceLines = [
    "INVOICE #INV-2024-00847",
    "Date Issued: October 15, 2024",
    "Due Date: November 15, 2024",
    "",
    "Bill To:                        From:",
    "Acme Corporation                QuickDesign Studio LLC",
    "123 Business Street             456 Vendor Avenue",
    "San Francisco, CA 94102         Los Angeles, CA 90001",
    "Tax ID: 12-3456789              Tax ID: 98-7654321",
    "",
    "Description                    Hours    Rate      Amount",
    "─────────────────────────────────────────────────────────",
    "Web Development Services        120    $150    $18,000",
    "  - Frontend Development         60    $150     $9,000",
    "  - Backend API Integration      40    $150     $6,000",
    "  - Database Setup               20    $150     $3,000",
    "",
    "UI/UX Design Consulting         80     $175    $14,000",
    "  - Wireframing & Prototyping    30    $175     $5,250",
    "  - User Research                25    $175     $4,375",
    "  - Design System Creation       25    $175     $4,375",
    "",
    "Project Management              45     $125     $5,625",
    "  - Sprint Planning              15    $125     $1,875",
    "  - Client Communications        20    $125     $2,500",
    "  - Documentation                10    $125     $1,250",
    "",
    "                                        Subtotal: $37,625",
    "                                        Tax (8%):  $3,010",
    "                                        ───────────────────",
    "                                        Total Due: $40,635",
    "",
    "Payment Terms: Net 30 Days",
    "Payment Method: Wire Transfer",
    "Bank Account: ****-****-1234",
    "Swift Code: BOFA0001234",
    "",
    "Notes: Thank you for your business!",
    "Please include invoice number in payment memo.",
  ];

  useEffect(() => {
    // Initialize scan line
    setScanLines([{
      id: 1,
      position: 0,
      speed: 0.8,
    }]);

    // Animate scan line
    const scanInterval = setInterval(() => {
      setScanLines(prev =>
        prev.map(line => ({
          ...line,
          position: (line.position + line.speed) % 100,
        }))
      );
    }, 50);

    // Generate fraud highlights - Top 25% anywhere, middle section right side only
    const highlightInterval = setInterval(() => {
      const fraudTypes = [
        // TOP 25% - Can be anywhere (left side line items)
        { top: 18, left: 13, width: 48, type: 'error' as const },      // Invoice header area
        { top: 22, left: 13, width: 52, type: 'warning' as const },    // Description line
        { top: 26, left: 13, width: 50, type: 'error' as const },      // Web Development line
        { top: 31, left: 13, width: 50, type: 'warning' as const },    // UI/UX Design line
        
        // MIDDLE SECTION - Right side only (totals area)
        { top: 48, left: 55, width: 28, type: 'warning' as const },    // Subtotal
        { top: 52, left: 55, width: 26, type: 'error' as const },      // Tax
        { top: 56, left: 55, width: 28, type: 'error' as const },      // Total Due
      ];

      const selectedFraud = fraudTypes[Math.floor(Math.random() * fraudTypes.length)];
      
      const newHighlight: FraudHighlight = {
        id: Date.now(),
        top: selectedFraud.top,
        left: selectedFraud.left,
        width: selectedFraud.width,
        height: 2.8,
        type: selectedFraud.type,
      };

      setFraudHighlights(prev => {
        const updated = [...prev, newHighlight];
        return updated.slice(-3);
      });

      // Remove highlight after animation
      setTimeout(() => {
        setFraudHighlights(prev => prev.filter(h => h.id !== newHighlight.id));
      }, 4000);
    }, 2000);

    return () => {
      clearInterval(scanInterval);
      clearInterval(highlightInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.15), transparent 50%), radial-gradient(ellipse at bottom left, rgba(168, 85, 247, 0.15), transparent 50%), #0a0e1a'
    }}>
      {/* Ambient glow effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-badge-purple/5 rounded-full blur-3xl" />

      {/* PDF Document */}
      <div className="absolute inset-0 flex items-center justify-end pr-32 opacity-70">
        <div className="relative w-[700px] h-[900px] bg-gray-900/60 rounded-lg shadow-2xl border-2 border-gray-700/50 backdrop-blur-sm" style={{ filter: 'blur(0.5px)' }}>
          {/* PDF Header */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800/90 border-b-2 border-gray-700 flex items-center px-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="ml-6 text-gray-400 text-sm font-mono">invoice_oct_2024.pdf</div>
          </div>

          {/* PDF Content with actual text */}
          <div className="absolute inset-0 pt-16 px-16 pb-12 font-mono text-sm text-gray-400">
            {invoiceLines.map((line, i) => (
              <div
                key={i}
                className={`mb-2 ${i === 0 ? 'text-lg font-bold text-gray-300' : ''} ${i === 5 ? 'border-b border-gray-700 pb-2 font-semibold text-gray-300' : ''} ${i >= 10 && i <= 12 ? 'text-right' : ''}`}
              >
                {line || '\u00A0'}
              </div>
            ))}
          </div>

          {/* Scanning Line */}
          {scanLines.map(line => (
            <div
              key={line.id}
              className="absolute left-0 right-0 h-[3px]"
              style={{
                top: `${line.position}%`,
                background: 'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.9), transparent)',
                boxShadow: '0 0 40px rgba(59, 130, 246, 1), 0 0 80px rgba(59, 130, 246, 0.6)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/70 to-transparent blur-md" />
            </div>
          ))}

          {/* Fraud Detection Highlights */}
          {fraudHighlights.map(highlight => (
            <div
              key={highlight.id}
              className="absolute"
              style={{
                top: `${highlight.top}%`,
                left: `${highlight.left}%`,
                width: `${highlight.width}%`,
                height: `${highlight.height}%`,
              }}
            >
              {/* Main highlight box */}
              <div
                className={`absolute inset-0 rounded animate-fraud-highlight ${
                  highlight.type === 'error'
                    ? 'bg-red-500/60 border-2 border-red-500'
                    : highlight.type === 'warning'
                    ? 'bg-orange-500/60 border-2 border-orange-500'
                    : 'bg-green-500/60 border-2 border-green-500'
                }`}
                style={{
                  boxShadow: highlight.type === 'error'
                    ? '0 0 20px rgba(239, 68, 68, 0.8)'
                    : highlight.type === 'warning'
                    ? '0 0 20px rgba(249, 115, 22, 0.8)'
                    : '0 0 20px rgba(34, 197, 94, 0.8)'
                }}
              />

              {/* Pulsing ripple effect */}
              <div
                className={`absolute inset-0 rounded animate-ping ${
                  highlight.type === 'error'
                    ? 'bg-red-500/70'
                    : highlight.type === 'warning'
                    ? 'bg-orange-500/70'
                    : 'bg-green-500/70'
                }`}
              />

              {/* Label showing what was detected */}
              <div
                className={`absolute -top-10 left-0 px-3 py-1 rounded-md text-white font-bold text-xs whitespace-nowrap ${
                  highlight.type === 'error'
                    ? 'bg-red-600 shadow-lg shadow-red-600/50'
                    : highlight.type === 'warning'
                    ? 'bg-orange-600 shadow-lg shadow-orange-600/50'
                    : 'bg-green-600 shadow-lg shadow-green-600/50'
                }`}
              >
                {highlight.type === 'error' ? '⚠️ FRAUD DETECTED' : highlight.type === 'warning' ? '⚠️ ERROR FOUND' : '✓ VERIFIED'}
              </div>

              {/* Alert icon/badge */}
              <div
                className={`absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                  highlight.type === 'error'
                    ? 'bg-red-600 shadow-lg shadow-red-600/50'
                    : highlight.type === 'warning'
                    ? 'bg-orange-600 shadow-lg shadow-orange-600/50'
                    : 'bg-green-600 shadow-lg shadow-green-600/50'
                }`}
              >
                {highlight.type === 'error' ? '✕' : highlight.type === 'warning' ? '!' : '✓'}
              </div>
            </div>
          ))}

          {/* Corner scan indicators */}
          <div className="absolute top-16 left-4 w-12 h-12 border-l-4 border-t-4 border-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
          <div className="absolute top-16 right-4 w-12 h-12 border-r-4 border-t-4 border-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />

          {/* Scanning progress indicator */}
          <div className="absolute top-4 right-20 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-blue-600/60 animate-pulse border border-blue-400">
            SCANNING...
          </div>
        </div>
      </div>
    </div>
  );
};
