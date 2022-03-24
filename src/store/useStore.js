import { useContext } from "react"
import { MobXProviderContext } from "mobx-react"

const useStores = (name) => useContext(MobXProviderContext)[name]

export { useStores }
