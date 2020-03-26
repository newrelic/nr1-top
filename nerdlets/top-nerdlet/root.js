import React from 'react';
import PropTypes from 'prop-types';
import { EntityByGuidQuery, Spinner } from 'nr1';
import { EmptyState } from '@newrelic/nr1-community';

import Top from './top';

export default class TopNerdlet extends React.Component {
  static propTypes = {
    launcherUrlState: PropTypes.object.isRequired,
    nerdletUrlState: PropTypes.object.isRequired,
  };

  render() {
    const { entityGuid } = this.props.nerdletUrlState;
    return (
      <EntityByGuidQuery entityGuid={entityGuid}>
        {({ loading, error, data }) => {
          if (loading) return <div />;
          const entity = data.entities[0];
          if (entity) {
            return <Top entity={entity} {...this.props} />;
          } else {
            return (
              <div className="empty-state-container">
                <EmptyState
                  heading="No entity found"
                  description="This Nerdpack must be run on a monitored host with the New Relic Infrastructure agent deployed on it. Please select a host that meets that criteria."
                  buttonText=""
                />
              </div>
            );
          }
        }}
      </EntityByGuidQuery>
    );
  }
}
