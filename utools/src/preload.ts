import http, { RequestListener } from 'http'
import https from 'https'
import os from 'os'
import fs from 'fs'
import path from 'path'
import withShutdown from 'http-shutdown'
import forge from 'node-forge'
import { IPAddress, NetFamily, ServerInfo, StartServerConfig, WithShutdown } from './types'
import { SecureContextOptions } from 'tls'

// borrowed from ry who stole it from jack- thanks
// https://github.com/ry/node_chat/blob/master/fu.js
const mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension: function (ext: string, fallback = 'application/octet-stream') {
    return mime.TYPES[ext.toLowerCase()] || fallback
  },

  // List of most common mime-types, stolen from Rack.
  TYPES: {
    '.3gp': 'video/3gpp',
    '.a': 'application/octet-stream',
    '.ai': 'application/postscript',
    '.aif': 'audio/x-aiff',
    '.aiff': 'audio/x-aiff',
    '.asc': 'application/pgp-signature',
    '.asf': 'video/x-ms-asf',
    '.asm': 'text/x-asm',
    '.asx': 'video/x-ms-asf',
    '.atom': 'application/atom+xml',
    '.au': 'audio/basic',
    '.avi': 'video/x-msvideo',
    '.bat': 'application/x-msdownload',
    '.bin': 'application/octet-stream',
    '.bmp': 'image/bmp',
    '.bz2': 'application/x-bzip2',
    '.c': 'text/x-c',
    '.cab': 'application/vnd.ms-cab-compressed',
    '.cc': 'text/x-c',
    '.chm': 'application/vnd.ms-htmlhelp',
    '.class': 'application/octet-stream',
    '.com': 'application/x-msdownload',
    '.conf': 'text/plain',
    '.cpp': 'text/x-c',
    '.crt': 'application/x-x509-ca-cert',
    '.css': 'text/css',
    '.csv': 'text/csv',
    '.cxx': 'text/x-c',
    '.deb': 'application/x-debian-package',
    '.der': 'application/x-x509-ca-cert',
    '.diff': 'text/x-diff',
    '.djv': 'image/vnd.djvu',
    '.djvu': 'image/vnd.djvu',
    '.dll': 'application/x-msdownload',
    '.dmg': 'application/octet-stream',
    '.doc': 'application/msword',
    '.dot': 'application/msword',
    '.dtd': 'application/xml-dtd',
    '.dvi': 'application/x-dvi',
    '.ear': 'application/java-archive',
    '.eml': 'message/rfc822',
    '.eps': 'application/postscript',
    '.exe': 'application/x-msdownload',
    '.f': 'text/x-fortran',
    '.f77': 'text/x-fortran',
    '.f90': 'text/x-fortran',
    '.flv': 'video/x-flv',
    '.for': 'text/x-fortran',
    '.gem': 'application/octet-stream',
    '.gemspec': 'text/x-script.ruby',
    '.gif': 'image/gif',
    '.gz': 'application/x-gzip',
    '.h': 'text/x-c',
    '.hh': 'text/x-c',
    '.htm': 'text/html',
    '.html': 'text/html',
    '.ico': 'image/vnd.microsoft.icon',
    '.ics': 'text/calendar',
    '.ifb': 'text/calendar',
    '.iso': 'application/octet-stream',
    '.jar': 'application/java-archive',
    '.java': 'text/x-java-source',
    '.jnlp': 'application/x-java-jnlp-file',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.log': 'text/plain',
    '.m3u': 'audio/x-mpegurl',
    '.m4v': 'video/mp4',
    '.man': 'text/troff',
    '.mathml': 'application/mathml+xml',
    '.mbox': 'application/mbox',
    '.mdoc': 'text/troff',
    '.me': 'text/troff',
    '.mid': 'audio/midi',
    '.midi': 'audio/midi',
    '.mime': 'message/rfc822',
    '.mml': 'application/mathml+xml',
    '.mng': 'video/x-mng',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.mp4v': 'video/mp4',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    '.ms': 'text/troff',
    '.msi': 'application/x-msdownload',
    '.odp': 'application/vnd.oasis.opendocument.presentation',
    '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
    '.odt': 'application/vnd.oasis.opendocument.text',
    '.ogg': 'application/ogg',
    '.p': 'text/x-pascal',
    '.pas': 'text/x-pascal',
    '.pbm': 'image/x-portable-bitmap',
    '.pdf': 'application/pdf',
    '.pem': 'application/x-x509-ca-cert',
    '.pgm': 'image/x-portable-graymap',
    '.pgp': 'application/pgp-encrypted',
    '.pkg': 'application/octet-stream',
    '.pl': 'text/x-script.perl',
    '.pm': 'text/x-script.perl-module',
    '.png': 'image/png',
    '.pnm': 'image/x-portable-anymap',
    '.ppm': 'image/x-portable-pixmap',
    '.pps': 'application/vnd.ms-powerpoint',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.ps': 'application/postscript',
    '.psd': 'image/vnd.adobe.photoshop',
    '.py': 'text/x-script.python',
    '.qt': 'video/quicktime',
    '.ra': 'audio/x-pn-realaudio',
    '.rake': 'text/x-script.ruby',
    '.ram': 'audio/x-pn-realaudio',
    '.rar': 'application/x-rar-compressed',
    '.rb': 'text/x-script.ruby',
    '.rdf': 'application/rdf+xml',
    '.roff': 'text/troff',
    '.rpm': 'application/x-redhat-package-manager',
    '.rss': 'application/rss+xml',
    '.rtf': 'application/rtf',
    '.ru': 'text/x-script.ruby',
    '.s': 'text/x-asm',
    '.sgm': 'text/sgml',
    '.sgml': 'text/sgml',
    '.sh': 'application/x-sh',
    '.sig': 'application/pgp-signature',
    '.snd': 'audio/basic',
    '.so': 'application/octet-stream',
    '.svg': 'image/svg+xml',
    '.svgz': 'image/svg+xml',
    '.swf': 'application/x-shockwave-flash',
    '.t': 'text/troff',
    '.tar': 'application/x-tar',
    '.tbz': 'application/x-bzip-compressed-tar',
    '.tcl': 'application/x-tcl',
    '.tex': 'application/x-tex',
    '.texi': 'application/x-texinfo',
    '.texinfo': 'application/x-texinfo',
    '.text': 'text/plain',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.torrent': 'application/x-bittorrent',
    '.tr': 'text/troff',
    '.txt': 'text/plain',
    '.vcf': 'text/x-vcard',
    '.vcs': 'text/x-vcalendar',
    '.vrml': 'model/vrml',
    '.war': 'application/java-archive',
    '.wav': 'audio/x-wav',
    '.wma': 'audio/x-ms-wma',
    '.wmv': 'video/x-ms-wmv',
    '.wmx': 'video/x-ms-wmx',
    '.wrl': 'model/vrml',
    '.wsdl': 'application/wsdl+xml',
    '.xbm': 'image/x-xbitmap',
    '.xhtml': 'application/xhtml+xml',
    '.xls': 'application/vnd.ms-excel',
    '.xml': 'application/xml',
    '.xpm': 'image/x-xpixmap',
    '.xsl': 'application/xml',
    '.xslt': 'application/xslt+xml',
    '.yaml': 'text/yaml',
    '.yml': 'text/yaml',
    '.zip': 'application/zip'
  } as Record<string, string>
}

/**
 * 替换变量为 #{field}. html 变量有 title, tr. tr 变量有 icon, href, name, error
 * @type {{html: string, tr: string, regex: RegExp, format: function(str: string, obj: any): string}}
 */
const htmlTemplate = {
  html: `<!DOCTYPE html><html lang="zh-cmn-Hans"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>#{title}</title><link rel="icon" href="data:image/ico;base64,aWNv"><style rel="stylesheet">a.icon{padding-left:1.5rem;text-decoration:none;}a.icon:hover{text-decoration:underline;}.icon.parent{background:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmlJREFUeNpsU0toU0EUPfPysx/tTxuDH9SCWhUDooIbd7oRUUTMouqi2iIoCO6lceHWhegy4EJFinWjrlQUpVm0IIoFpVDEIthm0dpikpf3ZuZ6Z94nrXhhMjM3c8895977BBHB2PznK8WPtDgyWH5q77cPH8PpdXuhpQT4ifR9u5sfJb1bmw6VivahATDrxcRZ2njfoaMv+2j7mLDn93MPiNRMvGbL18L9IpF8h9/TN+EYkMffSiOXJ5+hkD+PdqcLpICWHOHc2CC+LEyA/K+cKQMnlQHJX8wqYG3MAJy88Wa4OLDvEqAEOpJd0LxHIMdHBziowSwVlF8D6QaicK01krw/JynwcKoEwZczewroTvZirlKJs5CqQ5CG8pb57FnJUA0LYCXMX5fibd+p8LWDDemcPZbzQyjvH+Ki1TlIciElA7ghwLKV4kRZstt2sANWRjYTAGzuP2hXZFpJ/GsxgGJ0ox1aoFWsDXyyxqCs26+ydmagFN/rRjymJ1898bzGzmQE0HCZpmk5A0RFIv8Pn0WYPsiu6t/Rsj6PauVTwffTSzGAGZhUG2F06hEc9ibS7OPMNp6ErYFlKavo7MkhmTqCxZ/jwzGA9Hx82H2BZSw1NTN9Gx8ycHkajU/7M+jInsDC7DiaEmo1bNl1AMr9ASFgqVu9MCTIzoGUimXVAnnaN0PdBBDCCYbEtMk6wkpQwIG0sn0PQIUF4GsTwLSIFKNqF6DVrQq+IWVrQDxAYQC/1SsYOI4pOxKZrfifiUSbDUisif7XlpGIPufXd/uvdvZm760M0no1FZcnrzUdjw7au3vu/BVgAFLXeuTxhTXVAAAAAElFTkSuQmCC') left center no-repeat;}.icon.dir{background:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAd5JREFUeNqMU79rFUEQ/vbuodFEEkzAImBpkUabFP4ldpaJhZXYm/RiZWsv/hkWFglBUyTIgyAIIfgIRjHv3r39MePM7N3LcbxAFvZ2b2bn22/mm3XMjF+HL3YW7q28YSIw8mBKoBihhhgCsoORot9d3/ywg3YowMXwNde/PzGnk2vn6PitrT+/PGeNaecg4+qNY3D43vy16A5wDDd4Aqg/ngmrjl/GoN0U5V1QquHQG3q+TPDVhVwyBffcmQGJmSVfyZk7R3SngI4JKfwDJ2+05zIg8gbiereTZRHhJ5KCMOwDFLjhoBTn2g0ghagfKeIYJDPFyibJVBtTREwq60SpYvh5++PpwatHsxSm9QRLSQpEVSd7/TYJUb49TX7gztpjjEffnoVw66+Ytovs14Yp7HaKmUXeX9rKUoMoLNW3srqI5fWn8JejrVkK0QcrkFLOgS39yoKUQe292WJ1guUHG8K2o8K00oO1BTvXoW4yasclUTgZYJY9aFNfAThX5CZRmczAV52oAPoupHhWRIUUAOoyUIlYVaAa/VbLbyiZUiyFbjQFNwiZQSGl4IDy9sO5Wrty0QLKhdZPxmgGcDo8ejn+c/6eiK9poz15Kw7Dr/vN/z6W7q++091/AQYA5mZ8GYJ9K0AAAAAASUVORK5CYII=') left center no-repeat;}.icon.file{background:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAABHUlEQVR42o2RMW7DIBiF3498iHRJD5JKHurL+CRVBp+i2T16tTynF2gO0KSb5ZrBBl4HHDBuK/WXACH4eO9/CAAAbdvijzLGNE1TVZXfZuHg6XCAQESAZXbOKaXO57eiKG6ft9PrKQIkCQqFoIiQFBGlFIB5nvM8t9aOX2Nd18oDzjnPgCDpn/BH4zh2XZdlWVmWiUK4IgCBoFMUz9eP6zRN75cLgEQhcmTQIbl72O0f9865qLAAsURAAgKBJKEtgLXWvyjLuFsThCSstb8rBCaAQhDYWgIZ7myM+TUBjDHrHlZcbMYYk34cN0YSLcgS+wL0fe9TXDMbY33fR2AYBvyQ8L0Gk8MwREBrTfKe4TpTzwhArXWi8HI84h/1DfwI5mhxJamFAAAAAElFTkSuQmCC') left center no-repeat;}.error{margin-left:1rem;font-size:14px;color:#fff;background:#900;border-radius:4px;padding:2px 4px;}@media(prefers-color-scheme:dark){body{background:#333;color:#ddd;}a{color:#69f;}a:visited{color:#b6f;}a:active{color:#f66;}.error{color:#000;background:#f66;}}</style></head><body><table><tbody><tr><td><a class="icon parent" href="../">../</a></td></tr>#{tr}</tbody></table></body></html>`,
  tr: `<tr><td><a class="icon #{icon}" href="#{href}">#{name}</a>#{error}</td></tr>`,
  regex: /#{(\w+)}/g,
  format(str: string, obj: Record<string, string>) {
    return str.replaceAll(this.regex, (match, p1) => (obj.hasOwnProperty(p1) ? obj[p1] : match))
  }
}

/**
 * html 转义
 * @param text
 */
function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

/**
 * 响应目录页
 */
function responseDirectoryPage(dirPath: string, res: any, resHeaders: any) {
  const tr = fs
    .readdirSync(dirPath)
    .map((name) => {
      const stat = { d: false, e: '' }
      try {
        stat.d = fs.statSync(path.join(dirPath, name)).isDirectory()
      } catch (e) {
        stat.e = String(e)
      }
      return {
        icon: stat.d ? 'dir' : 'file',
        href: stat.e ? '#' + name : stat.d ? name + '/' : name,
        name,
        error: stat.e ? `<span class="error">${stat.e}</span>` : ''
      }
    })
    .map((obj) => htmlTemplate.format(htmlTemplate.tr, obj))
    .join('')
  const resp = htmlTemplate.format(htmlTemplate.html, {
    title: dirPath,
    tr
  })
  resHeaders['Content-Type'] = 'text/html'
  res.writeHead(200, resHeaders)
  res.end(resp)
}

/**
 * 捕获异常并显示错误页
 */
function handleError(handler: (req: any, res: any) => void) {
  return function (this: any, req: any, res: any) {
    try {
      handler.call(this, req, res)
    } catch (e: any) {
      const errStack = escapeHtml(String(e.stack))
      const html = `<!DOCTYPE html><html lang="zh-cmn-Hans"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Local Server</title><link rel="icon" href="data:image/ico;base64,aWNv"><style rel="stylesheet">body{background-color: #f0f0f2;margin: 0;padding: 0;}div{width:800px;margin:5em auto;padding:1em 2em;background-color:#fdfdff;border-radius:0.5em;box-shadow:2px 3px 7px 2px rgba(0,0,0,0.02);}pre{overflow:auto;}</style></head><body><div><h1>程序异常</h1><pre>${errStack}</pre></div></body></html>`
      res.writeHead(500, { 'Content-Type': 'text/html' })
      res.end(html)
    }
  }
}

/**
 * 生成控制器
 */
function createController(
  base: string,
  cors: boolean = false,
  showDir: boolean | undefined | null = null,
  mapPath: string | undefined | null = null
): RequestListener<any, any> {
  return handleError((req, res) => {
    const resHeaders: Record<string, string> = {}
    if (cors) {
      resHeaders['Access-Control-Allow-Headers'] = '*'
      resHeaders['Access-Control-Allow-Methods'] = '*'
      resHeaders['Access-Control-Allow-Origin'] = '*'
      resHeaders['Access-Control-Expose-Headers'] = '*'
    }
    const paramIndex = req.url.indexOf('?')
    const urlPath = paramIndex >= 0 ? req.url.substring(0, paramIndex) : req.url
    const pathname = decodeURIComponent(urlPath || '/')
    let filePath = path.join(base, mapPath ? new Function(`return ${mapPath}`)()(pathname) : pathname)
    const dirPath = filePath

    let isDir: boolean
    try {
      isDir = fs.statSync(filePath).isDirectory()
    } catch (e) {
      res.writeHead(404, resHeaders)
      res.end(String(e))
      return
    }

    if (isDir) {
      if (showDir) {
        responseDirectoryPage(dirPath, res, resHeaders)
        return
      }
      filePath = path.join(filePath, 'index.html')
    }

    fs.readFile(filePath, function (err, data) {
      if (err) {
        if (isDir && showDir !== false) {
          responseDirectoryPage(dirPath, res, resHeaders)
        } else {
          res.writeHead(404, resHeaders)
          res.end(String(err))
        }
        return
      }

      // return the document
      const defMime = mime.lookupExtension(path.extname(filePath))
      resHeaders['Content-Type'] = window._cache?.globalMimeFunction?.(filePath, defMime) || defMime
      res.writeHead(200, resHeaders)
      res.end(data)
    })
  })
}

/**
 * 生成自签名证书
 */
const createSelfSignedCert = (): SecureContextOptions => {
  // 生成RSA密钥对，密钥长度为2048位
  const keys = forge.pki.rsa.generateKeyPair(2048)

  // 创建一个新的X.509证书
  const cert = forge.pki.createCertificate()
  // 将公钥设置为生成的公钥
  cert.publicKey = keys.publicKey
  // 设置证书的序列号
  cert.serialNumber = '01'

  // 设置证书的有效期，从当前时间开始，有效期为1年
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

  // 定义证书的主题属性，包括通用名称、国家名称、州/省名称、地区名称、组织名称等
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { shortName: 'ST', value: 'California' },
    { name: 'localityName', value: 'San Francisco' },
    { name: 'organizationName', value: 'My Company' },
    { shortName: 'OU', value: 'My Company' }
  ]

  // 设置证书的主题和颁发者属性
  cert.setSubject(attrs)
  cert.setIssuer(attrs)

  // 设置证书的扩展属性，如基本约束、密钥用途、扩展密钥用途等
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    },
    {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true
    }
  ])

  // 使用生成的私钥自签名证书
  cert.sign(keys.privateKey)

  // 将生成的私钥和证书转换为PEM格式
  return {
    key: forge.pki.privateKeyToPem(keys.privateKey),
    cert: forge.pki.certificateToPem(cert)
  }
}

/**
 * 创建服务器
 */
function createServer(hostname: string, port: number, option?: SecureContextOptions, controller?: RequestListener<any, any>) {
  return new Promise<WithShutdown>((resolve, reject) => {
    const server = option ? https.createServer(option, controller) : http.createServer(controller)
    const withShutdownServer = withShutdown(server)
    if (reject) withShutdownServer.on('error', reject)
    withShutdownServer.listen(port, hostname, () => resolve(withShutdownServer))
  })
}

/**
 * 检查端口号是否被占用
 */
function checkPort(port: number) {
  return new Promise<boolean>((resolve) => {
    createServer('localhost', port)
      .then((server) => {
        server.forceShutdown(() => resolve(true))
      })
      .catch(() => resolve(false))
  })
}

/**
 * 获取随机可用端口号
 */
async function randomPort() {
  let port: number
  do {
    port = Math.floor(Math.random() * 65535 + 1)
  } while (!(await checkPort(port)))
  return port
}

/**
 * 获取 IP 地址
 */
function getIPAddresses(family: NetFamily | undefined | null = null, internal: boolean | undefined | null = null) {
  const ipAddresses: Array<IPAddress> = []
  const interfaces = os.networkInterfaces()
  Object.values(interfaces).forEach((items) => {
    items?.forEach((item) => {
      const v6 = item.family === 'IPv6'
      if (v6 && item.scopeid) return
      if (family && item.family !== family) return
      if (internal !== null && internal !== void 0 && item.internal !== internal) return
      ipAddresses.push({
        address: v6 ? `[${item.address}]` : item.address,
        family: item.family,
        internal: item.internal
      })
    })
  })
  return ipAddresses
}

/**
 * 启动服务
 */
function startServer(config: StartServerConfig) {
  return new Promise<ServerInfo>((resolve, reject) => {
    const { base, port, net, cors, showDir, mapPath } = config

    if (!base) throw new Error('请先选择目录')
    const ipAddresses = getIPAddresses(net.family, net.internal)
    if (!ipAddresses.length) throw new Error('没有可用的 IP 地址')
    const controller = createController(base, cors, showDir, mapPath)
    const portPromise = port ? Promise.resolve(port) : randomPort()
    const contextOptions: SecureContextOptions | undefined = net.https ? createSelfSignedCert() : undefined

    portPromise.then((mPort) => {
      const servers: Array<WithShutdown> = []
      const serverPromises = ipAddresses.map((address) =>
        createServer(address.address, mPort, contextOptions, controller).then((s) => {
          servers.push(s)
          return s
        })
      )

      Promise.all(serverPromises)
        .then(() => {
          const info: ServerInfo = {
            protocol: contextOptions ? 'https' : 'http',
            address: ipAddresses,
            port: mPort,
            shutdown: () => Promise.allSettled(servers.map((s) => new Promise((resolve) => s.shutdown(resolve))))
          }
          resolve(info)
        })
        .catch((e) => {
          servers.forEach((s) => s.forceShutdown())
          reject(e)
        })
    })
  })
}

window._preload = {
  startServer,
  isDirectory: (p: string) => {
    try {
      return fs.statSync(p).isDirectory()
    } catch (err) {
      return false
    }
  }
}
