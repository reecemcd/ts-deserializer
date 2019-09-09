import { DeserializerLogLevel } from './deserializable-reporter';
import { DeserializerResolver, DeserializerOperationType } from "./deserializer-resolver";

export class DeserializerResolverBuilder {

  private resolver = new DeserializerResolver();

  /**
   * Defines the property on T1 that data should be deserialized from. By
   * default it also sets the property on T2 that data should be deserialized
   * to this same value. Use the to() operator to override. This operator
   * is usually not directly called as the `resolve` factory will call it for you.
   * @param prop 
   */
  public resolve(prop: string) {
    if (typeof prop === 'string') {
      this.resolver.fromProp = prop;
      this.resolver.toProp = prop;
    }
    else {
      // TODO: throw error
    }
    return this;
  }

  /**
   * Defines the property on T2 that data should be deserialized to this same value. 
   * Overrides the value set by `resolve()` above.
   * @param prop 
   */
  public to(prop: string) {
    if (typeof prop === 'string') {
      this.resolver.toProp = prop;
    }
    else {
      throw new Error(`Parameter "prop" is of type "${typeof prop}" instead of type "string"`);
    }
    return this;
  }

  /**
   * The provided function is passed the current value for this resolver in the operator
   * chain. Whatever this function returns will be passed down the operator chain. If the
   * function returns undefined an issue will be logged and the fallback value will be returned.
   * @param func 
   */
  public map(func: Function) {
    this.resolver.addOperation({
      func: func,
      type: DeserializerOperationType.Operator
    });
    return this;
  }

  /**
   * The provided function is called every time deserialization occurs. The function 
   * is passed the current value for this resolver in the operator chain, but nothing 
   * is done with the return value of the provided function.
   * @param func 
   */
  public tap(func: Function) {
    this.resolver.addOperation({ 
      func: (obj) => { func(obj); return obj; },
      type: DeserializerOperationType.Operator
    });
    return this;
  }

  /**
   * Passes the current value for this resolver in the operator chain to a deserializer 
   * function for the given class. The given class must implement `Deserializable` or 
   * have a deserialize function.
   * @param clas 
   */
  public deserializeTo(clas: any) {
    this.resolver.addOperation({
      func: (obj) => new clas().deserialize(obj),
      type: DeserializerOperationType.Operator
    });
    return this;
  }

  /**
   * Maps child items the current value for this resolver in the operator chain to 
   * a deserializer function for the given class. The current value in the operator 
   * chain must be an array or collection. The given class must implement 
   * `Deserializable` or have a `deserialize` function.
   * @param clas 
   */
  public deserializeToArrayOf(clas: any) {
    this.resolver.addOperation({
      func: (obj: any[]) => obj.map(child => new clas().deserialize(child)),
      type: DeserializerOperationType.Operator
    });
    return this;
  }

  /**
   * Marks the property as invalid if the provided function returns a falsey value.
   * @param func 
   */
  public validate(func: Function) {
    this.resolver.addOperation({ 
      func: func,
      type: DeserializerOperationType.Validator
    });
    return this;
  }

  /**
   * Marks the property as invalid if its `typeof` result does not equal "string".
   */
  public validateString() {
    this.resolver.addOperation({ 
      func: (val) => (typeof val === 'string'),
      type: DeserializerOperationType.Validator
    });
    return this;
  }
  
  /**
   * Marks the property as invalid if its `typeof` result does not equal "number" and the value is not NaN.
   */
  public validateNumber() {
    this.resolver.addOperation({ 
      func: (val) => (typeof val === 'number' && !Number.isNaN(val)),
      type: DeserializerOperationType.Validator
    });
    return this;
  }

  /**
   * Marks the property as invalid if its `typeof` result does not equal "boolean".
   */
  public validateBoolean() {
    this.resolver.addOperation({ 
      func: (val) => (typeof val === 'boolean'),
      type: DeserializerOperationType.Validator
    });
    return this;
  }
  
  /**
   * Marks the property as invalid if it is not an array.
   */
  public validateArray() {
    this.resolver.addOperation({ 
      func: (val) => Array.isArray(val),
      type: DeserializerOperationType.Validator
    });
    return this;
  }

  /**
   * Used to set the log level for this resolver.
   * @param logLevel 
   */
  public setLogLevel(logLevel: DeserializerLogLevel) {
    this.resolver.setLogLevel(logLevel);
  }

  /**
   * Used to set the type of error thrown when the logLevel is set to `DeserializerLogLevel.Throw`.
   * @param customError 
   */
  public setCustomError(customError: any) {
    this.resolver.setCustomError(customError);
  }

  /**
   * The fallback value is returned anytime a prop is undefined, an error occurs in the operator chain, 
   * or a value does not pass validation. If a function is provided, it will be evaluated every time a 
   * fallback value is needed. Whatever value a fallback function returns will be passed as the fallback value.
   * @param fallbackValue 
   */
  public fallback(fallbackValue: any | Function = undefined) {
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

/* The resolve function is a useful factory for quickly creating DeserializerResolverBuilders. */
export const resolve = (prop: string) => {
  return new DeserializerResolverBuilder().resolve(prop);
};