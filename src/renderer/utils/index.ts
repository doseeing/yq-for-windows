export default class Utils {
  static getCurrentLocale(): string {
    return navigator?.language?.split('-')[0] || 'en'
  }

  static async openExternal(url: string): Promise<any> {
    return window.mainApi.invoke('msgOpenExternalLink', url)
  }

  static async openFile(type: string): Promise<any> {
    return window.mainApi.invoke('msgOpenFile', type)
  }
}

export const { getCurrentLocale, openExternal, openFile } = Utils
