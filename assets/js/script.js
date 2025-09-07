window.onload = function() {
  const isMobile = window.matchMedia("(max-width: 650px)").matches;
  const home = document.getElementById("home");
  const main = document.getElementById("main-container");
  const about = document.getElementById("about");
  const contact = document.getElementById("contact");
  const navbar = document.getElementById("navbar");
  const navbarButtons = document.querySelectorAll(".nav-btn");
  const backButton = document.getElementById("scroll-back-btn");
  const navButton = document.getElementById("nav-btn");

  navbar.style.position = "fixed";

  function hideNavbarOnMobile() {
    if (isMobile) {
      navbar.style.display = "none";
    }
  }

  if (isMobile) {
    hideNavbarOnMobile();
  }

  function goToHome() {
    function transition() {
      main.style.position = "fixed";
      navbar.style.transform = "translateY(0px)";
      main.style.transform = "translateY(0px)";
      home.style.transform = "translateY(0px)";
    }
    if (isMobile) {
      navbar.style.display = "none";
    }
    if (window.scrollY == 0) {
      transition();
    } else {
      window.scroll(0, 0);
      window.onscrollend = () => {
        transition();
        window.onscrollend = () => {};
      };
    }
  }

  function goToAbout() {
    hideNavbarOnMobile();
    window.scroll(0, about.offsetTop-navbar.offsetHeight);
  }

  function goToPortfolio() {
    hideNavbarOnMobile();
    window.scroll(0, portfolio.offsetTop-navbar.offsetHeight);
  }
  
  function goToContact() {
    hideNavbarOnMobile();
    window.scroll(0, contact.offsetTop-navbar.offsetHeight);
  }

  document.getElementById("nav-btn-home").addEventListener("click", goToHome);
  document.getElementById("nav-btn-about").addEventListener("click", goToAbout);
  document.getElementById("nav-btn-portfolio").addEventListener("click", goToPortfolio);
  document.getElementById("nav-btn-contact").addEventListener("click", goToContact);

  document.getElementById("footer-btn-home").addEventListener("click", goToHome);
  document.getElementById("footer-btn-about").addEventListener("click", goToAbout);
  document.getElementById("footer-btn-portfolio").addEventListener("click", goToPortfolio);
  document.getElementById("footer-btn-contact").addEventListener("click", goToContact);

  backButton.addEventListener("click", goToHome);

  navButton.addEventListener("click", () => {
    if (navbar.style.display == "none") {
      navbar.style.display = "flex";
    } else {
      navbar.style.display = "none";
    }
  });

  document.getElementById("btn-enter").addEventListener("click", () => {
    navbar.style.transform = "translateY(-100vh)";
    home.style.transform = "translateY(-100vh)";
    main.style.transform = "translateY(-100vh)";
    setTimeout(() => {
      main.style.position = "absolute";
    }, 500);
  });

  document.querySelectorAll('.flip-card-inner').forEach(flipCard => {
    const card = flipCard.querySelector('.flip-card-front');

    let index = 0;

    let activeCarousel;
    let desktopCarousel = card.querySelector(".carousel.desktop");
    let mobileCarousel = card.querySelector(".carousel.mobile");

    if (desktopCarousel && mobileCarousel) {
      if (isMobile) {
        activeCarousel = mobileCarousel;
      } else {
        activeCarousel = desktopCarousel;
      }
    } else {
      activeCarousel = card.querySelector(".carousel");
    }

    const images = activeCarousel.querySelectorAll('.carousel-image') ;
    const btnLeft = card.querySelector('.carousel-btn.left');
    const btnRight = card.querySelector('.carousel-btn.right');
    const dotsContainer = card.querySelector('.carousel-dots');

    images.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        index = i;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    const updateCarousel = () => {
      images.forEach((img, i) => img.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    btnLeft.addEventListener('click', () => {
      index = (index - 1 + images.length) % images.length;
      updateCarousel();
    });

    btnRight.addEventListener('click', () => {
      index = (index + 1) % images.length;
      updateCarousel();
    });

    flipCard.querySelectorAll('.flip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        flipCard.classList.toggle('flipped');
      });
    });
  });
  
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  window.addEventListener("scroll", throttle(() => {
    hideNavbarOnMobile();
    if (window.scrollY < portfolio.offsetTop) {
      backButton.style.display = "flex";
      navbarButtons.forEach((button) => {
        button.classList.remove("active");
      });
      navbarButtons[1].classList.add("active");
    } else if (window.scrollY < contact.offsetTop) {
      navbarButtons.forEach((button) => {
            button.classList.remove("active");
      });
      navbarButtons[2].classList.add("active");
    } else {
      navbarButtons.forEach((button) => {
            button.classList.remove("active");
      });
      navbarButtons[3].classList.add("active");
    }
  }, 100)); // Throttled to run at most every 100ms

  const today = new Date();
  const birthDate = new Date(1998, 2, 1);
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  document.getElementById("about-age").innerText = age;
};

const toggle = document.getElementById('theme-toggle');
const slider = toggle.querySelector('.toggle')
const sliderIcon = slider.querySelector('i');

toggle.addEventListener('click', () => {
  let theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    sliderIcon.classList.remove('fa-moon');
    sliderIcon.classList.add('fa-sun');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    sliderIcon.classList.remove('fa-sun');
    sliderIcon.classList.add('fa-moon');
  }
});