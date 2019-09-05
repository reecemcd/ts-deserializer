import { DeserializerLogLevel } from "./deserializable-reporter";

export enum DeserializerOperationType {
  Operator = 'OPERATOR',
  Validator = 'VALIDATOR'
}

export interface DeserializerOperation {
  func: Function
  type: DeserializerOperationType
}

export class DeserializerResolver {
  fromProp: string;
  toProp: string;
  operations: DeserializerOperation[] = [];
  fallback: any;
  logLevel: any;
  customError: any;

  addOperation(operation: DeserializerOperation) {
    this.operations = [ ...this.operations, operation ];
  }

  setLogLevel(logLevel: DeserializerLogLevel) {
    this.logLevel = logLevel;
  }

  setCustomError(customError: any) {
    this.customError = customError;
  }
}
