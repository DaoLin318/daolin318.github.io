document.addEventListener('DOMContentLoaded', function() {
    // 初始化粒子背景
    particlesJS('particles-js', {
        particles: {
            number: { value: 60 },
            color: { value: ['#8A2BE2', '#9370DB', '#BA55D3'] },
            shape: { type: 'circle' },
            opacity: { value: 0.7 },
            size: { value: 4, random: true },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#8A2BE2',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                out_mode: 'out'
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'repulse' },
                onclick: { enable: false }
            }
        }
    });

    // 时间更新
    function updateTime() {
        const now = new Date();
        const timeElement = document.getElementById('time');
        const dateElement = document.getElementById('date');
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        dateElement.textContent = `${year}年${month}月${day}日`;
    }

    updateTime();
    setInterval(updateTime, 1000);

    // 天气功能
    const WEATHER_API_KEY = "4d8fb5b93d4af21d66a2948710284366";
    const cityCoordinates = {
        '沙依巴克区': { lat: 43.8013, lon: 87.5988 },
        '默认': { lat: 43.8256, lon: 87.6168 }
    };

    function getWeather(province, city, district) {
        let locationName = district || city;
        document.querySelector('.weather-temp').textContent = '获取中...';
        document.querySelector('.weather-icon').textContent = '🌤️';
        
        const coordinates = cityCoordinates[locationName] || cityCoordinates['默认'];
        
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&lang=zh_cn&appid=${WEATHER_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    const temp = Math.round(data.main.temp);
                    document.querySelector('.weather-temp').textContent = `${temp}°C`;
                    
                    const weatherId = data.weather[0].id;
                    let weatherIcon = '🌤️';
                    
                    if (weatherId >= 200 && weatherId < 300) weatherIcon = '⛈️';
                    else if (weatherId >= 300 && weatherId < 400) weatherIcon = '🌦️';
                    else if (weatherId >= 500 && weatherId < 600) weatherIcon = '🌧️';
                    else if (weatherId >= 600 && weatherId < 700) weatherIcon = '🌨️';
                    else if (weatherId >= 700 && weatherId < 800) weatherIcon = '🌫️';
                    else if (weatherId === 800) weatherIcon = '☀️';
                    else if (weatherId > 800 && weatherId < 900) weatherIcon = '⛅';
                    
                    document.querySelector('.weather-icon').textContent = weatherIcon;
                }
            })
            .catch(error => {
                console.error('天气API请求失败:', error);
                document.querySelector('.weather-temp').textContent = '暂无数据';
                document.querySelector('.weather-icon').textContent = '🌡️';
            });
    }

    // 城市选择
    const weatherContainer = document.getElementById('weather-container');
    const citySelect = document.getElementById('city-select');
    const citySearch = document.getElementById('city-search');
    const cityOptions = document.querySelectorAll('.city-option');

    weatherContainer.addEventListener('click', () => {
        citySelect.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!weatherContainer.contains(e.target) && !citySelect.contains(e.target)) {
            citySelect.classList.remove('show');
        }
    });

    citySearch.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        cityOptions.forEach(option => {
            const cityName = option.textContent.toLowerCase();
            option.style.display = cityName.includes(searchText) ? 'block' : 'none';
        });
    });

    cityOptions.forEach(option => {
        option.addEventListener('click', () => {
            const province = option.dataset.province;
            const city = option.dataset.city;
            const district = option.dataset.district;
            const displayName = district || city;
            document.querySelector('.weather-location').textContent = displayName;
            getWeather(province, city, district);
            citySelect.classList.remove('show');
            
            localStorage.setItem('selectedProvince', province);
            localStorage.setItem('selectedCity', city);
            localStorage.setItem('selectedDistrict', district || '');
        });
    });

    // 加载保存的城市
    const savedProvince = localStorage.getItem('selectedProvince');
    const savedCity = localStorage.getItem('selectedCity');
    const savedDistrict = localStorage.getItem('selectedDistrict');
    if (savedProvince && savedCity) {
        const displayName = savedDistrict || savedCity;
        document.querySelector('.weather-location').textContent = displayName;
        getWeather(savedProvince, savedCity, savedDistrict);
    } else {
        document.querySelector('.weather-location').textContent = '沙依巴克区';
        getWeather('新疆', '乌鲁木齐', '沙依巴克区');
    }

    // 搜索引擎设置
    const engineTabs = document.querySelectorAll('.engine-tab');
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    const searchEngines = {
        baidu: { 
            url: 'https://www.baidu.com/s', 
            param: 'wd', 
            placeholder: '输入搜索内容...', 
            btn: '百度一下' 
        },
        bing: { 
            url: 'https://www.bing.com/search', 
            param: 'q', 
            placeholder: 'Search with Bing...', 
            btn: '必应搜索' 
        },
        sogou: { 
            url: 'https://www.sogou.com/web', 
            param: 'query', 
            placeholder: '搜狗搜索...', 
            btn: '搜狗搜索' 
        }
    };

    // 从本地存储加载搜索引擎偏好
    const currentEngine = localStorage.getItem('searchEngine') || 'baidu';
    updateSearchEngine(currentEngine);
    document.querySelector(`.engine-tab[data-engine="${currentEngine}"]`).classList.add('active');

    engineTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const engine = tab.dataset.engine;
            engineTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateSearchEngine(engine);
            localStorage.setItem('searchEngine', engine);
        });
    });

    function updateSearchEngine(engine) {
        const config = searchEngines[engine];
        searchForm.action = config.url;
        searchInput.name = config.param;
        searchInput.placeholder = config.placeholder;
        searchBtn.textContent = config.btn;
    }

    // 书签管理
    const bookmarkList = document.querySelector('.bookmark-list');
    const addBookmarkBtn = document.querySelector('.add-bookmark');
    const bookmarkModal = document.querySelector('.bookmark-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const bookmarkNameInput = document.getElementById('bookmark-name');
    const bookmarkUrlInput = document.getElementById('bookmark-url');
    const saveBtn = document.querySelector('.save');
    const cancelBtn = document.querySelector('.cancel');
    const nameError = document.getElementById('name-error');
    const urlError = document.getElementById('url-error');
    const iconOptions = document.querySelectorAll('.icon-option');
    const selectedIconPreview = document.querySelector('.selected-icon-preview');
    const selectedIconElement = document.querySelector('.selected-icon');

    let selectedIcon = 'fa-star';

    // 打开模态框
    function openModal() {
        bookmarkModal.style.display = 'block';
        bookmarkNameInput.value = '';
        bookmarkUrlInput.value = '';
        nameError.textContent = '';
        urlError.textContent = '';
        selectIcon('fa-star');
    }

    // 关闭模态框
    function closeModal() {
        bookmarkModal.style.display = 'none';
    }

    // 选择图标
    function selectIcon(iconClass) {
        selectedIcon = iconClass;
        if (selectedIconPreview) {
            selectedIconPreview.className = `fas ${iconClass}`;
        }
    }

    // URL验证
    function isValidUrl(url) {
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 添加书签到DOM
    function addBookmarkToDOM(bookmark) {
        const bookmarkElement = document.createElement('a');
        bookmarkElement.href = bookmark.url;
        bookmarkElement.target = '_blank';
        bookmarkElement.className = 'bookmark-item';
        bookmarkElement.innerHTML = `<i class="fas ${bookmark.icon}"></i><span>${bookmark.name}</span>`;
        
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'bookmark-delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            bookmarkElement.classList.add('removing');
            setTimeout(() => {
                bookmarkElement.remove();
                const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
                const updated = bookmarks.filter(b => !(b.name === bookmark.name && b.url === bookmark.url));
                localStorage.setItem('bookmarks', JSON.stringify(updated));
            }, 200);
        });
        
        bookmarkElement.appendChild(deleteBtn);
        bookmarkList.insertBefore(bookmarkElement, addBookmarkBtn);
    }

    // 加载书签
    function loadBookmarks() {
        try {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            bookmarks.sort((a, b) => a.name.localeCompare(b.name));
            bookmarks.forEach(bookmark => addBookmarkToDOM(bookmark));
        } catch (e) {
            console.error('解析书签失败:', e);
        }
    }

    // 保存书签
    function saveBookmark() {
        const name = bookmarkNameInput.value.trim();
        let url = bookmarkUrlInput.value.trim();
        
        // 重置错误提示
        nameError.textContent = '';
        urlError.textContent = '';
        
        // 验证名称
        if (!name) {
            nameError.textContent = '请输入书签名称';
            nameError.style.display = 'block';
            return;
        }
        
        // 验证网址
        if (!url) {
            urlError.textContent = '请输入网址';
            urlError.style.display = 'block';
            return;
        }
        
        if (!isValidUrl(url)) {
            urlError.textContent = '请输入有效的网址';
            urlError.style.display = 'block';
            return;
        }
        
        // 标准化URL
        if (!url.startsWith('http')) {
            url = `https://${url}`;
        }
        
        // 创建书签对象
        const bookmark = {
            name,
            url,
            icon: selectedIcon,
            createdAt: Date.now()
        };
        
        // 保存到本地存储
        try {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            bookmarks.push(bookmark);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            addBookmarkToDOM(bookmark);
            closeModal();
        } catch (e) {
            console.error('保存书签失败:', e);
        }
    }

    // 事件监听
    addBookmarkBtn.addEventListener('click', openModal);
    modalCloseBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', saveBookmark);

    // 图标选择
    if (selectedIconElement) {
        selectedIconElement.addEventListener('click', function() {
            document.querySelector('.icon-options').classList.toggle('show');
        });
    }

    iconOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectIcon(option.dataset.icon);
            document.querySelector('.icon-options').classList.remove('show');
        });
    });

    // 点击外部关闭图标选择框
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.icon-select')) {
            document.querySelector('.icon-options').classList.remove('show');
        }
    });

    // 初始化
    loadBookmarks();
});