import React from 'react';
import PropTypes from 'prop-types';
import {EntityByIdQuery, Spinner} from 'nr1'

import Top from './top'

export default class TopNerdlet extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
    }

    render() {
      const {entityId} = this.props.nerdletUrlState
      return (
        <EntityByIdQuery entityId={entityId}>
          {({loading, error, data}) => {      
            const entity = data && data.actor && data.actor.entities && data.actor.entities[0]
            return entity ? <Top entity={entity}/> : <Spinner/>
          }}
        </EntityByIdQuery>
      )
    }
}
