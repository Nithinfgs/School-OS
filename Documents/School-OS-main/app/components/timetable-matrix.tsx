'use client';

import React, { useState } from 'react';
import {
  TimetableSlot,
  TimetableGrid,
  TIMETABLE_DAYS,
  TIMETABLE_PERIODS,
  TIMETABLE_LEGEND,
  DEFAULT_DP2_GRID,
  getTimetableFromWorkspace,
  getCellClass,
} from '@/lib/timetable-data';
import { TimetableEditorModal } from '@/app/components/timetable-editor-modal';
import { Button } from '@/components/ui/button';
import { Clock, Edit3, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

interface TimetableMatrixProps {
  ws?: any;
  canEdit?: boolean;
  title?: string;
  subtitle?: string;
  onSaveSlot?: (day: string, periodKey: string, slot: TimetableSlot) => Promise<void> | void;
  onResetGrid?: () => Promise<void> | void;
}

export function TimetableMatrix({
  ws,
  canEdit = false,
  title = 'DP2 Timetable 2026–27',
  subtitle = 'Grade 12 Academic Timetable · Term 1 Active',
  onSaveSlot,
  onResetGrid,
}: TimetableMatrixProps) {
  const rows = ws?.rows || [];
  const gridData: TimetableGrid = getTimetableFromWorkspace(rows);

  const [selectedCell, setSelectedCell] = useState<{
    day: string;
    periodKey: string;
    periodLabel: string;
    slot: TimetableSlot;
  } | null>(null);

  const [editingCell, setEditingCell] = useState<{
    day: string;
    periodKey: string;
    periodLabel: string;
    slot: TimetableSlot;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const handleCellClick = (dayName: string, pKey: string, pLabel: string, slot: TimetableSlot) => {
    setSelectedCell({
      day: dayName,
      periodKey: pKey,
      periodLabel: pLabel,
      slot: slot || { code: 'FREE', title: 'Free Period', teacher: '—', room: '—', time: '' },
    });
  };

  const handleSaveSlot = async (day: string, periodKey: string, slot: TimetableSlot) => {
    try {
      if (onSaveSlot) {
        await onSaveSlot(day, periodKey, slot);
      } else if (ws?.add && ws?.remove) {
        // Find existing override for this slot if any
        const existing = ws.rows.find(
          (r: any) =>
            r.kind === 'timetable_override' &&
            r.data?.day === day &&
            r.data?.periodKey === periodKey
        );
        if (existing) {
          await ws.update(existing.id, {
            data: {
              ...existing.data,
              slot,
              updatedAt: new Date().toISOString(),
            },
          });
        } else {
          await ws.add({
            id: `override-${day.toLowerCase()}-${periodKey}-${Date.now()}`,
            kind: 'timetable_override',
            name: `Timetable: ${day} ${periodKey.toUpperCase()} (${slot.code})`,
            quantity: 1,
            data: {
              day,
              periodKey,
              slot,
              createdAt: new Date().toISOString(),
            },
          });
        }
      }

      setNotification(`Slot updated for ${day} (${periodKey.toUpperCase()})`);
      setTimeout(() => setNotification(null), 3500);

      // Update selected cell if active
      if (selectedCell && selectedCell.day === day && selectedCell.periodKey === periodKey) {
        setSelectedCell({
          ...selectedCell,
          slot,
        });
      }
    } catch (err: any) {
      console.error('Failed to save timetable slot:', err);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Are you sure you want to reset all customized timetable slots back to default DP2 template?')) {
      return;
    }
    try {
      if (onResetGrid) {
        await onResetGrid();
      } else if (ws?.remove) {
        const overrides = (ws.rows || []).filter(
          (r: any) => r.kind === 'timetable_override' || r.kind === 'timetable_matrix'
        );
        for (const ov of overrides) {
          await ws.remove(ov.id);
        }
      }
      setSelectedCell(null);
      setNotification('Timetable reset to standard template');
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      console.error('Failed to reset timetable:', err);
    }
  };

  return (
    <div className="dp2-timetable-wrapper">
      <div className="dp2-timetable-card">
        {/* Header Bar */}
        <div className="dp2-timetable-header-bar flex flex-wrap items-center justify-between gap-4">
          <div className="dp2-timetable-title-group">
            <h2 className="dp2-timetable-main-title flex items-center gap-2">
              {title}
              {canEdit && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Staff Editor Active
                </span>
              )}
            </h2>
            <p className="dp2-timetable-subtitle">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
                className="text-xs gap-1.5 border-slate-300 dark:border-slate-700"
              >
                <RotateCcw size={13} /> Reset Template
              </Button>
            )}
            <span className="dp2-timetable-pill-badge">
              <Clock size={13} className="inline mr-1" /> Term 1 Active
            </span>
          </div>
        </div>

        {notification && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Timetable Table Grid */}
        <div className="dp2-table-responsive-container">
          <table className="dp2-timetable-grid-table">
            <thead>
              <tr className="dp2-header-row-numbers">
                <th rowSpan={2} className="dp2-th-corner">
                  <span className="dp2-th-corner-text">Day \ Period</span>
                </th>
                <th className="dp2-th-period">1</th>
                <th className="dp2-th-period">2</th>
                <th rowSpan={2} className="dp2-th-break-time">
                  <div>09:50</div>
                  <div>–</div>
                  <div>10:00</div>
                </th>
                <th className="dp2-th-period">3</th>
                <th className="dp2-th-period">4</th>
                <th className="dp2-th-period">5</th>
                <th className="dp2-th-period">6</th>
                <th rowSpan={2} className="dp2-th-break-time">
                  <div>12:40</div>
                  <div>–</div>
                  <div>01:20</div>
                </th>
                <th className="dp2-th-period">7</th>
                <th className="dp2-th-period">8</th>
                <th className="dp2-th-period">9</th>
              </tr>
              <tr className="dp2-header-row-times">
                <th className="dp2-th-time">08:30–09:10</th>
                <th className="dp2-th-time">09:10–09:50</th>
                <th className="dp2-th-time">10:00–10:40</th>
                <th className="dp2-th-time">10:40–11:20</th>
                <th className="dp2-th-time">11:20–12:00</th>
                <th className="dp2-th-time">12:00–12:40</th>
                <th className="dp2-th-time">01:20–02:00</th>
                <th className="dp2-th-time">02:00–02:40</th>
                <th className="dp2-th-time">02:40–03:20</th>
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_DAYS.map((d, dayIndex) => {
                const daySchedule = gridData[d.name] || DEFAULT_DP2_GRID[d.name] || {};
                return (
                  <tr key={d.name} className="dp2-data-row">
                    <td className="dp2-day-cell">
                      <b>{d.name}</b>
                    </td>

                    {/* Period 1 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p1?.code || '')} ${daySchedule.p1?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p1', 'Period 1', daySchedule.p1)}
                        title={canEdit ? 'Click to view / edit period details' : 'Click to view details'}
                      >
                        {daySchedule.p1?.code || '—'}
                      </button>
                    </td>

                    {/* Period 2 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p2?.code || '')} ${daySchedule.p2?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p2', 'Period 2', daySchedule.p2)}
                        title={canEdit ? 'Click to view / edit period details' : 'Click to view details'}
                      >
                        {daySchedule.p2?.code || '—'}
                      </button>
                    </td>

                    {/* Short break: Render with rowSpan=5 on Monday */}
                    {dayIndex === 0 && (
                      <td rowSpan={5} className="dp2-th-break-title">
                        <div className="dp2-break-label-vertical">SHORT BREAK</div>
                      </td>
                    )}

                    {/* Period 3 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p3?.code || '')} ${daySchedule.p3?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p3', 'Period 3', daySchedule.p3)}
                      >
                        {daySchedule.p3?.code || '—'}
                      </button>
                    </td>

                    {/* Period 4 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p4?.code || '')} ${daySchedule.p4?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p4', 'Period 4', daySchedule.p4)}
                      >
                        {daySchedule.p4?.code || '—'}
                      </button>
                    </td>

                    {/* Period 5 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p5?.code || '')} ${daySchedule.p5?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p5', 'Period 5', daySchedule.p5)}
                      >
                        {daySchedule.p5?.code || '—'}
                      </button>
                    </td>

                    {/* Period 6 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p6?.code || '')} ${daySchedule.p6?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p6', 'Period 6', daySchedule.p6)}
                      >
                        {daySchedule.p6?.code || '—'}
                      </button>
                    </td>

                    {/* Lunch break: Render with rowSpan=5 on Monday */}
                    {dayIndex === 0 && (
                      <td rowSpan={5} className="dp2-th-break-title">
                        <div className="dp2-break-label-vertical">LUNCH BREAK</div>
                      </td>
                    )}

                    {/* Period 7 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p7?.code || '')} ${daySchedule.p7?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p7', 'Period 7', daySchedule.p7)}
                      >
                        {daySchedule.p7?.code || '—'}
                      </button>
                    </td>

                    {/* Period 8 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p8?.code || '')} ${daySchedule.p8?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p8', 'Period 8', daySchedule.p8)}
                      >
                        {daySchedule.p8?.code || '—'}
                      </button>
                    </td>

                    {/* Period 9 */}
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p9?.code || '')} ${daySchedule.p9?.isCustomized ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => handleCellClick(d.name, 'p9', 'Period 9', daySchedule.p9)}
                      >
                        {daySchedule.p9?.code || '—'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Cell Popover */}
        {selectedCell && (
          <div className="dp2-cell-detail-popover">
            <div className="dp2-detail-card">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`dp2-badge-large ${getCellClass(selectedCell.slot.code)}`}>
                  {selectedCell.slot.code} · {selectedCell.slot.title}
                </span>
                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 shadow-sm"
                      onClick={() => setEditingCell(selectedCell)}
                    >
                      <Edit3 size={13} /> Edit Slot
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedCell(null)}>
                    Close
                  </Button>
                </div>
              </div>
              <div className="dp2-detail-meta-grid">
                <div>
                  <small className="text-slate-500 block">Day & Time</small>
                  <b>
                    {selectedCell.day} · {selectedCell.periodLabel} ({selectedCell.slot.time})
                  </b>
                </div>
                <div>
                  <small className="text-slate-500 block">Teacher / Instructor</small>
                  <b>{selectedCell.slot.teacher}</b>
                </div>
                <div>
                  <small className="text-slate-500 block">Room / Location</small>
                  <b>{selectedCell.slot.room}</b>
                </div>
                {selectedCell.slot.notes && (
                  <div className="col-span-full mt-1">
                    <small className="text-slate-500 block">Notes</small>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {selectedCell.slot.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="dp2-timetable-legend-section">
          <h4 className="dp2-legend-title">Subject & Course Mapping</h4>
          <div className="dp2-legend-grid">
            {TIMETABLE_LEGEND.map((item) => (
              <div
                key={item.code}
                className="dp2-legend-chip"
                style={{ backgroundColor: item.bg, color: item.text, borderColor: item.border }}
              >
                <b>{item.code}</b>
                <span>{item.name.replace(`${item.code} · `, '')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Editor Modal */}
      {editingCell && (
        <TimetableEditorModal
          isOpen={!!editingCell}
          onClose={() => setEditingCell(null)}
          day={editingCell.day}
          periodKey={editingCell.periodKey}
          periodLabel={editingCell.periodLabel}
          currentSlot={editingCell.slot}
          onSave={handleSaveSlot}
        />
      )}
    </div>
  );
}
