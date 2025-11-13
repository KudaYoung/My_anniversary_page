// 照片数据
const photos = [
    {
        year: 2025,
        date: '2025年5月3日',
        image: 'images/2025.jpg',
        description: '一周年纪念，我们的第一张红底合照'
    }
    // 后续年份的照片可以在这里添加
];

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
function generateTimeline() {
    const timeline = document.getElementById('timeline');
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    
    // 从2024年开始生成时间轴项目
    for (let year = startYear; year <= currentYear; year++) {
        const photo = photos.find(p => p.year === year);
        const isEven = (year - startYear) % 2 === 0;
        
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${isEven ? 'even' : 'odd'}`;
        
        let content = '';
        if (photo) {
            // 有照片的年份
            content = `
                <div class="timeline-content">
                    <h3 class="timeline-year">${year}年</h3>
                    <p class="timeline-date">${photo.date}</p>
                    <img src="${photo.image}" alt="${year}年纪念照片" class="timeline-image">
                    <p>${photo.description}</p>
                </div>
            `;
        } else if (year === 2024) {
            // 2024年 - 开始的一年
            content = `
                <div class="timeline-content">
                    <h3 class="timeline-year">${year}年</h3>
                    <p class="timeline-date">2024年5月3日</p>
                    <p>我们的故事从这里开始...</p>
                </div>
            `;
        } else {
            // 未来年份（还没有照片）
            content = `
                <div class="timeline-content">
                    <h3 class="timeline-year">${year}年</h3>
                    <p class="timeline-date">${year}年5月3日</p>
                    <p>期待今年的纪念照片...</p>
                </div>
            `;
        }
        
        timelineItem.innerHTML = content + '<div class="timeline-marker"></div>';
        timeline.appendChild(timelineItem);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    updateDaysCounter();
    generateTimeline();
    
    // 每天更新天数
    setInterval(updateDaysCounter, 24 * 60 * 60 * 1000);
});
