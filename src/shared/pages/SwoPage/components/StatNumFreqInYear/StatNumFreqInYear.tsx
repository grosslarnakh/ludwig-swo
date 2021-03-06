import * as React from 'react';
import * as classNames from 'classnames';

import SectionContent from 'shared/pages/SwoPage/containers/SectionContent';
import Animator from 'shared/services/Animator';
import {ANIMATION_DURATION_DEFAULT} from 'shared/constants';
import * as utils from 'shared/utils';

import navSectionData from './navSectionData';

import {TStatTotal} from 'shared/types/StatTotal';

import './StatNumFreqInYear.scss';
import {ReactElement} from 'react';

type TProps = {
  isFetching: boolean,
  statTotal: TStatTotal,
};

type TState = {
  animatorCurrValue: TAnimatorValue,
};

type TAnimatorValue = {
  time: number,
};

// 1=340..9=66
const NUM_FREQ_IN_YEAR_VALUES: number[] = [340, 316, 216, 85, 66, 67, 66, 67, 67, 66];
const NUM_FREQ_IN_YEAR_MIN_VALUE = Math.min.apply(Math, NUM_FREQ_IN_YEAR_VALUES);
const NUM_FREQ_IN_YEAR_MAX_VALUE = Math.max.apply(Math, NUM_FREQ_IN_YEAR_VALUES);
const NUM_FREQ_IN_YEAR_VALUE_WIDTH_MIN = 5;
const NUM_FREQ_IN_YEAR_VALUE_WIDTH_MAX = 100;
const NUM_FREQ_IN_YEAR_VALUES_WIDTHES = NUM_FREQ_IN_YEAR_VALUES.map((value) => {
  return utils.math.convertRange(
    value,
    NUM_FREQ_IN_YEAR_MIN_VALUE,
    NUM_FREQ_IN_YEAR_MAX_VALUE,
    NUM_FREQ_IN_YEAR_VALUE_WIDTH_MIN,
    NUM_FREQ_IN_YEAR_VALUE_WIDTH_MAX,
  );
});

export default class StatNumFreqInYear extends React.Component<TProps, TState> {
  public state = {
    animatorCurrValue: {
      time: 0,
    },
  };
  private animator: Animator<TAnimatorValue>;

  constructor(props: TProps) {
    super(props);

    this.state.animatorCurrValue.time = props.statTotal.date.getTime();
    this.animator = this.createAnimator();
  }

  public componentWillReceiveProps(nextProps: TProps) {
    const oldDate = this.props.statTotal.date;
    const newDate = nextProps.statTotal.date;

    if (oldDate.getTime() === newDate.getTime()) {
      return;
    }

    this.animator.start([{time: newDate.getTime()}]);
  }

  public render() {
    return (
      <section className="StatNumFreqInYear">
        <SectionContent animator={this.animator} navSection={navSectionData}>
          {this.renderFreq()}
          {this.renderCalendar()}
        </SectionContent>
      </section>
    );
  }

  private renderFreq(): ReactElement<any> {
    return (
      <div className="StatNumFreqInYear-freq">
        <div className="StatNumFreqInYear-freqTitle">Частокол</div>
        <div className="StatNumFreqInYear-freqSubTitle">
          Частота появления цифр от&nbsp;нуля до&nbsp;девяти в&nbsp;датах одного года:
        </div>
        <div className="StatNumFreqInYear-freqColumns">
          {this.renderFreqColumns()}
        </div>
      </div>
    );
  }

  private renderFreqColumns = () => {
    const animatorCurrDayValueNums = this.getNumbersFromNumberWithLeadingZero(
      new Date(this.state.animatorCurrValue.time).getDate(),
    );

    return NUM_FREQ_IN_YEAR_VALUES.map((valueAtNum: number, num: number) => {
      const valueAtNumFormatted: string = utils.format.formatValueToTimesWithPluralize(valueAtNum);
      const horizontalLineWidth = NUM_FREQ_IN_YEAR_VALUES_WIDTHES[num];
      const numsFromNum = this.getNumbersFromNumber(num);
      const isSelected: boolean = numsFromNum.some((n) => animatorCurrDayValueNums.indexOf(n) !== -1);
      const className = classNames(
        'StatNumFreqInYear-freqColumn',
        {'is-selected': isSelected},
      );
      return (
        <div className={className} key={num}>
          <div className="StatNumFreqInYear-freqColumnLine is-vertical" style={{height: `${valueAtNum}px`}} />
          <div
            className="StatNumFreqInYear-freqColumnLine is-horizontal"
            style={{width: `${horizontalLineWidth}%`, flexBasis: `${horizontalLineWidth}%`}}
          />
          <div className="StatNumFreqInYear-freqColumnData">
            <div className="StatNumFreqInYear-freqColumnDataNum">«{num}»</div>
            <div className="StatNumFreqInYear-freqColumnDataValueAtNum">{valueAtNumFormatted}</div>
          </div>
        </div>
      );
    });
  };

  private renderCalendar(): ReactElement<any> {
    const dates = utils.date.getDaysInYearAsDates();
    const animatorCurrDateFormatted: string = utils.date.dateToDDMM(new Date(this.state.animatorCurrValue.time));
    return (
      <div className="StatNumFreqInYear-calendar">
        <div className="StatNumFreqInYear-calendarItems">
          {dates.map((date, index) => {
            const isOddMonth: boolean = ((date.getMonth()) % 2) === 0;
            const dateFormatted = utils.date.dateToDDMM(date);
            const className = classNames(
              'StatNumFreqInYear-calendarItem',
              `is-${isOddMonth ? 'odd' : 'even'}Month`,
              {'is-selected': animatorCurrDateFormatted === dateFormatted},
            );
            return (
              <span className={className} key={index}>{dateFormatted}</span>
            );
          })}
        </div>
      </div>
    );
  }

  private getNumbersFromNumber(num: number|string): number[] {
    return num.toString().split('').map((n) => parseInt(n));
  }

  private getNumbersFromNumberWithLeadingZero(num: number): number[] {
    const finalNum: string = `${num < 10 ? '0' : ''}${num}`;
    return this.getNumbersFromNumber(finalNum);
  }

  private createAnimator(): Animator<TAnimatorValue> {
    return new Animator<TAnimatorValue>({
      from: [{time: this.state.animatorCurrValue.time}],
      duration: ANIMATION_DURATION_DEFAULT,
      comparator: (oldValues, newValues) => {
        return (
          utils.date.dateToYYYYMMDD(new Date(oldValues[0].time)) !==
          utils.date.dateToYYYYMMDD(new Date(newValues[0].time))
        );
      },
      onValueChange: (newValues) => this.setState({animatorCurrValue: newValues[0]}),
    });
  }
}
