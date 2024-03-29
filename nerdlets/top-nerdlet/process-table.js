/* eslint-disable react/jsx-no-bind */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  NerdGraphQuery,
  Spinner,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  MetricTableRowCell,
  SectionMessage,
} from 'nr1';

const METRICS = {
  cpu: {
    id: 'cpu',
    name: 'CPU',
    fn: 'latest(cpuPercent) AS cpu',
    cellType: 'metric',
    dataType: MetricTableRowCell.TYPE.PERCENTAGE,
  },
  io: {
    id: 'io',
    name: 'I/O',
    fn: 'latest(ioReadBytesPerSecond+ioWriteBytesPerSecond) as io',
    cellType: 'metric',
    dataType: MetricTableRowCell.TYPE.BYTES_PER_SECOND,
  },
  res: {
    id: 'res',
    name: 'Res',
    fn: 'latest(memoryResidentSizeBytes) as res',
    cellType: 'metric',
    dataType: MetricTableRowCell.TYPE.BYTES,
  },
  virt: {
    id: 'virt',
    name: 'Virt',
    fn: 'latest(memoryVirtualSizeBytes) as virt',
    cellType: 'metric',
    dataType: MetricTableRowCell.TYPE.BYTES,
  },
  command: {
    id: 'command',
    name: 'Command',
    fn: 'latest(commandLine) as command',
    width: '3fr',
    ellipsis: TableRowCell.ELLIPSIS_TYPE.LEFT,
  },
};

const COLUMNS = [
  METRICS.cpu,
  METRICS.io,
  METRICS.res,
  METRICS.virt,
  METRICS.command,
];

const getQuery = (entity) => {
  const select = COLUMNS.map((m) => m.fn).join(', ');

  const query = `SELECT ${select} FROM ProcessSample WHERE entityGuid = '${
    entity.guid
  }' OR hostname = '${entity.name}' FACET processId LIMIT 50 SINCE ${
    Math.round(new Date().getTime() / 1000) - 60
  }`;

  return `{
      actor {
        account(id: ${entity.accountId}) {
          nrql(query: "${query}") {
            results
          }
        }
      }
    }
  `;
};

const parseData = (data) => {
  const facets = data?.actor?.account?.nrql?.results;
  const tableData = facets.map((facet) => {
    return {
      pid: parseInt(facet.processId),
      cpu: facet.cpu,
      io: facet.io,
      res: facet.res,
      virt: facet.virt,
      command: facet.command,
    };
  });
  return tableData;
};

const ProcessTable = ({ entity, selectedPid, onSelectPid }) => {
  const [sortColumn, setSortColumn] = useState(1);
  const [sortingType, setSortingType] = useState();

  const handleSort = (column, evt, { nextSortingType }) => {
    if (column === sortColumn) {
      setSortingType(nextSortingType);
    } else {
      setSortColumn(column);
      setSortingType(nextSortingType);
    }
  };

  return (
    <>
      <NerdGraphQuery query={getQuery(entity)} pollInterval={15000}>
        {({ data, loading, error }) => {
          if (loading) return <Spinner />;
          if (error?.graphQLErrors) {
            return (
              <SectionMessage
                type={SectionMessage.TYPE.CRITICAL}
                title="Error requesting data"
                style={{ width: '90%' }}
                description={error?.graphQLErrors.map((e) => (
                  // eslint-disable-next-line react/jsx-key
                  <div>{e.message}</div>
                ))}
              />
            );
          }
          const tableData = parseData(data);
          if (tableData.length === 0)
            return (
              <SectionMessage description="No Process Sample data for this host." />
            );

          if (!selectedPid) onSelectPid(tableData[0].pid);

          return (
            <div
              style={{
                height: '94%',
                overflow: 'scroll',
                transform: 'scaleX(-1)',
              }}
            >
              <Table style={{ transform: 'scaleX(-1)' }} items={tableData}>
                <TableHeader>
                  <TableHeaderCell
                    sortable
                    sortingType={
                      sortColumn === 0
                        ? sortingType
                        : TableHeaderCell.SORTING_TYPE.NONE
                    }
                    value={({ item }) => item.pid}
                    onClick={handleSort.bind(this, 0)}
                  >
                    PID
                  </TableHeaderCell>
                  {COLUMNS.map((column, idx) => (
                    <TableHeaderCell
                      alignmentType={
                        column.cellType === 'metric' &&
                        TableHeaderCell.ALIGNMENT_TYPE.RIGHT
                      }
                      key={idx}
                      sortable
                      sortingType={
                        sortColumn === idx + 1
                          ? sortingType
                          : TableHeaderCell.SORTING_TYPE.NONE
                      }
                      value={({ item }) => item[column.id]}
                      width={column.width || '1fr'}
                      onClick={handleSort.bind(this, idx + 1)}
                    >
                      {column.name}
                    </TableHeaderCell>
                  ))}
                </TableHeader>
                {({ item }) => {
                  const selected = item.pid === selectedPid;
                  const selectedBackground = {
                    backgroundColor: 'rgb(237,250,252)',
                  };
                  return (
                    <TableRow onClick={() => onSelectPid(item.pid)}>
                      <TableRowCell style={selected && selectedBackground}>
                        {item.pid}
                      </TableRowCell>
                      {COLUMNS.map((column, idx) =>
                        column.cellType === 'metric' ? (
                          <MetricTableRowCell
                            key={idx}
                            style={selected && selectedBackground}
                            type={column.dataType}
                            value={item[column.id]}
                          />
                        ) : (
                          <TableRowCell
                            style={selected && selectedBackground}
                            key={idx}
                            ellipsisType={
                              column.ellipsis ||
                              TableRowCell.ELLIPSIS_TYPE.RIGHT
                            }
                          >
                            {item[column.id]}
                          </TableRowCell>
                        )
                      )}
                    </TableRow>
                  );
                }}
              </Table>
            </div>
          );
        }}
      </NerdGraphQuery>
    </>
  );
};

ProcessTable.propTypes = {
  onSelectPid: PropTypes.func,
  entity: PropTypes.object,
  selectedPid: PropTypes.number,
};

export default ProcessTable;
/* eslint-enable react/jsx-no-bind */
