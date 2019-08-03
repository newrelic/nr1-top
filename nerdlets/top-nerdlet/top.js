import React from 'react';
import {Grid, GridItem, Spinner} from 'nr1';

import ProcessTable from './process-table'
import ProcessDetails from './process-details'

export default class Top extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state={selectedPid: ''}
    this.selectPid = this.selectPid.bind(this)

  }

  selectPid(pid) {
    this.setState({selectedPid: pid})
  }

  render() {
    const {entity} = this.props
    const {selectedPid} = this.state

    return <Grid>
      <GridItem columnSpan={7}>
        <ProcessTable entity={entity} selectedPid={selectedPid} onSelectPid={this.selectPid}/>
      </GridItem>
      <GridItem columnSpan={5}>
        {selectedPid ? 
          <ProcessDetails entity={entity} pid={selectedPid} onSelectPid={this.selectPid}/> : 
          <Spinner/>}
      </GridItem>
    </Grid>
  }
}