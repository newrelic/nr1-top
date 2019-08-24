import React from 'react';
import PropTypes from 'prop-types';
import {EntityByGuidQuery, Spinner} from 'nr1'

import Top from './top'

export default class TopNerdlet extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
    }

    render() {
      const {entityGuid} = this.props.nerdletUrlState
      return (
        <EntityByGuidQuery entityGuid={entityGuid}>
          {({loading, error, data}) => {      
            if(loading) return <Spinner/>
            const entity = data.actor.entities[0]
            return entity ? <Top entity={entity}/> : <Spinner/>
          }}
        </EntityByGuidQuery>
      )
    }
}
