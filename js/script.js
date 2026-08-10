// --- 配置区域 ---
const CONFIG = {
    startDate: '2024-05-03', // 在这里修改开始日期，全站自动更新
    title: '我们在一起的日子'
};

// --- 照片数据 ---
const photos = [
    {
        year: 2024,
        date: '2024年5月3日',
        image: null, // 如果这一年只有文字没有照片，可以设为 null
        description: '故事开始的地方。那一天的阳光很好，你很好。'
    },
    {
        year: 2025,
        date: '2025年5月3日',
        image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEY4k9qeUUxf1HaiH-uG5SZhZ58gMUnsAACECsAAhVdyVduUbh48c710D0E.jpg',
        description: '一周年快乐！我们拍了第一张红底合照，希望未来每一年都有你的陪伴。'
    },
    {
        year: 2026,
        date: '2026年5月3日',
        image: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEY4oJqeUeCRx5bzzmsa1DNpjL5uMQwfgACRSsAAhVdyVdSFvupOmF0Tj0E.png',
        description: '两周年啦！手里拿的是第一年的合照。'
    }
];

// --- 核心逻辑 ---

// 1. 初始化日期显示
function initDateDisplay() {
    // 设置页面头部显示的日期
    const displayElement = document.getElementById('start-date-display');
    if (displayElement) {
        const dateObj = new Date(CONFIG.startDate);
        // 格式化为：2024.05.03
        const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;
        displayElement.textContent = `${dateStr} - FOREVER`;
    }

    // 设置底部年份
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

// 2. 计算天数（保留你的逻辑，稍微精简）
function updateDaysCounter() {
    const start = new Date(CONFIG.startDate);
    const now = new Date();
    const diff = now - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // 增加数字跳动效果（可选优化）
    document.getElementById('days-counter').textContent = days;
}

// 3. 生成时间轴
function generateTimeline() {
    const timeline = document.getElementById('timeline');
    const currentYear = new Date().getFullYear();
    
    // 提取数据中的年份
    const photoYears = photos.map(p => p.year);
    // 确保至少显示到当前年份，如果当前年份没有照片，也显示一个占位
    let maxYear = Math.max(currentYear, ...photoYears);
    // 如果还没到一周年，至少显示开始那一年
    let minYear = Math.min(2024, ...photoYears);

    // 排序照片数据
    photos.sort((a, b) => a.year - b.year);

    let html = '';

    // 遍历生成，这里逻辑改为：只渲染 photos 数组里定义的内容 + 未来一年的展望
    // 如果你想自动补全中间缺失的年份，可以保留原先的循环逻辑，但我建议只展示有意义的节点
    
    // 渲染已有的数据节点
    photos.forEach((item, index) => {
        const hasImage = item.image && item.image !== '';
        
        // 图片 HTML
        const imgHtml = hasImage 
            ? `<img src="${item.image}" alt="${item.year}" class="timeline-image" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg=='">` 
            : '';

        html += `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h3 class="timeline-year">${item.year}</h3>
                    <p class="timeline-date">${item.date}</p>
                    ${imgHtml}
                    <p class="timeline-description">${item.description}</p>
                </div>
            </div>
        `;
    });

    // 总是添加一个“未来”的卡片，增加互动感
    const nextYear = Math.max(...photoYears) + 1;
    html += `
        <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content" style="background: rgba(255,255,255,0.4); border-style: dashed;">
                <h3 class="timeline-year">${nextYear}</h3>
                <p class="timeline-description" style="color: #999; font-style: italic;">
                    期待我们要去写的未来...
                </p>
            </div>
        </div>
    `;

    timeline.innerHTML = html;
    
    // 触发滚动动画观察器
    observeTimelineItems();
}

// 4. 滚动动画监听器 (新增功能：让元素滑入)
function observeTimelineItems() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 动画只触发一次，进入视野后取消观察
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 // 元素出现 10% 时触发
    });

    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}

// --- 启动 ---
document.addEventListener('DOMContentLoaded', () => {
    initDateDisplay();
    updateDaysCounter();
    generateTimeline();
    
    // 每天自动刷新一次天数
    setInterval(updateDaysCounter, 1000 * 60 * 60);
});
