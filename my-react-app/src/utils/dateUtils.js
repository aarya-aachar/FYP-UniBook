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
  const sorted = [...times].sort();
  const startTime = sorted[0];
  const lastStartTime = sorted[sorted.length - 1];
  
  const [h1, m1] = startTime.split(':');
  const [h2, m2] = lastStartTime.split(':');
  
  const start = new Date();
  start.setHours(parseInt(h1), parseInt(m1), 0);
  
  const end = new Date();
  end.setHours(parseInt(h2), parseInt(m2), 0);
  const finalEnd = new Date(end.getTime() + durationPerSlot * 60000);
  
  return `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })} to ${finalEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;
};
