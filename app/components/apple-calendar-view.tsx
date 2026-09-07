'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  Search,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Flame,
  LayoutGrid,
} from 'lucide-react';
import {
  IBDP_ACADEMIC_CALENDAR_EVENTS,
  ACADEMIC_MONTHS,
  CATEGORY_COLORS,
  IBDPCalendarEvent,
  getEventsForDate,
  getEventsForMonth,
} from '@/lib/ibdp-calendar';

interface AppleCalendarViewProps {
  ws?: any;
  initialDate?: string;
  onOpenClass?: (cls: any) => void;
}

export function AppleCalendarView({
  ws,
  initialDate = '2026-09-07',
  onOpenClass,
}: AppleCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEvent, setActiveEvent] = useState<IBDPCalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<string | null>(null);

  // Current year & month based on selectedDate
  const currDateObj = useMemo(() => new Date(selectedDate + 'T12:00:00'), [selectedDate]);
  const currYear = currDateObj.getFullYear();
  const currMonth = currDateObj.getMonth() + 1; // 1-12

  // Month info
  const currentMonthInfo = useMemo(() => {
    return (
      ACADEMIC_MONTHS.find((m) => m.year === currYear && m.month === currMonth) || {
        year: currYear,
        month: currMonth,
        name: currDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        shortName: currDateObj.toLocaleDateString('en-US', { month: 'short' }),
        workingDays: 22,
      }
    );
  }, [currYear, currMonth, currDateObj]);

  // Filtered IBDP Events
  const filteredEvents = useMemo(() => {
    return IBDP_ACADEMIC_CALENDAR_EVENTS.filter((e) => {
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.categoryLabel.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.target && e.target.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Timetable lessons from workspace if available
  const timetableRows = useMemo(() => {
    if (!ws?.rows) return [];
    return ws.rows.filter((r: any) => r.kind === 'timetable');
  }, [ws]);

  // Helper: Navigate
  const handlePrev = () => {
    if (viewMode === 'year') {
      const d = new Date(currDateObj);
      d.setFullYear(d.getFullYear() - 1);
      setSelectedDate(d.toISOString().slice(0, 10));
    } else if (viewMode === 'month') {
      const d = new Date(currDateObj);
      d.setMonth(d.getMonth() - 1);
      setSelectedDate(d.toISOString().slice(0, 10));
    } else {
      const d = new Date(currDateObj);
      d.setDate(d.getDate() - 7);
      setSelectedDate(d.toISOString().slice(0, 10));
    }
  };

  const handleNext = () => {
    if (viewMode === 'year') {
      const d = new Date(currDateObj);
      d.setFullYear(d.getFullYear() + 1);
      setSelectedDate(d.toISOString().slice(0, 10));
    } else if (viewMode === 'month') {
      const d = new Date(currDateObj);
      d.setMonth(d.getMonth() + 1);
      setSelectedDate(d.toISOString().slice(0, 10));
    } else {
      const d = new Date(currDateObj);
      d.setDate(d.getDate() + 7);
      setSelectedDate(d.toISOString().slice(0, 10));
    }
  };

  const handleToday = () => {
    const today = '2026-09-07';
    setSelectedDate(today);
  };

  // Compute Days for Month Grid
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(currYear, currMonth - 1, 1);
    const lastDayOfMonth = new Date(currYear, currMonth, 0);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      events: IBDPCalendarEvent[];
      isToday: boolean;
      isSelected: boolean;
      dayOfWeek: number;
    }> = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(currYear, currMonth - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDayNum = prevMonthLastDay - i;
      const prevDate = new Date(currYear, currMonth - 2, prevDayNum);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        dateStr,
        dayNumber: prevDayNum,
        isCurrentMonth: false,
        events: filteredEvents.filter((e) => dateStr >= e.startDate && dateStr <= e.endDate),
        isToday: dateStr === '2026-09-07',
        isSelected: dateStr === selectedDate,
        dayOfWeek: prevDate.getDay(),
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currYear}-${String(currMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        events: filteredEvents.filter((e) => dateStr >= e.startDate && dateStr <= e.endDate),
        isToday: dateStr === '2026-09-07',
        isSelected: dateStr === selectedDate,
        dayOfWeek: (startDayOfWeek + day - 1) % 7,
      });
    }

    // Next month filler days to complete grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(currYear, currMonth, day);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        events: filteredEvents.filter((e) => dateStr >= e.startDate && dateStr <= e.endDate),
        isToday: dateStr === '2026-09-07',
        isSelected: dateStr === selectedDate,
        dayOfWeek: nextDate.getDay(),
      });
    }

    return days;
  }, [currYear, currMonth, filteredEvents, selectedDate]);

  // Compute Days for Week View
  const weekDays = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dayOfWeek);

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      dayName: string;
      events: IBDPCalendarEvent[];
      isToday: boolean;
      isSelected: boolean;
      lessons: any[];
    }> = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      const dateStr = current.toISOString().slice(0, 10);
      const weekdayNum = current.getDay();

      const lessons = timetableRows
        .filter((r: any) => (r.data?.weekdays || [1, 2, 3, 4, 5]).includes(weekdayNum))
        .sort((a: any, b: any) => String(a.data?.startTime).localeCompare(String(b.data?.startTime)));

      days.push({
        dateStr,
        dayNumber: current.getDate(),
        dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
        events: filteredEvents.filter((e) => dateStr >= e.startDate && dateStr <= e.endDate),
        isToday: dateStr === '2026-09-07',
        isSelected: dateStr === selectedDate,
        lessons,
      });
    }

    return days;
  }, [selectedDate, filteredEvents, timetableRows]);

  // Days for Year View Mini Months
  const academicYearMonths = useMemo(() => {
    return ACADEMIC_MONTHS.map((m) => {
      const firstDay = new Date(m.year, m.month - 1, 1).getDay();
      const daysCount = new Date(m.year, m.month, 0).getDate();
      const monthEvents = getEventsForMonth(m.year, m.month);

      const days = [];
      for (let i = 0; i < firstDay; i++) {
        days.push({ empty: true, day: 0, dateStr: '', hasEvents: false, events: [] });
      }
      for (let day = 1; day <= daysCount; day++) {
        const dateStr = `${m.year}-${String(m.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvts = monthEvents.filter((e) => dateStr >= e.startDate && dateStr <= e.endDate);
        days.push({
          empty: false,
          day,
          dateStr,
          hasEvents: dayEvts.length > 0,
          events: dayEvts,
          isToday: dateStr === '2026-09-07',
          isSelected: dateStr === selectedDate,
        });
      }

      return {
        ...m,
        days,
        eventCount: monthEvents.length,
      };
    });
  }, [selectedDate]);

  return (
    <div className="apple-calendar-container">
      {/* Top Header Bar */}
      <div className="apple-calendar-header">
        {/* Left: Navigation & Date Title */}
        <div className="flex items-center gap-3">
          <div className="apple-nav-buttons">
            <button
              type="button"
              onClick={handlePrev}
              className="apple-nav-btn"
              title="Previous"
              aria-label="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="apple-today-btn"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="apple-nav-btn"
              title="Next"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="apple-title-group">
            <h2 className="apple-calendar-title">
              {viewMode === 'year'
                ? '2026 – 2027 DP Academic Year'
                : currentMonthInfo.name}
            </h2>
            {viewMode !== 'year' && (
              <span className="apple-working-badge">
                {currentMonthInfo.workingDays} Working Days
              </span>
            )}
          </div>
        </div>

        {/* Right: Apple Segmented Pill Switcher & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search box */}
          <div className="apple-search-box">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events, exams, IAs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="apple-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Filter Select */}
          <div className="apple-filter-wrapper">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="apple-category-select"
            >
              <option value="all">All Categories</option>
              <option value="assessment">🔴 Assessments & Exams</option>
              <option value="deadline">🟣 IA, TOK & EE Deadlines</option>
              <option value="holiday">🟢 Holidays & Breaks</option>
              <option value="celebration">🔵 Celebrations & Events</option>
              <option value="ptm">🟡 PTM / 3-Way Conference</option>
              <option value="mufti">🌸 Mufti Day</option>
              <option value="annual">🟠 Annual / Sports</option>
              <option value="reopening">🔷 School Reopening</option>
            </select>
          </div>

          {/* EXACT Apple Calendar Segmented Control */}
          <div className="apple-segmented-control" role="tablist" aria-label="Calendar View Modes">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'week'}
              className={`apple-segment-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <div className="apple-segment-divider" />
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'month'}
              className={`apple-segment-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <div className="apple-segment-divider" />
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'year'}
              className={`apple-segment-btn ${viewMode === 'year' ? 'active' : ''}`}
              onClick={() => setViewMode('year')}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Quick Strip */}
      <div className="apple-category-strip">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`apple-cat-chip ${selectedCategory === 'all' ? 'active-all' : ''}`}
        >
          All ({IBDP_ACADEMIC_CALENDAR_EVENTS.length})
        </button>
        {Object.entries(CATEGORY_COLORS).map(([key, config]) => {
          const count = IBDP_ACADEMIC_CALENDAR_EVENTS.filter((e) => e.category === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
              className={`apple-cat-chip ${selectedCategory === key ? 'active' : ''}`}
              style={{
                borderColor: selectedCategory === key ? config.color : 'transparent',
                backgroundColor: selectedCategory === key ? config.bgLight : undefined,
                color: selectedCategory === key ? config.textColor : undefined,
              }}
            >
              <span
                className="apple-cat-dot"
                style={{ backgroundColor: config.color }}
              />
              {config.label}
              <span className="apple-cat-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== MONTH VIEW ==================== */}
      {viewMode === 'month' && (
        <div className="apple-month-view-wrapper">
          {/* Weekday Header */}
          <div className="apple-weekday-grid">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w, idx) => (
              <div
                key={w}
                className={`apple-weekday-label ${idx === 0 || idx === 6 ? 'weekend' : ''}`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Month Matrix Grid */}
          <div className="apple-month-grid">
            {monthDays.map((d, index) => {
              const isSelected = selectedDayEvents === d.dateStr;
              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDate(d.dateStr);
                    if (d.events.length > 0) {
                      setSelectedDayEvents(isSelected ? null : d.dateStr);
                    }
                  }}
                  className={`apple-month-cell ${!d.isCurrentMonth ? 'other-month' : ''} ${
                    d.isToday ? 'is-today' : ''
                  } ${isSelected ? 'is-selected' : ''}`}
                >
                  <div className="apple-cell-header">
                    <span
                      className={`apple-day-number ${d.isToday ? 'today-pill' : ''} ${
                        d.isSelected ? 'selected-pill' : ''
                      }`}
                    >
                      {d.dayNumber}
                    </span>
                    {d.events.length > 0 && (
                      <span className="apple-cell-badge-count">
                        {d.events.length} event{d.events.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Event Badges in Cell */}
                  <div className="apple-cell-events">
                    {d.events.slice(0, 3).map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEvent(evt);
                        }}
                        className="apple-event-pill"
                        style={{
                          backgroundColor: evt.bgLight,
                          borderLeft: `3px solid ${evt.color}`,
                          color: evt.color,
                        }}
                        title={`${evt.title} (${evt.categoryLabel})`}
                      >
                        <span className="apple-event-pill-text">{evt.title}</span>
                      </div>
                    ))}
                    {d.events.length > 3 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayEvents(d.dateStr);
                        }}
                        className="apple-event-more"
                      >
                        +{d.events.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== WEEK VIEW ==================== */}
      {viewMode === 'week' && (
        <div className="apple-week-view-wrapper">
          <div className="apple-week-grid">
            {weekDays.map((d, index) => (
              <div
                key={index}
                className={`apple-week-col ${d.isToday ? 'is-today-col' : ''}`}
              >
                {/* Day Header */}
                <div className="apple-week-col-header">
                  <span className="apple-week-dayname">{d.dayName}</span>
                  <span
                    className={`apple-week-daynum ${d.isToday ? 'today-circle' : ''} ${
                      d.isSelected ? 'selected-circle' : ''
                    }`}
                  >
                    {d.dayNumber}
                  </span>
                </div>

                {/* All-day Events for Date */}
                <div className="apple-week-allday-container">
                  {d.events.length > 0 ? (
                    d.events.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => setActiveEvent(evt)}
                        className="apple-week-event-card"
                        style={{
                          backgroundColor: evt.bgLight,
                          borderLeft: `3px solid ${evt.color}`,
                        }}
                      >
                        <div
                          className="apple-week-event-title"
                          style={{ color: evt.color }}
                        >
                          {evt.title}
                        </div>
                        <div className="apple-week-event-meta">
                          <span>{evt.categoryLabel}</span>
                          {evt.target && (
                            <span className="apple-target-tag">{evt.target}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="apple-week-no-events">No major events</div>
                  )}
                </div>

                {/* Scheduled Periods for Weekday */}
                {d.lessons.length > 0 && (
                  <div className="apple-week-timetable-strip">
                    <div className="apple-week-tt-header">
                      <Clock size={12} /> DP2 Timetable
                    </div>
                    {d.lessons.map((les: any) => (
                      <div
                        key={les.id}
                        onClick={() => onOpenClass && onOpenClass(les)}
                        className="apple-week-lesson-item"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground">
                            {les.data?.period} · {les.data?.class}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {les.data?.startTime}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {les.data?.room} · {les.data?.teacher}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== YEAR VIEW ==================== */}
      {viewMode === 'year' && (
        <div className="apple-year-view-wrapper">
          <div className="apple-year-grid">
            {academicYearMonths.map((m) => (
              <div
                key={`${m.year}-${m.month}`}
                onClick={() => {
                  setSelectedDate(`${m.year}-${String(m.month).padStart(2, '0')}-01`);
                  setViewMode('month');
                }}
                className="apple-mini-month-card"
              >
                <div className="apple-mini-month-header">
                  <span className="apple-mini-month-name">{m.name}</span>
                  <span className="apple-mini-workdays">{m.workingDays} days</span>
                </div>

                {/* Mini Weekday Headers */}
                <div className="apple-mini-days-header">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
                    <span key={i} className="apple-mini-weekday-cell">
                      {wd}
                    </span>
                  ))}
                </div>

                {/* Mini Month Matrix */}
                <div className="apple-mini-month-grid">
                  {m.days.map((cell, idx) => (
                    <div
                      key={idx}
                      className={`apple-mini-day-cell ${cell.empty ? 'empty' : ''} ${
                        cell.isToday ? 'mini-today' : ''
                      }`}
                    >
                      {!cell.empty && (
                        <>
                          <span className="apple-mini-day-num">{cell.day}</span>
                          {cell.hasEvents && (
                            <span
                              className="apple-mini-event-dot"
                              style={{
                                backgroundColor: cell.events[0]?.color || '#ef4444',
                              }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mini Event Preview List */}
                <div className="apple-mini-event-preview">
                  {m.days
                    .filter((c) => c.hasEvents)
                    .slice(0, 2)
                    .map((c, i) => (
                      <div
                        key={i}
                        className="apple-mini-event-row truncate"
                        title={c.events.map((e) => e.title).join(', ')}
                      >
                        <span
                          className="apple-mini-bullet"
                          style={{ backgroundColor: c.events[0]?.color }}
                        />
                        <span className="text-[11px] font-medium text-foreground">
                          {c.day}: {c.events[0]?.title}
                        </span>
                      </div>
                    ))}
                  {m.eventCount > 2 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{m.eventCount - 2} more key dates
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SELECTED DAY INSPECTOR MODAL / DRAWER ==================== */}
      {selectedDayEvents && (
        <div className="apple-day-inspector-overlay" onClick={() => setSelectedDayEvents(null)}>
          <div
            className="apple-day-inspector-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="apple-inspector-header">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Events on{' '}
                  {new Date(selectedDayEvents + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {getEventsForDate(selectedDayEvents).length} scheduled items
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="apple-close-btn"
              >
                <X size={16} />
              </button>
            </div>

            <div className="apple-inspector-body">
              {getEventsForDate(selectedDayEvents).map((evt) => (
                <div
                  key={evt.id}
                  className="apple-inspector-event-item"
                  style={{
                    backgroundColor: evt.bgLight,
                    borderLeft: `4px solid ${evt.color}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm" style={{ color: evt.color }}>
                      {evt.title}
                    </h4>
                    <span
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: evt.color,
                        color: '#fff',
                      }}
                    >
                      {evt.categoryLabel}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    <b>Dates:</b> {evt.startDate}
                    {evt.startDate !== evt.endDate ? ` to ${evt.endDate}` : ''}
                    {evt.target && ` · Cohort: ${evt.target}`}
                  </div>

                  {evt.description && (
                    <p className="text-xs text-foreground mt-2 leading-relaxed">
                      {evt.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SINGLE EVENT DETAIL MODAL ==================== */}
      {activeEvent && (
        <div className="apple-day-inspector-overlay" onClick={() => setActiveEvent(null)}>
          <div
            className="apple-single-event-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="apple-modal-top-accent"
              style={{ backgroundColor: activeEvent.color }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-1.5"
                    style={{
                      backgroundColor: activeEvent.bgLight,
                      color: activeEvent.color,
                    }}
                  >
                    {activeEvent.categoryLabel}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    {activeEvent.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveEvent(null)}
                  className="apple-close-btn"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="apple-modal-details-grid">
                <div className="apple-detail-row">
                  <CalendarDays size={16} className="text-muted-foreground" />
                  <div>
                    <span className="apple-detail-label">Schedule Window</span>
                    <span className="apple-detail-val">
                      {activeEvent.startDate}
                      {activeEvent.startDate !== activeEvent.endDate
                        ? ` to ${activeEvent.endDate}`
                        : ''}
                    </span>
                  </div>
                </div>

                {activeEvent.target && (
                  <div className="apple-detail-row">
                    <GraduationCap size={16} className="text-muted-foreground" />
                    <div>
                      <span className="apple-detail-label">Target Cohort</span>
                      <span className="apple-detail-val">{activeEvent.target}</span>
                    </div>
                  </div>
                )}
              </div>

              {activeEvent.description && (
                <div className="apple-modal-description">
                  <p className="text-sm text-foreground leading-relaxed">
                    {activeEvent.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-5">
                <button
                  type="button"
                  onClick={() => setActiveEvent(null)}
                  className="apple-modal-dismiss-btn"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
