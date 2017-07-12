'use strict';

import { Observable, Observer, Subscription } from '../observer';

class BooleanSubscription implements Subscription {
  public isUnsubscribed: boolean = false;

  unsubscribe() {
    this.isUnsubscribed = true;
  }
}

class AsyncIterableObservable<TSource> implements Observable<TSource> {
  private _source: AsyncIterable<TSource>;

  constructor(source: AsyncIterable<TSource>) {
    this._source = source;
  }

  subscribe(observer: Observer<TSource>) {
    const subscription = new BooleanSubscription();

    const it = this._source[Symbol.asyncIterator]();
    const f = () => {
      it.next()
        .then(next => {
          if (!subscription.isUnsubscribed) {
            if (next.done) {
              observer.complete();
            } else {
              observer.next(next.value);
              f();
            }
          }
        })
        .catch(err => {
          if (!subscription.isUnsubscribed) {
            observer.error(err);
          }
        });
    };

    return subscription;
  }
}

export function toObservable<TSource>(source: AsyncIterable<TSource>) {
  return new AsyncIterableObservable<TSource>(source);
}