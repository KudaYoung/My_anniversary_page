// 照片数据
const photos = [
    {
        src: 'gallery/20240504.jpg',
        thumb: 'gallery/thumbs/20240504_thumb.jpg',
        title: '2024年5月4日',
        description: '2024年5月，我们在广州的游船上在一起了。'
    },
    {
        src: 'gallery/20240611.jpg',
        thumb: 'gallery/thumbs/20240611_thumb.jpg',
        title: '2024年6月1日',
        description: '2024年6月1日，我们在巍山的咖啡店，老板送了我们明信片。'
    },
    {
        src: 'gallery/20240811.jpg',
        thumb: 'gallery/thumbs/20240811_thumb.jpg',
        title: '2024年8月11日',
        description: '2024年8月11日，七夕节，我们订了小狗蛋糕。'
    },
    {
        src: 'gallery/20241001.jpg',
        thumb: 'gallery/thumbs/20241001_thumb.jpg',
        title: '2024年10月1日',
        description: '2024年10月1日，我们在阳朔。'
    },
    {
        src: 'gallery/20241003.jpg',
        thumb: 'gallery/thumbs/20241003_thumb.jpg',
        title: '2024年10月3日',
        description: '2024年10月3日，我们在涠洲岛一起看日落。'
    },
    {
        src: 'gallery/20250201.jpg',
        thumb: 'gallery/thumbs/20250201_thumb.jpg',
        title: '2025年2月1日',
        description: '2025年2月1日，我们在成都。'
    },
    {
        src: 'gallery/20250404.jpg',
        thumb: 'gallery/thumbs/20250404_thumb.jpg',
        title: '2025年4月4日',
        description: '2025年4月4日，我们在大理看海。'
    },
    {
        src: 'gallery/20250502.jpg',
        thumb: 'gallery/thumbs/20250502_thumb.jpg',
        title: '2025年5月2日',
        description: '2025年5月2日，我们在香格里拉。'
    },
    {
        src: 'gallery/20250519.jpg',
        thumb: 'gallery/thumbs/20250519_thumb.jpg',
        title: '2025年5月20日',
        description: '2025年5月20日，我们一起过了520。'
    },
    {
        src: 'gallery/20250611.jpg',
        thumb: 'gallery/thumbs/20250611_thumb.jpg',
        title: '2025年6月11日',
        description: '2025年6月11日，我们在巍山。'
    },
    {
        src: 'gallery/20251007.jpg',
        thumb: 'gallery/thumbs/20251007_thumb.jpg',
        title: '2025年10月7日',
        description: '2025年10月7日，我们在弥勒。'
    }
];

// 预加载图片缓存
const imageCache = new Map();

// 预加载图片函数
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        if (imageCache.has(src)) {
            resolve(imageCache.get(src));
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            imageCache.set(src, img);
            resolve(img);
        };
        img.onerror = reject;
        img.src = src;
    });
}

// 生成照片流
function generatePhotoStream() {
    const photoStream = document.getElementById('photoStream');
    
    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.setAttribute('data-index', index);
        
        // 使用压缩后的预览图
        const thumbSrc = photo.thumb || photo.src;
        
        photoItem.innerHTML = `
            <img src="${thumbSrc}" alt="${photo.title}" class="compressed-img" loading="lazy">
            <div class="photo-info">
                <div>${photo.title}</div>
            </div>
        `;
        
        photoStream.appendChild(photoItem);
        
        // 图片加载完成后移除模糊效果
        const img = photoItem.querySelector('img');
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
        
        // 预加载原图
        preloadImage(photo.src).catch(() => {
            console.warn(`Failed to preload image: ${photo.src}`);
        });
    });
}

// 灯箱功能
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxDescription = document.getElementById('lightboxDescription');
    
    let currentIndex = 0;
    let isImageLoading = false;
    
    // 打开灯箱
    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭灯箱
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // 更新灯箱内容
    function updateLightbox() {
        const photo = photos[currentIndex];
        
        // 直接显示预览图
        lightboxImg.src = photo.thumb || photo.src;
        lightboxImg.alt = photo.title;
        lightboxCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
        lightboxDescription.textContent = photo.description;
        
        // 检查原图是否已缓存
        if (imageCache.has(photo.src)) {
            // 如果已缓存，直接替换
            lightboxImg.src = photo.src;
        } else {
            // 如果没有缓存，异步加载原图
            isImageLoading = true;
            preloadImage(photo.src)
                .then(() => {
                    if (currentIndex === index) { // 确保仍然是当前图片
                        lightboxImg.src = photo.src;
                    }
                })
                .catch(() => {
                    console.warn(`Failed to load full image: ${photo.src}`);
                })
                .finally(() => {
                    isImageLoading = false;
                });
        }
    }
    
    // 上一张
    function prevPhoto() {
        if (isImageLoading) return;
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;
        updateLightbox();
    }
    
    // 下一张
    function nextPhoto() {
        if (isImageLoading) return;
        currentIndex = (currentIndex + 1) % photos.length;
        updateLightbox();
    }
    
    // 点击图片打开灯箱
    document.addEventListener('click', (e) => {
        if (e.target.closest('.photo-item')) {
            const photoItem = e.target.closest('.photo-item');
            const index = parseInt(photoItem.getAttribute('data-index'));
            openLightbox(index);
        }
    });
    
    // 事件监听
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevPhoto);
    lightboxNext.addEventListener('click', nextPhoto);
    
    // 点击灯箱背景关闭
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // 键盘导航
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevPhoto();
                break;
            case 'ArrowRight':
                nextPhoto();
                break;
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    generatePhotoStream();
    initLightbox();
});
