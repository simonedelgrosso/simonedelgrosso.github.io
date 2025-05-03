window.onload = function() {
  const home = document.getElementById("home");
  const main = document.getElementById("main-container");
  const about = document.getElementById("about");
  const contact = document.getElementById("contact");
  const navbar = document.getElementById("navbar");
  const navbarButtons = document.querySelectorAll(".nav-btn");
  const backButton = document.getElementById("scroll-back-btn");

  navbar.style.position = "fixed";

  function goToHome() {
    window.scroll(0, 0);
    window.onscrollend = () => {
      main.style.position = "fixed";
      navbar.style.transform = "translateY(0px)";
      main.style.transform = "translateY(0px)";
      home.style.transform = "translateY(0px)";
      window.onscrollend = () => {};
    };
  }

  function goToAbout() {
    window.scroll(0, about.offsetTop-navbar.offsetHeight);
  }

  function goToPortfolio() {
    window.scroll(0, portfolio.offsetTop-navbar.offsetHeight);
  }
  
  function goToContact() {
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
    const images = card.querySelectorAll('.carousel-image');
    const btnLeft = card.querySelector('.carousel-btn.left');
    const btnRight = card.querySelector('.carousel-btn.right');
    const dotsContainer = card.querySelector('.carousel-dots');

    let index = 0;

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
  
  window.addEventListener("scroll", () => {
    if (window.scrollY == 0) {
      backButton.style.display = "none";
    } else if (window.scrollY < (main.offsetTop + about.offsetHeight)) {
      backButton.style.display = "flex";
      navbarButtons.forEach((button) => {
        button.classList.remove("active");
      });
      navbarButtons[1].classList.add("active");
    } else if (window.scrollY >= (about.offsetTop + about.offsetHeight - navbar.offsetHeight) && window.scrollY < (portfolio.offsetTop + portfolio.offsetHeight - navbar.offsetHeight)) {
      navbarButtons.forEach((button) => {
            button.classList.remove("active");
      });
      navbarButtons[2].classList.add("active");
    } else if (window.scrollY >= (portfolio.offsetTop + portfolio.offsetHeight - navbar.offsetHeight) && window.scrollY < (contact.offsetTop + contact.offsetHeight - navbar.offsetHeight)) {
      navbarButtons.forEach((button) => {
            button.classList.remove("active");
      });
      navbarButtons[3].classList.add("active");
    }
  });

  const today = new Date();
  const birthDate = new Date("1998-02-01");
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  document.getElementById("about-age").innerText = age;
};
