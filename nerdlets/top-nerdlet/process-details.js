import React from 'react';
import { Stack, StackItem, LineChart, AreaChart, ChartGroup, NrqlQuery, BlockText } from 'nr1';

export default class ProcessDetails extends React.PureComponent {

  metricQuery(select, suffix="TIMESERIES") {
    const { entity, pid } = this.props
    return `SELECT ${select} FROM ProcessSample WHERE entityGuid='${entity.id}' AND processId=${pid}
      SINCE 30 minutes ago ${suffix}`
  }

  renderSummaryPanel() {
    const {entity} = this.props
    const select = ['commandLine', 'commandName', 'apmApplicationIds', 'parentProcessId'].
      map(s => `latest(${s})`).join(', ')
    const nrql = this.metricQuery(select, '')
    return <NrqlQuery accountId={entity.accountId} query={nrql} formatType='raw'>
      {({loading, data})=> {
        if(loading) return ""
        const {results} = data
        return <StackItem>
            <h2>{results[1].latest}</h2>
            <BlockText>
              <code>{results[0].latest}</code>
            </BlockText>
            <BlockText>
              Parent Process: {results[3].latest}
            </BlockText>
          </StackItem>
      }}
    </NrqlQuery>
  }

  renderChart(ChartType, title, select) {
    const { entity } = this.props;
    return <StackItem>
      <h3>{title}</h3>      
      <ChartType className="chart" accountId={entity.accountId}
        query={this.metricQuery(select)} />
    </StackItem>
  }

  render() {
    return <div className="process-details">
      <ChartGroup>
        <Stack directionType='vertical' alignmentType='fill'>
          {this.renderSummaryPanel()}
          {this.renderChart(AreaChart, 'CPU', 
            "average(cpuSystemPercent) as 'System CPU %', average(cpuUserPercent) AS 'User CPU %'")}
          {this.renderChart(LineChart, 'I/O', 
            "average(ioReadBytesPerSecond/1024/1024) AS 'Read MB/s', average(ioWriteBytesPerSecond/1024/1024) AS 'Write MB/s'")}
          {this.renderChart(AreaChart, 'Resident Memory', 
            "average(memoryResidentSizeBytes/1024/1024) AS 'Resident (MB)'")}
          {this.renderChart(AreaChart, 'Virtual Memory', 
            "average(memoryVirtualSizeBytes/1024/1024) AS 'Virtual (MB)'")}
        </Stack>
      </ChartGroup>
    </div>
  }
}

const x = {
  "agentName": "Infrastructure",
  "agentVersion": "1.3.27",
  "apmApplicationIds": "|750654|",
  "apmApplicationNames": "|Cassandra Timeslice Minute Perf|",
  "commandLine": "/usr/java/default/bin/java",
  "commandName": "java",
  "contained": "true",
  "containerId": "3195dac5f92ba417b94afdf90572450f59c8673640524f4e46e9d7d6d7f31e9e",
  "containerImage": "cf243c7703e7dd520d35418826b48d52b1ffbf426105b39c116b6b12d66b16f0",
  "containerImageName": "cf-registry.nr-ops.net/timeslice-storage/timeslice-docksandra:release-23",
  "containerName": "ts-minute-red-82743c51d67a58",
  "coreCount": "12",
  "cpuPercent": 2896.322429984788,
  "cpuSystemPercent": 762.8204032374999,
  "cpuUserPercent": 2133.502026747288,
  "criticalViolationCount": 1,
  "enclosure": "DZ122",
  "entityAndPid": "4878120499890968173/34395",
  "entityGuid": "MXxJTkZSQXxOQXw0ODc4MTIwNDk5ODkwOTY4MTcz",
  "entityId": "4878120499890968173",
  "entityKey": "chi-staging-ts-perf-9plt382.nr-ops.net",
  "entityName": "0ec376dce7f3",
  "environment": "none",
  "fileDescriptorCount": 910,
  "fqdn": "chi-staging-ts-perf-9plt382.nr-ops.net",
  "fullHostname": "chi-staging-ts-perf-9plt382.nr-ops.net",
  "hostname": "0ec376dce7f3",
  "instanceType": "unknown",
  "ioReadBytesPerSecond": 0,
  "ioReadCountPerSecond": 70428.77143857193,
  "ioTotalReadBytes": 15756337152,
  "ioTotalReadCount": 5326435804,
  "ioTotalWriteBytes": 6080869097472,
  "ioTotalWriteCount": 6884746797,
  "ioWriteBytesPerSecond": 91648076.80384019,
  "ioWriteCountPerSecond": 91304.86524326217,
  "kernelVersion": "4.14.96-coreos-r1",
  "linuxDistribution": "Container Linux by CoreOS 1967.6.0 (Rhyolite)",
  "memoryResidentSizeBytes": 58351943680,
  "memoryVirtualSizeBytes": 2113366052864,
  "nr.apmApplicationIds": "|750654|",
  "nr.apmApplicationNames": "|Cassandra Timeslice Minute Perf|",
  "nr.entityType": "HOST",
  "nr.ingestTimeMs": 1564775069000,
  "operatingSystem": "linux",
  "parentProcessId": 34322,
  "pod_name": "chi",
  "processDisplayName": "java",
  "processId": 34395,
  "processorCount": "48",
  "rack_unit": "21",
  "role": "ddt-chi",
  "server_id": "9PLT382",
  "service_tag": "9PLT382",
  "state": "S",
  "systemMemoryBytes": "270455406592",
  "team": "timeslice storage",
  "threadCount": 526,
  "timestamp": 1564775068000,
  "warningViolationCount": 0
}
