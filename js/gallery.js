// --- 数据配置 ---
const photoData = [
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9abb0f558.jpg",
        "thumb": "https://picui.cn/thumbnails/034da131b0b1d92f26f7c376873ea6c9.png",
        "title": "2024.05.04",
        "description": "2024年5月，我们在广州的游船上在一起了。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b04ad89e.jpg",
        "thumb": "https://picui.cn/thumbnails/6d2cdf57c0c40261a26480b39907f61f.png",
        "title": "2024.06.01",
        "description": "2024年6月1日，我们在巍山的咖啡店，老板送了我们明信片。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b6379815.jpg",
        "thumb": "https://picui.cn/thumbnails/106a9b78de17ef2c1af8871a71e4cc4e.png",
        "title": "2024.08.11",
        "description": "2024年8月11日，七夕节，我们订了小狗蛋糕。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b634c34e.jpg",
        "thumb": "https://picui.cn/thumbnails/c12ee4b7cf42237a856168ac91e42c30.png",
        "title": "2024.10.01",
        "description": "2024年10月1日，我们在阳朔。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9baeba014.jpg",
        "thumb": "https://picui.cn/thumbnails/230a47e21e6a0209e6bcde59986a41db.png",
        "title": "2024.10.03",
        "description": "2024年10月3日，我们在涠洲岛一起看日落。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b63630b3.jpg",
        "thumb": "https://picui.cn/thumbnails/69fa4b572198077d29591420b745c8d0.png",
        "title": "2025.02.01",
        "description": "2025年2月1日，我们在成都。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b6307714.jpg",
        "thumb": "https://picui.cn/thumbnails/4951555c90bc3897523016bfcaa5405c.png",
        "title": "2025.04.04",
        "description": "2025年4月4日，我们在大理看海。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b63820d5.jpg",
        "thumb": "https://picui.cn/thumbnails/efdccb5c6b0fa4210467c02d18e02a0b.png",
        "title": "2025.05.02",
        "description": "2025年5月2日，我们在香格里拉。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b7a2f4e7.jpg",
        "thumb": "https://picui.cn/thumbnails/8ca4a0fdd50d98036638c04e25bdf20b.png",
        "title": "2025.05.20",
        "description": "2025年5月20日，我们一起过了520。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b77d50a3.jpg",
        "thumb": "https://picui.cn/thumbnails/2d09df0833d0621fde5bc6bbb165bdc9.png",
        "title": "2025.06.11",
        "description": "2025年6月11日，我们在巍山。"
    },
    {
        "src": "https://free.picui.cn/free/2025/12/25/694c9b7932dd0.jpg",
        "thumb": "https://picui.cn/thumbnails/bc43caf9b436a2a69d8e15642dc97801.png",
        "title": "2025.10.07",
        "description": "2025年10月7日，我们在弥勒。"
    }
];

// 缓存已完全加载的原图 URL
const loadedImages = new Set();

// --- 渲染照片流 ---
function renderGallery() {
    const stream = document.getElementById('photoStream');
    stream.innerHTML = ''; 

    if (!photoData || photoData.length === 0) {
        stream.innerHTML = '<p class="subtitle">暂无照片回忆</p>';
        return;
    }

    photoData.forEach((photo, index) => {
        const card = document.createElement('div');
        card.className = 'photo-item fade-in';
        card.style.animationDelay = `${index * 0.05}s`;
        card.setAttribute('data-index', index);

        // 使用缩略图，如果没有缩略图则使用原图
        const imgSrc = photo.thumb || photo.src;
        
        card.innerHTML = `
            <img src="${imgSrc}" class="blur" alt="${photo.title}" loading="lazy">
            <div class="photo-info">
                <div class="photo-title">${photo.title}</div>
                <div class="photo-desc">${photo.description}</div>
            </div>
        `;

        stream.appendChild(card);

        // 缩略图加载优化
        const img = card.querySelector('img');
        const handleLoad = () => {
            img.classList.add('loaded');
            img.classList.remove('blur');
        };

        if (img.complete) {
            handleLoad();
        } else {
            img.onload = handleLoad;
            img.onerror = () => {
                img.classList.remove('blur'); // 即使失败也移除模糊
            }
        }
    });

    initLightbox();
}

// --- 灯箱功能 ---
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxBackdrop = document.getElementById('lightboxBackdrop'); // 背景层
    const titleEl = document.getElementById('lightboxTitle');
    const descEl = document.getElementById('lightboxDescription');
    const counterEl = document.getElementById('lightboxCounter');
    const loader = document.getElementById('lightboxLoader');
    
    let currentIndex = 0;
    let currentLoadId = 0; // 用于解决快速切换时的竞争条件

    // 打开灯箱
    window.openLightbox = (index) => {
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // 关闭灯箱
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // 延迟清理，避免闪烁
        setTimeout(() => {
            lightboxImg.src = '';
            lightboxBackdrop.src = '';
        }, 300);
    }

    // 核心更新逻辑
    function updateLightboxContent() {
        const photo = photoData[currentIndex];
        const loadId = ++currentLoadId; // 标记当前请求ID
        
        // 更新文字信息
        titleEl.textContent = photo.title;
        descEl.textContent = photo.description;
        counterEl.textContent = `${currentIndex + 1} / ${photoData.length}`;

        // 1. 设置背景层 (总是使用缩略图快速显示，或者已缓存的原图)
        // 背景层不需要loading，只需要填满色彩
        lightboxBackdrop.src = loadedImages.has(photo.src) ? photo.src : (photo.thumb || photo.src);

        // 2. 检查缓存：如果原图已经下载过
        if (loadedImages.has(photo.src)) {
            // 直接显示原图，无模糊，无Loading
            lightboxImg.src = photo.src;
            lightboxImg.classList.remove('blur-loading');
            loader.classList.remove('show');
            return;
        }

        // 3. 原图未缓存：执行平滑加载流程
        
        // 步骤 A: 先显示缩略图占位，并加模糊
        lightboxImg.src = photo.thumb || photo.src;
        lightboxImg.classList.add('blur-loading');
        loader.classList.add('show'); // 显示"加载中"

        // 步骤 B: 后台加载高清原图
        const fullImg = new Image();
        fullImg.src = photo.src;
        
        fullImg.onload = () => {
            // 只有当用户还停留在当前图片时，才执行替换
            if (loadId === currentLoadId) {
                lightboxImg.src = photo.src; // 替换为高清图
                lightboxImg.classList.remove('blur-loading'); // 移除模糊
                loader.classList.remove('show'); // 隐藏Loading
                loadedImages.add(photo.src); // 标记为已缓存
                
                // 顺便更新背景为高清图（可选，让背景也更清晰）
                lightboxBackdrop.src = photo.src;
            }
        };

        fullImg.onerror = () => {
            if (loadId === currentLoadId) {
                loader.querySelector('span').innerText = '加载失败';
                lightboxImg.classList.remove('blur-loading'); // 失败也移除模糊，至少看个缩略图
            }
        };
    }

    // 事件绑定
    document.querySelectorAll('.photo-item').forEach(item => {
        item.addEventListener('click', () => {
            openLightbox(parseInt(item.dataset.index));
        });
    });

    document.getElementById('lightboxClose').onclick = closeLightbox;
    
    // 点击背景不关闭（防止误触），或者你可以改为关闭
    // document.querySelector('.lightbox-overlay').onclick = closeLightbox;
    
    document.getElementById('lightboxPrev').onclick = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + photoData.length) % photoData.length;
        updateLightboxContent();
    };
    
    document.getElementById('lightboxNext').onclick = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % photoData.length;
        updateLightboxContent();
    };

    // 键盘支持
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
        if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
    });
}

// 启动
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderGallery, 100);
});