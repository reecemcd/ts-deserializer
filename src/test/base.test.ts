import { Deserializable, Deserializer, DeserializerLogLevel, resolve } from '..';

let uid = 0;

class User implements Deserializable<User> {
  name: string;
  info: string;
  other: string;
  id: number;

  deserialize(user: User): User {
    let deserializer = new Deserializer<User, User>({
      logLevel: DeserializerLogLevel.None,
      resolvers: [
        resolve('name')
          .fallback(''),
        resolve('info')
          .fallback(undefined),
        resolve('id')
          .tap(() => uid++)
          .fallback(() => uid)
      ]
    });

    return deserializer.deserialize(user, this);
  }
}

class Group implements Deserializable<Group> {
  title: string;
  primaryUser: User;
  users: User[]

  deserialize(group: Group): Group {
    let deserializer = new Deserializer<Group, Group>({
      logLevel: DeserializerLogLevel.None,
      resolvers: [
        resolve('title')
          .map((t) => t + '!')
          .fallback('Test'),
        resolve('primaryUser')
          .deserializeTo(User)
          .fallback(),
        resolve('users')
          .deserializeToArrayOf(User)
          .fallback(() => uid)
      ]
    });

    return deserializer.deserialize(group, this);
  }
}

class MyFormData implements Deserializable<MyFormData> {
  option1: string;
  option2: string;
  option3: string;

  deserialize(formData: MyFormData): MyFormData {
    let deserializer = new Deserializer<any, MyFormData>({
      logLevel: DeserializerLogLevel.None,
      resolvers: [
        resolve('optionA')
          .to('option1')
          .fallback(''),
        resolve('optionB')
          .to('option2')
          .fallback(''),
        resolve('extras.optionC')
          .to('option3')
          .fallback('')
      ]
    });

    return deserializer.deserialize(formData, this);
  }
}

test('Fallbacks', () => {
  const t1 = new User().deserialize({ 
    name: 'Bob',
    id: 10
  } as User);

  const t2 = new User().deserialize({} as User);

  expect(t1.name).toBe('Bob');
  expect(t1.id).toBe(10);
  expect(t2.name).toBe('');
  expect(t2.id).toBe(2);
  expect(t2.info).toBeUndefined();
  expect(t2.other).toBeUndefined();
});

test('Maps', () => {
  const t: Group = new Group().deserialize({ 
    title: 'My Users',
    primaryUser: new User(),
    users: [new User(), new User()]
  } as Group);

  expect(t.title).toBe('My Users!');
  expect(Array.isArray(t.users)).toBe(true);
  expect(t.primaryUser.name).toBe('');
  expect(t.primaryUser.id).toBe(3);
  expect(t.users[0].name).toBe('');
  expect(t.users[1].name).toBe('');
  expect(t.users[0].id).toBe(4);
  expect(t.users[1].id).toBe(5);
});

test('Resolves', () => {
  const t: MyFormData = new MyFormData().deserialize({
    optionA: 'A',
    optionB: 'B',
    extras: {
      optionC: 'C'
    }
  } as any);

  expect(t.option1).toBe('A');
  expect(t.option2).toBe('B');
  expect(t.option3).toBe('C');
});