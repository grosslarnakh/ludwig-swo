import * as React from 'react';
import {connect, DispatchProp} from 'react-redux';

import StatNumFreqInYear from '../components/StatNumFreqInYear';
import {TGlobalState} from 'shared/types/GlobalState';
import {TStatTotal} from 'shared/types/StatTotal';
import {TDispatch} from 'shared/types/Dispatch';

type TStateFromProps = {
  isFetching: boolean;
  statTotal: TStatTotal;
};

const mapStateToProps = (state: TGlobalState): TStateFromProps => {
  return {
    isFetching: state.stats.isFetching,
    statTotal: state.stats.data.statTotal,
  };
};

class StatNumFreqInYearContainer extends React.Component<TStateFromProps & DispatchProp<TDispatch>, any> {
  public render() {
    const {dispatch, ...props} = this.props;
    return (
      <StatNumFreqInYear {...props} />
    );
  }
}

export default connect<TStateFromProps, null, null>(mapStateToProps)(StatNumFreqInYearContainer);
