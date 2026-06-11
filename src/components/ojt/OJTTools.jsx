import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DailyLogbook from './DailyLogbook';
import ToDoList from './ToDoList';
import FocusTimer from './FocusTimer';
import ExpenseTracker from './ExpenseTracker';
import { BookOpen, CheckSquare, Clock, Wallet } from 'lucide-react';
import './OJTTools.css';

export default function OJTTools() {
  const [activeTool, setActiveTool] = useState('logbook');

  return (
    <div className="ojt-tools-container">
      <div className="ojt-tools-nav glass-panel">
        <button 
          className={`tool-btn ${activeTool === 'logbook' ? 'active' : ''}`}
          onClick={() => setActiveTool('logbook')}
        >
          <BookOpen size={16} /> Farm Logbook
        </button>
        <button 
          className={`tool-btn ${activeTool === 'todo' ? 'active' : ''}`}
          onClick={() => setActiveTool('todo')}
        >
          <CheckSquare size={16} /> Chores & Tasks
        </button>
        <button 
          className={`tool-btn ${activeTool === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTool('timer')}
        >
          <Clock size={16} /> Focus Timer
        </button>
        <button 
          className={`tool-btn ${activeTool === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTool('expenses')}
        >
          <Wallet size={16} /> Allowance
        </button>
      </div>

      <div className="ojt-tool-content">
        {activeTool === 'logbook' && <DailyLogbook />}
        {activeTool === 'todo' && <ToDoList />}
        {activeTool === 'timer' && <FocusTimer />}
        {activeTool === 'expenses' && <ExpenseTracker />}
      </div>
    </div>
  );
}
