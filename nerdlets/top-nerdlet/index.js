import React from 'react';
import { EntityByGuidQuery, NerdletStateContext, Spinner } from 'nr1';
import { EmptyState, NerdGraphError } from '@newrelic/nr1-community';
import Top from './top';

export default class TopNerdlet extends React.PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <NerdletStateContext.Consumer>
        {(nerdletUrlState) => (
          <EntityByGuidQuery entityGuid={nerdletUrlState.entityGuid}>
            {({ loading, data, error }) => {
              if (loading) {
                return <Spinner />;
              }
              if (error) {
                return <NerdGraphError error={error} />;
              }
              const entity = data.entities[0];
              if (entity) {
                return <Top entity={entity} />;
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
        )}
      </NerdletStateContext.Consumer>
    );
  }
}

