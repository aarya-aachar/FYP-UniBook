// Timezone-safe: extracts local date as YYYY-MM-DD avoiding UTC midnight shift from MySQL
export const getLocalDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const formatTimeRange = (timeStr, durationMinutes = 60) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(':');
  
  const start = new Date();
  start.setHours(parseInt(hours), parseInt(minutes), 0);
  
  const end = new Date(start.getTime() + durationMinutes * 60000);
  
  const startFormatted = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  const endFormatted = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  
  return `${startFormatted} to ${endFormatted}`;
};

export const formatMultiSlotRange = (times, durationPerSlot = 60) => {
  if (!times || times.length === 0) return "";
  
  // 1. Sort the times (HH:MM format)
  const sorted = [...times].sort();
  
  // 2. Map to objects with Start and End dates for easier comparison
  const timeObjects = sorted.map(t => {
    const [h, m] = t.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, h, m);
    return { 
      startDate, 
      endDate: new Date(startDate.getTime() + durationPerSlot * 60000) 
    };
  });

  const ranges = [];
  if (timeObjects.length > 0) {
    let currentStart = timeObjects[0].startDate;
    let currentEnd = timeObjects[0].endDate;

    for (let i = 1; i < timeObjects.length; i++) {
      const nextStart = timeObjects[i].startDate;
      
      // If the next slot starts exactly when the current one ends, it's consecutive
      if (nextStart.getTime() === currentEnd.getTime()) {
        currentEnd = timeObjects[i].endDate;
      } else {
        // Gap detected: push the finished range and start a new one
        ranges.push(formatRange(currentStart, currentEnd));
        currentStart = nextStart;
        currentEnd = timeObjects[i].endDate;
      }
    }
    ranges.push(formatRange(currentStart, currentEnd));
  }

  return ranges.join(", ");
};

// Private helper for range formatting
const formatRange = (start, end) => {
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return `${start.toLocaleTimeString([], options)} to ${end.toLocaleTimeString([], options)}`;
};

