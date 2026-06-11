import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Copy, CheckCircle2 } from 'lucide-react';
import { saveFarmLog, getFarmLog } from '../../utils/db';

export default function DailyLogbook() {
  const [log, setLog] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const loadLog = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const savedLog = await getFarmLog(todayStr);
      if (savedLog) setLog(savedLog);
    };
    loadLog();
  }, []);

  const handleSave = (e) => {
    const value = e.target.value;
    setLog(value);
    
    // Save to local immediately for snappy UI
    localStorage.setItem('ojtFarmLog', value);
    
    // Show saving UI
    setSaved(true);
    
    // Debounce the Supabase cloud sync to avoid spamming the DB
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      await saveFarmLog(todayStr, value);
      setSaved(false); // Hide saving UI when sync is done
    }, 1500);
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
          {saved ? <span className="saved-text"><Save size={12}/> Cloud sync...</span> : null}
        </div>
      </div>

      <div className="logbook-footer">
        <span className="word-count">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
        <button className="mobile-copy-btn" onClick={handleCopy}>
          <Copy size={16} /> Copy log
        </button>
      </div>
      
      <div className="tool-tip">
        <strong>💡 Tip:</strong> Your handsome LoveyDovey made sure this auto-saves directly to the cloud as you type! Just click the copy icon when you need to paste it into your official OJT report!
      </div>
    </motion.div>
  );
}
