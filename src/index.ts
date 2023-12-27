type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
type Severity = 'LOW_SEVERITY' | 'MEDIUM_SEVERITY' | 'HIGH_SEVERITY'

interface ErrorData {
  message: string
  stack: string
  body?: string
}

export class Logger implements LogInterface {
  isDebug: boolean
  constructor() {
    this.isDebug = true
    this.withField = this.withField.bind(this)
    this.withFields = this.withFields.bind(this)
    this.debug = this.debug.bind(this)
    this.info = this.info.bind(this)
    this.warn = this.warn.bind(this)
    this.error = this.error.bind(this)
    this.fatal = this.fatal.bind(this)
  }

  withFields(fields: Fields<unknown>): Entry {
    return new Entry(this).withFields(fields)
  }

  withField(key: string, value: unknown): Entry {
    return new Entry(this).withField(key, value)
  }

  debug(msg: string): void {
    new Entry(this).debug(msg)
  }
  info(msg: string): void {
    new Entry(this).info(msg)
  }
  warn(msg: string): void {
    new Entry(this).warn(msg)
  }
  error(msg: string): void {
    new Entry(this).error(msg)
  }
  fatal(msg: string): void {
    new Entry(this).fatal(msg)
  }

  log(level: Level, e: Entry, msg: string, severity?: Severity): void {
    // do nothing if debug is not enabled
    if (level === 'debug' && !this.isDebug) return

    const entry = e.finalize(level, msg, severity)

    if (level === 'warn') {
      // eslint-disable-next-line no-console
      console.warn(JSON.stringify(entry))
      return
    }

    if (level === 'error' || level === 'fatal') {
      // eslint-disable-next-line no-console
      console.error(JSON.stringify(entry))
      return
    }

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry))
  }

  setDebug(enabled = true): void {
    this.isDebug = enabled
  }
}

export interface Fields<T> {
  [key: string]: T
}

export interface LogInterface {
  withFields: (fields: Fields<unknown>) => Entry
  withField: (key: string, value: unknown) => Entry
  debug: (msg: string) => void
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string, severity?: Severity) => void
  fatal: (msg: string, severity?: Severity) => void
  setDebug(enabled: boolean): void
}

interface LogEntryDetails {
  level: Level
  fields: Fields<unknown>
  message: string
  timestamp: Date
  severity?: Severity
}

interface LogEntry {
  log: LogEntryDetails
}

class Entry implements LogInterface {
  _fields: Fields<unknown>[] = []
  log: Logger
  constructor(log: Logger) {
    this.log = log
    this.withField = this.withField.bind(this)
    this.withFields = this.withFields.bind(this)
    this.debug = this.debug.bind(this)
    this.info = this.info.bind(this)
    this.warn = this.warn.bind(this)
    this.error = this.error.bind(this)
    this.fatal = this.fatal.bind(this)
    this.finalize = this.finalize.bind(this)
  }
  debug(msg: string): void {
    this.log.log('debug', this, msg)
  }
  info(msg: string): void {
    this.log.log('info', this, msg)
  }
  warn(msg: string): void {
    this.log.log('warn', this, msg)
  }
  error(msg: string, severity?: Severity): void {
    this.log.log('error', this, msg, severity)
  }
  fatal(msg: string, severity?: Severity): void {
    this.log.log('fatal', this, msg, severity)
  }

  withFields(fields: Fields<unknown>): Entry {
    const f: Fields<unknown>[] = []
    this._fields.map((x) => f.push(x))
    f.push(fields)

    const entry = new Entry(this.log)
    entry._fields = f
    return entry
  }

  withField(key: string, value: unknown): Entry {
    const fields: Fields<unknown> = {}
    fields[key] = value
    return this.withFields(fields)
  }

  setDebug(enabled: boolean): void {
    this.log.setDebug(enabled)
  }

  finalize(level: Level, msg: string, severity?: Severity): LogEntry {
    return {
      log: {
        level,
        fields: mergeFields(this._fields),
        message: msg,
        severity,
        timestamp: new Date(Date.now()),
      },
    }
  }
}

const mergeFields = <T>(fields: Fields<T>[]): Fields<T> => {
  const allFields: Fields<T> = {}
  fields.map((f) => appendFields(f, allFields))
  return allFields
}

const appendFields = <T>(source: Fields<T>, destination: Fields<T>): void => {
  Object.keys(source).forEach((key) => {
    if (source[key] instanceof Error) {
      const data: ErrorData = {
        message: `${source[key]}`,
        stack: (source[key] as Error).stack ?? '',
      }

      // append axios error data as errorMessage if field doesn't exist
      if ((source[key] as any).isAxiosError) {
        const response = (source[key] as any).response
        if (response) {
          data.body = response.data
        }
      }

      destination[key] = JSON.stringify(data) as T
    } else if (typeof source[key] === 'object') {
      destination[key] = JSON.stringify(source[key]) as T
    } else {
      destination[key] = source[key]
    }
  })
}

const getLogger = (fields: Fields<unknown> = {}): LogInterface => {
  let env = process.env.NODE_ENV
  if (env !== 'production') {
    env = env === 'staging' ? 'qa' : 'dev'
  }
  fields.environment = env
  return new Logger().withFields(fields)
}

const logger = getLogger()

export default logger