import React from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  StackItem,
  LineChart,
  AreaChart,
  ChartGroup,
  NrqlQuery,
  BlockText,
  Button,
  Spinner,
  NerdGraphQuery
} from 'nr1';
import get from 'lodash.get';
import { timeRangeToNrql } from '../common/time-range-to-nrql';

export default class ProcessDetails extends React.PureComponent {
  static propTypes = {
    onSelectPid: PropTypes.func,
    entity: PropTypes.object,
    platformUrlState: PropTypes.object,
    pid: PropTypes.number
  };

  metricQuery(select, suffix = 'TIMESERIES') {
    const { entity, pid, platformUrlState } = this.props;
    return `SELECT ${select} FROM ProcessSample WHERE entityGuid='${
      entity.guid
    }' AND processId=${pid} ${suffix} ${timeRangeToNrql({
      timeRange: platformUrlState.timeRange
    })}`;
  }

  summaryPanelQuery(select) {
    const { entity, pid, platformUrlState } = this.props;

    const nrql = `SELECT ${select} FROM ProcessSample WHERE entityGuid='${
      entity.guid
    }' AND processId=${pid} ${timeRangeToNrql({
      timeRange: platformUrlState.timeRange
    })}`;

    return `{
      actor {
        account(id: ${entity.accountId}) {
          nrql(query: "${nrql}") {
            results
          }
        }
      }
    }`;
  }

  renderProcessLink(pid) {
    if (!pid || pid === null) {
      return (
        <StackItem key="none">
          <Button
            type={Button.TYPE.PLAIN}
            disabled
            sizeType={Button.SIZE_TYPE.SMALL}
          >
            none
          </Button>
        </StackItem>
      );
    }
    return (
      <StackItem key={pid}>
        <Button
          iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DRAG}
          sizeType={Button.SIZE_TYPE.SMALL}
          type={Button.TYPE.PLAIN}
          onClick={() => this.props.onSelectPid(pid)}
        >
          {pid}
        </Button>
      </StackItem>
    );
  }

  renderChildProcesses() {
    const { entity, pid } = this.props;
    const nrql = `SELECT uniques(processId) FROM ProcessSample
      WHERE entityGuid = '${entity.guid}' AND parentProcessId = ${pid}`;

    return (
      <NrqlQuery accountIds={[entity.accountId]} query={nrql} formatType="raw">
        {({ loading, data }) => {
          if (loading) return '';
          const { members } = data.results[0];

          // if there are no children, add a "null" child process, which will
          // result in us displaying "<em>none</em>"
          if (members.length === 0) members.push(null);

          return (
            <Stack
              verticalType={Stack.VERTICAL_TYPE.CENTER}
              className="summary-panel__child-processes"
            >
              <StackItem>Child Processes: </StackItem>
              {members.map((pid) => this.renderProcessLink(pid))}
            </Stack>
          );
        }}
      </NrqlQuery>
    );
  }

  renderSummaryPanel() {
    const select = ['commandLine', 'commandName', 'parentProcessId']
      .map((s) => `latest(${s}) as ${s}`)
      .join(', ');
    const nrql = this.summaryPanelQuery(select);

    return (
      <NerdGraphQuery query={nrql}>
        {({ loading, error, data }) => {
          if (loading) {
            return <Spinner fillContainer />;
          }

          // GraphQL Error -- pass through the error to default NerdGraphError component
          if (error || !data.actor.account.nrql) {
            // eslint-disable-next-line no-console
            console.debug(`Bad NRQL Query: ${nrql}: `);
            throw new Error(error);
          }

          const results = get(data, 'actor.account.nrql.results[0]');

          // Failed to get results for whatever reason - show friendly message to user
          if (!results) {
            // eslint-disable-next-line no-console
            console.debug('Error: Failed to retrieve process summary');
          }

          const commandLine = results.commandLine;
          const commandName = results.commandName;
          const parentPid = results.parentProcessId;

          return (
            <div className="summary-panel">
              <StackItem>
                <h2>{commandName}</h2>
              </StackItem>
              <StackItem>
                <BlockText>
                  Command Line: <code>{commandLine}</code>
                </BlockText>
              </StackItem>
              <StackItem>
                <Stack verticalType={Stack.VERTICAL_TYPE.CENTER}>
                  <StackItem>Parent Process: </StackItem>
                  {this.renderProcessLink(parentPid)}
                </Stack>
              </StackItem>
              <StackItem>{this.renderChildProcesses()}</StackItem>
            </div>
          );
        }}
      </NerdGraphQuery>
    );
  }

  renderChart(ChartType, title, select) {
    const { entity } = this.props;
    return (
      <StackItem>
        <h3>{title}</h3>
        <ChartType
          className="chart"
          accountIds={[entity.accountId]}
          query={this.metricQuery(select)}
        />
      </StackItem>
    );
  }

  render() {
    return (
      <div className="process-details">
        {this.renderSummaryPanel()}

        <ChartGroup>
          <Stack
            directionType={Stack.DIRECTION_TYPE.VERTICAL}
            horizontalType={Stack.HORIZONTAL_TYPE.FILL}
            fullWidth
          >
            <div className="process-details-main">
              {this.renderChart(
                AreaChart,
                'CPU',
                "average(cpuSystemPercent) as 'System CPU %', average(cpuUserPercent) AS 'User CPU %'"
              )}
              {this.renderChart(
                LineChart,
                'I/O',
                "average(ioReadBytesPerSecond/1024/1024) AS 'Read MB/s', average(ioWriteBytesPerSecond/1024/1024) AS 'Write MB/s'"
              )}
              {this.renderChart(
                AreaChart,
                'Resident Memory',
                "average(memoryResidentSizeBytes) AS 'Resident'"
              )}
              {this.renderChart(
                AreaChart,
                'Virtual Memory',
                "average(memoryVirtualSizeBytes) AS 'Virtual'"
              )}
            </div>
          </Stack>
        </ChartGroup>
      </div>
    );
  }
}
