const http = require('http')
const os = require('os')
const url = require('url')
const fs = require('fs')
const path = require('path')

/**
 * Adds shutdown functionaility to the `http.Server` object
 * @param {http.Server} server The server to add shutdown functionaility to
 * @see https://github.com/thedillonb/http-shutdown
 */
function addShutdown(server) {
  const connections = {}
  let isShuttingDown = false
  let connectionCounter = 0

  function destroy(socket, force) {
    if (force || (socket._isIdle && isShuttingDown)) {
      socket.destroy()
      delete connections[socket._connectionId]
    }
  }

  function onConnection(socket) {
    const id = connectionCounter++
    socket._isIdle = true
    socket._connectionId = id
    connections[id] = socket

    socket.on('close', function () {
      delete connections[id]
    })
  }

  server.on('request', function (req, res) {
    req.socket._isIdle = false

    res.on('finish', function () {
      req.socket._isIdle = true
      destroy(req.socket)
    })
  })

  server.on('connection', onConnection)
  server.on('secureConnection', onConnection)

  function shutdown(force, cb) {
    isShuttingDown = true
    server.close(function (err) {
      if (cb) {
        process.nextTick(function () {
          cb(err)
        })
      }
    })

    Object.keys(connections).forEach(function (key) {
      destroy(connections[key], force)
    })
  }

  server.shutdown = function (cb) {
    shutdown(false, cb)
  }

  server.forceShutdown = function (cb) {
    shutdown(true, cb)
  }

  return server
}

// borrowed from ry who stole it from jack- thanks
// https://github.com/ry/node_chat/blob/master/fu.js
const mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension: function (ext, fallback = 'application/octet-stream') {
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
  }
}

/**
 * 替换变量为 #{field}. html 变量有 title, tr. tr 变量有 icon, href, name
 */
const htmlTemplate = {
  html: `<!DOCTYPE html><html lang="zh-cmn-Hans"><head><meta charset="UTF-8" /><title>#{title}</title><style rel="stylesheet">a.icon {padding-left: 1.5em;text-decoration: none;}  a.icon:hover {text-decoration: underline;}  .icon.parent {background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmlJREFUeNpsU0toU0EUPfPysx/tTxuDH9SCWhUDooIbd7oRUUTMouqi2iIoCO6lceHWhegy4EJFinWjrlQUpVm0IIoFpVDEIthm0dpikpf3ZuZ6Z94nrXhhMjM3c8895977BBHB2PznK8WPtDgyWH5q77cPH8PpdXuhpQT4ifR9u5sfJb1bmw6VivahATDrxcRZ2njfoaMv+2j7mLDn93MPiNRMvGbL18L9IpF8h9/TN+EYkMffSiOXJ5+hkD+PdqcLpICWHOHc2CC+LEyA/K+cKQMnlQHJX8wqYG3MAJy88Wa4OLDvEqAEOpJd0LxHIMdHBziowSwVlF8D6QaicK01krw/JynwcKoEwZczewroTvZirlKJs5CqQ5CG8pb57FnJUA0LYCXMX5fibd+p8LWDDemcPZbzQyjvH+Ki1TlIciElA7ghwLKV4kRZstt2sANWRjYTAGzuP2hXZFpJ/GsxgGJ0ox1aoFWsDXyyxqCs26+ydmagFN/rRjymJ1898bzGzmQE0HCZpmk5A0RFIv8Pn0WYPsiu6t/Rsj6PauVTwffTSzGAGZhUG2F06hEc9ibS7OPMNp6ErYFlKavo7MkhmTqCxZ/jwzGA9Hx82H2BZSw1NTN9Gx8ycHkajU/7M+jInsDC7DiaEmo1bNl1AMr9ASFgqVu9MCTIzoGUimXVAnnaN0PdBBDCCYbEtMk6wkpQwIG0sn0PQIUF4GsTwLSIFKNqF6DVrQq+IWVrQDxAYQC/1SsYOI4pOxKZrfifiUSbDUisif7XlpGIPufXd/uvdvZm760M0no1FZcnrzUdjw7au3vu/BVgAFLXeuTxhTXVAAAAAElFTkSuQmCC') left center no-repeat;}  .icon.dir {background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAd5JREFUeNqMU79rFUEQ/vbuodFEEkzAImBpkUabFP4ldpaJhZXYm/RiZWsv/hkWFglBUyTIgyAIIfgIRjHv3r39MePM7N3LcbxAFvZ2b2bn22/mm3XMjF+HL3YW7q28YSIw8mBKoBihhhgCsoORot9d3/ywg3YowMXwNde/PzGnk2vn6PitrT+/PGeNaecg4+qNY3D43vy16A5wDDd4Aqg/ngmrjl/GoN0U5V1QquHQG3q+TPDVhVwyBffcmQGJmSVfyZk7R3SngI4JKfwDJ2+05zIg8gbiereTZRHhJ5KCMOwDFLjhoBTn2g0ghagfKeIYJDPFyibJVBtTREwq60SpYvh5++PpwatHsxSm9QRLSQpEVSd7/TYJUb49TX7gztpjjEffnoVw66+Ytovs14Yp7HaKmUXeX9rKUoMoLNW3srqI5fWn8JejrVkK0QcrkFLOgS39yoKUQe292WJ1guUHG8K2o8K00oO1BTvXoW4yasclUTgZYJY9aFNfAThX5CZRmczAV52oAPoupHhWRIUUAOoyUIlYVaAa/VbLbyiZUiyFbjQFNwiZQSGl4IDy9sO5Wrty0QLKhdZPxmgGcDo8ejn+c/6eiK9poz15Kw7Dr/vN/z6W7q++091/AQYA5mZ8GYJ9K0AAAAAASUVORK5CYII=') left center no-repeat;}  .icon.file {background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAABHUlEQVR42o2RMW7DIBiF3498iHRJD5JKHurL+CRVBp+i2T16tTynF2gO0KSb5ZrBBl4HHDBuK/WXACH4eO9/CAAAbdvijzLGNE1TVZXfZuHg6XCAQESAZXbOKaXO57eiKG6ft9PrKQIkCQqFoIiQFBGlFIB5nvM8t9aOX2Nd18oDzjnPgCDpn/BH4zh2XZdlWVmWiUK4IgCBoFMUz9eP6zRN75cLgEQhcmTQIbl72O0f9865qLAAsURAAgKBJKEtgLXWvyjLuFsThCSstb8rBCaAQhDYWgIZ7myM+TUBjDHrHlZcbMYYk34cN0YSLcgS+wL0fe9TXDMbY33fR2AYBvyQ8L0Gk8MwREBrTfKe4TpTzwhArXWi8HI84h/1DfwI5mhxJamFAAAAAElFTkSuQmCC') left center no-repeat;}</style></head><body><table><tbody><tr><td><a class="icon parent" href="../">../</a></td></tr>#{tr}</tbody></table></body></html>`,
  tr: `<tr><td><a class="icon #{icon}" href="#{href}">#{name}</a></td></tr>`,
  regex: /#{(\w+)}/g,
  format(str, obj) {
    return str.replaceAll(this.regex, (match, p1) => obj.hasOwnProperty(p1) ? obj[p1] : match)
  }
}

function responseDirectoryPage(dirPath, res, resHeaders) {
  const tr = fs.readdirSync(dirPath).map(name => {
    const d = fs.statSync(path.join(dirPath, name)).isDirectory()
    return {
      icon: d ? 'dir' : 'file',
      href: d ? name + '/' : name,
      name
    }
  }).map(obj => htmlTemplate.format(htmlTemplate.tr, obj)).join('')
  const resp = htmlTemplate.format(htmlTemplate.html, {
    title: dirPath,
    tr
  })
  resHeaders['Content-Type'] = 'text/html'
  res.writeHead(200, resHeaders)
  res.end(resp)
}

/**
 * 生成控制器
 */
function createController(base, cors = false, showDir = null) {
  return (req, res) => {
    const resHeaders = {}
    if (cors) resHeaders['Access-Control-Allow-Origin'] = '*'
    const u = url.parse(req.url)
    const pathname = decodeURIComponent(u.pathname || '/')
    let filePath = path.join(base, pathname)
    const dirPath = filePath

    let isDir
    try {
      isDir = fs.statSync(filePath).isDirectory()
    } catch (e) {
      res.writeHead(404, resHeaders)
      res.end()
      return
    }

    if (isDir) {
      filePath = path.join(filePath, 'index.html')
      if (showDir) {
        responseDirectoryPage(dirPath, res, resHeaders)
        return
      }
    }

    fs.readFile(filePath, function (err, data) {
      if (err) {
        if (showDir === false) {
          res.writeHead(404, resHeaders)
          res.end()
        } else {
          responseDirectoryPage(dirPath, res, resHeaders)
        }
        return
      }

      // return the document
      resHeaders['Content-Type'] = mime.lookupExtension(path.extname(filePath))
      res.writeHead(200, resHeaders)
      res.end(data)
    })
  }
}

/**
 * 创建服务器
 */
function createServer(hostname, port, controller) {
  return new Promise((resolve, reject) => {
    const server = addShutdown(http.createServer(controller))
    if (reject) server.on('error', reject)
    server.listen(port, hostname, () => resolve(server))
  })
}

/**
 * 检查端口号是否被占用
 */
function checkPort(port) {
  return new Promise((resolve) => {
    createServer('localhost', port, null).then((server) => {
      server.forceShutdown(() => resolve(true))
    }).catch(() => resolve(false))
  })
}

/**
 * 获取随机可用端口号
 */
async function randomPort() {
  let port
  do {
    port = Math.floor(Math.random() * 65535 + 1)
  } while (!await checkPort(port))
  return port
}

/**
 * 获取 IP 地址
 */
function getIPAddresses(family = null, internal = null) {
  const ipAddresses = []
  const interfaces = os.networkInterfaces()
  Object.values(interfaces).forEach(items => {
    items?.forEach(item => {
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
function startServer(config) {
  return new Promise((resolve, reject) => {
    const { base, port, net, cors, showDir } = config

    if (!base) throw new Error('请先选择目录')
    const ipAddresses = getIPAddresses(net.family, net.internal)
    if (!ipAddresses.length) throw new Error('没有可用的 IP 地址')
    const controller = createController(base, cors, showDir)
    const portPromise = port ? Promise.resolve(port) : randomPort()

    portPromise.then((mPort) => {
      const servers = []
      const serverPromises = ipAddresses.map(address => createServer(address.address, mPort, controller).then(s => {
        servers.push(s)
        return s
      }))

      Promise.all(serverPromises).then(() => {
        const info = {
          address: ipAddresses,
          port: mPort,
          shutdown: () => Promise.allSettled(servers.map(s => new Promise(resolve => s.shutdown(resolve))))
        }
        resolve(info)
      }).catch((e) => {
        servers.forEach(s => s.shutdown())
        reject(e)
      })
    })
  })
}

window._preload = {
  startServer
}
