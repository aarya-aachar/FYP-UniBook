/**
 * The Timekeeper (Date & Time Utilities)
 * 
 * relative path: /src/utils/dateUtils.js
 * 
 * Handling dates in a web app is notoriously difficult due to Timezones. 
 * This file contains high-precision logic to ensure that what the user 
 * selects in Nepal matches what is stored and retrieved from the server.
 */

/**
 * getLocalDate
 * Fixes the "Day Shift" bug. 
 * Standard JS date parsing often slips by one day because of UTC offsets. 
 * This function extracts the Year-Month-Day directly from the string 
 * as-is to ensure the UI stays accurate.
 */
export const getLocalDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * formatTime
 * Converts "14:00" into "2:00 PM".
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

/**
 * formatTimeRange
 * Given a start time and a duration (e.g. 60 mins), 
 * it generates a readable window like "10:00 AM to 11:00 AM".
 */
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

/**
 * formatMultiSlotRange (SMART BUNDLER)
 * 
 * This is "Smart Logic" for the UI. 
 * If a user books 3 individual 1-hour slots (10:00, 11:00, 12:00), 
 * showing them as separate items is messy. 
 * 
 * This function detects that they are consecutive and merges them into 
 * a single clean block: "10:00 AM to 1:00 PM".
 */
export const formatMultiSlotRange = (times, durationPerSlot = 60) => {
  if (!times || times.length === 0) return "";
  
  // 1. Sort the times chronologically
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
    // Push the final group
    ranges.push(formatRange(currentStart, currentEnd));
  }

  return ranges.join(", ");
};

// Internal utility to keep the code DRY (Don't Repeat Yourself)
const formatRange = (start, end) => {
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return `${start.toLocaleTimeString([], options)} to ${end.toLocaleTimeString([], options)}`;
};

