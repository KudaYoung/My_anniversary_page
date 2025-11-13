// 照片配置数据 - 直接嵌入脚本中
const PHOTOS = [
    {
        "src": "https://files.240503.xyz/gallery/20240504.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20240504_thumb.jpg",
        "title": "2024年5月4日",
        "description": "2024年5月，我们在广州的游船上在一起了。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20240611.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20240611_thumb.jpg",
        "title": "2024年6月1日",
        "description": "2024年6月1日，我们在巍山的咖啡店，老板送了我们明信片。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20240811.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20240811_thumb.jpg",
        "title": "2024年8月11日",
        "description": "2024年8月11日，七夕节，我们订了小狗蛋糕。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20241001.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20241001_thumb.jpg",
        "title": "2024年10月1日",
        "description": "2024年10月1日，我们在阳朔。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20241003.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20241003_thumb.jpg",
        "title": "2024年10月3日",
        "description": "2024年10月3日，我们在涠洲岛一起看日落。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20250201.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20250201_thumb.jpg",
        "title": "2025年2月1日",
        "description": "2025年2月1日，我们在成都。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20250404.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20250404_thumb.jpg",
        "title": "2025年4月4日",
        "description": "2025年4月4日，我们在大理看海。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20250502.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20250502_thumb.jpg",
        "title": "2025年5月2日",
        "description": "2025年5月2日，我们在香格里拉。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20250519.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20250519_thumb.jpg",
        "title": "2025年5月20日",
        "description": "2025年5月20日，我们一起过了520。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20250611.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20250611_thumb.jpg",
        "title": "2025年6月11日",
        "description": "2025年6月11日，我们在巍山。"
    },
    {
        "src": "https://files.240503.xyz/gallery/20251007.jpg",
        "thumb": "https://files.240503.xyz/gallery/thumbs/20251007_thumb.jpg",
        "title": "2025年10月7日",
        "description": "2025年10月7日，我们在弥勒。"
    }
];

// 预加载图片缓存
const imageCache = new Map();
// 存储重定向后的最终URL
const finalUrlCache = new Map();

// 获取重定向后的最终URL
async function getFinalUrl(url) {
    if (finalUrlCache.has(url)) {
        return finalUrlCache.get(url);
    }
    
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            mode: 'cors',
            credentials: 'omit'
        });
        finalUrlCache.set(url, response.url);
        return response.url;
    } catch (error) {
        console.warn(`Failed to get final URL for ${url}:`, error);
        return url;
    }
}

// 预加载图片函数
async function preloadImage(src) {
    const finalSrc = await getFinalUrl(src);
    
    if (imageCache.has(finalSrc)) {
        return imageCache.get(finalSrc);
    }
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            imageCache.set(finalSrc, img);
            resolve(img);
        };
        img.onerror = reject;
        img.src = finalSrc;
    });
}

// 加载照片配置 - 直接返回内嵌数据
function loadPhotosConfig() {
    return new Promise((resolve) => {
        resolve(PHOTOS);
    });
}

// 解析所有照片URL，获取最终地址
async function resolveAllPhotoUrls(photos) {
    const allUrls = [];
    photos.forEach(photo => {
        allUrls.push(photo.src);
        if (photo.thumb) {
            allUrls.push(photo.thumb);
        }
    });
    
    const uniqueUrls = [...new Set(allUrls)];
    
    const urlPromises = uniqueUrls.map(async url => {
        const finalUrl = await getFinalUrl(url);
        return { original: url, final: finalUrl };
    });
    
    const resolvedUrls = await Promise.allSettled(urlPromises);
    
    const urlMap = new Map();
    resolvedUrls.forEach(result => {
        if (result.status === 'fulfilled') {
            urlMap.set(result.value.original, result.value.final);
        }
    });
    
    const resolvedPhotos = photos.map(photo => ({
        ...photo,
        src: urlMap.get(photo.src) || photo.src,
        thumb: photo.thumb ? (urlMap.get(photo.thumb) || photo.thumb) : undefined
    }));
    
    return resolvedPhotos;
}

// 生成照片流
async function generatePhotoStream(photos) {
    const photoStream = document.getElementById('photoStream');
    photoStream.innerHTML = '';
    
    if (photos.length === 0) {
        photoStream.innerHTML = '<p style="text-align: center; color: #b0c4de; padding: 40px;">暂无照片</p>';
        return;
    }
    
    const resolvedPhotos = await resolveAllPhotoUrls(photos);
    
    resolvedPhotos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.setAttribute('data-index', index);
        
        const thumbSrc = photo.thumb || photo.src;
        
        photoItem.innerHTML = `
            <img src="${thumbSrc}" alt="${photo.title}" class="compressed-img" loading="lazy">
            <div class="photo-info">
                <div>${photo.title}</div>
            </div>
        `;
        
        photoStream.appendChild(photoItem);
        
        const img = photoItem.querySelector('img');
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
        
        preloadImage(photo.src).catch(() => {
            console.warn(`Failed to preload image: ${photo.src}`);
        });
    });
}

// 灯箱功能
function initLightbox(photos) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxDescription = document.getElementById('lightboxDescription');
    
    let currentIndex = 0;
    let currentLoadIndex = null;

    async function openLightbox(index) {
        currentIndex = index;
        await updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentLoadIndex = null;
    }

    async function updateLightbox() {
        const photo = photos[currentIndex];
        const loadIndex = currentIndex;
        currentLoadIndex = loadIndex;
        
        const thumbFinalUrl = await getFinalUrl(photo.thumb || photo.src);
        lightboxImg.src = thumbFinalUrl;
        lightboxImg.alt = photo.title;
        lightboxCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
        lightboxDescription.textContent = photo.description;
        
        const finalSrc = await getFinalUrl(photo.src);
        if (imageCache.has(finalSrc)) {
            if (currentLoadIndex === loadIndex) {
                lightboxImg.src = finalSrc;
            }
        } else {
            preloadImage(photo.src)
                .then(() => {
                    if (currentLoadIndex === loadIndex) {
                        lightboxImg.src = finalSrc;
                    }
                })
                .catch(() => {
                    console.warn(`Failed to load full image: ${photo.src}`);
                });
        }
    }

    async function prevPhoto() {
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;
        await updateLightbox();
    }

    async function nextPhoto() {
        currentIndex = (currentIndex + 1) % photos.length;
        await updateLightbox();
    }

    document.addEventListener('click', async (e) => {
        if (e.target.closest('.photo-item')) {
            const photoItem = e.target.closest('.photo-item');
            const index = parseInt(photoItem.getAttribute('data-index'));
            await openLightbox(index);
        }
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevPhoto);
    lightboxNext.addEventListener('click', nextPhoto);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', async (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                await prevPhoto();
                break;
            case 'ArrowRight':
                await nextPhoto();
                break;
        }
    });
}

function showLoading() {
    const photoStream = document.getElementById('photoStream');
    photoStream.innerHTML = '<p style="text-align: center; color: #b0c4de; padding: 40px;">加载中...</p>';
}

function showResolvingStatus() {
    const photoStream = document.getElementById('photoStream');
    photoStream.innerHTML = `
        <div style="text-align: center; color: #b0c4de; padding: 40px;">
            <p>正在解析图片地址...</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">这可能需要几秒钟时间</p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', async function() {
    showResolvingStatus();
    
    try {
        const photos = await loadPhotosConfig();
        await generatePhotoStream(photos);
        initLightbox(photos);
    } catch (error) {
        console.error('Failed to initialize gallery:', error);
        const photoStream = document.getElementById('photoStream');
        photoStream.innerHTML = `
            <div style="text-align: center; color: #ff6b6b; padding: 40px;">
                <p>加载失败，请刷新页面重试</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">错误信息: ${error.message}</p>
                <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">重新加载</button>
            </div>
        `;
    }
});
