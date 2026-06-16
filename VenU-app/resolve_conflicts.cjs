const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/Organizer/Panels/VenuesPanel.jsx',
  'src/pages/Organizer/Panels/EventsPanel.jsx',
  'src/pages/Organizer/Panels/AttendeesPanel.jsx',
  'src/pages/Organizer/Panels/CreateEventPanel.jsx',
  'src/pages/Organizer/Panels/AnalyticsPanel.jsx',
  'src/pages/Organizer/OrganizerDashboard.jsx'
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  
  let inConflict = false;
  let keepBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('<<<<<<< Updated upstream')) {
      inConflict = true;
      keepBlock = true; // We accept upstream
      continue;
    }
    
    if (line.startsWith('=======')) {
      if (inConflict) {
        keepBlock = false; // Discard stashed changes
      }
      continue;
    }
    
    if (line.startsWith('>>>>>>> Stashed changes')) {
      inConflict = false;
      keepBlock = true;
      continue;
    }
    
    if (!inConflict || keepBlock) {
      newLines.push(line);
    }
  }
  
  fs.writeFileSync(fullPath, newLines.join('\n'));
});

console.log("Resolved all conflicts, favoring upstream.");
