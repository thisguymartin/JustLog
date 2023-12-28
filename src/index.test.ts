import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { LogInterface, Logger } from './logger'; // Replace with the actual path of your logger file

describe('Logger', () => {
  let logger: LogInterface;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleSpy: { log: any; warn: any; error: any; };

  const mockDate = new Date('2023-11-30T13:00:00.000Z')
  vi.useFakeTimers().setSystemTime(mockDate)

  beforeEach(() => {
    logger = new Logger();
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log debug messages when debug is enabled', () => {
    logger.setDebug(true);
    logger.debug('Debug message');
    expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Debug message'));
  });

  it('should not log debug messages when debug is disabled', () => {
    logger.setDebug(false);
    logger.debug('Debug message');
    expect(consoleSpy.log).not.toHaveBeenCalled();
  });

  it('should log info messages', () => {
    logger.info('Info message');
    expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Info message'));
    expect(consoleSpy.log.mock.calls[0][0]).toMatchSnapshot();
  });

  it('should log warning messages', () => {
    logger.warn('Warning message');
    expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('Warning message'));
  });

  it('should log error messages', () => {
    logger.error('Error message');
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Error message'));
  });

  it('should log fatal messages', () => {
    logger.fatal('Fatal message');
    expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Fatal message'));
  });

  it('should add fields to logs', () => {
    const entry = logger.withField('key', 'value');
    entry.info('Info with field');
    expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Info with field'));
    expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"key":"value"'));
    expect(consoleSpy.log.mock.calls[0][0]).toMatchSnapshot();
  });
});
