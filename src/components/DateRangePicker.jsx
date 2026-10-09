import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight, X, Edit3, Calendar as CalendarIcon } from 'lucide-react';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const [activePopup, setActivePopup] = useState(null); // 'start', 'end', or null
  const [isManualMode, setIsManualMode] = useState(false);
  
  // Manual string states
  const [manualStartStr, setManualStartStr] = useState('');
  const [manualEndStr, setManualEndStr] = useState('');

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState(null);

  const startInputRef = useRef(null);
  const endInputRef = useRef(null);
  const popupRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Parse string YYYY-MM-DD to Date
  const parseDateStr = (str) => {
    if (!str || str.length !== 10) return null; // 10 chars: YYYY-MM-DD
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      // Disallow future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) return null;
      return date;
    }
    return null;
  };

  // Format Date to YYYY-MM-DD
  const formatDateForInput = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Sync manual strings when props change
  useEffect(() => {
    setManualStartStr(formatDateForInput(startDate));
    setManualEndStr(formatDateForInput(endDate));
  }, [startDate, endDate]);

  // Window Resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside the popup, or inside either input field
      const isOutsidePopup = popupRef.current && !popupRef.current.contains(event.target);
      const isOutsideStart = startInputRef.current && !startInputRef.current.contains(event.target);
      const isOutsideEnd = endInputRef.current && !endInputRef.current.contains(event.target);
      
      if (activePopup && isOutsidePopup && isOutsideStart && isOutsideEnd) {
        setActivePopup(null);
      }
    };
    if (activePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopup]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActivePopup(null);
    };
    if (activePopup) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePopup]);

  // Sync calendar month when opening
  useEffect(() => {
    if (activePopup === 'start' && startDate) {
      setCurrentMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    } else if (activePopup === 'end' && endDate) {
      setCurrentMonth(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
    } else if (activePopup === 'end' && startDate) {
      setCurrentMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    } else if (activePopup) {
      setCurrentMonth(new Date());
    }
  }, [activePopup, startDate, endDate]);

  const handleManualChange = (type, value) => {
    const val = value; // YYYY-MM-DD
    if (type === 'start') {
      setManualStartStr(val);
      const d = parseDateStr(val);
      if (d) {
        if (endDate && d > endDate) onChange(d, d);
        else onChange(d, endDate);
      } else {
        onChange(null, endDate); // clear if invalid
      }
    } else {
      setManualEndStr(val);
      const d = parseDateStr(val);
      if (d) {
        onChange(startDate, d);
      } else {
        onChange(startDate, null);
      }
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return; // Prevent clicking future dates

    if (activePopup === 'start') {
      if (endDate && date > endDate) {
        onChange(date, date); // Swap behavior
      } else {
        onChange(date, endDate);
      }
      setActivePopup('end'); // Auto move to end
    } else if (activePopup === 'end') {
      if (startDate && date < startDate) {
        onChange(date, startDate);
      } else {
        onChange(startDate, date);
      }
      setTimeout(() => setActivePopup(null), 150); // Close smoothly
    }
  };

  const isSelected = (date) => {
    if (!date) return false;
    const time = date.getTime();
    return (startDate && time === startDate.getTime()) || (endDate && time === endDate.getTime());
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isInRange = (date) => {
    if (!date || !startDate) return false;
    const time = date.getTime();
    const start = startDate.getTime();
    
    if (endDate) {
      return time > start && time < endDate.getTime();
    }
    
    if (hoverDate && activePopup === 'end') {
      const hover = hoverDate.getTime();
      return (time > start && time < hover);
    }
    return false;
  };

  const formatDateDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const setShortcut = (type) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (type === 'today') {
      onChange(today, today);
      setActivePopup(null);
    } else if (type === 'thisMonth') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      onChange(start, end);
      setActivePopup(null);
    } else if (type === 'last30') {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      onChange(start, today);
      setActivePopup(null);
    } else if (type === 'clear') {
      onChange(null, null);
      setActivePopup(null);
    }
  };

  // Compute portal coordinates
  const getPortalStyles = () => {
    if (windowWidth < 768) {
      // Mobile bottom sheet
      return {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      };
    }

    // Desktop floating
    const ref = activePopup === 'start' ? startInputRef : endInputRef;
    if (!ref.current) return {};
    
    const rect = ref.current.getBoundingClientRect();
    
    let style = {
      position: 'absolute',
      zIndex: 9999,
      width: '380px'
    };

    if (activePopup === 'start') {
      const spaceOnLeft = rect.left;
      if (spaceOnLeft >= 400) {
        style.top = Math.max(16, rect.top + window.scrollY - 180);
        style.left = rect.left + window.scrollX - 380 - 24; 
      } else {
        style.top = rect.bottom + window.scrollY + 8;
        style.left = rect.left + window.scrollX;
      }
    } else {
      const spaceOnRight = window.innerWidth - rect.right;
      if (spaceOnRight >= 400) {
        style.top = Math.max(16, rect.top + window.scrollY - 180);
        style.left = rect.right + window.scrollX + 24; 
      } else {
        style.top = rect.bottom + window.scrollY + 8;
        style.left = rect.right + window.scrollX - 380; 
      }
    }

    return style;
  };

  const renderCalendarPopup = () => {
    if (!activePopup) return null;
    const portalStyles = getPortalStyles();
    
    return createPortal(
      <>
        {/* Mobile Backdrop */}
        {windowWidth < 768 && (
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[9998] animate-in fade-in"
            onClick={() => setActivePopup(null)}
          />
        )}
        
        <div 
          ref={popupRef}
          style={portalStyles}
          className={`bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-gray-100 p-5 animate-in ${windowWidth < 768 ? 'slide-in-from-bottom-4 rounded-b-none' : 'slide-in-from-top-2 fade-in'} duration-200`}
        >
          {/* Header & Controls */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-gray-800 text-lg">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h4>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" onClick={handlePrevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {(() => {
                const today = new Date();
                const isCurrentOrFutureMonth = currentMonth.getFullYear() > today.getFullYear() || 
                                               (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() >= today.getMonth());
                return (
                  <button 
                    className={`p-2 rounded-lg transition-colors ${isCurrentOrFutureMonth ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`} 
                    onClick={isCurrentOrFutureMonth ? undefined : handleNextMonth}
                    disabled={isCurrentOrFutureMonth}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0" onMouseLeave={() => setHoverDate(null)}>
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="w-full h-10"></div>;
              
              const isSel = isSelected(date);
              const isRng = isInRange(date);
              const isTod = isToday(date);
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isFuture = date > today;
              
              return (
                <div 
                  key={i} 
                  className={`w-full h-10 flex items-center justify-center relative ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer'} ${isRng && !isFuture ? 'bg-soft-mint' : ''} ${isSel ? (activePopup === 'end' || date.getTime() === startDate?.getTime() ? 'rounded-l-full' : '') : ''} ${isSel ? (activePopup === 'start' || date.getTime() === endDate?.getTime() ? 'rounded-r-full' : '') : ''}`}
                  onClick={() => !isFuture && handleDateClick(date)}
                  onMouseEnter={() => !isFuture && activePopup === 'end' && setHoverDate(date)}
                >
                  <div className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200
                    ${isFuture ? 'text-gray-300 opacity-40' : ''}
                    ${isSel && !isFuture ? 'bg-mint text-white shadow-md z-10' : ''}
                    ${!isSel && isTod && !isFuture ? 'border border-mint text-mint z-10' : ''}
                    ${!isSel && !isTod && !isFuture ? 'text-gray-700 hover:bg-gray-100 z-10' : ''}
                  `}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shortcuts */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
            <button onClick={() => setShortcut('today')} className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">Today</button>
            <button onClick={() => setShortcut('thisMonth')} className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">This Month</button>
            <button onClick={() => setShortcut('clear')} className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100 ml-auto">Clear</button>
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <div className="w-full flex flex-col">
      {/* Input Fields */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Start Date Field */}
        <div 
          ref={startInputRef}
          className={`flex-1 flex items-center bg-white border ${activePopup === 'start' ? 'border-mint ring-2 ring-mint/20' : 'border-gray-200'} rounded-xl px-4 py-2.5 transition-all hover:border-gray-300 shadow-sm ${!isManualMode ? 'cursor-pointer' : ''}`}
          onClick={() => !isManualMode && setActivePopup('start')}
        >
          <CalendarDays className={`w-5 h-5 mr-3 shrink-0 ${startDate || activePopup === 'start' ? 'text-mint' : 'text-gray-400'}`} />
          <div className="flex flex-col w-full overflow-hidden">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Start Date</span>
            {isManualMode ? (
              <input 
                type="date"
                value={manualStartStr}
                max={formatDateForInput(new Date())}
                onChange={(e) => handleManualChange('start', e.target.value)}
                className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none [::-webkit-calendar-picker-indicator]:hidden [::-webkit-calendar-picker-indicator]:appearance-none"
              />
            ) : (
              <span className={`text-sm font-semibold truncate ${startDate ? 'text-gray-800' : 'text-gray-400'}`}>
                {startDate ? formatDateDisplay(startDate) : 'Select start date'}
              </span>
            )}
          </div>
        </div>
        
        {/* End Date Field */}
        <div 
          ref={endInputRef}
          className={`flex-1 flex items-center bg-white border ${activePopup === 'end' ? 'border-mint ring-2 ring-mint/20' : 'border-gray-200'} rounded-xl px-4 py-2.5 transition-all hover:border-gray-300 shadow-sm ${!isManualMode ? 'cursor-pointer' : ''}`}
          onClick={() => !isManualMode && setActivePopup('end')}
        >
          <CalendarDays className={`w-5 h-5 mr-3 shrink-0 ${endDate || activePopup === 'end' ? 'text-mint' : 'text-gray-400'}`} />
          <div className="flex flex-col w-full overflow-hidden">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">End Date</span>
            {isManualMode ? (
              <input 
                type="date"
                value={manualEndStr}
                max={formatDateForInput(new Date())}
                onChange={(e) => handleManualChange('end', e.target.value)}
                className="w-full text-sm font-semibold text-gray-800 bg-transparent focus:outline-none [::-webkit-calendar-picker-indicator]:hidden [::-webkit-calendar-picker-indicator]:appearance-none"
              />
            ) : (
              <span className={`text-sm font-semibold truncate ${endDate ? 'text-gray-800' : 'text-gray-400'}`}>
                {endDate ? formatDateDisplay(endDate) : 'Select end date'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {startDate && endDate && endDate < startDate && (
        <span className="text-xs text-red-500 font-medium -mt-2 mb-4 inline-block">End date cannot be earlier than Start date.</span>
      )}

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <button 
          onClick={() => {
            setIsManualMode(!isManualMode);
            setActivePopup(null);
          }}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-1.5 rounded-full transition-colors"
        >
          {isManualMode ? <CalendarIcon className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          {isManualMode ? 'Switch to Calendar Mode' : 'Enter Date Manually'}
        </button>
      </div>

      {/* Portal Container */}
      {!isManualMode && renderCalendarPopup()}

      {/* Duration Summary */}
      {startDate && endDate && endDate >= startDate && (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-mint"></div>
          <div className="flex gap-8 pl-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</span>
              <span className="text-sm font-bold text-gray-800">{formatDateDisplay(startDate)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">End Date</span>
              <span className="text-sm font-bold text-gray-800">{formatDateDisplay(endDate)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Duration</span>
             <span className="text-xl font-extrabold text-teal-700">{calculateDays(startDate, endDate)} Days</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
