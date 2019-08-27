import React from 'react';
import { NrqlQuery, Spinner } from 'nr1';
import timePickerNrql from '../common/time-picker-nrql';

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
  }

  async componentDidMount() {
    this.loadProcessData()
  }

  componentDidUpdate({entity,launcherUrlState}) {
    if(entity != this.props.entity || launcherUrlState != this.props.launcherUrlState) {
      this.loadProcessData()
    }
  }
  
  async loadProcessData() {
    let { entity, selectedPid } = this.props
    const { sortBy } = this.state

    // select all of the metrics, but ensure that the first thing we select is the sorted column,
    // since NRQL sorts on the first function in FACET queries.
    const select = [
      METRICS[sortBy],
    ].concat(COLUMNS).map(m => m.fn).join(', ')

    const nrql = `SELECT ${select} FROM ProcessSample 
      WHERE entityGuid = '${entity.guid}' OR hostname = '${entity.name}' 
      FACET processId LIMIT 50
      ${timePickerNrql(this.props)}`
    const { data } = await NrqlQuery.query({ accountId: entity.accountId, query: nrql, formatType: 'raw' })
    const { facets } = data.cdsData.raw
    const tableData = facets.map((facet) => {
      return {
        pid: parseInt(facet.name),
        sort: facet.results[0].average,
        cpu: `${(facet.results[1].average).toFixed(1)}%`,
        io: `${bytesToSize(facet.results[2].average)}/s`,
        res: bytesToSize(facet.results[3].average),
        virt: bytesToSize(facet.results[4].average),
        command: facet.results[5].latest,
      }
    })

    if (tableData.length > 0 && !selectedPid) {
      this.props.onSelectPid(tableData[0].pid)
    }
    this.setState({ tableData })
  }

  render() {
    const {tableData} = this.state
    const {selectedPid} = this.props

    if (!tableData) return <Spinner />

    if (tableData.length == 0) return "No Process Sample data for this host."

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
          const className = (parseInt(selectedPid) == parseInt(row.pid)) ? 'selected' : ''
          return <tr key={row.pid} className={className} onClick={() => this.props.onSelectPid(row.pid)}>
            <td className="left">{row.pid}</td>
            {COLUMNS.map(column => {
              return <td className={column.align || 'right'} key={column.id}>{row[column.id]}</td>
            })}
          </tr>
        })}
      </tbody>
    </table>
    
  }
}