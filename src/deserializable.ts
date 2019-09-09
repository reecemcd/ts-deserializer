
/**
 * Deserializable is an interface that requires a deserialize(obj: any): any method. 
 * It provides a recommended pattern for deserializing classes.
 */
export interface Deserializable<T> {
  deserialize(obj: any): T;
}