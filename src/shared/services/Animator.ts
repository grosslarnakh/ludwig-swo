import * as TWEEN from 'tween.js';

type TProps<TValue> = {
  from: TValue[],
  duration: number,
  onValueChange: (newValues: TValue[]) => void,
  comparator: (oldValues: TValue[], newValues: TValue[]) => boolean,
};

export enum AnimationState {
  NOT_STARTED,
  STARTED,
  PAUSED,
  FINISHED,
}

type TFlattenValue<TValue> = {
  [key: string]: TValue,
};

export default class Animator<TValue> {
  private props: TProps<TValue>;
  private prevValue: TFlattenValue<TValue> | null = null;
  private currValue: TFlattenValue<TValue>;
  private animationEnabled: boolean = false;
  private animationState: AnimationState = AnimationState.NOT_STARTED;
  private tween: typeof TWEEN.Tween.prototype;

  constructor(props: TProps<TValue>) {
    this.props = props;

    this.currValue = this.flattenValue(props.from);
    this.tween = this.createTween();
  }

  public enableAnimation = (): void => {
    this.animationEnabled = true;
  };

  public disableAnimation = (): void => {
    this.animationEnabled = false;
  };

  public start(newValue: TValue[]): void {
    if (this.animationState !== AnimationState.NOT_STARTED) {
      this.stop();
    }
    if (Array.isArray(newValue) && newValue.length > 0) {
      const newValueFlatten = this.flattenValue(newValue);
      this.tween.to(newValueFlatten, this.animationEnabled ? this.props.duration : 0);
    }
    this.changeState(AnimationState.STARTED);
    this.tween.start();
    this.animate();
  }

  public stop(): void {
    this.changeState(AnimationState.PAUSED);
    this.tween.stop();
  }

  public isAnimationInProgress(): boolean {
    return this.animationState === AnimationState.STARTED;
  }

  private createTween() {
    const tween = new TWEEN.Tween(this.currValue);
    tween.onUpdate(() => {
      const {prevValue, currValue} = this;
      const noPrevValue = prevValue === null;
      const currValueUnflatten = this.fromFlattenToArray(currValue);

      if (noPrevValue) {
        this.changeValue(currValueUnflatten);
        this.prevValue = this.flattenValue(currValueUnflatten);
      } else {
        const prevValueUnflatten = this.fromFlattenToArray(prevValue);
        if (this.props.comparator(prevValueUnflatten, currValueUnflatten)) {
          this.changeValue(currValueUnflatten);
          this.prevValue = this.flattenValue(currValueUnflatten);
        }
      }
    });
    tween.easing(TWEEN.Easing.Exponential.Out);
    tween.onComplete(() => {
      this.changeValue(this.fromFlattenToArray(this.currValue));
      this.changeState(AnimationState.FINISHED);
    });

    return tween;
  }

  private flattenValue(values: TValue[]): TFlattenValue<TValue> {
    const flattenValue = {};
    values.forEach((value, index) => {
      Object.keys(value).forEach((key) => {
        const flattenKey = `${index}.${key}`;
        flattenValue[flattenKey] = value[key];
      });
    });
    return flattenValue;
  }

  private fromFlattenToArray(flattenValue: TFlattenValue<TValue>): TValue[] {
    let maxIndex = 0;
    Object.keys(flattenValue).forEach((flattenKey) => {
      const [index, key] = flattenKey.split('.');
      maxIndex = Math.max(maxIndex, parseInt(index));
    });
    const values: TValue[] = new Array(maxIndex + 1);
    Object.keys(flattenValue).forEach((flattenKey) => {
      const [index, key] = flattenKey.split('.');
      if (typeof values[index] === 'undefined') {
        values[index] = {};
      }
      values[index][key] = flattenValue[flattenKey];
    });
    return values as TValue[];
  }

  private changeState(newState: AnimationState): void {
    this.animationState = newState;
  }

  private changeValue(newValues: TValue[]): void {
    this.props.onValueChange(newValues);
  }

  private animate = (): void => {
    if (this.animationState !== AnimationState.STARTED) {
      return;
    }
    requestAnimationFrame(this.animate);
    TWEEN.update();
  }
}