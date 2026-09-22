/* Shared technology-partner marquee. Visual rules live in assets/skin.css. */
(function () {
  'use strict';

  var brands = [
    { name: 'HP', link: 'about.html#partner-hp', logo: 'assets/partners/hp.svg', width: 100, height: 100 },
    { name: 'Dell Technologies', link: 'about.html#partner-dell', logo: 'assets/partners/dell-technologies.svg', width: 72, height: 9 },
    { name: 'Siemens' },
    { name: 'Motorola Solutions', link: 'about.html#partner-motorola', logo: 'assets/partners/motorola-solutions.svg', width: 634, height: 73 },
    { name: 'Microsoft' },
    { name: 'Hikvision' },
    { name: 'Matrix' },
    { name: 'Intel' },
    { name: 'Cisco' },
    { name: 'Lenovo' },
    { name: 'Molex' }
  ];

  function buildItem(brand, duplicate) {
    var tag = brand.link ? 'a' : 'div';
    var href = brand.link ? ' href="' + brand.link + '"' : '';
    var tabIndex = duplicate && brand.link ? ' tabindex="-1"' : '';
    var logo = brand.logo
      ? '<img src="' + brand.logo + '" alt="" width="' + brand.width + '" height="' + brand.height + '" loading="lazy">'
      : '';
    return '<' + tag + href + tabIndex + ' class="brand-marquee-item">' + logo +
      '<span class="bm-name">' + brand.name + '</span></' + tag + '>';
  }

  function buildSet(duplicate) {
    var hidden = duplicate ? ' aria-hidden="true"' : '';
    var html = '<div class="brand-marquee-set"' + hidden + '>' +
      '<span class="brand-marquee-label">Authorized technology partners</span>';
    for (var i = 0; i < brands.length; i += 1) {
      html += buildItem(brands[i], duplicate);
    }
    return html + '</div>';
  }

  function inject() {
    if (document.querySelector('.brand-marquee')) return;

    var section = document.createElement('section');
    section.className = 'brand-marquee';
    section.setAttribute('aria-label', 'Technology partners');

    var track = document.createElement('div');
    track.className = 'brand-marquee-track';
    track.innerHTML = buildSet(false) + buildSet(true);
    section.appendChild(track);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'brand-marquee-toggle';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.textContent = 'Pause partner logos';
    toggle.addEventListener('click', function () {
      var paused = section.classList.toggle('is-paused');
      toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
      toggle.textContent = paused ? 'Play partner logos' : 'Pause partner logos';
    });
    section.appendChild(toggle);

    var footer = document.querySelector('footer');
    var homeMetric = document.body && document.body.getAttribute('data-page') === 'home'
      ? document.querySelector('.home-hero + section')
      : null;
    if (homeMetric && homeMetric.parentNode) {
      homeMetric.parentNode.insertBefore(section, homeMetric.nextSibling);
    } else if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(section, footer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
