(function() {
  'use strict';

  // Nav highlight
  function setup() {
    var path = location.pathname.split('/').pop() || 'index.html'
    document.querySelectorAll('.site-header nav a, .nav a').forEach(function(a) {
      if (a.getAttribute('href') === path) a.classList.add('active')
    })
  }
  document.addEventListener('DOMContentLoaded', setup)

  // Copy QQ Group
  window.copyQQGroup = function() {
    var input = document.createElement('input')
    input.value = '964879234'
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    var desc = document.getElementById('qq-desc')
    if (desc) { desc.textContent = '已复制！'; setTimeout(function(){ desc.textContent = '点击复制群号' }, 2000) }
  }

  // Scroll-triggered fade-in (uses CSS transitions, just adds the class)
  ;(function() {
    var els = document.querySelectorAll('[data-animate]')
    if (!els.length) return

    // 卡片组逐项 stagger：父级已带 data-animate 时，为兄弟卡片递增延迟
    ;(function stagger() {
      var groups = ['.methods-grid', '.feature-grid', '.app-grid', '.download-grid', '.projects-grid', '.contact-grid', '.px-dl-grid', '.px-stats', '.steps']
      groups.forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(grid) {
          var idx = 0
          Array.prototype.forEach.call(grid.children, function(child) {
            if (!child.hasAttribute('data-animate') || child.hasAttribute('data-delay')) return
            if (idx > 0 && idx <= 3) child.setAttribute('data-delay', String(idx))
            idx++
          })
        })
      })
    })();

    if (!('IntersectionObserver' in window)) {
      els.forEach(function(el) { el.setAttribute('data-animated', '') })
      return
    }
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-animated', '')
          obs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' })
    els.forEach(function(el) { obs.observe(el) })
  })();

  // Screenshot carousel
  ;(function() {
    function init(sc) {
      var dots = sc.parentElement.querySelector('.scroll-dots')
      if (!dots || !dots.children.length) return
      function update() {
        var cards = sc.querySelectorAll('.screenshot-card')
        if (!cards.length) return
        var idx = Math.round(sc.scrollLeft / (cards[0].offsetWidth + 12))
        idx = Math.max(0, Math.min(idx, dots.children.length - 1))
        Array.from(dots.children).forEach(function(d, i) { d.classList.toggle('active', i === idx) })
        cards.forEach(function(c, i) { c.classList.toggle('active', i === idx) })
      }
      sc.addEventListener('scroll', update)
      Array.from(dots.children).forEach(function(dot) {
        dot.addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-index'), 10)
          var cards = sc.querySelectorAll('.screenshot-card')
          if (cards[idx]) cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start' })
        })
      })
      update()
      var timer = setInterval(function() {
        var cards = sc.querySelectorAll('.screenshot-card')
        if (!cards.length) return
        var ci = Array.from(dots.children).findIndex(function(d) { return d.classList.contains('active') })
        sc.scrollTo({ left: ((ci + 1) % cards.length) * (cards[0].offsetWidth + 12), behavior: 'smooth' })
      }, 1200)
      var idle
      function pause() {
        clearTimeout(idle); clearInterval(timer)
        idle = setTimeout(function() {
          timer = setInterval(function() {
            var cards = sc.querySelectorAll('.screenshot-card')
            if (!cards.length) return
            var ci = Array.from(dots.children).findIndex(function(d) { return d.classList.contains('active') })
            sc.scrollTo({ left: ((ci + 1) % cards.length) * (cards[0].offsetWidth + 12), behavior: 'smooth' })
          }, 1200)
        }, 6000)
      }
      sc.addEventListener('scroll', pause)
      Array.from(dots.children).forEach(function(d) { d.addEventListener('click', pause) })
    }
    document.querySelectorAll('.screenshot-scroll').forEach(function(sc) {
      if (sc.offsetParent !== null) init(sc)
    })
  })();

  // 鼠标跟随光晕（spotlight）：卡片内部随鼠标亮起
  ;(function() {
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return
    document.addEventListener('pointermove', function(e) {
      var card = e.target.closest && e.target.closest('.glass')
      if (!card) return
      var r = card.getBoundingClientRect()
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px')
      card.style.setProperty('--my', (e.clientY - r.top) + 'px')
    }, { passive: true })
  })();

  // 顶部滚动进度条
  ;(function() {
    var bar = document.createElement('div')
    bar.className = 'scroll-progress'
    document.body.appendChild(bar)
    function update() {
      var h = document.documentElement
      var max = h.scrollHeight - h.clientHeight
      var p = max > 0 ? (h.scrollTop / max) : 0
      bar.style.transform = 'scaleX(' + p + ')'
    }
    document.addEventListener('scroll', update, { passive: true })
    update()
  })();
})()
