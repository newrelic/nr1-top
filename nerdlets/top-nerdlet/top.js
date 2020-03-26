import React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem, Spinner } from 'nr1';

import ProcessTable from './process-table';
import ProcessDetails from './process-details';

export default class Top extends React.PureComponent {
  static propTypes = {
    entity: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = { selectedPid: null };
    this.selectPid = this.selectPid.bind(this);
  }

  selectPid(pid) {
    this.setState({ selectedPid: pid });
  }

  render() {
    const { entity } = this.props;
    const { selectedPid } = this.state;

    return (
      <Grid className="primary-grid">
        <GridItem columnSpan={7} className="column primary-column">
          <header className="column-header">
            <h1>Top Processes</h1>
            <p className="subtitle">Refreshes every 15 seconds</p>
          </header>
          <div className="primary-column-main">
            <ProcessTable
              entity={entity}
              selectedPid={selectedPid}
              onSelectPid={this.selectPid}
              {...this.props}
            />
          </div>
        </GridItem>
        <GridItem columnSpan={5} className="column secondary-column">
          {selectedPid ? (
            <ProcessDetails
              entity={entity}
              pid={selectedPid}
              onSelectPid={this.selectPid}
              {...this.props}
            />
          ) : (
            <Spinner />
          )}
        </GridItem>
      </Grid>
    );
  }
}
