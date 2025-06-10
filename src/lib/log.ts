export function logDebug(...args: any[]) {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
}

export function logError(...args: any[]) {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
}
