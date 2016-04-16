import * as ActionTypes from './constants.js'
import api from '../../helpers/api.js'
import * as selectors from './selectors.js'

export function update (entity) {
  if (!entity || !entity._id) {
    throw new Error('Invalid entity submitted to update')
  }

  return (dispatch) => dispatch({
    type: ActionTypes.UPDATE,
    entity: entity
  })
}

export function remove (id) {
  return async function (dispatch, getState) {
    const entity = selectors.getById(getState(), id)
    await api.del(`/odata/${entity.__entitySet}(${id})`)

    return dispatch({
      type: ActionTypes.REMOVE,
      _id: id
    })
  }
}

export function add (entity) {
  if (!entity || !entity._id) {
    throw new Error('Invalid entity submitted to add')
  }

  return (dispatch) => dispatch({
    type: ActionTypes.ADD,
    entity: entity
  })
}

export function load (id) {
  return async function (dispatch, getState) {
    let entity = selectors.getById(getState(), id)
    if (!entity.__isLoaded && !entity.__isNew) {
      entity = (await api.get(`/odata/${entity.__entitySet}(${id})`)).value[ 0 ]
    }
    dispatch({
      type: ActionTypes.LOAD,
      entity: entity
    })
  }
}

export function unload (id) {
  return async function (dispatch) {
    dispatch({
      type: ActionTypes.UNLOAD,
      _id: id
    })
  }
}

export function loadReferences (entitySet) {
  return async function (dispatch) {
    let response = await api.get(`/odata/${entitySet}?$select=name,shortid&$orderby=name`)
    dispatch({
      type: ActionTypes.LOAD_REFERENCES,
      entities: response.value,
      entitySet: entitySet
    })
  }
}

export function save (id) {
  return async function (dispatch, getState) {
    try {
      const entity = Object.assign({}, selectors.getById(getState(), id))

      if (entity.__isNew) {
        const oldId = entity._id
        delete entity._id
        const response = await api.post(`/odata/${entity.__entitySet}`, { data: entity })
        entity._id = response._id
        dispatch({
          type: ActionTypes.SAVE_NEW,
          oldId: oldId,
          entity: response
        })
        entity._id = response._id
      } else {
        await api.patch(`/odata/${entity.__entitySet}(${entity._id})`, { data: entity })
        dispatch({
          type: ActionTypes.SAVE,
          _id: entity._id
        })
      }

      return entity
    } catch (e) {
      console.error(e)
    }
  }
}
