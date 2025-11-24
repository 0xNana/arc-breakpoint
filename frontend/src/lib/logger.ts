type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: number;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; 

  constructor() {
    this.isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: Date.now(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.isDevelopment) {
      const timestamp = new Date(entry.timestamp).toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      
      switch (level) {
        case 'debug':
          console.debug(prefix, message, data || '');
          break;
        case 'info':
          console.info(prefix, message, data || '');
          break;
        case 'warn':
          console.warn(prefix, message, data || '');
          break;
        case 'error':
          console.error(prefix, message, data || '');
          break;
      }
    }

    if (!this.isDevelopment && level === 'error') {
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  getRecentLogs(count = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();

export const logBatch = {
  start: (size: number) => logger.info(`Starting batch processing`, { size }),
  chunk: (current: number, total: number, size: number) => 
    logger.debug(`Processing batch chunk ${current}/${total}`, { size }),
  success: (size: number) => logger.info(`Batch completed successfully`, { size }),
  error: (error: any, size: number) => logger.error(`Batch failed`, { error, size }),
};

export const logTransaction = {
  queue: (count: number, batchSize: number) => 
    logger.debug(`Action queued (${count}/${batchSize})`),
  immediate: () => logger.debug(`Sending transaction immediately (no session)`),
  pending: () => logger.debug(`Transaction pending confirmation`),
  success: () => logger.info(`Transaction confirmed`),
  error: (error: any) => logger.error(`Transaction failed`, { error }),
};

export const logSession = {
  start: (duration: number) => logger.info(`Session started`, { duration }),
  end: () => logger.info(`Session ended`),
  flush: (count: number) => logger.info(`Flushing queued actions`, { count }),
};
