/* Shared technology-partner marquee. Visual rules live in assets/skin.css. */
(function () {
  'use strict';

  var brands = [
    { name: 'HP', link: 'about.html#partner-hp', logo: 'assets/partners/hp.svg', width: 100, height: 100 },
    { name: 'Dell Technologies', link: 'about.html#partner-dell', logo: 'assets/partners/dell-technologies.svg', width: 72, height: 9 },
    { name: 'Siemens', logo: 'assets/partners/siemens.svg', width: 126, height: 20 },
    { name: 'Motorola Solutions', link: 'about.html#partner-motorola', logo: 'assets/partners/motorola-solutions.svg', width: 634, height: 73 },
    { name: 'Microsoft', logo: 'assets/partners/microsoft.svg', width: 118, height: 25 },
    { name: 'Hikvision', logo: 'assets/partners/hikvision.svg', width: 120, height: 16 },
    { name: 'Matrix', logo: 'assets/partners/matrix-comsec.png', width: 90, height: 34 },
    { name: 'Intel', logo: 'assets/partners/intel.svg', width: 90, height: 35 },
    { name: 'Cisco', logo: 'assets/partners/cisco.svg', width: 80, height: 42 },
    { name: 'Lenovo', logo: 'assets/partners/lenovo.svg', width: 120, height: 24 },
    { name: 'Molex', logo: 'assets/partners/molex.svg', width: 100, height: 25 },
    { name: 'Axis Communications', logo: 'assets/partners/axis-communications.svg', width: 278, height: 100 },
    { name: 'Asus', logo: 'assets/partners/asus.svg', width: 371, height: 100 },
    { name: 'Oracle', logo: 'assets/partners/oracle.svg', width: 770, height: 100 },
    { name: 'Google', logo: 'assets/partners/google.svg', width: 296, height: 100 },
    { name: 'CP Plus', logo: 'assets/partners/cp-plus.png', width: 168, height: 28 },
    { name: 'APC', logo: 'assets/partners/apc.svg', width: 236, height: 100 },
    { name: 'Acer', logo: 'assets/partners/acer.svg', width: 373, height: 100 },
    { name: 'Apple', logo: 'assets/partners/apple.svg', width: 81, height: 100 },
    { name: 'Beetel', logo: 'assets/partners/beetel.png', width: 633, height: 118 },
    { name: 'Canon', logo: 'assets/partners/canon.svg', width: 472, height: 100 },
    { name: 'D-Link', logo: 'assets/partners/d-link.svg', width: 333, height: 100 },
    { name: 'Panasonic', logo: 'assets/partners/panasonic.svg', width: 653, height: 100 },
    { name: 'Digisol', logo: 'assets/partners/digisol.png', width: 657, height: 120 },
    { name: 'Epson', logo: 'assets/partners/epson.svg', width: 407, height: 100 },
    { name: 'Samsung', logo: 'assets/partners/samsung.svg', width: 653, height: 100 },
    { name: 'Exide', logo: 'assets/partners/exide.svg', width: 310, height: 100 },
    { name: 'Grandstream', logo: 'assets/partners/grandstream.png', width: 300, height: 43 },
    { name: 'Polycab', logo: 'assets/partners/polycab.png', width: 150, height: 34 },
    { name: 'Poly', logo: 'assets/partners/poly.svg', width: 229, height: 100 },
    { name: 'Honeywell', logo: 'assets/partners/honeywell.svg', width: 565, height: 100 },
    { name: 'JBL', logo: 'assets/partners/jbl.svg', width: 96, height: 100 },
    { name: 'Legrand', logo: 'assets/partners/legrand.svg', width: 403, height: 100 },
    { name: 'LG', logo: 'assets/partners/lg.svg', width: 100, height: 100 },
    { name: 'Logitech', logo: 'assets/partners/logitech.svg', width: 605, height: 100 },
    { name: 'Prama', logo: 'assets/partners/prama.png', width: 793, height: 213 },
    { name: 'Sony', logo: 'assets/partners/sony.svg', width: 568, height: 100 },
    { name: 'ViewSonic', logo: 'assets/partners/viewsonic.svg', width: 616, height: 100 },
    { name: 'ZKTeco', logo: 'assets/partners/zkteco.png', width: 500, height: 115 }
  ];

  function buildItem(brand, duplicate) {
    var tag = brand.link ? 'a' : 'div';
    var href = brand.link ? ' href="' + brand.link + '"' : '';
    var tabIndex = duplicate && brand.link ? ' tabindex="-1"' : '';
    var logo = brand.logo
      ? '<img src="' + brand.logo + '" alt="' + brand.name + '" width="' + brand.width + '" height="' + brand.height + '" loading="lazy">'
      : brand.name;
    return '<' + tag + href + tabIndex + ' class="brand-marquee-item">' + logo + '</' + tag + '>';
  }

  function buildSet(duplicate) {
    var hidden = duplicate ? ' aria-hidden="true" inert' : '';
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
