// 照片数据 - 使用URL地址
const photos = [
    {
        year: 2025,
        date: '2025年5月3日',
        image: 'https://files.240503.xyz/gallery/2025.jpg',
        description: '一周年纪念，我们的第一张红底合照'
    }
    // 后续年份的照片可以在这里添加
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
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            // 即使加载失败也返回一个占位图片
            const placeholder = new Image();
            placeholder.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iIGZpbGw9IiM5OTkiPua1i+ivleWbvueJhzwvdGV4dD48L3N2Zz4=';
            resolve(placeholder);
        };
        img.src = src;
    });
}

// 计算在一起的天数
function calculateDaysTogether() {
    const startDate = new Date('2024-05-03');
    const currentDate = new Date();
    const timeDiff = currentDate - startDate;
    const daysTogether = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return daysTogether;
}

// 更新天数计数器
function updateDaysCounter() {
    const daysCounter = document.getElementById('days-counter');
    const days = calculateDaysTogether();
    daysCounter.textContent = days + ' 天';
}

// 生成时间轴
async function generateTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = ''; // 清空现有内容
    
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    
    // 预加载所有图片
    const preloadPromises = photos.map(photo => preloadImage(photo.image));
    await Promise.allSettled(preloadPromises);
    
    // 从2024年开始生成时间轴项目
    for (let year = startYear; year <= currentYear; year++) {
        const photo = photos.find(p => p.year === year);
        const isEven = (year - startYear) % 2 === 0;
        
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${isEven ? 'even' : 'odd'}`;
        
        let content = '';
        if (photo) {
            // 有照片的年份
            const img = imageCache.get(photo.image);
            const imgSrc = img && img.src ? img.src : photo.image;
            
            content = `
                <div class="timeline-content">
                    <h3 class="timeline-year">${year}年</h3>
                    <p class="timeline-date">${photo.date}</p>
                    <img src="${imgSrc}" alt="${year}年纪念照片" class="timeline-image" loading="lazy">
                    <p class="timeline-description">${photo.description}</p>
                </div>
            `;
        } else if (year === 2024) {
            // 2024年 - 开始的一年
            content = `
                <div class="timeline-content">
                    <h3 class="timeline-year">${year}年</h3>
                    <p class="timeline-date">2024年5月3日</p>
                    <div class="timeline-placeholder">
                        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#f0f0f0"/>
                            <text x="50%" y="50%" font-size="14" text-anchor="middle" dy="0.35em" fill="#999">纪念照片加载中...</text>
                        </svg>
                    </div>
                    <p class="timeline-description">我们的故事从这里开始...</p>
                </div>
            `;
        } else {
            // 未来年份（还没有照片）
            content = `
                <div class="timeline-content">
                    <h3 class="timeline-year">${year}年</h3>
                    <p class="timeline-date">${year}年5月3日</p>
                    <div class="timeline-placeholder">
                        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#f0f0f0"/>
                            <text x="50%" y="50%" font-size="14" text-anchor="middle" dy="0.35em" fill="#999">期待今年的纪念照片</text>
                        </svg>
                    </div>
                    <p class="timeline-description">期待今年的纪念照片...</p>
                </div>
            `;
        }
        
        timelineItem.innerHTML = content + '<div class="timeline-marker"></div>';
        timeline.appendChild(timelineItem);
    }
}

// 添加图片加载错误处理
function addImageErrorHandling() {
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.timeline-image').forEach(img => {
            img.addEventListener('error', function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iIGZpbGw9IiM5OTkiPua1i+ivleWbvueJh+Wksei0pTwvdGV4dD48L3N2Zz4=';
                this.alt = '图片加载失败';
            });
        });
    });
}

// 显示加载状态
function showLoading() {
    const timeline = document.getElementById('timeline');
    if (timeline) {
        timeline.innerHTML = `
            <div style="text-align: center; color: #b0c4de; padding: 40px;">
                <p>加载时间轴中...</p>
            </div>
        `;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    updateDaysCounter();
    showLoading();
    
    try {
        await generateTimeline();
        addImageErrorHandling();
    } catch (error) {
        console.error('Failed to initialize timeline:', error);
        const timeline = document.getElementById('timeline');
        if (timeline) {
            timeline.innerHTML = `
                <div style="text-align: center; color: #ff6b6b; padding: 40px;">
                    <p>时间轴加载失败</p>
                    <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">重新加载</button>
                </div>
            `;
        }
    }
    
    // 每天更新天数
    setInterval(updateDaysCounter, 24 * 60 * 60 * 1000);
});
