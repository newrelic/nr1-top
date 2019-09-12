import React from 'react';
import {
  Stack,
  StackItem,
  LineChart,
  AreaChart,
  ChartGroup,
  NrqlQuery,
  BlockText,
  Button,
} from 'nr1';
import timePickerNrql from '../common/time-picker-nrql';

export default class ProcessDetails extends React.PureComponent {
  metricQuery(select, suffix = 'TIMESERIES') {
    const { entity, pid } = this.props;
    return `SELECT ${select} FROM ProcessSample WHERE entityGuid='${
      entity.guid
    }'
      AND processId=${pid} ${suffix} ${timePickerNrql(this.props)}`;
  }

  renderProcessLink(pid) {
    if (!pid || pid == 'null') {
      return (
        <StackItem key="none">
          <Button type="plain" disabled sizeType={Button.SIZE_TYPE.SMALL}>
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
          type="plain"
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
      <NrqlQuery accountId={entity.accountId} query={nrql} formatType="raw">
        {({ loading, data }) => {
          if (loading) return '';
          const { members } = data.results[0];

          // if there are no children, add a "null" child process, which will
          // result in us displaying "<em>none</em>"
          if (members.length == 0) members.push(null);

          return (
            <Stack alignmentType="center">
              <StackItem>Child Processes: </StackItem>
              {members.map(pid => this.renderProcessLink(pid))}
            </Stack>
          );
        }}
      </NrqlQuery>
    );
  }

  renderSummaryPanel() {
    const { entity } = this.props;
    const select = ['commandLine', 'commandName', 'parentProcessId']
      .map(s => `latest(${s})`)
      .join(', ');
    const nrql = this.metricQuery(select, '');
    return (
      <NrqlQuery accountId={entity.accountId} query={nrql} formatType="raw">
        {({ loading, data }) => {
          if (loading) return null;
          const { results } = data;
          if (!results || results.length == 0) return null;

          const commandLine = results.shift().latest,
            commandName = results.shift().latest,
            parentPid = results.shift().latest;

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
                <Stack alignmentType="center">
                  <StackItem>Parent Process: </StackItem>
                  {this.renderProcessLink(parentPid)}
                </Stack>
              </StackItem>
              <StackItem>{this.renderChildProcesses()}</StackItem>
            </div>
          );
        }}
      </NrqlQuery>
    );
  }

  renderChart(ChartType, title, select) {
    const { entity } = this.props;
    return (
      <StackItem>
        <h3>{title}</h3>
        <ChartType
          className="chart"
          accountId={entity.accountId}
          query={this.metricQuery(select)}
        />
      </StackItem>
    );
  }

  render() {
    return (
      <div className="process-details">
        <ChartGroup>
          <Stack directionType="vertical" alignmentType="fill">
            {this.renderSummaryPanel()}
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
          </Stack>
        </ChartGroup>
      </div>
    );
  }
}
