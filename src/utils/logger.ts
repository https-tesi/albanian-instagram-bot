type LogMetadata = Record<string, unknown>;

const formatMetadata = (metadata: LogMetadata | undefined): string => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "";
  }

  return ` ${JSON.stringify(metadata)}`;
};

export const logger = {
  info(message: string, metadata?: LogMetadata): void {
    console.log(`[info] ${message}${formatMetadata(metadata)}`);
  },

  warn(message: string, metadata?: LogMetadata): void {
    console.warn(`[warn] ${message}${formatMetadata(metadata)}`);
  },

  error(message: string, metadata?: LogMetadata): void {
    console.error(`[error] ${message}${formatMetadata(metadata)}`);
  }
};
