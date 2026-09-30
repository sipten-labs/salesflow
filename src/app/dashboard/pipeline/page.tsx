"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Building, DollarSign, GripVertical } from "lucide-react";

interface Lead {
  id: string;
  fullName: string;
  companyName: string | null;
  status: string;
  estimatedValue: number;
}

const COLUMNS = [
  { id: "NEW", title: "New" },
  { id: "CONTACTED", title: "Contacted" },
  { id: "QUALIFIED", title: "Qualified" },
  { id: "PROPOSAL", title: "Proposal" },
  { id: "NEGOTIATION", title: "Negotiation" },
  { id: "WON", title: "Won" },
  { id: "LOST", title: "Lost" },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (res.ok) setLeads(data.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId;

    // Optimistic UI Update
    setLeads((prev) =>
      prev.map((lead) => (lead.id === draggableId ? { ...lead, status: newStatus } : lead))
    );

    try {
      await fetch("/api/leads/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: draggableId, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status on server", err);
      fetchLeads(); // Rollback on failure
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Pipeline Board...</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Sales Pipeline</h1>
        <p className="text-sm text-slate-400">Drag and drop leads across deal stages.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((column) => {
            const columnLeads = leads.filter((lead) => lead.status === column.id);
            const columnTotal = columnLeads.reduce((sum, item) => sum + item.estimatedValue, 0);

            return (
              <div
                key={column.id}
                className="w-72 shrink-0 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col max-h-[calc(100vh-180px)]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{column.title}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
                      {columnLeads.length}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">
                    ${columnTotal.toLocaleString()}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 space-y-2.5 overflow-y-auto min-h-[150px] transition ${
                        snapshot.isDraggingOver ? "bg-slate-800/20" : ""
                      }`}
                    >
                      {columnLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`rounded-lg border border-slate-800 bg-slate-900 p-3 shadow-md hover:border-slate-700 transition ${
                                snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500/50" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="text-sm font-semibold text-white line-clamp-1">
                                  {lead.fullName}
                                </span>
                                <GripVertical className="h-4 w-4 text-slate-600 cursor-grab" />
                              </div>

                              {lead.companyName && (
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                  <Building className="h-3 w-3" />
                                  <span className="truncate">{lead.companyName}</span>
                                </p>
                              )}

                              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                                <span className="flex items-center font-semibold text-emerald-400">
                                  <DollarSign className="h-3 w-3" />
                                  {lead.estimatedValue.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}