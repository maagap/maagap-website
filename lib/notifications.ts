// Professional toast notification system

export const showSuccess = (message: string) => {
  // Using native confirm dialog styled professionally
  const msg = `✅ SUCCESS\n\n${message}`;
  alert(msg);
};

export const showError = (message: string, details?: string) => {
  const msg = details 
    ? `❌ ERROR\n\n${message}\n\nDetails: ${details}`
    : `❌ ERROR\n\n${message}`;
  alert(msg);
};

export const showInfo = (message: string) => {
  const msg = `ℹ️ INFORMATION\n\n${message}`;
  alert(msg);
};

export const showWarning = (message: string) => {
  const msg = `⚠️ WARNING\n\n${message}`;
  alert(msg);
};

export const confirmAction = (message: string, title: string = 'Confirm Action'): boolean => {
  const msg = `${title}\n\n${message}\n\nThis action cannot be undone. Do you want to proceed?`;
  return confirm(msg);
};

export const showImportResult = (imported: number, errors: number) => {
  const msg = `📊 IMPORT COMPLETE\n\n✅ Successfully imported: ${imported} record(s)\n❌ Failed: ${errors} record(s)${errors > 0 ? '\n\nPlease check the console (F12) for error details.' : ''}`;
  alert(msg);
};
