import { Deserializable, Deserializer, DeserializerLogLevel, resolve } from "..";

class ValidatorTrue implements Deserializable<ValidatorTrue> {
  prop: string;

  deserialize(obj: any): ValidatorTrue {
    let deserializer = new Deserializer<any, ValidatorTrue>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('prop')
          .validate(() => true)
          .fallback('')
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

class ValidatorFalse implements Deserializable<ValidatorFalse> {
  prop: string;

  deserialize(obj: any): ValidatorFalse {
    let deserializer = new Deserializer<any, ValidatorFalse>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('prop')
          .validate(() => false)
          .fallback('')
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

class ValidatorString implements Deserializable<ValidatorString> {
  prop: string;

  deserialize(obj: any): ValidatorString {
    let deserializer = new Deserializer<any, ValidatorString>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('prop')
          .validateString()
          .fallback('')
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

class ValidatorNumber implements Deserializable<ValidatorNumber> {
  prop: number;

  deserialize(obj: any): ValidatorNumber {
    let deserializer = new Deserializer<any, ValidatorNumber>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('prop')
          .validateNumber()
          .fallback('')
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

class ValidatorBoolean implements Deserializable<ValidatorBoolean> {
  prop: boolean;

  deserialize(obj: any): ValidatorBoolean {
    let deserializer = new Deserializer<any, ValidatorBoolean>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('prop')
          .validateBoolean()
          .fallback('')
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

class ValidatorArray implements Deserializable<ValidatorArray> {
  prop: any[];

  deserialize(obj: any): ValidatorArray {
    let deserializer = new Deserializer<any, ValidatorArray>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('prop')
          .validateArray()
          .fallback('')
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

describe('Validators', () => {

  test('Basic', () => {
    let warnSpy = jest.spyOn(console, 'warn');
    const t1 = new ValidatorTrue().deserialize({ prop: 'A' });
    expect(warnSpy).not.toHaveBeenCalled();
    const t2 = new ValidatorFalse().deserialize({ prop: 'A' });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockClear();
  });
  
  test('String', () => {
    let warnSpy = jest.spyOn(console, 'warn');
    const t1 = new ValidatorString().deserialize({ prop: 'A' });
    expect(warnSpy).not.toHaveBeenCalled();
    const t2 = new ValidatorString().deserialize({ prop: 0 });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockClear();
  });

  test('Number', () => {
    let warnSpy = jest.spyOn(console, 'warn');
    const t1 = new ValidatorNumber().deserialize({ prop: 0 });
    expect(warnSpy).not.toHaveBeenCalled();
    const t2 = new ValidatorNumber().deserialize({ prop: 'A' });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockClear();
  });

  test('Boolean', () => {
    let warnSpy = jest.spyOn(console, 'warn');
    const t1 = new ValidatorBoolean().deserialize({ prop: true });
    expect(warnSpy).not.toHaveBeenCalled();
    const t2 = new ValidatorBoolean().deserialize({ prop: 'A' });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockClear();
  });

  test('Array', () => {
    let warnSpy = jest.spyOn(console, 'warn');
    const t1 = new ValidatorArray().deserialize({ prop: [] });
    expect(warnSpy).not.toHaveBeenCalled();
    const t2 = new ValidatorArray().deserialize({ prop: 'A' });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockClear();
  });
  
});