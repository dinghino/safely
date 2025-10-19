import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native'
import { useEffect, useReducer } from 'react'
import BackgroundGeolocation, { type State } from 'react-native-background-geolocation'

type ComponentState = {
  enabled: boolean
  debug: boolean
  headless: boolean
}

const defaults: ComponentState = {
  enabled: false,
  debug: false,
  headless: false,
}

type Action = { type: 'SET_STATE'; payload: Partial<ComponentState> }

const reducer = (state: ComponentState, { type, payload }: Action): ComponentState => {
  switch (type) {
    case 'SET_STATE':
      return { ...state, ...payload }
    default:
      return state
  }
}



export default function SettingsTab() {
  const [state, dispatch] = useReducer(reducer, defaults)
  useEffect(() => {
    // Get current state
    BackgroundGeolocation.getState().then((state) => {
      const { enabled, debug = false, enableHeadless = false } = state
      dispatch({ type: 'SET_STATE', payload: { enabled, debug, headless: enableHeadless } })
    })
  }, [])

  const handleEnableToggle = async (value: boolean) => {
    const next = value ? BackgroundGeolocation.start : BackgroundGeolocation.stop
    const state = await next()
    dispatch({ type: 'SET_STATE', payload: { enabled: state.enabled } })
  }

  const handleDebugToggle = async (value: boolean) => {
    const state = await BackgroundGeolocation.setConfig({ debug: value })
    dispatch({ type: 'SET_STATE', payload: { debug: state.debug } })
  }

  const toggleHeadless = async (value: boolean) => {
    const state = await BackgroundGeolocation.setConfig({ enableHeadless: value })
    dispatch({ type: 'SET_STATE', payload: { headless: state.enableHeadless } })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Control
        title="Enable Tracking"
        description="Start/stop background location tracking"
        value={state.enabled}
        onValueChange={handleEnableToggle}
      />
      <Control
        title="Debug Mode"
        description="Enable debug logging and notifications"
        value={state.debug}
        onValueChange={handleDebugToggle}
        trackColor={{ true: '#FF9800', false: '#ff980033' }}
      />
      <Control
        title="Headless mode"
        description="Allow location tracking when app is terminated"
        value={state.headless}
        onValueChange={toggleHeadless}
      />
    </ScrollView>
  )
}

type ControlProps = {
  title: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
  trackColor?: { false?: string; true?: string }
}

function Control(props: ControlProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{props.title}</Text>
        <Text style={styles.settingDescription}>{props.description}</Text>
      </View>
      <Switch
        value={props.value}
        onValueChange={props.onValueChange}
        trackColor={{ false: '#e0e0e0', true: '#4CAF50', ...props.trackColor }}
        thumbColor={props.value ? '#ffffff' : '#ffffff'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    gap: 8,
    display: 'flex',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 8,
    // marginBottom: 12,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
})
