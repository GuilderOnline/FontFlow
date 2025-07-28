import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import '../css/fontPreviewModal.css'; // Your custom CSS file

const FontPreviewModal = ({ fontUrl, fontName, isOpen, onClose }) => {
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [lineHeight, setLineHeight] = useState(1.4);
  const [fontLoaded, setFontLoaded] = useState(false);
  const canvasRef = useRef();

  // Load the font dynamically using FontFace
  useEffect(() => {
    if (!isOpen || !fontUrl) return;

    const fontFace = new FontFace(fontName, `url(${fontUrl})`);
    fontFace.load().then((loaded) => {
      document.fonts.add(loaded);
      setFontLoaded(true);
    }).catch((err) => {
      console.error('❌ Font load error:', err);
    });
  }, [fontUrl, fontName, isOpen]);

  const downloadAsPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    // Note: jsPDF uses its own internal fonts. To truly embed your custom font into PDF,
    // you'd need to convert TTF to a jsPDF-compatible format (like .ttf → base64) and register.
    // This version just uses the name, which may fall back.
    doc.setFont(fontName);
    doc.setFontSize(fontSize);
    doc.setTextColor(textColor);
    doc.text(previewText, 40, 100, {
      maxWidth: 515,
      lineHeightFactor: lineHeight,
    });

    doc.save(`${fontName}-preview.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Font Preview: {fontName}</h2>

        {!fontLoaded ? (
          <p>Loading font...</p>
        ) : (
          <textarea
            className="preview-textarea"
            style={{
              fontFamily: fontName,
              fontSize: `${fontSize}px`,
              color: textColor,
              backgroundColor: bgColor,
              lineHeight: lineHeight,
            }}
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
          />
        )}

        <div className="controls">
          <label>
            Font Size:
            <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
          </label>

          <label>
            Text Color:
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
          </label>

          <label>
            Background:
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          </label>

          <label>
            Line Spacing:
            <input type="number" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} />
          </label>
        </div>

        <div className="modal-actions">
          <button onClick={downloadAsPDF}>Download PDF</button>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default FontPreviewModal;
