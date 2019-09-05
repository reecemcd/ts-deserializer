import { Deserializable, Deserializer, DeserializerLogLevel, resolve } from "..";

class BasicChain implements Deserializable<BasicChain> {
  val: number;

  deserialize(obj: any): BasicChain {
    let deserializer = new Deserializer<any, BasicChain>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('a.b')
          .to('val')
          .map((val) => parseInt(val))
          .validateNumber()
          .fallback(0)
      ]
    });

    return deserializer.deserialize(obj, this);
  }
}

test('Chaining', () => {
  let warnSpy = jest.spyOn(console, 'warn');

  const t1 = new BasicChain().deserialize({ a: { b: '42' } });

  expect(warnSpy).not.toHaveBeenCalled();
  expect(t1.val).toBe(42);
  warnSpy.mockClear();

  const t2 = new BasicChain().deserialize({});

  console.log(t2);

  expect(warnSpy).toHaveBeenCalled();
  expect(t2.val).toBe(0);
});