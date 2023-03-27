import React, { useState, useEffect } from 'react';
import {
  EmptyState,
  EntityByGuidQuery,
  NerdletStateContext,
  Spinner,
  nerdlet,
  Icon,
} from 'nr1';
import { HelpModal } from '@newrelic/nr-labs-components';
import Top from './top';

const TopNerdlet = () => {
  // state that controls the open/closed state of the modal
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // effect to configure the Help button in the nerdlet action bar
  useEffect(() => {
    nerdlet.setConfig({
      actionControls: true,
      actionControlButtons: [
        {
          label: 'Help',
          hint: 'Quick links to get support',
          type: 'primary',
          iconType: Icon.TYPE.INTERFACE__INFO__HELP,
          onClick: () => setHelpModalOpen(true),
        },
      ],
    });
  }, []);

  return (
    <>
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
                    title="Entity not found"
                    description="This nerdpack is not enabled for the selected account - please choose an entity from an enabled account, or ask your New Relic admin to enable this nerdpack for this account."
                  />
                );
              }
            }}
          </EntityByGuidQuery>
        )}
      </NerdletStateContext.Consumer>
      <HelpModal
        isModalOpen={helpModalOpen}
        setModalOpen={setHelpModalOpen}
        about={{
          appName: 'Top',
          blurb: `A simple process monitor inspired by Unix’s top command, Top allows you to easily see and understand the CPU, I/O and memory of the processes on a given host.`,
        }}
        urls={{
          docs: 'https://github.com/newrelic/nr1-top#readme',
          createIssue:
            'https://github.com/newrelic/nr1-top/issues/new?assignees=&labels=bug%2C+needs-triage&template=bug_report.md&title=',
          createFeature:
            'https://github.com/newrelic/nr1-top/issues/new?assignees=&labels=enhancement%2C+needs-triage&template=enhancement.md&title=',
          createQuestion:
            'https://github.com/newrelic/nr1-top/discussions/new/choose',
        }}
        ownerBadge={{
          logo: {
            src: 'https://drive.google.com/uc?id=1BdXVy2X34rufvG4_1BYb9czhLRlGlgsT',
            alt: 'New Relic Labs',
          },
          blurb: {
            text: 'This a New Relic Labs open source app.',
            link: {
              text: 'Take a look at our other repos',
              url: 'https://github.com/newrelic?q=nrlabs-viz&type=all&language=&sort=',
            },
          },
        }}
      />
    </>
  );
};

export default TopNerdlet;
