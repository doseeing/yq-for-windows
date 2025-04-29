import { ipcMain, shell, IpcMainEvent, dialog } from 'electron'
import Constants from './utils/Constants'
import { execFile } from 'child_process'
import path from 'path'
import { promisify } from 'util'

async function runBinary() {
  const binaryPath = path.join(__dirname, 'static', 'yq_darwin_arm64')
  console.log('Running binary at:', binaryPath)

  const execFileAsync = promisify(execFile)

  try {
    const { stdout } = await execFileAsync(binaryPath, ['--version'])
    return stdout
  } catch (error) {
    console.error('Error executing binary:', error)
    return binaryPath
  }
}

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(): void {
    // Get application version
    ipcMain.handle('msgRequestGetVersion', () => {
      return Constants.APP_VERSION
    })

    // Open url via web browser
    ipcMain.handle('msgOpenExternalLink', async (event: IpcMainEvent, url: string) => {
      // await shell.openExternal(url)
      const result = await runBinary()
      console.log('Binary result:', result)
      return result
    })

    // Open file
    ipcMain.handle('msgOpenFile', async (event: IpcMainEvent, filter: string) => {
      const filters = []
      if (filter === 'text') {
        filters.push({ name: 'Text', extensions: ['txt', 'json'] })
      } else if (filter === 'zip') {
        filters.push({ name: 'Zip', extensions: ['zip'] })
      }
      const dialogResult = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters
      })
      return dialogResult
    })
  }
}
