"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  priority: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  lead?: { fullName: string; companyName: string | null };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (res.ok) setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate, priority }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setDueDate("");
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
    );
    await fetch("/api/tasks/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: newStatus }),
    });
  };

  const isOverdue = (dateStr: string, status: string) => {
    return status !== "COMPLETED" && new Date(dateStr) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tasks & Activities</h1>
          <p className="text-sm text-slate-400">Track deal follow-ups, calls, and sales assignments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 rounded-xl border border-slate-800 bg-slate-900/40">
            No scheduled tasks. Click "+ Add Task" to create your first follow-up.
          </div>
        ) : (
          tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            return (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50 gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-sm font-bold ${
                        task.status === "COMPLETED" ? "line-through text-slate-500" : "text-white"
                      }`}
                    >
                      {task.title}
                    </span>
                    {overdue && (
                      <span className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
                        <AlertTriangle className="h-3 w-3" /> OVERDUE
                      </span>
                    )}
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-mono text-slate-400">
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {task.lead && (
                      <span>
                        Lead: <strong className="text-slate-400">{task.lead.fullName}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Create Task</h2>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs uppercase font-medium text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Call Sarah about proposal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-medium text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Follow up on contract pricing discount..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase font-medium text-slate-300">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-medium text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}