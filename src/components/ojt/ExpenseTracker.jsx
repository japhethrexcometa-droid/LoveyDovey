import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, DollarSign } from 'lucide-react';

export default function ExpenseTracker() {
  const [allowance, setAllowance] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const savedAll = localStorage.getItem('ojtAllowance');
    const savedExp = localStorage.getItem('ojtExpenses');
    if (savedAll) setAllowance(Number(savedAll));
    if (savedExp) setExpenses(JSON.parse(savedExp));
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

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = allowance - totalExpenses;

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
    </motion.div>
  );
}
