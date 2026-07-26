(function() {
  'use strict';

  // Nav highlight
  function setup() {
    var path = location.pathname.split('/').pop() || 'index.html'
    document.querySelectorAll('.nav a').forEach(function(a) {
      if (a.getAttribute('href') === path) a.style.color = 'var(--primary)'
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
})()
