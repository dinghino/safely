import { api } from '@workspace/backend/api'
import { useQuery } from 'convex/react'
import { StyleSheet, Text, View } from 'react-native'

export const ServerHealthcheck = () => {
  const check = useQuery(api.system.healthcheck)

  const isOk = check === 'OK'
  const isUnknown = check === undefined

  const dotStyle = {
    ...styles.base,
    ...(isOk ? styles.ok : {}),
    ...(isUnknown ? styles.unknown : {}),
    ...(!isOk && !isUnknown ? styles.error : {}),
  }

  return (
    <View style={styles.container}>
      <View style={dotStyle}/>
      <Text>{isOk ? 'connected' : isUnknown ? 'unknown' : 'error'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  // badge like element to keep a left colored dot and the text
  container: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 8,
    paddingBlock: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#55555555',
    borderRadius: 8,
  },
  base: {
    height: 8,
    width: 8,
    borderRadius: 32,
  },
  ok: {
    backgroundColor: 'green',
  },
  unknown: {
    backgroundColor: 'gray',
  },
  error: {
    backgroundColor: 'red',
  },
})
