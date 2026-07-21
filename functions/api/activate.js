// functions/api/activate.js
// Cloudflare Workers API — 激活码生成

function djb2(str) {
  var h = 5381
  for (var i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h = h & 0x7FFFFFFF
  }
  return h
}

function generateKey(deviceCode) {
  var SALT = 'GuGUc_gSR?J_Bj?oBc?fRS?_ExCRD'
  var hash = djb2(deviceCode + SALT).toString(16)
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

function isValidOrderNo(orderNo) {
  if (!orderNo || typeof orderNo !== 'string') return false
  // 微信支付交易单号：28 位数字，以 420000 开头
  // 支付宝等其他支付方式放宽校验
  var cleaned = orderNo.replace(/\s/g, '')
  if (/^420000\d{22}$/.test(cleaned)) return true
  // 备用规则：至少 10 位纯数字（兼容其他支付平台）
  return /^\d{10,64}$/.test(cleaned)
}

var CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: CORS_HEADERS })
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url)
    var path = url.pathname

    // API 路由：/api/activate
    if (path === '/api/activate') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS })
      }
      if (request.method !== 'POST') {
        return jsonResponse({ success: false, message: '仅支持 POST 请求' }, 405)
      }
      try {
        var body = await request.json()
        var deviceCode = (body.device_code || '').trim()
        var orderNo = (body.order_no || '').trim()

        if (!deviceCode) return jsonResponse({ success: false, message: '设备码不能为空' }, 400)
        if (!orderNo) return jsonResponse({ success: false, message: '订单号不能为空' }, 400)

        var orderKey = 'order:' + orderNo
        var existing = env.ACTIVATE_ORDERS ? await env.ACTIVATE_ORDERS.get(orderKey) : null
        if (existing) {
          return jsonResponse({ success: false, message: '该订单号已被使用' }, 400)
        }

        var finalKey = generateKey(deviceCode)

        if (env.ACTIVATE_ORDERS) {
          await env.ACTIVATE_ORDERS.put(orderKey, deviceCode, { expirationTtl: 86400 })
        }

        return jsonResponse({ success: true, final_key: finalKey, message: '激活成功！' })
      } catch (e) {
        return jsonResponse({ success: false, message: '服务器错误，请稍后重试' }, 500)
      }
    }

    // 静态资源由 env.ASSETS 托管
    return env.ASSETS.fetch(request)
  }
}
