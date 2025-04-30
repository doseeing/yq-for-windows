import { ipcMain, IpcMainEvent, dialog } from 'electron'
import Constants from './utils/Constants'
import { execFile } from 'child_process'
import path from 'path'
import { promisify } from 'util'
import stream from 'stream'

function chooseBinaryByPlatform(): string {
  const platform = process.platform
  const arch = process.arch
  let binaryName = ''
  if (platform === 'win32') {
    binaryName = 'yq_windows_amd64.exe'
  }
  if (platform === 'linux') {
    binaryName = 'yq_linux_amd64'
  }
  if (platform === 'darwin') {
    // check arch
    if (arch === 'arm64') {
      binaryName = 'yq_darwin_arm64'
    } else {
      binaryName = 'yq_darwin_amd64'
    }
  }
  return binaryName
}

function runBinary(input: string, callback: (error: Error | null, result: string) => void): void {
  const binaryName = chooseBinaryByPlatform()
  const binaryPath =
    process.env.NODE_ENV === 'development'
      ? path.join(__dirname, '..', '..', 'bin', binaryName)
      : path.join(process.resourcesPath, 'bin', binaryName)
  console.log('Running binary at:', binaryPath)

  const child = execFile(binaryPath, ['-P'], (error, stdout) => {
    if (error) {
      console.error('Error executing binary:', error)
      callback(error, '')
    } else {
      console.log('Binary output:', stdout)
      callback(null, stdout)
    }
  })

  const stdinStream = new stream.Readable()
  stdinStream.push(input) // Add data to the internal queue for users of the stream to consume
  stdinStream.push(null) // Signals the end of the stream (EOF)
  stdinStream.pipe(child.stdin)
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
      const runBinaryAsync = promisify(runBinary)
      const result = await runBinaryAsync(url)
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
