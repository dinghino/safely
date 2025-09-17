import { customAlphabet } from 'nanoid'

export const generateId = customAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz',
  10,
)

export default generateId
