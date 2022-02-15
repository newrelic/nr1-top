import React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem, Spinner, PlatformStateContext } from 'nr1';

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
            <PlatformStateContext.Consumer>
              {(platformUrlState) => (
                <ProcessTable
                  entity={entity}
                  platformUrlState={platformUrlState}
                  selectedPid={selectedPid}
                  onSelectPid={this.selectPid}
                  {...this.props}
                />
              )}
            </PlatformStateContext.Consumer>
          </div>
        </GridItem>
        <GridItem columnSpan={5} className="column secondary-column">
          {selectedPid ? (
            <PlatformStateContext.Consumer>
              {(platformUrlState) => (
                <ProcessDetails
                  entity={entity}
                  platformUrlState={platformUrlState}
                  pid={selectedPid}
                  onSelectPid={this.selectPid}
                  {...this.props}
                />
              )}
            </PlatformStateContext.Consumer>
          ) : (
            <Spinner />
          )}
        </GridItem>
      </Grid>
    );
  }
}
