import React from 'react';
import {
  EmptyState,
  EntityByGuidQuery,
  NerdletStateContext,
  Spinner,
} from 'nr1';
import { NerdGraphError } from '@newrelic/nr1-community';
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
                  <EmptyState
                    fullHeight
                    fullWidth
                    iconType={
                      EmptyState.ICON_TYPE
                        .HARDWARE_AND_SOFTWARE__SOFTWARE__ALL_ENTITIES
                    }
                    title="No entity found"
                    description="This nerdpack is not enabled for the selected account - please choose an entity from an enabled account, or ask your New Relic admin to enable this nerdpack for this account."
                  />
                );
              }
            }}
          </EntityByGuidQuery>
        )}
      </NerdletStateContext.Consumer>
    );
  }
}
