import * as ActionTypes from './constants.js'
import { ActionTypes as EntityActionTypes } from '../entities'
import createReducer from '../createReducer.js'

const reducer = createReducer({
  tabs: [],
  activeTab: null,
  lastActiveTemplateKey: null
})
export default reducer.export()

reducer.handleAction(ActionTypes.OPEN_TAB, (state, { tab }) => ({
  ...state,
  tabs: state.tabs.filter((t) => t.key === tab.key).length ? state.tabs : [...state.tabs, tab]
}))

reducer.handleAction(ActionTypes.OPEN_NEW_TAB, (state, { tab }) => ({
  ...state,
  activeTab: tab.key,
  tabs: [...state.tabs, tab]
}))

reducer.handleActions([EntityActionTypes.REMOVE, ActionTypes.CLOSE_TAB], (state, action) => {
  let newTabs = state.tabs.filter((t) => t.key !== action.key && (!action._id || t._id !== action._id))
  let newActivatTabKey = state.activeTab
  if (state.activeTab === action.key || state.activeTab === action._id) {
    newActivatTabKey = newTabs.length ? newTabs[newTabs.length - 1].key : null
  }

  const newActivatTab = newActivatTabKey ? newTabs.filter((t) => t.key === newActivatTabKey)[0] : null

  return {
    ...state,
    activeTab: newActivatTabKey,
    tabs: newTabs,
    lastActiveTemplateKey: (newActivatTab && newActivatTab.entitySet === 'templates') ? newActivatTab.key
      : (newTabs.filter((t) => t.key === state.lastActiveTemplateKey).length ? state.lastActiveTemplateKey : null)
  }
})

reducer.handleAction(ActionTypes.ACTIVATE_TAB, (state, action) => {
  const newTab = state.tabs.filter((t) => t.key === action.key)[0]
  return {
    ...state,
    activeTab: action.key,
    lastActiveTemplateKey: newTab.entitySet === 'templates' ? action.key : state.lastActiveTemplateKey
  }
})

reducer.handleAction(EntityActionTypes.SAVE_NEW, (state, action) => {
  let index = state.tabs.indexOf(state.tabs.filter((t) => t.key === action.oldId)[0])
  const tab = Object.assign({}, state.tabs[index])
  tab.key = action.entity._id
  tab._id = tab.key

  return {
    ...state,
    tabs: [
      ...state.tabs.slice(0, index),
      tab,
      ...state.tabs.slice(index + 1)],
    activeTab: action.entity._id
  }
})