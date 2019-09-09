<h1 align="center">TS Deserializer</h1>

<p align="center">
Typescript library for deserializing one object type to another.
</p>

<p align="center">
    <a href="https://badge.fury.io/js/ts-deserializable" target="_blank"><img src="https://badge.fury.io/js/ts-deserializer.svg" alt="npm version" height="18"></a>
    <a href="https://npmjs.org/ts-deserializer" target="_blank"><img src="https://img.shields.io/npm/dt/ts-deserializer.svg" alt="npm downloads" ></a>
    <a href="https://github.com/reecemcd/ts-deserializer/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="mit license" height="18"></a>
    <a href="https://circleci.com/gh/reecemcd/ts-deserializer" target="_blank"><img src="https://circleci.com/gh/reecemcd/ts-deserializer.svg?style=svg" alt="mit license" height="18"></a>
</p>

## Table of contents
* [Installation](#installation)
* [Description](#description)
* [API Documentation](#api-documentation)


## Installation

`npm install ts-deserializer --save`

## Description

ts-deserializer can be used to deserialize data from one class to another. **Another common use case is deserializing data that should be of a given type _to itself_**. This is useful when dealing with unverified data from an external location like an XMLHttpRequest request.

Functional operators can be chained to resolve properties across types, map functions, deserialize child content, validate values, and provide fallback values should something not exist or go wrong. Logging can occur in various ways to report any missing or invalid data where needed.

**A goal of ts-deserializer is for no deserialized object to have properties that should be defined be undefined.** If used correctly, theoretically you should never have to check for undefined properties. Any properties that are missing or contain unexpected data will be logged as configured.

### Quick Examples:

```Typescript
/* Basic fallback example */
class User implements Deserializable<User> {
  name: string;
  email: string;
  info: string;

  deserialize(user: User): User {
    let deserializer = new Deserializer<User, User>({
      logLevel: DeserializerLogLevel.None,
      resolvers: [
        resolve('name')
          .fallback(''),
        resolve('email')
          .fallback(() => ''),
      ]
    });
    return deserializer.deserialize(user, this);
  }
}

const user = new User().deserialize({});
// user == { name: '', email: '' }
```

```Typescript
/* Map examples */
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
          .fallback([])
      ]
    });
    return deserializer.deserialize(group, this);
  }
}

const group = new Group().deserialize({ title: 'My Group' });
// group == { title: 'MyGroup!', primaryUser: {name: '', email: ''}, users: [ {name: '', email: ''}, { name: '', email: ''} ]}
```

```Typescript
/* Resolve -> to examples */
class MyFormData implements Deserializable<MyFormData> {
  option1: string;
  option2: string;
  option3: string;

  deserialize(formData: OtherFormData): MyFormData {
    let deserializer = new Deserializer<OtherFormData, MyFormData>({
      logLevel: DeserializerLogLevel.Error,
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

const formData = new MyFormData().deserialize({
  optionA: 'A',
  optionB: 'B',
  extras: { optionC: 'C' }
} as OtherFormData);
// formData == { option1: 'A', option2: 'B', option3: 'C' }
```

```Typescript
/* Basic Chaining Example */
class NumberStringToNumber implements Deserializable<BasicChain> {
  val: number;

  deserialize(obj: any): BasicChain {
    let deserializer = new Deserializer<any, BasicChain>({
      logLevel: DeserializerLogLevel.Warn,
      resolvers: [
        resolve('someStrings.thisString')
          .to('val')
          .map((val) => parseInt(val))
          .validateNumber()
          .fallback(0)
      ]
    });
    return deserializer.deserialize(obj, this);
  }
}

const result = new NumberStringToNumber().deserialize({ someStrings: { thisString: '42' } });
// result == { val: 42 }
```

## API Documentation

### Exported Objects
* [`Deserializable`](#Deserializable) - _interface_
* [`Deserializer<T1,T2>`](#Deserializer) - _class_
* [`DeserializerConfig`](#DeserializerConfig) - _interface_
* [`DeserializerLogLevel`](#DeserializerLogLevel) - _enum_
* [`resolve`](#resolve) - _factory function_
* [`DeserializerResolverBuilder`](#DeserializerResolverBuilder) - _builder class_

### `Deserializable`
> Interface

`Deserializable` is an interface that requires a `deserialize(obj: any): any` method. It provides a recommended pattern for deserializing classes.

This class can also be implemented without the use of ts-deserializable decorators and will still be compatible with classes that do.

```Typescript
class User implements Deserializable<User> { 
  deserialize(obj: any): User { ... }
}
```

<br />

### `Deserializer`
> Class

The Deserializer<T1,T2> class is used to deserialize objects of type `T1` to type `T2`. It's only parameter is a [`DeserializerConfig`](#DeserializerConfig) seen below.

| Methods | Returns | Description |
|---------|---------|-------------|
| `addResolver(resolver: DeserializerResolver)` | `void` | Adds a resolver object to the list of resolvers this Deserializer passes the input object through upon deserialization. |
| `addResolvers(resolvers: DeserializerResolver[])` | `void` | Adds a list of resolver objects to the list of resolvers this Deserializer passes the input object through upon deserialization. |
| `setResolvers(resolvers: DeserializerResolver[])` | `void` | Sets the list of resolvers this Deserializer passes the input object through upon deserialization. |
| `deserialize(from: T1, to: T2)` | `T2` | Passes the `from` and `to` inputs through all resolver pipelines. |

<br />

### `DeserializerConfig`
> Interface

A `Deserializer` constructor requires a `DeserializerConfig` as it's only parameter. This object is used to configure a deserializer.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `logLevel` | [`DeserializerLogLevel`](#DeserializerLogLevel) | `DeserializerLogLevel.Warn` | Used to set the default log level for this deserializer. |
| `customError` | `any` | `undefined` | Used to set the type of error thrown when the `logLevel` is set to `DeserializerLogLevel.Throw`. |
| `resolvers` | [`DeserializerResolver[]`](#DeserializerResolverBuilder) | `[]` | Array of resolvers that configure how a [`Deserializer`](#Deserializer) deserializes properties from type `T1` to type `T2`. |

<br />

### `DeserializerLogLevel`
> Enum

A DeserializerLogLevel is used to set log levels across all resolvers in a deserializer or to override the deserializer log level at the resolver level. There are four log levels:

| Level | Description |
|-------|-------------|
| `None` | Does not log issues at all when they occur. |
| `Warn` | Logs issues as warnings in the console. Does not throw any error. |
| `Error` | Logs issues as errors in the console. Does not throw any errors |
| `Throw` | Throws issues as errors. If a custom error is provided to the deserializer or overridden in the resolver where the issue occurs, that error object type is thrown instead of the default `Error` type. |

<br />

### `resolve`
> Factory

The resolve function is a useful factory for quickly creating [`DeserializerResolverBuilder`s](#DeserializerResolverBuilder).

<br />

### `DeserializerResolverBuilder`
> Builder Class

A DeserializerResolverBuilder is the builder class used to define resolvers that can be passed to a [`Deserializer`](#Deserializer) via a [`DeserializerConfig`](#DeserializerConfig).

There are four types of operators each outlined below:

#### Deserializer Operators

Deserializer Operators are used to define the property on `T1` that data should be deserialized from. The property on `T2` that data should be deserialized to. As well as a fallback value should `T1` be undefined or some other issue occur in the operator chain.

The `resolve` operator is required. Without it no `fromProp` or `toProp` can be determined.

The `fallback` operator is required. It serves as the "build" method for this builder class.

| Operator | Description |
|----------|-------------|
| `resolve(prop: string)` | Defines the property on `T1` that data should be deserialized from. By default it also sets the property on `T2` that data should be deserialized to this same value. Use the `to()` operator to override. This operator is usually not directly called as the [`resolve` factory](#resolve) will call it for you. |
| `to(prop: string)` | Defines the property on `T2` that data should be deserialized to this same value. Overrides the value set by `resolve()` above. |
| `fallback(fallbackValue: any \| Function = undefined)` | The fallback value is returned anytime a prop is undefined, an error occurs in the operator chain, or a value does not pass validation. If a function is provided, it will be evaluated every time a fallback value is needed. Whatever value a fallback function returns will be passed as the fallback value. |

#### Functional Operators

Functional Operators are used to manipulate data as it is being deserialized. They can be used to map data to functions, trigger side effects, or deserialize child content.

| Operator | Description |
|----------|-------------|
| `map(func: Function)` | The provided function is passed the current value for this resolver in the operator chain. Whatever this function returns will be passed down the operator chain. If the function returns undefined an issue will be logged and the fallback value will be returned. |
| `tap(func: Function)` | The provided function is called every time deserialization occurs. The function is passed the current value for this resolver in the operator chain, but nothing is done with the return value of the provided function. |
| `deserializeTo(clas: any)` | Passes the current value for this resolver in the operator chain to a deserializer function for the given class. The given class **must** implement [`Deserializable`](#Deserializable) or have a `deserialize` function. |
| `deserializeToArrayOf(clas: any)` | Maps child items the current value for this resolver in the operator chain to a deserializer function for the given class. The current value in the operator chain **must** be an array or collection. The given class **must** implement [`Deserializable`](#Deserializable) or have a `deserialize` function. |

#### Validators

Validator can be used to catch when certain conditions are not met. If any validator returns false the issue is logged and the fallback value is returned.

| Operator | Description |
|----------|-------------|
| `validate(func: Function)` | Marks the property as invalid if the provided function returns a falsey value. |
| `validateString()` | Marks the property as invalid if its `typeof` result does not equal `"string"`. |
| `validateNumber()` | Marks the property as invalid if its `typeof` result does not equal `"number"` and the value is not `NaN`. |
| `validateBoolean()` | Marks the property as invalid if its `typeof` result does not equal `"boolean"`. |
| `validateArray()` | Marks the property as invalid if it is not an array. |

#### Logging Overrides

Logging overrides can be used to set custom logging settings for a given resolver. The logging settings set at the [`Deserializer`](#Deserializer) level will be overridden with these. See [`DeserializerLogLevel`](#DeserializerLogLevel) for a list of available log levels.

| Operator | Description |
|----------|-------------|
| `setLogLevel(logLevel: DeserializerLogLevel)` | Used to set the log level for this resolver. |
| `setCustomError(customError: any)` | Used to set the type of error thrown when the `logLevel` is set to `DeserializerLogLevel.Throw`. |

<br />

#### TODO:

* Create more validators
* Create more operators for common mapping use cases
* Add reusable resolver examples
* Add resolver logging override examples
