# react-propify-methods

Convert instance methods to Observable props.

A utility function (higher-order component, 'HOC') that takes a React component as input, and returns a React component that behaves like the input but accepts Observable props that will call component instance methods.

😞 Avoid this: `this.textFieldRef.current.clear()`

😎 Do this: `<TextField clear$={observable} />`

## What problem this package solves

Let's say you have a React component that has instance methods, for instance from React Native we know that `TextInput` has the `clear()` method:

```jsx
<TextInput
  ref={input => {
    this.textInput = input;
  }}
/>
```

```js
this.textInput.current.clear();
```

Instance methods are unfortunately necessary in React because props are not enough to trigger the instance calls. So we require Refs, and maintaining refs is not the nicest way of using React.

## Usage

```
npm install --save react-propify-methods
```

Let's suppose you want to use FlatList's `scrollToIndex` method using Observable props.

```js
import { FlatList } from 'react-native';
import { propifyMethods } from 'react-propify-methods';

const MyFlatList = propifyMethods(FlatList, 'scrollToIndex', 'scrollToEnd');

// ... then in a render function ...
<MyFlatList
  scrollToIndex$={obs} // this!
  scrollToEnd$={anotherObs} // and this!
  data={this.state.data}
  renderItem={({ item }) => <Item data={item} />}
/>;
```

The `obs` argument can be an Observable, from [RxJS](http://reactivex.io/rxjs/) or simply any object with the `subscribe(observer)` method. For instance, with [Callbags](https://github.com/callbag/callbag):

```js
import { pipe, interval, map } from 'callbag-basics';
import toObservable from 'callbag-to-obs';

const obs = pipe(
  interval(2000),
  map(i => ({ index: i, viewOffset: 50 })),
  toObservable,
);

// ... in a render function ...
<MyFlatList
  scrollToIndex$={obs}
  data={this.state.data}
  renderItem={({ item }) => <Item data={item} />}
/>;
```

This will cause the FlatList to scroll to the next item, every 2 seconds. You could have also done it with RxJS:

```js
import Rx from 'rxjs';

const obs = Rx.Observable.interval(2000).map(i => ({
  index: i,
  viewOffset: 50,
}));
```

## API

* `propifyMethods(component, ...methodNames)`

Will return a React component that supports a prop named `name`+`$` for every `name` in `methodNames`. For example, the `setValue` method would become a `setValue$` prop. Existing props of `component` are supported by the returned component.

Every new `$` prop expects the value to be an Observable. It should be an object with the function `subscribe(observer): Subscription` or any object that follows the [ECMAScript Observable](https://github.com/tc39/proposal-observable) proposal.

If the Observable prop **emits a non-array value**, then that value is used as the first argument of the method. E.g. `setValue$={Observable.of(42)}` would call the method `setValue(42)`.

If the Observable prop **emits an array**, then the array is interpreted as arguments to be applied on the method. E.g. `setValue$={Observable.of([42, 'hello'])}` would call the method `setValue(42, 'hello')`.

This library only supports component methods that return void. If a non-void value is returned from the method, then it cannot be retrieved through this API.

## License

MIT
