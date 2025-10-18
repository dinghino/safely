import { View, Text, StyleSheet } from 'react-native'
import shared from '@/lib/shared.styles'
export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Text style={shared.tabTitle}>[Tabs|Home]</Text>
      {/* <View style={styles.mapContainer}>
        <View style={styles.map} />
      </View> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    minHeight: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'lightgray',
  },
})
