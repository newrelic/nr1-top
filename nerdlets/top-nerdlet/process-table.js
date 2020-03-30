import React from 'react';
import PropTypes from 'prop-types';
import { NrqlQuery, Spinner, Icon } from 'nr1';

import bytesToSize from '../common/bytes-to-size';

const METRICS = {
  cpu: {
    id: 'cpu',
    name: 'CPU',
    fn: 'latest(cpuPercent) AS cpu',
  },
  io: {
    id: 'io',
    name: 'I/O',
    fn: 'latest(ioReadBytesPerSecond+ioWriteBytesPerSecond) as io',
  },
  res: {
    id: 'res',
    name: 'Res',
    fn: 'latest(memoryResidentSizeBytes) as res',
  },
  virt: {
    id: 'virt',
    name: 'Virt',
    fn: 'latest(memoryVirtualSizeBytes) as virt',
  },
  command: {
    id: 'command',
    name: 'Command',
    fn: 'latest(commandName) as command',
    align: 'left',
  },
};

const COLUMNS = [
  METRICS.cpu,
  METRICS.io,
  METRICS.res,
  METRICS.virt,
  METRICS.command,
];

export default class ProcessTable extends React.PureComponent {
  static propTypes = {
    onSelectPid: PropTypes.func,
    entity: PropTypes.object,
    platformUrlState: PropTypes.object,
    selectedPid: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = { sortBy: 'cpu' };
  }

  async componentDidMount() {
    this.loadProcessData();
    this.interval = setInterval(() => this.loadProcessData(), 15000);
  }

  componentDidUpdate({ entity, platformUrlState }) {
    if (
      entity !== this.props.entity ||
      platformUrlState !== this.props.platformUrlState
    ) {
      this.loadProcessData();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async loadProcessData() {
    const { entity, selectedPid } = this.props;
    const { sortBy } = this.state;

    // select all of the metrics, but ensure that the first thing we select is the sorted column,
    // since NRQL sorts on the first function in FACET queries.
    const select = [METRICS[sortBy]]
      .concat(COLUMNS)
      .map((m) => m.fn)
      .join(', ');

    const nrql = `SELECT ${select} FROM ProcessSample
      WHERE entityGuid = '${entity.guid}' OR hostname = '${entity.name}'
      FACET processId LIMIT 50
      SINCE ${Math.round(new Date().getTime() / 1000) - 60}`;

    const { data } = await NrqlQuery.query({
      accountId: entity.accountId,
      query: nrql,
      formatType: 'raw',
    });
    const { facets } = data.raw;
    const tableData = facets.map((facet) => {
      return {
        pid: parseInt(facet.name),
        sort: facet.results[0].latest,
        cpu: `${Math.max(facet.results[1].latest, 0).toFixed(1)}%`,
        io: `${bytesToSize(facet.results[2].latest)}/s`,
        res: bytesToSize(facet.results[3].latest),
        virt: bytesToSize(facet.results[4].latest),
        command: facet.results[5].latest,
      };
    });

    if (tableData.length > 0 && !selectedPid) {
      this.props.onSelectPid(tableData[0].pid);
    }
    this.setState({ tableData });
  }

  render() {
    const { tableData, sortBy } = this.state;
    const { selectedPid } = this.props;

    if (!tableData) return <Spinner />;

    if (tableData.length === 0) return 'No Process Sample data for this host.';

    return (
      <table className="process-table">
        <thead>
          <tr>
            <th className="center">PID</th>
            {COLUMNS.map((column) => {
              const isSelected = sortBy === column.id;
              const className = `{$column.align || 'center'}`;
              return (
                <th
                  className={className}
                  key={column.id}
                  onClick={() => {
                    this.setState({ sortBy: column.id }, () =>
                      this.loadProcessData()
                    );
                  }}
                >
                  {column.name}
                  {isSelected && (
                    <Icon
                      style={{ marginLeft: '6px' }}
                      sizeType={
                        Icon.SIZE_TYPE
                          .INTERFACE__CARET__CARET_BOTTOM__WEIGHT_BOLD__SIZE_8
                      }
                      color="#aaaaaa"
                      type="interface_caret_caret-bottom_weight-bold"
                    />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => {
            const className =
              parseInt(selectedPid) === parseInt(row.pid) ? 'selected' : '';
            return (
              <tr
                key={row.pid}
                className={className}
                onClick={() => this.props.onSelectPid(row.pid)}
              >
                <td className="right">{row.pid}</td>
                {COLUMNS.map((column) => {
                  return (
                    <td className={column.align || 'right'} key={column.id}>
                      {row[column.id]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}
