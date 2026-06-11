import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

export default function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ojtTasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('ojtTasks', JSON.stringify(newTasks));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = { id: Date.now(), text: newTask, done: false };
    saveTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <motion.div 
      className="tool-card glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="tool-header">
        <div className="tool-title-group">
          <h2>📋 Farm Chores & Tasks</h2>
          <p>Don't forget what the farm supervisor asked you to do!</p>
        </div>
      </div>

      <form onSubmit={addTask} className="task-form">
        <input 
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="e.g. Check broiler temperatures..."
          className="task-input"
        />
        <button type="submit" className="task-add-btn">
          <Plus size={20} />
        </button>
      </form>

      <div className="tasks-list">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="empty-tasks">
              <span className="empty-emoji">🐄</span>
              <p>No chores right now! Take a break, my love.</p>
            </motion.div>
          ) : (
            tasks.map(task => (
              <motion.div 
                key={task.id}
                className={`task-item ${task.done ? 'done' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              >
                <button className="task-check-btn" onClick={() => toggleTask(task.id)}>
                  {task.done ? <CheckCircle color="var(--primary)" /> : <Circle color="#aaa" />}
                </button>
                <span className="task-text">{task.text}</span>
                <button className="task-delete-btn" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
