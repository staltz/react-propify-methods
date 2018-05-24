import {
  Component,
  createElement,
  RefObject,
  createRef,
  ComponentClass as CClass,
} from 'react';
import $$observable from 'symbol-observable';

export type Subscription = {
  unsubscribe(): void;
};

export function propifyMethods<P, K extends keyof P, M extends K>(
  Comp: CClass<P>,
  ...names: Array<M>
): CClass<any> {
  const PMC: CClass<any> = class extends Component<any> {
    constructor(props: any) {
      super(props);
      this.ref = createRef ? createRef() : (null as any);
      this.subscriptions = {};
    }

    private ref: RefObject<typeof Comp>;
    private subscriptions: { [name: string]: Subscription };

    getInstanceAndMethod(name: string): [object, Function] {
      if ((this.ref as any)[name]) return [this.ref, (this.ref as any)[name]];
      const instance = this.ref.current || (this.ref as any).value;
      return [instance, instance[name]];
    }

    public componentDidMount() {
      const { props, subscriptions } = this;
      names.forEach(name => {
        const streamName: string = name + '$';
        if (props[streamName]) {
          const observable = props[streamName];
          subscriptions[name] = observable.subscribe({
            next: (args: Array<any>) => {
              if (!this.ref) return;
              const [instance, method] = this.getInstanceAndMethod(name);
              if (!method) return;
              if (Array.isArray(args)) {
                method.apply(instance, args);
              } else {
                method.call(instance, args);
              }
            },
          });
        }
      });
    }

    public componentWillUnmount() {
      const subs = this.subscriptions;
      let name: string;
      for (let n = names.length, i = 0; i < n; i++) {
        name = names[i];
        if (subs[name]) subs[name].unsubscribe();
      }
      this.subscriptions = {};
    }

    render() {
      let ref: any = this.ref;
      if (!ref) {
        ref = (r: RefObject<typeof Comp>) => {
          if (r) this.ref = r;
        };
      }
      return createElement(
        Comp,
        { ...(this.props as any), ref },
        this.props.children,
      );
    }
  };
  PMC.displayName =
    'PropifiedMethods(' +
    (Comp.displayName || (Comp as any).name || 'Component') +
    ')';
  return PMC;
}
