import React from 'react';
import {
  EmptyState,
  EntityByGuidQuery,
  NerdletStateContext,
  Spinner
} from 'nr1';
import Top from './top';

const TopNerdlet = () => {
  return (
    <NerdletStateContext.Consumer>
      {({ entityGuid }) => (
        <EntityByGuidQuery entityGuid={entityGuid}>
          {({ loading, data, error }) => {
            if (loading) {
              return <Spinner />;
            }
            if (error) {
              throw new Error(error);
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
};

export default TopNerdlet;
