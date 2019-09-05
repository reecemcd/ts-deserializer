import { DeserializerLogLevel, DeserializerReporter } from "./deserializable-reporter";
import { DeserializerResolver, DeserializerOperationType } from "./deserializer-resolver";

export interface DeserializerConfig {
  logLevel?: DeserializerLogLevel,
  customError?: any,
  resolvers?: DeserializerResolver[]
}

export class Deserializer<T1, T2> {

  private reporter: DeserializerReporter<T1, T2>;
  private resolvers: DeserializerResolver[];

  constructor(config: DeserializerConfig) {
    this.reporter = new DeserializerReporter<T1, T2>(config.logLevel || DeserializerLogLevel.Warn, config.customError);
    this.resolvers = [ ...config.resolvers ] || [];
  }

  public addResolver(resolver: DeserializerResolver) {
    this.resolvers = [ ...this.resolvers, resolver ];
  }

  public addResolvers(resolvers: DeserializerResolver[]) {
    this.resolvers = [ ...this.resolvers, ...resolvers ];
  }

  public setResolvers(resolvers: DeserializerResolver[]) {
    this.resolvers = resolvers;
  }

  public deserialize(from: T1, to: T2) {
    // Resolve all resolvers
    this.resolvers.forEach((resolver) => {
      let fromValue = this.getNestedPropValue(from, resolver.fromProp);
      let fromValueString = JSON.stringify(fromValue);
      let breaker = false;

      // Run all operations on the fromProp value
      let value = resolver.operations.reduce((val, operation) => {
        if (breaker) {
          return val;
        }
        switch(operation.type) {
          case DeserializerOperationType.Operator:
            try {
              val = operation.func(val);
              // Default error if value resolves to undefined
              if (val === undefined) {
                throw new Error(`Property "${resolver.fromProp}" resolved to "undefined" when attempting to deserialize object of type "${from.constructor.name.toString()}" to type "${to.constructor.name.toString()}"`);
              }
            }
            catch(e) {
              val = this.getFallback(resolver.fallback);
              this.reporter.reportUnresolvedError(e, resolver, fromValueString, val);
              breaker = true;
            }
            return val;
          case DeserializerOperationType.Validator:
            try {
              // Default error if value does not pass validation
              if (!operation.func(val)) {
                throw new Error(`Property "${resolver.fromProp}" resolved to a value that did not pass validation when attempting to deserialize object of type "${from.constructor.name.toString()}" to type "${to.constructor.name.toString()}"`)
              }
            }
            catch(e) {
              val = this.getFallback(resolver.fallback);
              this.reporter.reportValidationError(e, resolver, fromValueString, val);
              breaker = true;
            }
            return val;
        }
      }, fromValue);

      // Set the toProp value
      to[resolver.toProp] = value;
    });
    return to;
  }

  private getNestedPropValue(obj: any, propPath: string, separator = '.') {
    let pathList = propPath.split(separator);
    return pathList.reduce((prev, curr) => prev && prev[curr], obj);
  };

  private getFallback(fallback) {
    return (typeof fallback === 'function')
      ? fallback()
      : fallback
  };
  
}

