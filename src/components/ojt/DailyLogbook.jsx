import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Copy, CheckCircle2 } from 'lucide-react';

export default function DailyLogbook() {
  const [log, setLog] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedLog = localStorage.getItem('ojtFarmLog');
    if (savedLog) setLog(savedLog);
  }, []);

  const handleSave = (e) => {
    const value = e.target.value;
    setLog(value);
    localStorage.setItem('ojtFarmLog', value);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(log);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = log.trim() ? log.trim().split(/\s+/).length : 0;

  return (
    <motion.div 
      className="tool-card glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="tool-header">
        <div className="tool-title-group">
          <h2>🚜 Daily Farm Logbook</h2>
          <p>Record your animal observations and farm activities today!</p>
        </div>
        <button className="icon-btn desktop-copy" onClick={handleCopy} title="Copy to Clipboard">
          {copied ? <CheckCircle2 color="green" /> : <Copy />}
        </button>
      </div>

      <div className="textarea-wrapper">
        <textarea
          className="logbook-textarea"
          value={log}
          onChange={handleSave}
          placeholder="e.g. 8:00 AM - Fed the cattle and checked the water troughs. 10:00 AM - Assisted in sorting the piglets..."
        />
        <div className="save-status">
          {saved ? <span className="saved-text"><Save size={12}/> Auto-saved!</span> : null}
        </div>
      </div>

      <div className="logbook-footer">
        <span className="word-count">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
        <button className="mobile-copy-btn" onClick={handleCopy}>
          <Copy size={16} /> Copy log
        </button>
      </div>
      
      <div className="tool-tip">
        <strong>💡 Tip:</strong> Your handsome LoveyDovey made sure this auto-saves as you type. Just click the copy icon when you need to paste it into your official OJT report!
      </div>
    </motion.div>
  );
}
