import { Deserializable, Deserializer, DeserializerLogLevel, resolve } from "..";

class WarnExample implements Deserializable<WarnExample> {
  example: number;

  deserialize(obj: any): WarnExample {
    let deserializer = new Deserializer<any, WarnExample>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('example')
          .fallback(0)
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

class ErrorExample implements Deserializable<ErrorExample> {
  example: number;

  deserialize(obj: any): ErrorExample {
    let deserializer = new Deserializer<any, ErrorExample>({
      logLevel: DeserializerLogLevel.Error,
      resolvers: [
        resolve('example')
          .fallback(0)
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

class ThrowExample implements Deserializable<ThrowExample> {
  example: number;

  deserialize(obj: any): ThrowExample {
    let deserializer = new Deserializer<any, ThrowExample>({
      logLevel: DeserializerLogLevel.Throw,
      resolvers: [
        resolve('example')
          .fallback(0)
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

class FooError extends Error {
  constructor(m: string) { super(m); }
}

class ThrowFooExample implements Deserializable<ThrowFooExample> {
  example: number;

  deserialize(obj: any): ThrowFooExample {
    let deserializer = new Deserializer<any, ThrowFooExample>({
      logLevel: DeserializerLogLevel.Throw,
      customError: FooError,
      resolvers: [
        resolve('example')
          .fallback(0)
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

test('Reporter', () => {
  let warnSpy = jest.spyOn(console, 'warn');
  let errorSpy = jest.spyOn(console, 'error');

  const t1 = new WarnExample().deserialize({});
  const t2 = new ErrorExample().deserialize({});

  expect(warnSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalled();

  expect(() => { 
    new ThrowExample().deserialize({})
  }).toThrowError();

  expect(() => { 
    new ThrowFooExample().deserialize({})
  }).toThrowError();

  warnSpy.mockClear();
  errorSpy.mockClear();
});