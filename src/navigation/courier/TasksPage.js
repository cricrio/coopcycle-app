import React, { Component } from 'react'
import { StyleSheet, Platform, InteractionManager } from 'react-native'
import { Container } from 'native-base'
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'
import RNPinScreen from 'react-native-pin-screen'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import { whiteColor, orangeColor, dateSelectHeaderHeight, websocketWarningHeight } from '../../styles/common'
import DateSelectHeader from '../../components/DateSelectHeader'
import TasksMapView from '../../components/TasksMapView'
import {
  loadTasks,
  selectFilteredTasks,
  selectTaskSelectedDate,
  selectKeepAwake,
} from '../../redux/Courier'
import { navigateToTask } from '../../navigation'

class TasksPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      task: null,
      polyline: [],
    }

    this.refreshTasks = this.refreshTasks.bind(this)
  }

  enableKeepAwake() {
    if (Platform.OS === 'ios') {
      activateKeepAwake()
    } else {
      RNPinScreen.pin()
    }
  }

  disableKeepAwake() {
    if (Platform.OS === 'ios') {
      deactivateKeepAwake()
    } else {
      RNPinScreen.unpin()
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.refreshTasks(this.props.selectedDate)
    })

    if (this.props.keepAwake && this.props.isFocused) {
      this.enableKeepAwake()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused || prevProps.keepAwake !== this.props.keepAwake) {
      if (this.props.keepAwake && this.props.isFocused) {
        this.enableKeepAwake()
      } else {
        this.disableKeepAwake()
      }
    }
  }

  refreshTasks (selectedDate) {
    this.props.loadTasks(selectedDate)
  }

  render() {

    const { tasks, selectedDate } = this.props

    return (
      <Container style={ styles.container }>
        <TasksMapView
          mapCenter={ this.props.mapCenter }
          tasks={ tasks }
          onMarkerCalloutPress={ task => navigateToTask(this.props.navigation, this.props.route, task, tasks) } />
        <DateSelectHeader
          buttonsEnabled={true}
          toDate={this.refreshTasks}
          selectedDate={selectedDate}/>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: dateSelectHeaderHeight,
  },
  websocketWarning: {
    backgroundColor: orangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    height: websocketWarningHeight,
    zIndex: 2,
  },
  websocketWarningText: {
    color: whiteColor,
  },
})

function mapStateToProps (state) {
  return {
    tasks: selectFilteredTasks(state),
    selectedDate: selectTaskSelectedDate(state),
    keepAwake: selectKeepAwake(state),
    mapCenter: state.app.settings.latlng.split(',').map(parseFloat),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    loadTasks: (selectedDate) => dispatch(loadTasks(selectedDate)),
  }
}

// module.exports = connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withNavigationFocus(TasksPage)))

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TasksPage))
