import { customAlphabet } from 'nanoid'

export const NANOID_LENGTH = 10

export const generateId = customAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz',
  NANOID_LENGTH,
)

export default generateId
