import { DeserializerResolver } from './deserializer-resolver';

export enum DeserializerLogLevel {
  None = 'NONE',
  Warn = 'WARN',
  Error = 'ERROR',
  Throw = 'THROW'
}

export class DeserializerReporter<T1, T2> {
  constructor(public logLevel: DeserializerLogLevel, public customError: any) {}

  reportUnresolvedError(e: Error, resolver: DeserializerResolver, fromValueString: string, fallback: any) {
    this.report(
      resolver.logLevel || this.logLevel,
      resolver.customError || this.customError,
      `DeserializerUnresolvedValueError - ${resolver.fromProp} was ${fromValueString} but failed deserialization, returned fallback value: ${JSON.stringify(fallback)}.\n${e}\n`
    );
  }

  reportValidationError(e: Error, resolver: DeserializerResolver, fromValueString: string, fallback: any) {
    this.report(
      resolver.logLevel || this.logLevel, 
      resolver.customError || this.customError,
      `DeserializerInvalidValueError - ${resolver.fromProp} was ${fromValueString} and did not pass validation, returned fallback value: ${JSON.stringify(fallback)}.\n${e}\n`
    );
  }

  private report(logLevel: DeserializerLogLevel, customError: any, message: string) {
    switch(logLevel) {
      case DeserializerLogLevel.None:
        break;
      case DeserializerLogLevel.Warn:
        console.warn(message);
        break;
      case DeserializerLogLevel.Error:
        console.error(message);
        break;
      case DeserializerLogLevel.Throw:
        if (customError) {
          throw new this.customError(message);
        }
        else {
          throw message;
        }
    }
  }
}