import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Target, Sparkles } from 'lucide-react';

export default function ExpenseTracker() {
  const [allowance, setAllowance] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  
  // Savings goal
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    const savedAll = localStorage.getItem('ojtAllowance');
    const savedExp = localStorage.getItem('ojtExpenses');
    const savedGoalName = localStorage.getItem('ojtGoalName');
    const savedGoalAmt = localStorage.getItem('ojtGoalAmount');
    const savedTotalSaved = localStorage.getItem('ojtTotalSaved');
    if (savedAll) setAllowance(Number(savedAll));
    if (savedExp) setExpenses(JSON.parse(savedExp));
    if (savedGoalName) setGoalName(savedGoalName);
    if (savedGoalAmt) setGoalAmount(Number(savedGoalAmt));
    if (savedTotalSaved) setTotalSaved(Number(savedTotalSaved));
  }, []);

  const saveAllowance = (val) => {
    setAllowance(val);
    localStorage.setItem('ojtAllowance', val);
  };

  const saveExpenses = (newExp) => {
    setExpenses(newExp);
    localStorage.setItem('ojtExpenses', JSON.stringify(newExp));
  };

  const addExpense = (e) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const newExp = { id: Date.now(), desc, amount: Number(amount) };
    saveExpenses([...expenses, newExp]);
    setDesc('');
    setAmount('');
  };

  const deleteExpense = (id) => {
    saveExpenses(expenses.filter(e => e.id !== id));
  };

  const handleSaveGoal = (name, amt) => {
    setGoalName(name);
    setGoalAmount(amt);
    localStorage.setItem('ojtGoalName', name);
    localStorage.setItem('ojtGoalAmount', amt);
  };

  const handleAddSavings = () => {
    const amt = prompt("How much did you save today? (₱)");
    if (!amt || isNaN(Number(amt))) return;
    const newTotal = totalSaved + Number(amt);
    setTotalSaved(newTotal);
    localStorage.setItem('ojtTotalSaved', newTotal);
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = allowance - totalExpenses;
  const goalProgress = goalAmount > 0 ? Math.min(100, (totalSaved / goalAmount) * 100) : 0;
  const goalReached = goalAmount > 0 && totalSaved >= goalAmount;

  return (
    <motion.div 
      className="tool-card glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="tool-header">
        <div className="tool-title-group">
          <h2>💰 OJT Allowance Tracker</h2>
          <p>Track your fare and food budget for the day!</p>
        </div>
      </div>

      <div className="allowance-input">
        <label>Daily Allowance (₱):</label>
        <input 
          type="number" 
          value={allowance || ''} 
          onChange={(e) => saveAllowance(Number(e.target.value))}
          placeholder="e.g. 500"
        />
      </div>

      <div className="expense-summary">
        <div className="summary-card">
          <span>Remaining</span>
          <h3 style={{ color: remaining < 0 ? '#ff6b6b' : 'var(--primary)' }}>₱{remaining}</h3>
        </div>
        <div className="summary-card">
          <span>Spent</span>
          <h3>₱{totalExpenses}</h3>
        </div>
      </div>

      <form onSubmit={addExpense} className="expense-form">
        <input 
          type="text" 
          placeholder="What did you buy?" 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="expense-desc"
        />
        <input 
          type="number" 
          placeholder="Amount (₱)" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="expense-amt"
        />
        <button type="submit" className="task-add-btn">
          <Plus size={20} />
        </button>
      </form>

      <div className="expenses-list">
        <AnimatePresence>
          {expenses.map(exp => (
            <motion.div 
              key={exp.id}
              className="expense-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="exp-info">
                <span className="exp-desc">{exp.desc}</span>
                <span className="exp-amt">₱{exp.amount}</span>
              </div>
              <button className="task-delete-btn" onClick={() => deleteExpense(exp.id)}>
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Savings Goal Section */}
      <div className="savings-goal-section">
        <div className="savings-header">
          <Target size={18} color="var(--primary)" />
          <h3>Savings Goal</h3>
        </div>

        {goalAmount === 0 ? (
          <div className="savings-setup">
            <p>Set a goal to save for something special! 🎯</p>
            <button 
              className="task-add-btn savings-setup-btn"
              onClick={() => {
                const name = prompt("What are you saving for? (e.g. Date Night 🥰)");
                if (!name) return;
                const amt = prompt("How much do you need? (₱)");
                if (!amt || isNaN(Number(amt))) return;
                handleSaveGoal(name, Number(amt));
              }}
            >
              <Plus size={16} /> Set Goal
            </button>
          </div>
        ) : (
          <div className="savings-progress-card">
            <div className="savings-info">
              <span className="savings-goal-name">
                {goalReached && <Sparkles size={14} />}
                {goalName}
              </span>
              <span className="savings-amounts">
                ₱{totalSaved} / ₱{goalAmount}
              </span>
            </div>
            <div className="savings-bar-track">
              <motion.div 
                className={`savings-bar-fill ${goalReached ? 'complete' : ''}`}
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="savings-actions">
              <button className="task-add-btn" onClick={handleAddSavings}>
                <Plus size={14} /> Add Savings
              </button>
              {goalReached && (
                <motion.span 
                  className="goal-reached-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  🎉 Goal Reached!
                </motion.span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
