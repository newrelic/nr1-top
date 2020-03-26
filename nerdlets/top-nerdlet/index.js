import React from 'react';
import TopNerdlet from './root';
import { PlatformStateContext, NerdletStateContext } from 'nr1';

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {(platformUrlState) => (
          <NerdletStateContext.Consumer>
            {(nerdletUrlState) => (
              <TopNerdlet
                launcherUrlState={platformUrlState}
                nerdletUrlState={nerdletUrlState}
              />
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
