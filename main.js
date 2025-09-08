const menuBtn = document.getElementById('menu-btn');
const contactPopup = document.getElementById('contact-popup');
const phoneLink = document.getElementById('phone-link');
const infoIcon = document.querySelector('.info-icon');
const phoneNumber = "";
if (phoneNumber) {
  phoneLink.href = "tel:" + phoneNumber;
  phoneLink.style.display = "block";
}
menuBtn.addEventListener('click', () => {
  contactPopup.style.display = (contactPopup.style.display === "block") ? "none" : "block";
});
document.addEventListener('click', (e) => {
  if (!contactPopup.contains(e.target) && !menuBtn.contains(e.target)) {
    contactPopup.style.display = "none";
  }
});
const shopGrid = document.getElementById('shop-grid');
const modal = document.getElementById('product-modal');
const closeModalBtn = document.querySelector('.close-btn');
const modalName = document.getElementById('modal-name');
const modalPrice = document.getElementById('modal-price');
const modalDesc = document.getElementById('modal-desc');
const modalImage = document.getElementById('modal-image');
const buyLink = document.getElementById('buy-link');
const imageDotsContainer = document.getElementById('image-dots');
const modalImageContainer = document.querySelector('.modal-image-container');
let shopData = [];
let currentProduct = null;
let currentImageIndex = 0;
let touchStartX = 0;
fetch('shop.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok, status: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    shopData = data;
    renderProducts(shopData);
  })
  .catch(error => {
    console.error('Error fetching shop data:', error);
    shopGrid.innerHTML = `
      <div style="text-align: center; color: #aaa; margin-top: 50px;">
        <h2>Sorry! Products could not be loaded.</h2>
        <p>Please check your internet connection or try again later.</p>
      </div>
    `;
  });
function renderProducts(products) {
  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <div class="thumbnail-container">
          <img src="${product.thumbnail}" alt="${product.name}" class="product-thumbnail">
      </div>
      <div class="product-info">
        <h4 class="product-name">${product.name}</h4>
        <p class="product-desc">Loading...</p>
        <div class="product-footer">
          <span class="product-price">Loading...</span>
          <a class="buy-btn" href="${product.buyLink}" target="_blank">Buy Now</a>
        </div>
      </div>
    `;
    const promises = [
      product.descriptionPath ? fetch(product.descriptionPath).then(res => res.text()).catch(() => 'No description available.') : Promise.resolve('No description available.'),
      product.price ? fetch(product.price).then(res => res.text()).catch(() => 'Price N/A') : Promise.resolve('Price N/A')
    ];
    Promise.all(promises).then(([descriptionText, priceText]) => {
      const firstLine = descriptionText.split('\n')[0].trim();
      card.querySelector('.product-desc').textContent = firstLine;
      card.querySelector('.product-price').textContent = priceText.trim();
    }).catch(error => {
      console.error(`Error fetching data for ${product.name}:`, error);
      card.querySelector('.product-desc').textContent = 'Error loading.';
      card.querySelector('.product-price').textContent = 'Error loading.';
    });
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.buy-btn')) {
        showModal(product);
      }
    });
    shopGrid.appendChild(card);
  });
}
function showModal(product) {
  currentProduct = product;
  currentImageIndex = 0;
  modalName.textContent = product.name;
  const fetchPromises = [
    product.descriptionPath ? fetch(product.descriptionPath).then(res => res.text()).catch(() => 'Description not found.') : Promise.resolve('Description not found.'),
    product.price ? fetch(product.price).then(res => res.text()).catch(() => 'Price not found.') : Promise.resolve('Price not found.'),
  ];
  Promise.all(fetchPromises)
    .then(([descriptionText, priceText]) => {
      modalDesc.textContent = descriptionText;
      modalPrice.textContent = priceText.trim();
      if (product.buyLink) {
        buyLink.href = product.buyLink;
        buyLink.style.display = 'inline-block';
      } else {
        buyLink.href = '#';
        buyLink.style.display = 'none';
      }
    })
    .catch(error => {
      console.error('Error fetching product data:', error);
      modalDesc.textContent = 'Description not found.';
      modalPrice.textContent = 'Price not found.';
      buyLink.href = '#';
      buyLink.textContent = "Link N/A";
      buyLink.style.display = 'none';
    });
  updateModalImage();
  modal.style.display = 'flex';
}
function updateModalImage() {
  modalImage.src = currentProduct.images[currentImageIndex];
  modalImage.classList.remove('active');
  setTimeout(() => modalImage.classList.add('active'), 10);
  imageDotsContainer.innerHTML = '';
  if (currentProduct.images.length > 1) {
      imageDotsContainer.style.display = 'flex';
      currentProduct.images.forEach((_, index) => {
          const dot = document.createElement('span');
          dot.classList.add('dot');
          if (index === currentImageIndex) {
              dot.classList.add('active');
          }
          dot.addEventListener('click', (e) => {
              e.stopPropagation();
              currentImageIndex = index;
              updateModalImage();
          });
          imageDotsContainer.appendChild(dot);
      });
  } else {
      imageDotsContainer.style.display = 'none';
  }
}
closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
modalImageContainer.addEventListener('mousedown', (e) => {
    touchStartX = e.clientX;
});
modalImageContainer.addEventListener('mouseup', (e) => {
    const touchEndX = e.clientX;
    const threshold = 50;
    if (touchStartX - touchEndX > threshold) {
        currentImageIndex = (currentImageIndex + 1) % currentProduct.images.length;
        updateModalImage();
    } else if (touchEndX - touchStartX > threshold) {
        currentImageIndex = (currentImageIndex - 1 + currentProduct.images.length) % currentProduct.images.length;
        updateModalImage();
    }
});
modalImageContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});
modalImageContainer.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const threshold = 50;
    if (touchStartX - touchEndX > threshold) {
        currentImageIndex = (currentImageIndex + 1) % currentProduct.images.length;
        updateModalImage();
    } else if (touchEndX - touchStartX > threshold) {
        currentImageIndex = (currentImageIndex - 1 + currentProduct.images.length) % currentProduct.images.length;
        updateModalImage();
    }
});
