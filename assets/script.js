(function() {
  'use strict';

  // ===== Theme Toggle =====
  var themeKey = 'hhz-theme'
  function getTheme() { return localStorage.getItem(themeKey) || 'light' }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(themeKey, t)
    var btn = document.getElementById('theme-toggle')
    if (btn) btn.textContent = t === 'light' ? '🌙' : '☀️'
  }
  function toggleTheme() { setTheme(getTheme() === 'light' ? 'dark' : 'light') }

  document.addEventListener('DOMContentLoaded', function() {
    setTheme(getTheme())
    var btn = document.getElementById('theme-toggle')
    if (btn) btn.addEventListener('click', toggleTheme)

    // Nav highlight
    var path = location.pathname.split('/').pop() || 'index.html'
    document.querySelectorAll('.nav a').forEach(function(a) {
      if (a.getAttribute('href') === path) a.style.color = 'var(--primary)'
    })
  })

  // ===== Copy QQ Group =====
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

  // ===== Scroll Animation (Intersection Observer) =====
  ;(function() {
    var animateElems = document.querySelectorAll('[data-animate]')
    if (!animateElems.length || !('IntersectionObserver' in window)) {
      animateElems.forEach(function(el) { el.setAttribute('data-animated', '') })
      return
    }
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-animated', '')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    animateElems.forEach(function(el) { observer.observe(el) })
  })();

  // ===== Screenshot Carousel =====
  ;(function() {
    var scrollContainer = document.querySelector('.screenshot-scroll')
    var dots = document.querySelectorAll('.scroll-dot')
    if (!scrollContainer || !dots.length) return

    function updateDots() {
      var cards = scrollContainer.querySelectorAll('.screenshot-card')
      var scrollLeft = scrollContainer.scrollLeft
      var cardWidth = cards.length ? (cards[0].offsetWidth + 12) : 130
      var idx = Math.round(scrollLeft / cardWidth)
      idx = Math.max(0, Math.min(idx, dots.length - 1))
      dots.forEach(function(d, i) { d.classList.toggle('active', i === idx) })
      cards.forEach(function(c, i) { c.classList.toggle('active', i === idx) })
    }

    scrollContainer.addEventListener('scroll', updateDots)
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-index'), 10)
        var cards = scrollContainer.querySelectorAll('.screenshot-card')
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'start' })
        }
      })
    })
    updateDots()

    // Auto-scroll every 2 seconds (scrollLeft only, doesn't affect page scroll)
    var autoTimer = setInterval(function() {
      var cards = scrollContainer.querySelectorAll('.screenshot-card')
      if (!cards.length) return
      var currentIdx = Array.from(dots).findIndex(function(d) { return d.classList.contains('active') })
      var nextIdx = (currentIdx + 1) % cards.length
      var cardWidth = cards[0].offsetWidth + 16
      scrollContainer.scrollTo({ left: nextIdx * cardWidth, behavior: 'smooth' })
    }, 2000)

    // Pause auto-scroll during manual interaction, resume after idle
    var idleTimer
    function resetAutoScroll() {
      clearTimeout(idleTimer)
      clearInterval(autoTimer)
      idleTimer = setTimeout(function() {
        autoTimer = setInterval(function() {
          var cards = scrollContainer.querySelectorAll('.screenshot-card')
          if (!cards.length) return
          var currentIdx = Array.from(dots).findIndex(function(d) { return d.classList.contains('active') })
          var nextIdx = (currentIdx + 1) % cards.length
          var cardWidth = cards[0].offsetWidth + 16
          scrollContainer.scrollTo({ left: nextIdx * cardWidth, behavior: 'smooth' })
        }, 2000)
      }, 6000)
    }
    scrollContainer.addEventListener('scroll', resetAutoScroll)
    dots.forEach(function(d) { d.addEventListener('click', resetAutoScroll) })
  })();
})()
