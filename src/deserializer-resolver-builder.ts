import { DeserializerLogLevel } from './deserializable-reporter';
import { DeserializerResolver, DeserializerOperationType } from "./deserializer-resolver";

export class DeserializerResolverBuilder {

  private resolver = new DeserializerResolver();

  resolve(prop: string) {
    if (typeof prop === 'string') {
      this.resolver.fromProp = prop;
      this.resolver.toProp = prop;
    }
    else {
      // TODO: throw error
    }
    return this;
  }

  to(prop: string) {
    if (typeof prop === 'string') {
      this.resolver.toProp = prop;
    }
    else {
      // TODO: throw error
    }
    return this;
  }

  map(func: Function) {
    this.resolver.addOperation({
      func: func,
      type: DeserializerOperationType.Operator
    });
    return this;
  }

  tap(func: Function) {
    this.resolver.addOperation({ 
      func: (obj) => { func(obj); return obj; },
      type: DeserializerOperationType.Operator
    });
    return this;
  }

  deserializeTo(clas: any) {
    this.resolver.addOperation({
      func: (obj) => new clas().deserialize(obj),
      type: DeserializerOperationType.Operator
    });
    return this;
  }

  deserializeToArrayOf(clas: any) {
    this.resolver.addOperation({
      func: (obj: any[]) => obj.map(child => new clas().deserialize(child)),
      type: DeserializerOperationType.Operator
    });
    return this;
  }

  validate(func: Function) {
    this.resolver.addOperation({ 
      func: func,
      type: DeserializerOperationType.Validator
    });
    return this;
  }

  validateString() {
    this.resolver.addOperation({ 
      func: (val) => (typeof val === 'string'),
      type: DeserializerOperationType.Validator
    });
    return this;
  }
  
  validateNumber() {
    this.resolver.addOperation({ 
      func: (val) => (typeof val === 'number' && !Number.isNaN(val)),
      type: DeserializerOperationType.Validator
    });
    return this;
  }

  validateBoolean() {
    this.resolver.addOperation({ 
      func: (val) => (typeof val === 'boolean'),
      type: DeserializerOperationType.Validator
    });
    return this;
  }
  
  validateArray() {
    this.resolver.addOperation({ 
      func: (val) => Array.isArray(val),
      type: DeserializerOperationType.Validator
    });
    return this;
  }

  setLogLevel(logLevel: DeserializerLogLevel) {
    this.resolver.setLogLevel(logLevel);
  }

  setCustomError(customError: any) {
    this.resolver.setCustomError(customError);
  }

  fallback(fallbackValue: any | Function = undefined) {
    this.resolver.fallback = fallbackValue;

    // If no operations are passed provide a pass through function to ensure the value is checked
    if (this.resolver.operations && this.resolver.operations.length === 0) {
      this.resolver.addOperation({
        func: (val) => val,
        type: DeserializerOperationType.Operator
      });
    }

    return this.resolver;
  }
}

export const resolve = (prop: string) => {
  return new DeserializerResolverBuilder().resolve(prop);
};