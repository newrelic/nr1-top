import React from 'react';
import { NrqlQuery } from 'nr1';

import bytesToSize from '../common/bytes-to-size'

const METRICS = {
  cpu: {
    id: 'cpu',
    name: "CPU",
    fn: "average(cpuPercent) AS cpu"
  },
  io: {
    id: 'io',
    name: "I/O",
    fn: "average(ioReadBytesPerSecond+ioWriteBytesPerSecond) as io"
  },
  res: {
    id: 'res',
    name: "Res",
    fn: "average(memoryResidentSizeBytes) as res"
  },
  virt: {
    id: 'virt',
    name: "Virt",
    fn: "average(memoryVirtualSizeBytes) as virt"
  },
  command: {
    id: 'command',
    name: "Command",
    fn: "latest(commandName) as command",
    align: 'left'
  },
}

const COLUMNS = [
  METRICS.cpu, METRICS.io, METRICS.res, METRICS.virt, METRICS.command
]

export default class ProcessTable extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = { sortBy: 'cpu' }
    this.selectRow = this.selectRow.bind(this)
  }

  selectRow(row) {
    this.setState({selectedPid: row.pid})
    this.props.selectPid(row.pid)
  }

  render() {
    let { sortBy, selectedPid } = this.state
    const { entity } = this.props

    // select all of the metrics, but ensure that the first thing we select is the sorted column,
    // since NRQL sorts on the first function in FACET queries.
    const select = [
      METRICS[sortBy],
    ].concat(COLUMNS).map(m => m.fn).join(', ')

    const nrql = `SELECT ${select} FROM ProcessSample WHERE entityGuid = '${entity.id}' FACET processId LIMIT 50`
    return (
      <NrqlQuery accountId={entity.accountId} query={nrql} formatType='raw'>
        {({ loading, data }) => {
          if (loading) return ""
          if (data.facets.length == 0) return "No process data for this host."
          const tableData = data.facets.map((facet) => {
            return {
              pid: facet.name,
              sort: facet.results[0].average,
              cpu: `${(facet.results[1].average).toFixed(1)}%`,
              io: `${bytesToSize(facet.results[2].average)}/s`,
              res: bytesToSize(facet.results[3].average),
              virt: bytesToSize(facet.results[4].average),
              command: facet.results[5].latest,
            }
          })

          if(!selectedPid) {
            this.selectRow(tableData[0])
            selectedPid = tableData[0].pid
          }

          return <table className="process-table">
            <thead>
              <tr>
                <th className="center">PID</th>
                {COLUMNS.map(column => {
                  return <th className={column.align || 'center'} key={column.id}>{column.name}</th>
                })}
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => {
                const selected = (selectedPid == row.pid) ? 'selected' : ''
                return <tr key={row.pid} className={selected} onClick={() => this.selectRow(row)}>
                  <td className="left">{row.pid}</td>
                  {COLUMNS.map(column => {
                    return <td className={column.align || 'right'} key={column.id}>{row[column.id]}</td>
                  })}
                </tr>
              })}
            </tbody>
          </table>
        }}

      </NrqlQuery>
    )
  }
}