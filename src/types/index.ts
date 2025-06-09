import type { ImageSourcePropType } from "react-native"

export interface User {
  id: string
  username: string
  email: string
  profileImage?: ImageSourcePropType
}
