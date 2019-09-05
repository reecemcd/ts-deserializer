
export interface Deserializable<T> {
  deserialize(obj: any): T;
}