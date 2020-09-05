import { existsSync } from "fs"
import * as path from "path"

export const loadConfiguration = (moduleName: string) => {
  if (existsSync(path.resolve(__dirname, `../../../config/${moduleName}.local.json`))) {
    return require.main?.require(`../../config/${moduleName}.local.json`)
  } else {
    return require.main?.require(`../../config/${moduleName}.json`)
  }
}
