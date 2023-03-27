import React from 'react';
import PropTypes from 'prop-types';
import { BlockText, HeadingText, Spacing, PlatformStateContext } from 'nr1';
import { Messages } from '@newrelic/nr-labs-components';

import ProcessTable from './process-table';
import ProcessDetails from './process-details';

export default class Top extends React.PureComponent {
  static propTypes = {
    entity: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { selectedPid: null };
  }

  selectPid = (pid) => {
    this.setState({ selectedPid: pid });
  };

  render() {
    const { entity } = this.props;
    const { selectedPid } = this.state;

    return (
      <>
        <Messages repo="nr1-top" />
        <div className="primary-grid">
          <div className="primary-column">
            <HeadingText>Top Processes</HeadingText>
            <Spacing type={[Spacing.TYPE.MEDIUM, Spacing.TYPE.OMIT]}>
              <BlockText className="subtitle">
                Refreshes every 15 seconds
              </BlockText>
            </Spacing>
            <ProcessTable
              entity={entity}
              selectedPid={selectedPid}
              onSelectPid={this.selectPid}
              {...this.props}
            />
          </div>
          <div className="secondary-column">
            {selectedPid && (
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
            )}
          </div>
        </div>
      </>
    );
  }
}
