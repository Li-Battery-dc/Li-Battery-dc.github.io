window.onload = function() {
    const combinedImagesDiv = document.querySelector('.combined-images');
    const images = combinedImagesDiv.dataset.images.split(',').map(image => image.trim());

    // 创建背景图像的CSS样式
    const backgroundImages = images.map((image, index) => `url('${image}')`).join(', ');
    
    // 设置背景图像
    combinedImagesDiv.style.backgroundImage = backgroundImages;
  
    // 动态调整背景图像的位置
    const positions = images.map((_, index) => {
      if (index === 0) return 'top left';
      if (index === 1) return 'top right';
      return `bottom center`;  // 其他的图像默认放到底部居中
    }).join(', ');
  
    // 设置背景位置
    combinedImagesDiv.style.backgroundPosition = positions;
  }
  