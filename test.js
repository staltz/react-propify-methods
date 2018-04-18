const test = require('tape');
const React = require('React');
const interval = require('callbag-interval');
const map = require('callbag-map');
const pipe = require('callbag-pipe');
const take = require('callbag-take');
const toObs = require('callbag-to-obs');
const { propifyMethods } = require('./index');
const TestRenderer = require('react-test-renderer');

test('calls component method when observable emits args array', t => {
  t.plan(9);
  let hasShouted = false;

  class Input extends React.Component {
    constructor(props) {
      super(props);
    }
    shout(message) {
      t.false(hasShouted, 'has not yet shouted');
      t.equals(message, 'HUF!', 'shout is correct value');
      hasShouted = true;
    }
    render() {
      return React.createElement('span', null, `My age is ${this.props.age}`);
    }
  }

  const Output = propifyMethods(Input, 'shout');

  const obs = pipe(interval(50), take(1), map(() => ['HUF!']), toObs);

  const elem = React.createElement(Output, { age: 20, shout$: obs });
  const testRenderer = TestRenderer.create(elem);

  const result1 = testRenderer.toJSON();
  t.ok(result1, 'should have rendered');
  t.equal(result1.children.length, 1, 'should have one child');
  t.equal(result1.children[0], 'My age is 20', 'should show 20');

  setTimeout(() => {
    testRenderer.update(elem);
    t.true(hasShouted, 'shout happened');
    const result2 = testRenderer.toJSON();
    t.ok(result2, 'should have rendered');
    t.equal(result2.children.length, 1, 'should have one child');
    t.equal(result2.children[0], 'My age is 20', 'should show 20');
    t.end();
  }, 100);
});

test('calls component method when observable emits non-array', t => {
  t.plan(9);
  let hasShouted = false;

  class Input extends React.Component {
    constructor(props) {
      super(props);
    }
    shout(message) {
      t.false(hasShouted, 'has not yet shouted');
      t.equals(message, 'HUF!', 'shout is correct value');
      hasShouted = true;
    }
    render() {
      return React.createElement('span', null, `My age is ${this.props.age}`);
    }
  }

  const Output = propifyMethods(Input, 'shout');

  const obs = pipe(interval(50), take(1), map(() => 'HUF!'), toObs);

  const elem = React.createElement(Output, { age: 20, shout$: obs });
  const testRenderer = TestRenderer.create(elem);

  const result1 = testRenderer.toJSON();
  t.ok(result1, 'should have rendered');
  t.equal(result1.children.length, 1, 'should have one child');
  t.equal(result1.children[0], 'My age is 20', 'should show 20');

  setTimeout(() => {
    testRenderer.update(elem);
    t.true(hasShouted, 'shout happened');
    const result2 = testRenderer.toJSON();
    t.ok(result2, 'should have rendered');
    t.equal(result2.children.length, 1, 'should have one child');
    t.equal(result2.children[0], 'My age is 20', 'should show 20');
    t.end();
  }, 100);
});

test('supports many observable props', t => {
  t.plan(17);
  let hasShouted = false;
  let hasGreeted = false;

  class Input extends React.Component {
    constructor(props) {
      super(props);
    }
    shout(message) {
      t.false(hasShouted, 'has not yet shouted');
      t.equals(message, 'HUF!', 'shout is correct value');
      hasShouted = true;
    }
    greet(message) {
      t.false(hasGreeted, 'has not yet greeted');
      t.equals(message, 'Hello', 'greet is correct value');
      hasGreeted = true;
    }
    render() {
      return React.createElement('span', null, `My age is ${this.props.age}`);
    }
  }

  const Output = propifyMethods(Input, 'shout', 'greet');

  const shout$ = pipe(interval(50), take(1), map(() => 'HUF!'), toObs);
  const greet$ = pipe(interval(150), take(1), map(() => 'Hello'), toObs);

  const elem = React.createElement(Output, {
    age: 20,
    shout$,
    greet$,
  });
  const testRenderer = TestRenderer.create(elem);

  const result1 = testRenderer.toJSON();
  t.ok(result1, 'should have rendered');
  t.equal(result1.children.length, 1, 'should have one child');
  t.equal(result1.children[0], 'My age is 20', 'should show 20');

  setTimeout(() => {
    testRenderer.update(elem);
    t.true(hasShouted, 'shout happened');
    t.false(hasGreeted, 'greet not yet happened');
    const result2 = testRenderer.toJSON();
    t.ok(result2, 'should have rendered');
    t.equal(result2.children.length, 1, 'should have one child');
    t.equal(result2.children[0], 'My age is 20', 'should show 20');
  }, 100);

  setTimeout(() => {
    testRenderer.update(elem);
    t.true(hasShouted, 'shout happened');
    t.true(hasGreeted, 'greet happened');
    const result2 = testRenderer.toJSON();
    t.ok(result2, 'should have rendered');
    t.equal(result2.children.length, 1, 'should have one child');
    t.equal(result2.children[0], 'My age is 20', 'should show 20');
    t.end();
  }, 200);
});
