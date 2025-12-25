// 存储重定向后的最终URL (用于缩略图和原图)
const finalUrlCache = new Map();
// 存储已经完全加载的高清原图 (避免重复加载)
const fullImageCache = new Map();
// 存储已解析的缩略图URL映射 (确保网格显示无误)
const thumbUrlMap = new Map();

// 注入CSS样式
// 修改点：增加了 loading-tip 样式，以及 img 的 object-fit 属性确保大小一致
const style = document.createElement('style');
style.textContent = `
    /* 灯箱图片容器样式 */
    #lightboxImg {
        width: 100%;
        height: 100%;
        object-fit: contain; /* 关键：让缩略图和原图都自适应填满容器，保持大小一致 */
        transition: filter 0.3s ease-out;
        display: block;
    }
    
    /* 模糊状态 */
    #lightboxImg.blur-loading {
        filter: blur(15px); /* 加大模糊程度，减少马赛克感 */
    }

    /* 加载提示文字样式 */
    .loading-tip {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 14px;
        pointer-events: none; /* 防止遮挡点击 */
        z-index: 100;
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .loading-tip.show {
        opacity: 1;
    }
`;
document.head.appendChild(style);

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

async function loadPhotosConfig() {
        return [
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9abb0f558.jpg",
            "thumb": "https://picui.cn/thumbnails/034da131b0b1d92f26f7c376873ea6c9.png",
            "title": "2024年5月4日",
            "description": "2024年5月，我们在广州的游船上在一起了。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b04ad89e.jpg",
            "thumb": "https://picui.cn/thumbnails/6d2cdf57c0c40261a26480b39907f61f.png",
            "title": "2024年6月1日",
            "description": "2024年6月1日，我们在巍山的咖啡店，老板送了我们明信片。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b6379815.jpg",
            "thumb": "https://picui.cn/thumbnails/106a9b78de17ef2c1af8871a71e4cc4e.png",
            "title": "2024年8月11日",
            "description": "2024年8月11日，七夕节，我们订了小狗蛋糕。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b634c34e.jpg",
            "thumb": "https://picui.cn/thumbnails/c12ee4b7cf42237a856168ac91e42c30.png",
            "title": "2024年10月1日",
            "description": "2024年10月1日，我们在阳朔。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9baeba014.jpg",
            "thumb": "https://picui.cn/thumbnails/230a47e21e6a0209e6bcde59986a41db.png",
            "title": "2024年10月3日",
            "description": "2024年10月3日，我们在涠涠洲岛一起看日落。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b63630b3.jpg",
            "thumb": "https://picui.cn/thumbnails/69fa4b572198077d29591420b745c8d0.png",
            "title": "2025年2月1日",
            "description": "2025年2月1日，我们在成都。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b6307714.jpg",
            "thumb": "https://picui.cn/thumbnails/4951555c90bc3897523016bfcaa5405c.png",
            "title": "2025年4月4日",
            "description": "2025年4月4日，我们在大理看海。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b63820d5.jpg",
            "thumb": "https://picui.cn/thumbnails/efdccb5c6b0fa4210467c02d18e02a0b.png",
            "title": "2025年5月2日",
            "description": "2025年5月2日，我们在香格里拉。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b7a2f4e7.jpg",
            "thumb": "https://picui.cn/thumbnails/8ca4a0fdd50d98036638c04e25bdf20b.png",
            "title": "2025年5月20日",
            "description": "2025年5月20日，我们一起过了520。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b77d50a3.jpg",
            "thumb": "https://picui.cn/thumbnails/2d09df0833d0621fde5bc6bbb165bdc9.png",
            "title": "2025年6月11日",
            "description": "2025年6月11日，我们在巍山。"
        },
        {
            "src": "https://free.picui.cn/free/2025/12/25/694c9b7932dd0.jpg",
            "thumb": "https://picui.cn/thumbnails/bc43caf9b436a2a69d8e15642dc97801.png",
            "title": "2025年10月7日",
            "description": "2025年10月7日，我们在弥勒。"
        }
    ];
}

// 预解析缩略图URL
async function resolveThumbnailUrls(photos) {
    const thumbUrls = [];
    photos.forEach(photo => {
        if (photo.thumb) thumbUrls.push(photo.thumb);
    });
    
    const uniqueUrls = [...new Set(thumbUrls)];
    
    const urlPromises = uniqueUrls.map(async url => {
        const finalUrl = await getFinalUrl(url);
        return { original: url, final: finalUrl };
    });
    
    const resolvedUrls = await Promise.allSettled(urlPromises);
    
    resolvedUrls.forEach(result => {
        if (result.status === 'fulfilled') {
            thumbUrlMap.set(result.value.original, result.value.final);
        }
    });
    
    return photos;
}

// 生成照片流
async function generatePhotoStream(photos) {
    const photoStream = document.getElementById('photoStream');
    photoStream.innerHTML = '';
    
    if (photos.length === 0) {
        photoStream.innerHTML = '<p style="text-align: center; color: #b0c4de; padding: 40px;">暂无照片</p>';
        return;
    }
    
    await resolveThumbnailUrls(photos);
    
    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.setAttribute('data-index', index);
        
        const thumbSrc = thumbUrlMap.get(photo.thumb) || photo.thumb;
        
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
    });
}

// 灯箱功能初始化
function initLightbox(photos) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxDescription = document.getElementById('lightboxDescription');
    
    // 动态创建加载提示元素并添加到灯箱中
    let loadingTip = document.querySelector('.loading-tip');
    if (!loadingTip) {
        loadingTip = document.createElement('div');
        loadingTip.className = 'loading-tip';
        loadingTip.innerText = '正在加载原图，请稍后...';
        // 将提示插入到图片容器附近，确保在图片上方显示
        // 假设 lightboxImg 的父级是容器，如果不是，可能需要根据你的HTML结构调整
        if(lightboxImg.parentNode) {
            lightboxImg.parentNode.appendChild(loadingTip);
        } else {
            lightbox.appendChild(loadingTip);
        }
    }

    let currentIndex = 0;
    let loadGeneration = 0; // 用于处理并发加载

    async function openLightbox(index) {
        currentIndex = index;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        await updateLightbox();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    async function updateLightbox() {
        const photo = photos[currentIndex];
        const currentGen = ++loadGeneration;
        
        // 更新基本信息
        lightboxCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
        lightboxDescription.textContent = photo.description;
        lightboxImg.alt = photo.title;

        // 1. 检查是否有已加载的高清原图缓存
        if (fullImageCache.has(photo.src)) {
            const cachedImg = fullImageCache.get(photo.src);
            lightboxImg.src = cachedImg.src;
            lightboxImg.classList.remove('blur-loading'); // 移除模糊
            loadingTip.classList.remove('show'); // 隐藏提示
            return;
        }

        // 2. 如果没有缓存，先显示缩略图（带模糊效果）
        const thumbSrc = thumbUrlMap.get(photo.thumb) || photo.thumb;
        
        // 先设置模糊和缩略图，并显示提示
        lightboxImg.classList.add('blur-loading');
        loadingTip.classList.add('show');
        
        // 由于CSS中设置了 object-fit: contain，缩略图会被拉伸到和原图一样大的显示区域
        lightboxImg.src = thumbSrc; 

        // 3. 后台解析并加载高清原图
        try {
            const finalFullSrc = await getFinalUrl(photo.src);
            const fullImg = new Image();
            
            fullImg.onload = () => {
                // 只有当用户还停留在当前图片时，才执行替换
                if (currentGen === loadGeneration) {
                    lightboxImg.src = finalFullSrc;
                    lightboxImg.classList.remove('blur-loading'); // 清除模糊
                    loadingTip.classList.remove('show'); // 隐藏提示
                }
                fullImageCache.set(photo.src, fullImg);
            };
            
            fullImg.onerror = () => {
                console.warn(`Failed to load full image: ${photo.src}`);
                if (currentGen === loadGeneration) {
                     loadingTip.innerText = '加载失败';
                     // 即使失败，也移除模糊让用户至少能看清缩略图
                     lightboxImg.classList.remove('blur-loading'); 
                }
            };
            
            fullImg.src = finalFullSrc;

        } catch (error) {
            console.error("Error loading full image:", error);
            loadingTip.classList.remove('show');
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

function showResolvingStatus() {
    const photoStream = document.getElementById('photoStream');
    photoStream.innerHTML = `
        <div style="text-align: center; color: #b0c4de; padding: 40px;">
            <p>正在加载相册...</p>
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
