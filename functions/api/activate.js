// functions/api/activate.js
// CF Worker — 授权码验证 + 激活码生成

var CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: CORS_HEADERS })
}

// DJB2 哈希
function djb2(str) {
  var h = 5381
  for (var i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h = h & 0x7FFFFFFF
  }
  return h
}

// 根据设备码生成 6 位激活码
function generateKey(deviceCode, salt) {
  var hash = djb2(deviceCode + salt).toString(16)
  var expected = ''
  for (var i = 0; i < 5; i++) {
    var n = parseInt(hash[i % hash.length], 16)
    if (isNaN(n)) n = 0
    expected += (n % 10).toString()
  }
  var w = [1, 3, 7, 9, 5], sum = 0
  for (var i = 0; i < 5; i++) sum += parseInt(expected[i]) * w[i]
  expected += (sum % 10).toString()
  return expected
}

// IP 限流 (内存计数器，Worker 重启后重置)
var RATE_LIMIT = {}
setInterval(function() { RATE_LIMIT = {} }, 60000)  // 每分钟重置

function checkRateLimit(ip) {
  var now = Date.now()
  if (!RATE_LIMIT[ip]) { RATE_LIMIT[ip] = { count: 1, resetAt: now + 60000 }; return true }
  if (now > RATE_LIMIT[ip].resetAt) { RATE_LIMIT[ip] = { count: 1, resetAt: now + 60000 }; return true }
  if (RATE_LIMIT[ip].count >= 10) return false
  RATE_LIMIT[ip].count++
  return true
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url)
    var path = url.pathname

    if (path === '/api/activate') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
      if (request.method !== 'POST') return jsonResponse({ success: false, message: '仅支持 POST 请求' }, 405)

      // 限流
      var clientIP = request.headers.get('CF-Connecting-IP') || 'unknown'
      if (!checkRateLimit(clientIP)) return jsonResponse({ success: false, message: '请求过于频繁，请稍后再试' }, 429)

      try {
        var body = await request.json()
        var deviceCode = (body.device_code || '').trim()
        var authCode = (body.auth_code || '').trim().toUpperCase()

        // 校验设备码: 6 位纯数字
        if (!/^\d{6}$/.test(deviceCode)) return jsonResponse({ success: false, message: '设备码格式错误，应为 6 位数字' }, 400)

        // 校验授权码: 10 位大写字母+数字
        if (!/^[A-Z0-9]{10}$/.test(authCode)) return jsonResponse({ success: false, message: '授权码格式错误' }, 400)

        // 从 KV 查询授权码
        var kvKey = 'auth:' + authCode
        var record = await env.ACTIVATE_CODES.get(kvKey)
        if (!record) return jsonResponse({ success: false, message: '授权码无效' }, 400)

        var data = JSON.parse(record)
        if (data.used) return jsonResponse({ success: false, message: '授权码已被使用' }, 400)

        // 标记为已用
        data.used = true
        data.device_code = deviceCode
        data.source = body.source || 'web'
        data.used_at = new Date().toISOString()
        await env.ACTIVATE_CODES.put(kvKey, JSON.stringify(data))

        // 生成激活码
        var salt = env.ACTIVATE_SALT || 'GuGUc_gSR?J_Bj?oBc?fRS?_ExCRD'
        var activationCode = generateKey(deviceCode, salt)

        return jsonResponse({
          success: true,
          activation_code: activationCode,
          message: '激活成功！请在手表输入以上激活码'
        })
      } catch (e) {
        return jsonResponse({ success: false, message: '服务器错误，请稍后重试' }, 500)
      }
    }

    // 静态资源
    return env.ASSETS.fetch(request)
  }
}
